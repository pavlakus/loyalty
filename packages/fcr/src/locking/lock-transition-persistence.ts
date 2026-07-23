import fs from 'node:fs/promises';
import path from 'node:path';

import type { RuntimeFrameworkError, Timestamp } from '../artifacts/artifact-types.js';
import { CanonicalJsonService } from '../canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import type { SchemaValidator } from '../validation/schema-validator.js';
import { LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE, LOCK_ACQUIRED_STATE, LOCK_ENTITY_TYPE, LOCK_RELEASED_STATE, REGISTRY_WRITE_LOCK_ID, REGISTRY_WRITE_NAMESPACE, type LockRecord, type LockTransitionRecord } from './lock-types.js';
import { RegistryLockPathResolver } from './lock-paths.js';
import { RegistryLockTransitionIdentityService } from './lock-transition-identity.js';

export const LOCK_TRANSITION_RECORD_SCHEMA_PATH = 'docs/ai-engineering-framework/fcr/schemas/lock-transition-record.schema.json';

export type RegistryLockTransitionPersistenceFailureKind =
  | 'TRANSITION_INVALID'
  | 'PATH_ESCAPE'
  | 'PERSISTENCE_FAILURE';

export class RegistryLockTransitionPersistenceError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly failureKind: RegistryLockTransitionPersistenceFailureKind,
    public readonly causeSummary?: string,
  ) {
    super(frameworkError.message);
    this.name = 'RegistryLockTransitionPersistenceError';
  }
}

export interface RegistryLockTransitionConstructionInput {
  readonly lockRecord: LockRecord;
  readonly occurredAt: Timestamp;
}

export class RegistryLockTransitionPersistenceService {
  private readonly paths: RegistryLockPathResolver;

  public constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly errorService: FrameworkErrorService,
    repositoryRoot: string,
    private readonly identityService: RegistryLockTransitionIdentityService = new RegistryLockTransitionIdentityService(errorService),
    private readonly canonicalJson: CanonicalJsonService = new CanonicalJsonService(),
  ) {
    this.paths = new RegistryLockPathResolver(repositoryRoot);
  }

  public async constructReleaseTransition(input: RegistryLockTransitionConstructionInput): Promise<Readonly<LockTransitionRecord>> {
    const transitionId = this.identityService.deriveRegistryLockReleaseTransitionId(input.lockRecord, input.occurredAt);
    const record: LockTransitionRecord = {
      schema_version: '1.0.0',
      transition_id: transitionId,
      entity_type: LOCK_ENTITY_TYPE,
      entity_id: REGISTRY_WRITE_LOCK_ID,
      namespace: REGISTRY_WRITE_NAMESPACE,
      from_state: LOCK_ACQUIRED_STATE,
      to_state: LOCK_RELEASED_STATE,
      owner_transaction_id: input.lockRecord.owner_transaction_id,
      owner_identity: input.lockRecord.owner_identity,
      acquired_at: input.lockRecord.acquired_at,
      occurred_at: input.occurredAt,
      transition_type: LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE,
    };
    const validation = await this.schemaValidator.validateRecord<LockTransitionRecord>(LOCK_TRANSITION_RECORD_SCHEMA_PATH, record);
    if (!validation.valid || !validation.value) {
      throw new RegistryLockTransitionPersistenceError(
        'constructed registry lock transition failed canonical schema validation',
        validation.error ?? this.errorService.createDiagnostic('REGISTRY_SCHEMA_INVALID', { schema_path: LOCK_TRANSITION_RECORD_SCHEMA_PATH }),
        'TRANSITION_INVALID',
      );
    }
    return validation.value;
  }

  public async persistReleaseTransition(input: RegistryLockTransitionConstructionInput): Promise<Readonly<LockTransitionRecord>> {
    const record = await this.constructReleaseTransition(input);
    const transitionPath = await this.containedTransitionPath(record.transition_id);
    const bytes = Buffer.concat([
      Buffer.from(this.canonicalJson.canonicalBytes(record)),
      Buffer.from('\n', 'utf8'),
    ]);
    try {
      await fs.mkdir(path.dirname(transitionPath), { recursive: true });
      await this.paths.assertContainedPath(transitionPath);
      await fs.writeFile(transitionPath, bytes, { flag: 'wx' });
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new RegistryLockTransitionPersistenceError(
          'registry lock transition target already exists',
          this.errorService.createOccurrence('REGISTRY_TRANSITION_CONFLICT', repositoryMetadata({
            transactionId: input.lockRecord.owner_transaction_id,
            transitionId: record.transition_id,
            observedHeartbeat: input.lockRecord.heartbeat_at,
          })),
          'PERSISTENCE_FAILURE',
          safeCause(cause),
        );
      }
      throw new RegistryLockTransitionPersistenceError(
        'registry lock transition persistence failed',
        this.errorService.createDiagnostic('REGISTRY_PERSISTENCE_FAILED', { journal_step: 'persist_registry_lock_transition' }),
        'PERSISTENCE_FAILURE',
        safeCause(cause),
      );
    }
    return record;
  }

  private async containedTransitionPath(transitionId: string): Promise<string> {
    let transitionPath: string;
    try {
      transitionPath = this.paths.resolveRegistryWriteTransitionPath(transitionId);
      await this.paths.assertContainedPath(transitionPath);
      return transitionPath;
    } catch (cause) {
      throw new RegistryLockTransitionPersistenceError(
        'registry lock transition path is outside the canonical repository',
        this.errorService.createDiagnostic('REGISTRY_PATH_NORMALIZATION_FAILED', { path: transitionId, reason: safeCause(cause) }),
        'PATH_ESCAPE',
        safeCause(cause),
      );
    }
  }
}

function safeCause(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function repositoryMetadata(input: {
  readonly transactionId: string;
  readonly transitionId: string;
  readonly observedHeartbeat: string;
}): Record<string, string> {
  return {
    transaction_id: input.transactionId,
    request_id: 'UNAVAILABLE',
    task_id: 'UNAVAILABLE',
    module_id: 'FCR',
    repository_id: 'UNAVAILABLE',
    repository_revision: 'UNAVAILABLE',
    registry_revision: 'UNAVAILABLE',
    failure_phase: 'PERSISTENCE',
    source_ids: input.transitionId,
    validator_name: 'FCR',
    validator_version: 'V2-007C',
    recovery_id: 'NONE',
    lock_id: REGISTRY_WRITE_LOCK_ID,
    observed_heartbeat: input.observedHeartbeat,
  };
}
