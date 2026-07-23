import fs from 'node:fs/promises';

import { FrameworkErrorService } from '../errors/framework-error-service.js';
import type { RuntimeFrameworkError } from '../artifacts/artifact-types.js';
import type { SchemaValidator } from '../validation/schema-validator.js';
import {
  REGISTRY_WRITE_LOCK_ID,
  REGISTRY_WRITE_NAMESPACE,
  type LockRecord,
} from './lock-types.js';
import { LOCK_RECORD_SCHEMA_PATH } from './lock-record.js';
import { RegistryLockPathResolver } from './lock-paths.js';

export type RegistryLockLoadingFailureKind =
  | 'LOCK_MISSING'
  | 'LOCK_INVALID'
  | 'LOCK_PATH_ESCAPE'
  | 'PERSISTENCE_FAILURE';

export class RegistryLockLoadingError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly failureKind: RegistryLockLoadingFailureKind,
    public readonly causeSummary?: string,
  ) {
    super(frameworkError.message);
    this.name = 'RegistryLockLoadingError';
  }
}

export class RegistryLockLoadingService {
  private readonly paths: RegistryLockPathResolver;

  public constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly errorService: FrameworkErrorService,
    repositoryRoot: string,
  ) {
    this.paths = new RegistryLockPathResolver(repositoryRoot);
  }

  public async registryWriteLockExists(): Promise<boolean> {
    try {
      await this.loadRegistryWriteLock();
      return true;
    } catch (cause) {
      if (cause instanceof RegistryLockLoadingError
        && (cause.failureKind === 'LOCK_MISSING' || cause.failureKind === 'LOCK_INVALID')) return false;
      if (cause instanceof RegistryLockLoadingError) throw cause;
      throw this.persistenceError('registry_write_lock_exists', cause);
    }
  }

  public async loadRegistryWriteLock(): Promise<Readonly<LockRecord>> {
    const lockPath = await this.containedLockPath();
    let stat: Awaited<ReturnType<typeof fs.stat>>;
    try {
      stat = await fs.stat(lockPath);
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
        throw this.missingError();
      }
      throw this.persistenceError('load_registry_write_lock_stat', cause);
    }
    if (!stat.isFile()) {
      throw this.invalidError('registry-write lock target is not a regular file', 'LOCK_INVALID', {
        lock_id: REGISTRY_WRITE_LOCK_ID,
        reason: 'active lock target is not a regular file',
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(await fs.readFile(lockPath, 'utf8')) as unknown;
    } catch (cause) {
      if (cause instanceof SyntaxError) {
        throw this.invalidError('registry-write lock JSON is malformed', 'LOCK_INVALID', {
          lock_id: REGISTRY_WRITE_LOCK_ID,
          schema_path: LOCK_RECORD_SCHEMA_PATH,
          reason: 'malformed JSON',
        }, cause);
      }
      throw this.persistenceError('load_registry_write_lock', cause);
    }

    const validation = await this.schemaValidator.validateRecord<LockRecord>(LOCK_RECORD_SCHEMA_PATH, parsed);
    if (!validation.valid || !validation.value) {
      throw this.invalidError('registry-write lock record is schema-invalid', 'LOCK_INVALID', {
        lock_id: REGISTRY_WRITE_LOCK_ID,
        schema_path: LOCK_RECORD_SCHEMA_PATH,
        issues: validation.issues,
      });
    }

    const record = validation.value;
    if (record.lock_id !== REGISTRY_WRITE_LOCK_ID || record.namespace !== REGISTRY_WRITE_NAMESPACE) {
      throw this.invalidError('registry-write lock identity is invalid', 'LOCK_INVALID', {
        lock_id: REGISTRY_WRITE_LOCK_ID,
        reason: 'singleton lock identity mismatch',
      });
    }
    return record;
  }

  private async containedLockPath(): Promise<string> {
    const lockPath = this.paths.resolveRegistryWriteLockPath();
    try {
      await this.paths.assertContainedPath(lockPath);
      return lockPath;
    } catch (cause) {
      throw new RegistryLockLoadingError(
        'registry-write lock path is outside the canonical repository',
        this.errorService.createDiagnostic('REGISTRY_PATH_NORMALIZATION_FAILED', { path: lockPath, reason: safeCause(cause) }),
        'LOCK_PATH_ESCAPE',
        safeCause(cause),
      );
    }
  }

  private missingError(): RegistryLockLoadingError {
    return new RegistryLockLoadingError(
      'registry-write lock is missing',
      this.errorService.createOccurrence('REGISTRY_LOCK_MISSING', {
        transaction_id: 'UNAVAILABLE',
        request_id: 'UNAVAILABLE',
        task_id: 'UNAVAILABLE',
        module_id: 'FCR',
        repository_id: 'UNAVAILABLE',
        repository_revision: 'UNAVAILABLE',
        registry_revision: 'UNAVAILABLE',
        failure_phase: 'LOAD',
        source_ids: 'REGISTRY_WRITE',
        validator_name: 'FCR',
        validator_version: 'V2-007C',
        recovery_id: 'NONE',
        lock_id: REGISTRY_WRITE_LOCK_ID,
        observed_heartbeat: 'UNAVAILABLE',
      }),
      'LOCK_MISSING',
    );
  }

  private invalidError(
    message: string,
    failureKind: 'LOCK_INVALID',
    diagnostics: Record<string, unknown>,
    cause?: unknown,
    code: 'REGISTRY_SCHEMA_INVALID' | 'REGISTRY_INVALID_TRANSITION' = 'REGISTRY_SCHEMA_INVALID',
  ): RegistryLockLoadingError {
    return new RegistryLockLoadingError(
      message,
      this.errorService.createDiagnostic(code, diagnostics),
      failureKind,
      safeCause(cause),
    );
  }

  private persistenceError(step: string, cause: unknown): RegistryLockLoadingError {
    return new RegistryLockLoadingError(
      'registry-write lock persistence operation failed',
      this.errorService.createDiagnostic('REGISTRY_PERSISTENCE_FAILED', { journal_step: step }),
      'PERSISTENCE_FAILURE',
      safeCause(cause),
    );
  }
}

function safeCause(cause: unknown): string | undefined {
  return cause instanceof Error ? cause.message : cause === undefined ? undefined : String(cause);
}
