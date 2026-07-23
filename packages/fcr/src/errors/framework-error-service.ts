import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import Ajv2020Import from 'ajv/dist/2020.js';
import * as addFormatsModule from 'ajv-formats';
import type {
  EvidenceRef,
  FrameworkErrorDefinition,
  JsonValue,
  RuntimeFrameworkError,
  ValidationResult,
} from '../artifacts/artifact-types.js';
import type { ErrorContext, FrameworkErrorOptions } from './framework-error-types.js';

const CATALOG_RELATIVE_PATH = 'docs/ai-engineering-framework/fcr/errors/framework-error-catalog.json';
const SCHEMA_ROOT = 'docs/ai-engineering-framework/fcr/errors/schemas';
const CANONICAL_SCHEMA_ROOT = 'docs/ai-engineering-framework/fcr/schemas';
const SCHEMA_PATH_PATTERN = /^(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*\/\/)(?![A-Za-z][A-Za-z0-9+.-]*:\/\/)[^\u0000]+\.schema\.json$/;
const REPOSITORY_PATH_PATTERN = /^(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*\/\/)(?![A-Za-z][A-Za-z0-9+.-]*:\/\/)[^\u0000]+$/;
const Ajv2020 = Ajv2020Import as unknown as new (options: Record<string, unknown>) => { addSchema: (schema: unknown, id?: string) => void; getSchema: (id: string) => MetadataValidator | undefined; validateSchema: (schema: unknown) => boolean };
const addFormats = addFormatsModule.default as unknown as (ajv: { addSchema: (schema: unknown, id?: string) => void }, options: Record<string, unknown>) => void;

export class FrameworkErrorServiceError extends Error {
  public constructor(public readonly code: string, message: string, public readonly causeSummary?: string) {
    super(message);
    this.name = 'FrameworkErrorServiceError';
  }
}

interface MetadataValidator {
  readonly validate: (value: unknown) => boolean;
  readonly errors: readonly unknown[] | null | undefined;
}

export class FrameworkErrorService {
  private readonly definitions: ReadonlyMap<string, FrameworkErrorDefinition>;
  private readonly metadataValidators: ReadonlyMap<string, MetadataValidator>;

  public constructor(definitions: readonly FrameworkErrorDefinition[], metadataValidators: ReadonlyMap<string, MetadataValidator> = new Map()) {
    const indexed = new Map<string, FrameworkErrorDefinition>();
    for (const definition of definitions) {
      if (!isErrorDefinition(definition)) throw new FrameworkErrorServiceError('REGISTRY_SCHEMA_INVALID', 'malformed FrameworkError definition');
      if (indexed.has(definition.code)) throw new FrameworkErrorServiceError('REGISTRY_VALIDATION_FAILED', `duplicate FrameworkError code: ${definition.code}`);
      indexed.set(definition.code, freezeDefinition(definition));
    }
    this.definitions = indexed;
    this.metadataValidators = metadataValidators;
  }

  public static async fromRepository(repositoryRoot: string): Promise<FrameworkErrorService> {
    const file = path.resolve(repositoryRoot, CATALOG_RELATIVE_PATH);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    } catch (cause) {
      throw new FrameworkErrorServiceError('REGISTRY_DOCUMENT_MISSING', `unable to load FrameworkError catalog: ${CATALOG_RELATIVE_PATH}`, String(cause));
    }
    if (!isErrorCatalog(parsed)) throw new FrameworkErrorServiceError('REGISTRY_SCHEMA_INVALID', `invalid FrameworkError catalog: ${CATALOG_RELATIVE_PATH}`);
    validateCanonicalDefinitions(repositoryRoot, parsed.errors);

    const metadataValidators = new Map<string, MetadataValidator>();
    const ajv = new Ajv2020({ strict: true, allErrors: true, validateFormats: true });
    addFormats(ajv, { mode: 'full' });
    const realRepositoryRoot = await fs.realpath(repositoryRoot);
    for (const definition of parsed.errors) {
      if (!SCHEMA_PATH_PATTERN.test(definition.machine_metadata_schema_ref)) {
        throw new FrameworkErrorServiceError('REGISTRY_SCHEMA_INVALID', `invalid metadata schema path for ${definition.code}`);
      }
      const metadataPath = path.resolve(repositoryRoot, definition.machine_metadata_schema_ref);
      if (!isContained(repositoryRoot, metadataPath)) throw new FrameworkErrorServiceError('REGISTRY_PATH_NORMALIZATION_FAILED', `metadata schema escapes repository: ${definition.machine_metadata_schema_ref}`);
      let realMetadataPath: string;
      try { realMetadataPath = await fs.realpath(metadataPath); }
      catch (cause) { throw new FrameworkErrorServiceError('REGISTRY_DOCUMENT_MISSING', `metadata schema is missing: ${definition.machine_metadata_schema_ref}`, String(cause)); }
      if (!isContained(realRepositoryRoot, realMetadataPath)) throw new FrameworkErrorServiceError('REGISTRY_PATH_NORMALIZATION_FAILED', `metadata schema escapes repository: ${definition.machine_metadata_schema_ref}`);
      let metadataSchema: unknown;
      try {
        metadataSchema = JSON.parse(await fs.readFile(realMetadataPath, 'utf8'));
        if (!metadataSchema || typeof metadataSchema !== 'object') throw new Error('schema must be an object');
        const schemaId = typeof (metadataSchema as { $id?: unknown }).$id === 'string' ? (metadataSchema as { $id: string }).$id : undefined;
        if (!schemaId) throw new Error('metadata schema is missing $id');
        if (!metadataValidators.has(definition.machine_metadata_schema_ref)) ajv.addSchema(metadataSchema, schemaId);
        const validator = ajv.getSchema(schemaId) as unknown as ((value: unknown) => boolean) & { errors: readonly unknown[] | null | undefined };
        if (!validator) throw new Error('compiled validator missing');
        metadataValidators.set(definition.machine_metadata_schema_ref, { validate: validator, errors: validator.errors });
      } catch (cause) {
        throw new FrameworkErrorServiceError('REGISTRY_SCHEMA_INVALID', `invalid metadata schema for ${definition.code}`, String(cause));
      }
    }
    return new FrameworkErrorService(parsed.errors, metadataValidators);
  }

  public has(code: string): boolean { return this.definitions.has(code); }

  public getDefinition(code: string): FrameworkErrorDefinition {
    const definition = this.definitions.get(code);
    if (!definition) throw new FrameworkErrorServiceError('REGISTRY_VALIDATION_FAILED', `unknown FrameworkError code: ${code}`);
    return definition;
  }

  /** @deprecated Use getDefinition. */
  public get(code: string): FrameworkErrorDefinition { return this.getDefinition(code); }

  public createOccurrence(code: string, metadata: JsonValue = {}, evidence: readonly EvidenceRef[] = [], context: ErrorContext = {}): RuntimeFrameworkError {
    const definition = this.getDefinition(code);
    const metadataValidator = this.metadataValidators.get(definition.machine_metadata_schema_ref);
    if (!metadataValidator) throw new FrameworkErrorServiceError('REGISTRY_SCHEMA_INVALID', `metadata schema is not loaded: ${definition.machine_metadata_schema_ref}`);
    if (!metadataValidator.validate(metadata)) throw new FrameworkErrorServiceError('REGISTRY_VALIDATION_FAILED', `metadata does not match ${definition.machine_metadata_schema_ref}`);
    if (!evidence.every(isEvidenceRef)) throw new FrameworkErrorServiceError('REGISTRY_VALIDATION_FAILED', `invalid evidence reference for ${code}`);
    const frozenContext = Object.freeze(Object.fromEntries(Object.entries(context).filter((entry): entry is [string, string] => typeof entry[1] === 'string')));
    const occurrence: RuntimeFrameworkError = {
      code,
      definition,
      message: formatMessage(definition.human_message_template, context),
      machine_metadata: freezeJson(metadata),
      evidence: Object.freeze(evidence.map((ref) => Object.freeze({ ...ref }))),
      context: frozenContext,
    };
    return Object.freeze(occurrence);
  }

  /** @deprecated Use createOccurrence. */
  public create(code: string, options: FrameworkErrorOptions = {}): RuntimeFrameworkError {
    return this.createOccurrence(code, options.metadata ?? {}, options.evidence ?? [], options.context ?? {});
  }

  public createDiagnostic(code: string, diagnostics: Record<string, unknown> = {}, context: ErrorContext = {}): RuntimeFrameworkError {
    const definition = this.getDefinition(code);
    const metadata = diagnosticMetadata(definition.machine_metadata_schema_ref, diagnostics);
    return this.createOccurrence(code, metadata, [], context);
  }

  public toCanonicalRecord(error: RuntimeFrameworkError): FrameworkErrorDefinition { return error.definition; }

  public async validate<T>(error: RuntimeFrameworkError, validateRecord: (schemaPath: string, value: unknown) => Promise<ValidationResult<T>>): Promise<ValidationResult<T>> {
    return validateRecord('docs/ai-engineering-framework/fcr/schemas/framework-error.schema.json', error.definition);
  }

  public async createValidated<T>(code: string, options: FrameworkErrorOptions, validateRecord: (schemaPath: string, value: unknown) => Promise<ValidationResult<T>>): Promise<RuntimeFrameworkError> {
    const error = this.create(code, options);
    const result = await this.validate(error, validateRecord);
    if (!result.valid) throw new FrameworkErrorServiceError('REGISTRY_VALIDATION_FAILED', `invalid FrameworkError definition: ${code}`);
    return error;
  }
}

function formatMessage(template: string, context: ErrorContext): string {
  return `${template}${context.correlationId ? ` correlation_id=${context.correlationId}` : ''}${context.taskId ? ` task_id=${context.taskId}` : ''}`;
}

function isErrorCatalog(value: unknown): value is { errors: FrameworkErrorDefinition[] } {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as { errors?: unknown }).errors) && (value as { errors: unknown[] }).errors.every(isErrorDefinition));
}

function isErrorDefinition(value: unknown): value is FrameworkErrorDefinition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const required = ['code', 'schema_version', 'severity', 'response_contract_status', 'blocker_category', 'retryable', 'resume_condition', 'human_message_template', 'machine_metadata_schema_ref', 'evidence_requirements', 'cleanup_behavior', 'transaction_effect', 'lifecycle_effect', 'escalation_required', 'recovery_operation', 'terminal'];
  if (required.some((key) => !(key in record))) return false;
  if (typeof record.code !== 'string' || typeof record.schema_version !== 'string' || !/^\d+\.\d+\.\d+$/.test(record.schema_version)) return false;
  if (!['P0', 'P1', 'P2', 'P3'].includes(String(record.severity))) return false;
  if (!['TASK PREPARATION BLOCKED', 'READY FOR IMPLEMENTATION', 'IMPLEMENTATION BLOCKED', 'READY FOR REVIEW', 'APPROVED', 'APPROVED WITH FOLLOW-UP', 'CHANGES REQUIRED', 'BLOCKED', 'QA APPROVED', 'QA APPROVED WITH FOLLOW-UP', 'QA CHANGES REQUIRED', 'QA BLOCKED', 'READY FOR MERGE', 'MERGED', 'DONE'].includes(String(record.response_contract_status))) return false;
  if (typeof record.blocker_category !== 'string' || typeof record.retryable !== 'boolean' || typeof record.resume_condition !== 'string' || typeof record.human_message_template !== 'string' || typeof record.machine_metadata_schema_ref !== 'string' || typeof record.cleanup_behavior !== 'string' || typeof record.transaction_effect !== 'string' || typeof record.lifecycle_effect !== 'string' || typeof record.escalation_required !== 'boolean' || typeof record.recovery_operation !== 'string' || typeof record.terminal !== 'boolean') return false;
  return Array.isArray(record.evidence_requirements) && record.evidence_requirements.every(isEvidenceRef);
}

function validateCanonicalDefinitions(repositoryRoot: string, definitions: readonly FrameworkErrorDefinition[]): void {
  const files = ['common-types.schema.json', 'evidence-ref.schema.json', 'framework-error.schema.json'];
  if (!fsSync.existsSync(path.join(repositoryRoot, CANONICAL_SCHEMA_ROOT, 'framework-error.schema.json'))) return;
  const schemas = new Map<string, Record<string, unknown>>();
  const ids = new Map<string, string>();
  try {
    for (const filename of files) {
      const sourcePath = path.join(repositoryRoot, CANONICAL_SCHEMA_ROOT, filename);
      const schema = JSON.parse(requireNodeFs(sourcePath)) as Record<string, unknown>;
      const id = typeof schema.$id === 'string' ? schema.$id : undefined;
      if (!id) throw new Error(`missing $id in ${filename}`);
      schemas.set(filename, schema);
      ids.set(filename, id);
    }
    const ajv = new Ajv2020({ strict: true, allErrors: true, validateFormats: true });
    addFormats(ajv, { mode: 'full' });
    for (const [filename, schema] of schemas) {
      const normalized = rewriteSchemaReferences(schema, filename, ids);
      if (!ajv.validateSchema(normalized)) throw new Error(`invalid schema ${filename}`);
      ajv.addSchema(normalized, String(normalized.$id));
    }
    const frameworkId = ids.get('framework-error.schema.json');
    const validator = frameworkId ? ajv.getSchema(frameworkId) : undefined;
    if (!validator) throw new Error('framework-error schema validator is unavailable');
    const validate = validator as unknown as (value: unknown) => boolean;
    for (const definition of definitions) if (!validate(definition)) throw new Error(`invalid FrameworkError definition: ${definition.code}`);
  } catch (cause) {
    throw new FrameworkErrorServiceError('REGISTRY_SCHEMA_INVALID', 'canonical FrameworkError definitions failed schema validation', String(cause));
  }
}

function requireNodeFs(filePath: string): string {
  // The service is initialized before the asynchronous runtime is available;
  // this synchronous read is limited to three immutable architecture schemas.
  return fsSync.readFileSync(filePath, 'utf8');
}

function rewriteSchemaReferences(schema: Record<string, unknown>, sourceFilename: string, ids: ReadonlyMap<string, string>): Record<string, unknown> {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    const object = value as Record<string, unknown>;
    if (typeof object.$ref === 'string' && object.$ref.startsWith('./')) {
      const [filename, fragment] = object.$ref.split('#', 2);
      const targetId = filename ? ids.get(filename.slice(2)) : undefined;
      if (!targetId) throw new Error(`unresolved FrameworkError schema reference ${object.$ref}`);
      return { ...object, $ref: `${targetId}${fragment ? `#${fragment}` : ''}` };
    }
    return Object.fromEntries(Object.entries(object).map(([key, child]) => [key, visit(child)]));
  };
  return visit(schema) as Record<string, unknown>;
}

function isEvidenceRef(value: unknown): value is EvidenceRef {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const ref = value as Record<string, unknown>;
  return typeof ref.evidence_id === 'string' && /^[A-Z0-9][A-Z0-9._-]{0,127}$/.test(ref.evidence_id) && typeof ref.canonical_path === 'string' && REPOSITORY_PATH_PATTERN.test(ref.canonical_path) && typeof ref.required === 'boolean' && typeof ref.predicate_id === 'string' && /^[A-Z0-9][A-Z0-9._-]{0,127}$/.test(ref.predicate_id);
}

function freezeDefinition(definition: FrameworkErrorDefinition): FrameworkErrorDefinition {
  return Object.freeze({ ...definition, evidence_requirements: Object.freeze(definition.evidence_requirements.map((ref) => Object.freeze({ ...ref }))) });
}

function freezeJson<T extends JsonValue>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) { value.forEach((child) => freezeJson(child)); return Object.freeze(value) as T; }
  Object.values(value).forEach((child) => freezeJson(child));
  return Object.freeze(value) as T;
}

function isContained(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function diagnosticMetadata(schemaPath: string, diagnostics: Record<string, unknown>): JsonValue {
  const base: Record<string, JsonValue> = {
    transaction_id: 'UNAVAILABLE', request_id: 'UNAVAILABLE', task_id: 'UNAVAILABLE', module_id: 'FCR',
    repository_id: 'UNAVAILABLE', repository_revision: 'UNAVAILABLE', registry_revision: 'UNAVAILABLE',
    failure_phase: 'VALIDATION', source_ids: JSON.stringify(diagnostics), validator_name: 'FCR',
    validator_version: 'V2-006', recovery_id: 'NONE',
  };
  const filename = path.basename(schemaPath);
  const specificKey: Record<string, string> = {
    'error-authority.schema.json': 'source_hashes', 'error-context.schema.json': 'candidate_ids',
    'error-dependency.schema.json': 'edge_ids', 'error-evidence.schema.json': 'predicate_id',
    'error-identity.schema.json': 'identity_fingerprint', 'error-lifecycle.schema.json': 'lifecycle_revision',
    'error-persistence.schema.json': 'journal_step', 'error-repository.schema.json': 'lock_id',
    'error-resolution.schema.json': 'identity_fingerprint', 'error-scope.schema.json': 'path_rules',
    'error-validation.schema.json': 'validation_path', 'error-validator.schema.json': 'validator_exit_code',
  };
  const key = specificKey[filename];
  if (key === 'validator_exit_code') base[key] = '1';
  else if (key === 'source_hashes' || key === 'candidate_ids' || key === 'edge_ids' || key === 'path_rules') base[key] = [JSON.stringify(diagnostics)];
  else if (key === 'validation_path') base[key] = typeof diagnostics.path === 'string' ? diagnostics.path : typeof diagnostics.schema_path === 'string' ? diagnostics.schema_path : 'UNAVAILABLE';
  else if (key) base[key] = typeof diagnostics[key] === 'string' ? diagnostics[key] as string : JSON.stringify(diagnostics);
  return base;
}
