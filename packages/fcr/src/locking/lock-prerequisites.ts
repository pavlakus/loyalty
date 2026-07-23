import type { TransactionRecord } from '../artifacts/artifact-types.js';
import type { FrameworkErrorService } from '../errors/framework-error-service.js';
import { TransactionServiceError, type TransactionService } from '../transactions/transaction-service.js';
import type { LockRecord, RegistryLockOwner } from './lock-types.js';

const CANONICAL_ID_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,127}$/;

export class RegistryLockOwnershipError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: ReturnType<FrameworkErrorService['createDiagnostic']>,
  ) {
    super(frameworkError.message);
    this.name = 'RegistryLockOwnershipError';
  }
}

export async function validateRegistryLockAcquisitionTransaction(
  transactionService: TransactionService,
  ownerTransactionId: string,
  errorService?: FrameworkErrorService,
): Promise<Readonly<TransactionRecord>> {
  try {
    return await transactionService.loadTransaction(ownerTransactionId);
  } catch (cause) {
    if (errorService && cause instanceof TransactionServiceError && cause.failureKind === 'TRANSACTION_MISSING') {
      throw new TransactionServiceError(
        'registry lock requires an existing transaction',
        errorService.createOccurrence('REGISTRY_TRANSACTION_MISSING', {
          transaction_id: ownerTransactionId,
          request_id: 'UNAVAILABLE',
          task_id: 'UNAVAILABLE',
          module_id: 'FCR',
          repository_id: 'UNAVAILABLE',
          repository_revision: 'UNAVAILABLE',
          registry_revision: 'UNAVAILABLE',
          failure_phase: 'VALIDATION',
          source_ids: 'REGISTRY_WRITE',
          validator_name: 'FCR',
          validator_version: 'V2-007C',
          recovery_id: 'NONE',
          lock_id: 'REGISTRY_WRITE',
          observed_heartbeat: 'UNAVAILABLE',
        }),
        'TRANSACTION_MISSING',
        cause instanceof Error ? cause.message : String(cause),
      );
    }
    throw cause;
  }
}

export function isRegistryLockOwner(
  lockRecord: Pick<LockRecord, 'owner_transaction_id' | 'owner_identity'>,
  owner: RegistryLockOwner,
): boolean {
  return lockRecord.owner_transaction_id === owner.ownerTransactionId
    && lockRecord.owner_identity === owner.ownerIdentity;
}

export function assertRegistryLockOwner(
  lockRecord: Pick<LockRecord, 'lock_id' | 'owner_transaction_id' | 'owner_identity'>,
  owner: RegistryLockOwner,
  errorService: FrameworkErrorService,
): void {
  if (!isValidOwnerInput(owner)) {
    throw new RegistryLockOwnershipError(
      'registry lock owner is invalid',
      errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { reason: 'registry lock owner is invalid' }),
    );
  }
  if (!isRegistryLockOwner(lockRecord, owner)) {
    throw new RegistryLockOwnershipError(
      'registry lock ownership does not match',
      errorService.createDiagnostic('REGISTRY_OWNERSHIP_CONFLICT', { lock_id: lockRecord.lock_id }),
    );
  }
}

function isCanonicalId(value: string): boolean {
  return CANONICAL_ID_PATTERN.test(value);
}

function isValidOwnerInput(value: RegistryLockOwner): boolean {
  const keys = Object.keys(value as object).sort();
  return keys.length === 2
    && keys[0] === 'ownerIdentity'
    && keys[1] === 'ownerTransactionId'
    && isCanonicalId(value.ownerTransactionId)
    && isCanonicalId(value.ownerIdentity);
}
