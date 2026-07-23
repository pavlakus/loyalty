import fs from 'node:fs/promises';

import type { RuntimeFrameworkError, Timestamp } from '../artifacts/artifact-types.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import type { SchemaValidator } from '../validation/schema-validator.js';
import { assertRegistryLockOwner } from './lock-prerequisites.js';
import { RegistryLockPathResolver } from './lock-paths.js';
import { RegistryLockLoadingService } from './lock-loading.js';
import { LOCK_TRANSITION_RECORD_SCHEMA_PATH, RegistryLockTransitionPersistenceService } from './lock-transition-persistence.js';
import { LOCK_ACQUIRED_STATE, type LockTransitionRecord, type RegistryLockOwner } from './lock-types.js';
import { CanonicalJsonService } from '../canonical/canonical-json-service.js';

const CANONICAL_ID_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,127}$/;
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export class RegistryLockReleaseError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly causeSummary?: string,
  ) {
    super(frameworkError.message);
    this.name = 'RegistryLockReleaseError';
  }
}

export class RegistryLockReleaseService {
  private readonly paths: RegistryLockPathResolver;

  public constructor(
    private readonly loading: RegistryLockLoadingService,
    private readonly transitions: RegistryLockTransitionPersistenceService,
    private readonly errorService: FrameworkErrorService,
    repositoryRoot: string,
    private readonly schemaValidator: SchemaValidator,
    /** @internal Narrow filesystem seam for deterministic deletion-failure tests. */
    private readonly unlinkFile: (filePath: string) => Promise<void> = (filePath) => fs.unlink(filePath),
  ) {
    this.paths = new RegistryLockPathResolver(repositoryRoot);
  }

  public async releaseRegistryWriteLock(owner: RegistryLockOwner, occurredAt: Timestamp): Promise<Readonly<LockTransitionRecord>> {
    this.validateReleaseInput(owner, occurredAt);
    const lock = await this.loading.loadRegistryWriteLock();
    this.assertAcquired(lock.state);
    assertRegistryLockOwner(lock, owner, this.errorService);
    const transition = await this.transitions.persistReleaseTransition({ lockRecord: lock, occurredAt });
    await this.deleteActiveLock();
    return transition;
  }

  public async retryRegistryWriteRelease(owner: RegistryLockOwner, occurredAt: Timestamp): Promise<Readonly<LockTransitionRecord>> {
    this.validateReleaseInput(owner, occurredAt);
    const lock = await this.loading.loadRegistryWriteLock();
    this.assertAcquired(lock.state);
    assertRegistryLockOwner(lock, owner, this.errorService);
    const expected = await this.transitions.constructReleaseTransition({ lockRecord: lock, occurredAt });
    const transitionPath = this.paths.resolveRegistryWriteTransitionPath(expected.transition_id);
    await this.paths.assertContainedPath(transitionPath);

    let parsed: unknown;
    try {
      parsed = JSON.parse(await fs.readFile(transitionPath, 'utf8')) as unknown;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
        return this.releaseRegistryWriteLock(owner, occurredAt);
      }
      if (cause instanceof SyntaxError) {
        throw this.transitionValidationError('existing release transition JSON is malformed');
      }
      throw new RegistryLockReleaseError(
        'existing release transition could not be read',
        this.errorService.createDiagnostic('REGISTRY_PERSISTENCE_FAILED', { journal_step: 'retry_read_registry_lock_transition' }),
        cause instanceof Error ? cause.message : String(cause),
      );
    }

    const validation = await this.schemaValidator.validateRecord<LockTransitionRecord>(LOCK_TRANSITION_RECORD_SCHEMA_PATH, parsed);
    if (!validation.valid || !validation.value) {
      throw this.transitionValidationError('existing release transition is schema-invalid');
    }
    const canonicalJson = new CanonicalJsonService();
    if (canonicalJson.canonicalize(validation.value) !== canonicalJson.canonicalize(expected)) {
      throw new RegistryLockReleaseError(
        'existing release transition conflicts with the current acquisition',
        this.errorService.createOccurrence('REGISTRY_TRANSITION_CONFLICT', {
          transaction_id: owner.ownerTransactionId,
          request_id: 'UNAVAILABLE',
          task_id: 'UNAVAILABLE',
          module_id: 'FCR',
          repository_id: 'UNAVAILABLE',
          repository_revision: 'UNAVAILABLE',
          registry_revision: 'UNAVAILABLE',
          failure_phase: 'VALIDATION',
          source_ids: expected.transition_id,
          validator_name: 'FCR',
          validator_version: 'V2-007C',
          recovery_id: 'NONE',
          lock_id: 'REGISTRY_WRITE',
          observed_heartbeat: lock.heartbeat_at,
        }),
      );
    }
    await this.deleteActiveLock();
    return validation.value;
  }

  private async deleteActiveLock(): Promise<void> {
    const lockPath = this.paths.resolveRegistryWriteLockPath();
    try {
      await this.paths.assertContainedPath(lockPath);
      await this.unlinkFile(lockPath);
    } catch (cause) {
      throw new RegistryLockReleaseError(
        'registry-write lock deletion failed after transition persistence',
        this.errorService.createDiagnostic('REGISTRY_PARTIAL_WRITE', { journal_step: 'release_registry_write_lock' }),
        cause instanceof Error ? cause.message : String(cause),
      );
    }
  }

  private transitionValidationError(message: string): RegistryLockReleaseError {
    return new RegistryLockReleaseError(
      message,
      this.errorService.createDiagnostic('REGISTRY_SCHEMA_INVALID', { schema_path: LOCK_TRANSITION_RECORD_SCHEMA_PATH, reason: message }),
    );
  }

  private assertAcquired(state: string): void {
    if (state !== LOCK_ACQUIRED_STATE) {
      throw new RegistryLockReleaseError(
        'registry-write lock state does not permit this operation',
        this.errorService.createDiagnostic('REGISTRY_INVALID_TRANSITION', { lock_id: 'REGISTRY_WRITE', state }),
      );
    }
  }

  private validateReleaseInput(owner: RegistryLockOwner, occurredAt: Timestamp): void {
    const keys = Object.keys(owner as object).sort();
    if (keys.length !== 2 || keys[0] !== 'ownerIdentity' || keys[1] !== 'ownerTransactionId'
      || !CANONICAL_ID_PATTERN.test(owner.ownerTransactionId)
      || !CANONICAL_ID_PATTERN.test(owner.ownerIdentity)) {
      throw new RegistryLockReleaseError(
        'registry lock release owner is invalid',
        this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { reason: 'registry lock release owner is invalid' }),
      );
    }
    if (!CANONICAL_TIMESTAMP_PATTERN.test(occurredAt) || !Number.isFinite(Date.parse(occurredAt))) {
      throw new RegistryLockReleaseError(
        'registry lock release timestamp is invalid',
        this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { reason: 'occurred_at is not a canonical UTC timestamp' }),
      );
    }
  }
}
