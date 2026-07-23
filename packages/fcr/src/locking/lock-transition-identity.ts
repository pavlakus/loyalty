import { CanonicalJsonService } from '../canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import type { Id, RuntimeFrameworkError, Timestamp } from '../artifacts/artifact-types.js';
import {
  LOCK_ACQUIRED_STATE,
  LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE,
  REGISTRY_WRITE_LOCK_ID,
  REGISTRY_WRITE_NAMESPACE,
  type LockRecord,
} from './lock-types.js';

const CANONICAL_ID_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,127}$/;
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export class RegistryLockTransitionIdentityError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly causeSummary?: string,
  ) {
    super(frameworkError.message);
    this.name = 'RegistryLockTransitionIdentityError';
  }
}

export class RegistryLockTransitionIdentityService {
  public constructor(
    private readonly errorService: FrameworkErrorService,
    private readonly canonicalJson: CanonicalJsonService = new CanonicalJsonService(),
  ) {}

  public deriveRegistryLockReleaseTransitionId(lockRecord: LockRecord, occurredAt: Timestamp): Id {
    try {
      this.validateLockRecord(lockRecord);
      this.validateTimestamp(occurredAt, 'occurred_at');
      if (Date.parse(occurredAt) < Date.parse(lockRecord.acquired_at)) {
        throw new Error('occurred_at must not precede acquired_at');
      }

      const identity = {
        entity_id: REGISTRY_WRITE_LOCK_ID,
        namespace: REGISTRY_WRITE_NAMESPACE,
        owner_transaction_id: lockRecord.owner_transaction_id,
        owner_identity: lockRecord.owner_identity,
        acquired_at: lockRecord.acquired_at,
        transition_type: LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE,
      } as const;
      const digest = this.canonicalJson.sha256(identity).toUpperCase();
      const transitionId = `REL_${digest}`;
      if (!CANONICAL_ID_PATTERN.test(transitionId)) throw new Error('derived transition identifier is not canonical');
      return transitionId;
    } catch (cause) {
      if (cause instanceof RegistryLockTransitionIdentityError) throw cause;
      throw new RegistryLockTransitionIdentityError(
        'registry lock release transition identity is invalid',
        this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { reason: safeCause(cause) }),
        safeCause(cause),
      );
    }
  }

  private validateLockRecord(lockRecord: LockRecord): void {
    if (!lockRecord || typeof lockRecord !== 'object') throw new Error('lock record must be an object');
    if (lockRecord.lock_id !== REGISTRY_WRITE_LOCK_ID) throw new Error('lock identity must be REGISTRY_WRITE');
    if (lockRecord.namespace !== REGISTRY_WRITE_NAMESPACE) throw new Error('lock namespace must be REGISTRY_WRITE');
    if (lockRecord.state !== LOCK_ACQUIRED_STATE) throw new Error('lock state must be ACQUIRED');
    if (!CANONICAL_ID_PATTERN.test(lockRecord.owner_transaction_id)) throw new Error('owner transaction ID is invalid');
    if (!CANONICAL_ID_PATTERN.test(lockRecord.owner_identity)) throw new Error('owner identity is invalid');
    this.validateTimestamp(lockRecord.acquired_at, 'acquired_at');
  }

  private validateTimestamp(value: string, field: string): void {
    if (!CANONICAL_TIMESTAMP_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
      throw new Error(`${field} is not a canonical UTC timestamp`);
    }
  }
}

function safeCause(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
