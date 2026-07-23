import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv2020Import from 'ajv/dist/2020.js';
import * as addFormatsModule from 'ajv-formats';
import type { ErrorObject } from 'ajv/dist/2020.js';
import type { FrameworkErrorService } from '../errors/framework-error-service.js';
import type { RegistryIndex, ValidationIssue } from '../artifacts/artifact-types.js';
import { normalizeLocalSchemaReferences, type SchemaWithIdentity } from './schema-reference.js';
import { FCR_INDEX_RELATIVE_PATH, FCR_ROOT_RELATIVE_PATH } from '../config/repository-paths.js';

const DRAFT_2020_SCHEMA = 'https://json-schema.org/draft/2020-12/schema';
const REGISTRY_SCHEMA_RELATIVE_PATH = `${FCR_ROOT_RELATIVE_PATH}/schemas/registry-index.schema.json`;
const COMMON_TYPES_SCHEMA_RELATIVE_PATH = `${FCR_ROOT_RELATIVE_PATH}/schemas/common-types.schema.json`;

interface AjvLike {
  readonly errors?: ErrorObject[] | null;
  addSchema(schema: unknown, id?: string): unknown;
  getSchema(schemaId: string): ((value: unknown) => boolean) & { errors?: ErrorObject[] | null } | undefined;
  validateSchema(schema: unknown): boolean;
}

const Ajv2020 = Ajv2020Import as unknown as new (options: Record<string, unknown>) => AjvLike;
const addFormats = addFormatsModule.default as unknown as (ajv: AjvLike, options: Record<string, unknown>) => void;

export class RegistryBootstrapError extends Error {
  public constructor(
    public readonly frameworkError: ReturnType<FrameworkErrorService['createDiagnostic']>,
    public readonly issues: readonly ValidationIssue[] = [],
  ) {
    super(frameworkError.message);
    this.name = 'RegistryBootstrapError';
  }
}

export async function validateRegistryBeforeConsumption(
  realRepositoryRoot: string,
  realFcrRoot: string,
  errorService: FrameworkErrorService,
): Promise<RegistryIndex> {
  const schemaRoot = path.join(realFcrRoot, 'schemas');
  let realSchemaRoot: string;
  try { realSchemaRoot = await fs.realpath(schemaRoot); }
  catch { throw bootstrapFailure(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: `${FCR_ROOT_RELATIVE_PATH}/schemas` }); }
  const rawRegistryPath = path.join(realFcrRoot, 'registry.json');
  const requiredSchemaPaths = [
    path.join(realRepositoryRoot, REGISTRY_SCHEMA_RELATIVE_PATH),
    path.join(realRepositoryRoot, COMMON_TYPES_SCHEMA_RELATIVE_PATH),
  ];
  let rawRegistry: unknown;
  try {
    rawRegistry = JSON.parse(await fs.readFile(rawRegistryPath, 'utf8'));
  } catch {
    throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: FCR_INDEX_RELATIVE_PATH, reason: 'registry JSON could not be parsed' });
  }

  const schemas = new Map<string, SchemaWithIdentity>();
  const filesToLoad = [...requiredSchemaPaths];
  for (let index = 0; index < filesToLoad.length; index += 1) {
    const schemaPath = filesToLoad[index];
    if (!schemaPath || !isContained(schemaRoot, schemaPath)) {
      throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: REGISTRY_SCHEMA_RELATIVE_PATH, reason: 'bootstrap schema escaped the canonical schema root' });
    }
    let realSchemaPath: string;
    try { realSchemaPath = await fs.realpath(schemaPath); }
    catch { throw bootstrapFailure(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: toRepositoryRelative(realRepositoryRoot, schemaPath) }); }
    if (!isContained(realSchemaRoot, realSchemaPath)) {
      throw bootstrapFailure(errorService, 'REGISTRY_PATH_NORMALIZATION_FAILED', { path: toRepositoryRelative(realRepositoryRoot, schemaPath) });
    }
    const stat = await fs.stat(realSchemaPath);
    if (!stat.isFile()) throw bootstrapFailure(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: toRepositoryRelative(realRepositoryRoot, realSchemaPath) });
    const relativePath = toRepositoryRelative(realRepositoryRoot, realSchemaPath);
    let schema: SchemaWithIdentity;
    try {
      const parsed = JSON.parse(await fs.readFile(realSchemaPath, 'utf8')) as unknown;
      schema = requireSchema(parsed, relativePath);
    } catch (cause) {
      throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: relativePath, reason: safeCause(cause) });
    }
    if (schema.$schema !== DRAFT_2020_SCHEMA) {
      throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: relativePath, reason: 'Draft 2020-12 required' });
    }
    const absoluteKey = path.resolve(realSchemaPath);
    if (schemas.has(absoluteKey)) continue;
    schemas.set(absoluteKey, schema);
    for (const reference of fileReferences(schema)) {
      if (reference.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(reference)) continue;
      const hash = reference.indexOf('#');
      const relativeTarget = hash === -1 ? reference : reference.slice(0, hash);
      const targetPath = path.resolve(path.dirname(realSchemaPath), relativeTarget);
      if (!isContained(schemaRoot, targetPath)) {
        throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: relativePath, reason: `bootstrap reference escapes schema root: ${reference}` });
      }
      filesToLoad.push(targetPath);
    }
  }

  const idsByPath = new Map<string, string>();
  for (const [schemaPath, schema] of schemas) {
    if (idsByPathHasValue(idsByPath, schema.$id)) {
      throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: toRepositoryRelative(realRepositoryRoot, schemaPath), reason: `duplicate schema id: ${schema.$id}` });
    }
    idsByPath.set(schemaPath, schema.$id);
  }

  const ajv = new Ajv2020({ strict: true, strictRequired: false, strictTypes: false, allErrors: true, validateFormats: true, loadSchema: undefined });
  addFormats(ajv, { mode: 'full' });
  const normalizedSchemas: Array<{ readonly path: string; readonly schema: SchemaWithIdentity }> = [];
  for (const [schemaPath, schema] of schemas) {
    const relativePath = toRepositoryRelative(realRepositoryRoot, schemaPath);
    let normalized: SchemaWithIdentity;
    try {
      normalized = normalizeLocalSchemaReferences(schema, relativePath, realRepositoryRoot, idsByPath);
    } catch (cause) {
      throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: relativePath, reason: safeCause(cause) });
    }
    if (!ajv.validateSchema(normalized)) {
      const issues = normalizeIssues(ajv.errors, relativePath, 'schemas');
      throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: relativePath, reason: 'Draft 2020-12 metaschema validation failed', issues }, issues);
    }
    normalizedSchemas.push({ path: relativePath, schema: normalized });
  }
  for (const entry of normalizedSchemas) {
    try { ajv.addSchema(entry.schema, entry.schema.$id); }
    catch (cause) { throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: entry.path, reason: safeCause(cause) }); }
  }

  const registrySchemaPath = await fs.realpath(path.join(realRepositoryRoot, REGISTRY_SCHEMA_RELATIVE_PATH));
  const registrySchemaId = schemas.get(registrySchemaPath)?.$id;
  const registryValidator = registrySchemaId ? ajv.getSchema(registrySchemaId) : undefined;
  if (!registryValidator) throw bootstrapFailure(errorService, 'REGISTRY_SCHEMA_INVALID', { path: REGISTRY_SCHEMA_RELATIVE_PATH, reason: 'registry schema validator is unavailable' });
  if (!registryValidator(rawRegistry)) {
    const issues = normalizeIssues(registryValidator.errors, FCR_INDEX_RELATIVE_PATH, 'registry');
    throw bootstrapFailure(errorService, 'REGISTRY_VALIDATION_FAILED', { source: FCR_INDEX_RELATIVE_PATH, issues }, issues);
  }
  return rawRegistry as RegistryIndex;
}

function bootstrapFailure(errorService: FrameworkErrorService, code: string, metadata: Record<string, unknown>, issues: readonly ValidationIssue[] = []): RegistryBootstrapError {
  return new RegistryBootstrapError(errorService.createDiagnostic(code, metadata), issues);
}

function requireSchema(value: unknown, sourcePath: string): SchemaWithIdentity {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof (value as { $id?: unknown }).$id !== 'string' || typeof (value as { $schema?: unknown }).$schema !== 'string') throw new Error(`invalid schema: ${sourcePath}`);
  return value as SchemaWithIdentity;
}

function fileReferences(value: unknown): string[] {
  const references: string[] = [];
  const visit = (current: unknown): void => {
    if (Array.isArray(current)) { current.forEach(visit); return; }
    if (!current || typeof current !== 'object') return;
    const object = current as Record<string, unknown>;
    if (typeof object.$ref === 'string') references.push(object.$ref);
    Object.values(object).forEach(visit);
  };
  visit(value);
  return references;
}

function normalizeIssues(errors: ErrorObject[] | null | undefined, artifactPath: string, category: 'registry' | 'schemas'): ValidationIssue[] {
  return (errors ?? []).map((error) => ({ artifactPath, category, instancePath: error.instancePath, schemaPath: error.schemaPath, keyword: error.keyword, params: Object.freeze({ ...error.params }), message: error.message ?? 'validation failed' }));
}

function idsByPathHasValue(ids: ReadonlyMap<string, string>, value: string): boolean { return [...ids.values()].includes(value); }
function safeCause(_cause: unknown): string { return 'registry bootstrap schema validation failed'; }
function isContained(root: string, candidate: string): boolean { const relative = path.relative(path.resolve(root), path.resolve(candidate)); return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)); }
function toRepositoryRelative(realRepositoryRoot: string, absolutePath: string): string { return path.relative(realRepositoryRoot, absolutePath).split(path.sep).join('/'); }
