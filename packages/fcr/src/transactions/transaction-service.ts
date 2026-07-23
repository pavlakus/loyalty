import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { ArtifactCategory, IndexedArtifact, RuntimeFrameworkError, TransactionRecord } from '../artifacts/artifact-types.js';
import { ArtifactLoader } from '../artifacts/artifact-loader.js';
import { CanonicalJsonService } from '../canonical/canonical-json-service.js';
import { resolveRepositoryRoot, normalizeRepositoryRelativePath } from '../config/repository-paths.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import { RegistryFilesystemPathResolver } from '../persistence/filesystem-paths.js';
import { RegistryRepository } from '../persistence/registry-repository.js';
import { SchemaValidator } from '../validation/schema-validator.js';
import { planForArtifact } from '../validation/artifact-schema-map.js';

export const TRANSACTION_RECORD_SCHEMA_PATH = 'docs/ai-engineering-framework/fcr/schemas/transaction-record.schema.json';

export interface CreateTransactionInput {
  readonly transaction_id?: string;
  readonly request_id: string;
  readonly idempotency_key: string;
  readonly repository_id: string;
  readonly repository_revision: string;
  readonly parent_revision?: string | null;
  readonly owner: string;
  readonly recovery_operation: string;
}

export interface StagedArtifact {
  readonly transaction_id: string;
  readonly artifact_path: string;
  readonly staging_path: string;
  readonly content_hash: string;
}

export type TransactionFailureKind =
  | 'DUPLICATE_TRANSACTION'
  | 'TRANSACTION_MISSING'
  | 'TRANSACTION_INVALID'
  | 'TRANSACTION_STATE_UNSUPPORTED'
  | 'ARTIFACT_INVALID'
  | 'STAGING_PATH_ESCAPE'
  | 'STAGING_FAILED'
  | 'PERSISTENCE_FAILURE';

export class TransactionServiceError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly failureKind: TransactionFailureKind,
    public readonly causeSummary?: string,
  ) {
    super(message);
    this.name = 'TransactionServiceError';
  }
}

export class TransactionService {
  private readonly paths: RegistryFilesystemPathResolver;

  public constructor(
    private readonly repository: RegistryRepository,
    private readonly errorService: FrameworkErrorService,
    private readonly schemaValidator: SchemaValidator,
    private readonly canonicalJson: CanonicalJsonService = new CanonicalJsonService(),
  ) {
    this.paths = new RegistryFilesystemPathResolver(repository.paths.repositoryRoot);
  }

  public static async create(repositoryRoot: string = process.cwd()): Promise<TransactionService> {
    const resolvedRoot = resolveRepositoryRoot(repositoryRoot);
    const errorService = await FrameworkErrorService.fromRepository(resolvedRoot);
    const loader = new ArtifactLoader(resolvedRoot);
    const schemaValidator = new SchemaValidator(loader, errorService);
    const repository = new RegistryRepository(resolvedRoot, errorService, schemaValidator);
    return new TransactionService(repository, errorService, schemaValidator);
  }

  public async createTransaction(input: CreateTransactionInput): Promise<Readonly<TransactionRecord>> {
    const transactionId = this.requireTransactionId(input.transaction_id ?? `TX-${randomUUID().replaceAll('-', '').toUpperCase()}`);
    await this.repository.bootstrap();
    let transactionPath: string;
    try {
      transactionPath = this.paths.childPath('transactions', `${transactionId}.json`);
      await this.paths.assertContainedFilesystemPath(transactionPath);
    } catch (cause) {
      throw this.pathError(cause);
    }

    if (await this.fileExists(transactionPath)) {
      throw this.transactionError(
        `transaction already exists: ${transactionId}`,
        'REGISTRY_VALIDATION_FAILED',
        'DUPLICATE_TRANSACTION',
        { transaction_id: transactionId },
      );
    }

    const timestamp = new Date().toISOString();
    const record: TransactionRecord = {
      schema_version: '1.0.0',
      transaction_id: transactionId,
      request_id: input.request_id,
      idempotency_key: input.idempotency_key,
      repository_id: input.repository_id,
      repository_revision: input.repository_revision,
      ...(input.parent_revision !== undefined ? { parent_revision: input.parent_revision } : {}),
      state: 'NEW',
      owner: input.owner,
      lock_ids: [],
      staging_root: this.paths.relativePath(this.paths.childPath('staging', transactionId)),
      candidate_hashes: {},
      recovery_operation: input.recovery_operation,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await this.validateTransactionRecord(record, 'TRANSACTION_INVALID');
    const stagingPath = this.paths.childPath('staging', transactionId);
    let createdStaging = false;
    try {
      await this.paths.assertContainedFilesystemPath(stagingPath);
      await fs.mkdir(stagingPath, { recursive: false });
      createdStaging = true;
      await this.paths.assertContainedFilesystemPath(stagingPath);
      await this.writeCanonical(transactionPath, record, 'create_transaction');
    } catch (cause) {
      const primaryError = cause instanceof TransactionServiceError
        ? cause
        : this.persistenceError('create_transaction', cause);
      if (createdStaging) {
        try {
          await this.removeCreatedStagingDirectory(stagingPath);
        } catch (cleanupCause) {
          this.attachCleanupDiagnostic(primaryError, cleanupCause);
        }
      }
      throw primaryError;
    }
    const persisted = await this.loadTransaction(transactionId);
    return persisted;
  }

  public async loadTransaction(transactionId: string): Promise<Readonly<TransactionRecord>> {
    const validatedTransactionId = this.requireTransactionId(transactionId);
    const transactionPath = await this.transactionPath(validatedTransactionId);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await fs.readFile(transactionPath, 'utf8')) as unknown;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
        throw this.transactionError(`transaction is missing: ${validatedTransactionId}`, 'REGISTRY_DOCUMENT_MISSING', 'TRANSACTION_MISSING', { transaction_id: validatedTransactionId });
      }
      if (cause instanceof SyntaxError) {
        throw this.transactionError(`transaction JSON is malformed: ${validatedTransactionId}`, 'REGISTRY_VALIDATION_FAILED', 'TRANSACTION_INVALID', { transaction_id: validatedTransactionId });
      }
      throw this.persistenceError('load_transaction', cause);
    }
    const validation = await this.schemaValidator.validateRecord<TransactionRecord>(TRANSACTION_RECORD_SCHEMA_PATH, parsed);
    if (!validation.valid || !validation.value) {
      throw this.transactionError(
        `transaction record is invalid: ${validatedTransactionId}`,
        'REGISTRY_VALIDATION_FAILED',
        'TRANSACTION_INVALID',
        { transaction_id: validatedTransactionId, schema_path: TRANSACTION_RECORD_SCHEMA_PATH, issues: validation.issues },
      );
    }
    if (validation.value.state !== 'NEW') {
      throw this.transactionError(
        `transaction state is unsupported in V2-007B: ${validation.value.state}`,
        'REGISTRY_VALIDATION_FAILED',
        'TRANSACTION_STATE_UNSUPPORTED',
        { transaction_id: validatedTransactionId, state: validation.value.state },
      );
    }
    return validation.value;
  }

  public async transactionExists(transactionId: string): Promise<boolean> {
    const validatedTransactionId = this.requireTransactionId(transactionId);
    const transactionPath = await this.transactionPath(validatedTransactionId);
    try {
      const stat = await fs.stat(transactionPath);
      if (!stat.isFile()) throw this.transactionError(`transaction target is not a regular file: ${validatedTransactionId}`, 'REGISTRY_VALIDATION_FAILED', 'TRANSACTION_INVALID', { transaction_id: validatedTransactionId });
      return true;
    } catch (cause) {
      if (cause instanceof TransactionServiceError) throw cause;
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw this.persistenceError('transaction_exists', cause);
    }
  }

  public async createStagingArea(transactionId: string): Promise<string> {
    const validatedTransactionId = this.requireTransactionId(transactionId);
    const transaction = await this.loadTransaction(validatedTransactionId);
    if (transaction.state !== 'NEW') throw this.stateError(validatedTransactionId, transaction.state);
    const stagingPath = this.paths.childPath('staging', validatedTransactionId);
    try {
      await this.paths.assertContainedFilesystemPath(stagingPath);
    } catch (cause) {
      throw this.pathError(cause);
    }
    try {
      await fs.mkdir(stagingPath, { recursive: true });
      return stagingPath;
    } catch (cause) {
      throw this.stagingError('create_staging_area', cause);
    }
  }

  public async stageArtifact(transactionId: string, artifactPath: string, category: ArtifactCategory, artifact: unknown): Promise<StagedArtifact> {
    const validatedTransactionId = this.requireTransactionId(transactionId);
    const transaction = await this.loadTransaction(validatedTransactionId);
    if (transaction.state !== 'NEW') throw this.stateError(validatedTransactionId, transaction.state);
    let normalizedArtifactPath: string;
    try {
      normalizedArtifactPath = normalizeRepositoryRelativePath(artifactPath);
    } catch (cause) {
      throw this.pathError(cause);
    }
    const descriptor = {
      repositoryRelativePath: normalizedArtifactPath,
      absolutePath: '',
      category,
      raw: artifact,
      byteLength: 0,
    } as IndexedArtifact;
    let plan;
    try {
      plan = planForArtifact(descriptor);
    } catch (cause) {
      throw this.transactionError(`staged artifact mapping is invalid: ${normalizedArtifactPath}`, 'REGISTRY_SCHEMA_INVALID', 'ARTIFACT_INVALID', { source: normalizedArtifactPath, category, reason: cause instanceof Error ? cause.message : 'canonical mapping failed' }, cause);
    }
    if (plan.kind !== 'RECORD' || plan.selector !== 'whole') {
      throw this.transactionError(`staged artifact kind is unsupported: ${normalizedArtifactPath}`, 'REGISTRY_SCHEMA_INVALID', 'ARTIFACT_INVALID', { source: normalizedArtifactPath, category, reason: 'artifact must map to one canonical whole-record schema' });
    }
    const validation = await this.schemaValidator.validateRecord(plan.schemaPath, artifact);
    if (!validation.valid) {
      throw this.transactionError(
        `staged artifact is invalid: ${artifactPath}`,
        'REGISTRY_VALIDATION_FAILED',
        'ARTIFACT_INVALID',
        { source: normalizedArtifactPath, category, schema_path: plan.schemaPath, issues: validation.issues },
      );
    }
    let destination: string;
    try {
      const stagingRoot = await this.createStagingArea(validatedTransactionId);
      destination = path.resolve(stagingRoot, normalizedArtifactPath);
      const relative = path.relative(stagingRoot, destination);
      if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('staging path escapes transaction staging area');
      await this.paths.assertContainedFilesystemPath(destination);
    } catch (cause) {
      if (cause instanceof TransactionServiceError) throw cause;
      throw this.pathError(cause);
    }

    try {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await this.paths.assertContainedFilesystemPath(destination);
      const canonicalBytes = this.canonicalJson.canonicalBytes(artifact);
      await fs.writeFile(destination, Buffer.concat([Buffer.from(canonicalBytes), Buffer.from('\n', 'utf8')]), { flag: 'wx' });
      return Object.freeze({
        transaction_id: validatedTransactionId,
        artifact_path: normalizedArtifactPath,
        staging_path: this.paths.relativePath(destination),
        content_hash: this.canonicalJson.sha256(artifact),
      });
    } catch (cause) {
      if (cause instanceof TransactionServiceError) throw cause;
      throw this.stagingError('stage_artifact', cause);
    }
  }

  private async transactionPath(transactionId: string): Promise<string> {
    const validatedTransactionId = this.requireTransactionId(transactionId);
    try {
      const transactionPath = this.paths.childPath('transactions', `${validatedTransactionId}.json`);
      await this.paths.assertContainedFilesystemPath(transactionPath);
      return transactionPath;
    } catch (cause) {
      throw this.pathError(cause);
    }
  }

  private requireTransactionId(transactionId: string): string {
    if (!/^[A-Z0-9][A-Z0-9._-]{0,127}$/.test(transactionId)) {
      throw this.transactionError('transaction identifier is invalid', 'REGISTRY_VALIDATION_FAILED', 'TRANSACTION_INVALID', { transaction_id: transactionId });
    }
    return transactionId;
  }

  private async removeCreatedStagingDirectory(stagingPath: string): Promise<void> {
    await this.paths.assertContainedFilesystemPath(stagingPath);
    try {
      await fs.rmdir(stagingPath);
    } catch (cause) {
      const code = (cause as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw cause;
    }
  }

  private attachCleanupDiagnostic(error: TransactionServiceError, cause: unknown): void {
    Object.defineProperty(error, 'cleanupFailureSummary', {
      value: cause instanceof Error ? cause.message : 'cleanup failed',
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }

  private async validateTransactionRecord(record: TransactionRecord, kind: TransactionFailureKind): Promise<void> {
    const validation = await this.schemaValidator.validateRecord<TransactionRecord>(TRANSACTION_RECORD_SCHEMA_PATH, record);
    if (!validation.valid) {
      throw this.transactionError('transaction record is invalid', 'REGISTRY_VALIDATION_FAILED', kind, { schema_path: TRANSACTION_RECORD_SCHEMA_PATH, issues: validation.issues });
    }
  }

  private async writeCanonical(filePath: string, value: unknown, step: string): Promise<void> {
    const bytes = this.canonicalJson.canonicalBytes(value);
    await fs.writeFile(filePath, Buffer.concat([Buffer.from(bytes), Buffer.from('\n', 'utf8')]), { flag: 'wx' });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath);
      return true;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw this.persistenceError('transaction_exists', cause);
    }
  }

  private pathError(cause: unknown): TransactionServiceError {
    return this.transactionError('transaction path escapes the canonical repository', 'REGISTRY_PATH_NORMALIZATION_FAILED', 'STAGING_PATH_ESCAPE', { reason: cause instanceof Error ? cause.message : 'path containment failed' }, cause);
  }

  private stagingError(step: string, cause: unknown): TransactionServiceError {
    return this.transactionError(`transaction staging failed during ${step}`, 'REGISTRY_STAGING_FAILED', 'STAGING_FAILED', { journal_step: step }, cause);
  }

  private persistenceError(step: string, cause: unknown): TransactionServiceError {
    return this.transactionError(`transaction persistence failed during ${step}`, 'REGISTRY_ARTIFACT_PERSISTENCE_FAILED', 'PERSISTENCE_FAILURE', { journal_step: step }, cause);
  }

  private stateError(transactionId: string, state: string): TransactionServiceError {
    return this.transactionError(`transaction state is unsupported in V2-007B: ${state}`, 'REGISTRY_VALIDATION_FAILED', 'TRANSACTION_STATE_UNSUPPORTED', { transaction_id: transactionId, state });
  }

  private transactionError(message: string, code: string, failureKind: TransactionFailureKind, metadata: Record<string, unknown>, cause?: unknown): TransactionServiceError {
    return new TransactionServiceError(message, this.errorService.createDiagnostic(code, metadata), failureKind, cause instanceof Error ? cause.message : undefined);
  }
}
