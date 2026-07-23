import path from 'node:path';
import Ajv2020Import from 'ajv/dist/2020.js';
import * as addFormatsModule from 'ajv-formats';
import type { ErrorObject, ValidateFunction } from 'ajv/dist/2020.js';
import { ArtifactLoader, FcrRuntimeError } from '../artifacts/artifact-loader.js';
import type { ArtifactCategory, ArtifactLoadResult, DeepReadonly, IndexedArtifact, RegistryIndex, TaskRecord, ValidationIssue, ValidationResult } from '../artifacts/artifact-types.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import { FCR_ROOT_RELATIVE_PATH } from '../config/repository-paths.js';
import { planForArtifact, registryIndexSchemaPath } from './artifact-schema-map.js';
import { normalizeLocalSchemaReferences, type SchemaWithIdentity } from './schema-reference.js';
import { cloneAndFreezeJson } from '../runtime/json-values.js';

const DRAFT_2020_SCHEMA = 'https://json-schema.org/draft/2020-12/schema';

interface AjvLike {
  readonly errors?: ErrorObject[] | null;
  addSchema(schema: unknown, id?: string): unknown;
  getSchema(schemaId: string): ValidateFunction<unknown> | undefined;
  validateSchema(schema: unknown): boolean;
}

const Ajv2020 = Ajv2020Import as unknown as new (options: Record<string, unknown>) => AjvLike;
const addFormats = addFormatsModule.default as unknown as (ajv: AjvLike, options: Record<string, unknown>) => void;

export interface ArtifactValidationSummary {
  readonly registry: RegistryIndex;
  readonly artifactCount: number;
  readonly schemaCount: number;
  readonly normativeRecordCount: number;
  readonly validatedRecordCount: number;
  readonly failedRecordCount: number;
  readonly skippedNonNormativeCount: number;
}

type SchemaObject = SchemaWithIdentity;

interface ValidationTarget {
  readonly sourcePath: string;
  readonly category: ArtifactCategory | 'registry';
  readonly schemaPath: string;
  readonly input: unknown;
}

export class SchemaValidator {
  private readonly ajv: AjvLike;
  private readonly loader: ArtifactLoader;
  private readonly errorService: FrameworkErrorService;
  private initialized = false;
  private loadResult?: ArtifactLoadResult;
  private readonly validators = new Map<string, ValidateFunction<unknown>>();
  private readonly schemaIdsByPath = new Map<string, string>();

  public constructor(loader: ArtifactLoader, errorService: FrameworkErrorService) {
    this.loader = loader;
    this.errorService = errorService;
    // Canonical schemas use branch-local required fields and branch-local
    // items constraints on shared properties. Those are valid Draft 2020-12
    // constructs, but AJV's optional strict lint rejects them. Keep strict
    // keyword checking enabled and disable only these two lints required by
    // the canonical schema set; network loading remains disabled.
    this.ajv = new Ajv2020({ strict: true, strictRequired: false, strictTypes: false, allErrors: true, validateFormats: true, loadSchema: undefined });
    addFormats(this.ajv, { mode: 'full' });
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.loadResult = await this.loader.load();
    const schemas = this.loadResult.artifacts.filter((artifact) => artifact.repositoryRelativePath.endsWith('.schema.json'));
    const schemaIdsByPath = new Map<string, string>();

    for (const artifact of schemas) {
      let schema: SchemaObject;
      try { schema = requireSchema(artifact.raw, artifact.repositoryRelativePath); }
      catch (cause) { throw this.runtimeError('REGISTRY_SCHEMA_INVALID', { path: artifact.repositoryRelativePath, reason: safeCause(cause) }); }
      if (schema.$schema !== DRAFT_2020_SCHEMA) {
        throw this.runtimeError('REGISTRY_SCHEMA_INVALID', { path: artifact.repositoryRelativePath, reason: 'Draft 2020-12 required' });
      }
      const previous = [...schemaIdsByPath.entries()].find(([, id]) => id === schema.$id);
      if (previous) {
        throw this.runtimeError('REGISTRY_SCHEMA_INVALID', { duplicate_id: schema.$id, first_path: previous[0], duplicate_path: artifact.repositoryRelativePath });
      }
      schemaIdsByPath.set(path.resolve(this.loader.repositoryRoot, artifact.repositoryRelativePath), schema.$id);
    }

    const normalizedSchemas: Array<{ readonly artifact: IndexedArtifact; readonly schema: SchemaObject }> = [];
    for (const artifact of schemas) {
      let schema: SchemaObject;
      try {
        schema = requireSchema(artifact.raw, artifact.repositoryRelativePath);
        const normalized = normalizeLocalSchemaReferences(schema, artifact.repositoryRelativePath, this.loader.repositoryRoot, schemaIdsByPath);
        if (!this.ajv.validateSchema(normalized)) {
          throw this.runtimeError('REGISTRY_SCHEMA_INVALID', {
            path: artifact.repositoryRelativePath,
            reason: 'Draft 2020-12 metaschema validation failed',
            issues: normalizeAjvErrors(this.ajv.errors, artifact.repositoryRelativePath, 'schemas'),
          });
        }
        normalizedSchemas.push({ artifact, schema: normalized });
      } catch (cause) {
        if (cause instanceof FcrRuntimeError) throw cause;
        throw this.runtimeError('REGISTRY_SCHEMA_INVALID', { path: artifact.repositoryRelativePath, reason: safeCause(cause) });
      }
    }

    // No schema is registered until every indexed schema has passed the
    // Draft 2020-12 metaschema check and reference normalization.
    this.schemaIdsByPath.clear();
    for (const { artifact, schema } of normalizedSchemas) {
      try {
        this.ajv.addSchema(schema, schema.$id);
      } catch (cause) {
        throw this.runtimeError('REGISTRY_SCHEMA_INVALID', { path: artifact.repositoryRelativePath, reason: safeCause(cause) });
      }
      this.schemaIdsByPath.set(artifact.repositoryRelativePath, schema.$id);
    }

    for (const artifact of schemas) {
      try {
        const schema = requireSchema(artifact.raw, artifact.repositoryRelativePath);
        const validator = this.ajv.getSchema(schema.$id);
        if (!validator) throw new Error('compiled validator missing');
        this.validators.set(schema.$id, validator);
      } catch (cause) {
        throw this.runtimeError('REGISTRY_SCHEMA_INVALID', { path: artifact.repositoryRelativePath, reason: safeCause(cause) });
      }
    }
    this.initialized = true;
  }

  public async validateRecord<T = unknown>(schemaPath: string, input: unknown): Promise<ValidationResult<DeepReadonly<T>>> {
    await this.initialize();
    const schemaId = this.schemaIdsByPath.get(schemaPath);
    if (!schemaId) return this.failure('REGISTRY_SCHEMA_INVALID', { schema_path: schemaPath, reason: 'schema path is not indexed' });
    return this.validateWithId<T>(schemaId, input, schemaPath);
  }

  public async validateSchemaId<T = unknown>(schemaId: string, input: unknown): Promise<ValidationResult<DeepReadonly<T>>> {
    await this.initialize();
    return this.validateWithId<T>(schemaId, input, schemaId);
  }

  public async validateCompleteArtifactSet(): Promise<ValidationResult<ArtifactValidationSummary>> {
    await this.initialize();
    const loadResult = this.loadResult as ArtifactLoadResult;
    const failures: ReturnType<FrameworkErrorService['createDiagnostic']>[] = [...loadResult.issues];
    const issues: ValidationIssue[] = [];
    const targets: ValidationTarget[] = [{ sourcePath: `${FCR_ROOT_RELATIVE_PATH}/registry.json`, category: 'registry', schemaPath: registryIndexSchemaPath(), input: loadResult.index }];
    let skippedNonNormativeCount = 0;
    let mappingFailureCount = 0;

    for (const artifact of loadResult.artifacts) {
      let plan;
      try {
        plan = planForArtifact(artifact);
      } catch (cause) {
        mappingFailureCount += 1;
        issues.push(mappingIssue(artifact.repositoryRelativePath, artifact.category, safeCause(cause)));
        failures.push(this.errorService.createDiagnostic('REGISTRY_SCHEMA_INVALID', { source: artifact.repositoryRelativePath, reason: safeCause(cause) }));
        continue;
      }
      if (plan.kind === 'SCHEMA') continue;
      if (plan.kind === 'NON_NORMATIVE') {
        skippedNonNormativeCount += 1;
        continue;
      }
      if (plan.selector === 'whole') {
        targets.push({ sourcePath: artifact.repositoryRelativePath, category: artifact.category, schemaPath: plan.schemaPath, input: artifact.raw });
        continue;
      }
      const record = asRecord(artifact.raw);
      const entries = plan.selector === 'transitions' ? asArray(record?.transitions) : asArray(record?.errors);
      if (entries.length === 0) {
        issues.push(mappingIssue(artifact.repositoryRelativePath, artifact.category, 'required record collection is empty'));
        failures.push(this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { source: artifact.repositoryRelativePath, reason: 'required record collection is empty' }));
        continue;
      }
      for (const [index, entry] of entries.entries()) {
        targets.push({ sourcePath: `${artifact.repositoryRelativePath}#${index}`, category: artifact.category, schemaPath: plan.schemaPath === `${FCR_ROOT_RELATIVE_PATH}/schemas/framework-error-catalog.schema.json` ? `${FCR_ROOT_RELATIVE_PATH}/schemas/framework-error.schema.json` : plan.schemaPath, input: entry });
      }
    }

    const orderedTargets = [...targets].sort((left, right) => compareStrings(left.sourcePath, right.sourcePath));
    let validatedRecordCount = 0;
    let failedRecordCount = 0;
    for (const target of orderedTargets) {
      const schemaId = this.schemaIdsByPath.get(target.schemaPath);
      const validator = schemaId ? this.validators.get(schemaId) : undefined;
      if (!validator) {
        failedRecordCount += 1;
        issues.push(mappingIssue(target.sourcePath, target.category, `canonical schema mapping is unresolved: ${target.schemaPath}`));
        failures.push(this.errorService.createDiagnostic('REGISTRY_SCHEMA_INVALID', { source: target.sourcePath, schema_path: target.schemaPath, reason: 'canonical schema mapping is unresolved' }));
        continue;
      }
      if (validator(target.input)) {
        validatedRecordCount += 1;
        continue;
      }
      failedRecordCount += 1;
      const normalized = normalizeAjvErrors(validator.errors, target.sourcePath, target.category);
      issues.push(...normalized);
      failures.push(this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { source: target.sourcePath, schema_path: target.schemaPath, issues: normalized }));
    }

    const schemaCount = loadResult.artifacts.filter((artifact) => artifact.repositoryRelativePath.endsWith('.schema.json')).length;
    const normativeRecordCount = orderedTargets.length + mappingFailureCount;
    const summary: ArtifactValidationSummary = {
      registry: loadResult.index,
      artifactCount: loadResult.artifacts.length,
      schemaCount,
      normativeRecordCount,
      validatedRecordCount,
      failedRecordCount: failedRecordCount + mappingFailureCount,
      skippedNonNormativeCount,
    };
    const orderedFailures = Object.freeze([...failures].sort(compareErrors));
    const orderedIssues = Object.freeze([...issues].sort(compareIssues));
    if (orderedFailures.length > 0 || orderedIssues.length > 0) {
      const firstFailure = orderedFailures[0];
      return { valid: false, value: summary, issues: orderedIssues, errors: orderedFailures, ...(firstFailure ? { error: firstFailure } : {}) };
    }
    return { valid: true, value: summary, issues: [], errors: [] };
  }

  public async validateTaskRecord(input: unknown): Promise<ValidationResult<DeepReadonly<TaskRecord>>> {
    const result = await this.validateRecord<TaskRecord>(`${FCR_ROOT_RELATIVE_PATH}/schemas/task-record.schema.json`, input);
    if (!result.valid || !result.value) return result as ValidationResult<DeepReadonly<TaskRecord>>;
    return result;
  }

  public get load(): ArtifactLoadResult | undefined { return this.loadResult; }

  private async validateWithId<T>(schemaId: string, input: unknown, source: string): Promise<ValidationResult<DeepReadonly<T>>> {
    const validator = this.validators.get(schemaId);
    if (!validator) return this.failure('REGISTRY_SCHEMA_INVALID', { schema_id: schemaId, source });
    if (validator(input)) return { valid: true, value: cloneAndFreezeJson(input) as DeepReadonly<T>, issues: [], errors: [] };
    const issues = normalizeAjvErrors(validator.errors, source, inferCategory(source));
    const error = this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { schema_id: schemaId, source, issues });
    return { valid: false, issues, errors: [error], error };
  }

  private failure<T>(code: string, metadata: Record<string, unknown>): ValidationResult<DeepReadonly<T>> {
    const error = this.errorService.createDiagnostic(code, metadata);
    return { valid: false, issues: [], errors: [error], error };
  }

  private runtimeError(code: string, metadata: Record<string, unknown>): FcrRuntimeError {
    return new FcrRuntimeError(this.errorService.createDiagnostic(code, metadata));
  }
}

function requireSchema(value: unknown, sourcePath: string): SchemaObject {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof (value as { $id?: unknown }).$id !== 'string' || typeof (value as { $schema?: unknown }).$schema !== 'string') {
    throw new Error(`invalid schema: ${sourcePath}`);
  }
  return value as SchemaObject;
}

/** Convert only repository-relative file references. Fragment-only refs remain local. */
function normalizeAjvErrors(errors: ErrorObject[] | null | undefined, artifactPath: string, category: ArtifactCategory | 'registry'): ValidationIssue[] {
  return (errors ?? []).map((error) => ({
    artifactPath,
    category,
    instancePath: error.instancePath,
    schemaPath: error.schemaPath,
    keyword: error.keyword,
    params: Object.freeze({ ...error.params }),
    message: error.message ?? 'validation failed',
  }));
}

function mappingIssue(artifactPath: string, category: ArtifactCategory | 'registry', message: string): ValidationIssue {
  return { artifactPath, category, instancePath: '', schemaPath: '', keyword: 'mapping', params: Object.freeze({}), message };
}

function inferCategory(source: string): ArtifactCategory | 'registry' {
  if (source.endsWith('/registry.json')) return 'registry';
  if (source.includes('/contracts/')) return 'contracts';
  if (source.includes('/predicates/')) return 'predicates';
  if (source.includes('/transitions/')) return 'transition_tables';
  if (source.includes('/authority/')) return 'authority_tables';
  if (source.includes('/bootstrap/')) return 'bootstrap_contracts';
  if (source.includes('/context/')) return 'context_contracts';
  if (source.includes('/errors/')) return 'error_catalogs';
  return 'schemas';
}

function asRecord(value: unknown): Record<string, unknown> | undefined { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined; }
function asArray(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function safeCause(cause: unknown): string { return cause instanceof Error ? cause.message : 'schema registration failed'; }
function compareStrings(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function compareIssues(left: ValidationIssue, right: ValidationIssue): number { return compareStrings(`${left.artifactPath}\u0000${left.category}\u0000${left.instancePath}\u0000${left.schemaPath}\u0000${left.keyword}\u0000${left.message}`, `${right.artifactPath}\u0000${right.category}\u0000${right.instancePath}\u0000${right.schemaPath}\u0000${right.keyword}\u0000${right.message}`); }
function compareErrors(left: ReturnType<FrameworkErrorService['createDiagnostic']>, right: ReturnType<FrameworkErrorService['createDiagnostic']>): number {
  return compareStrings(`${left.code}\u0000${JSON.stringify(left.machine_metadata)}`, `${right.code}\u0000${JSON.stringify(right.machine_metadata)}`);
}
