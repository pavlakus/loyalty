import type { Id, Timestamp } from '../artifacts/artifact-types.js';
import type { RuntimeFrameworkError } from '../artifacts/artifact-types.js';
import type { SchemaValidator } from '../validation/schema-validator.js';
import {
  REGISTRY_WRITE_LOCK_ID,
  REGISTRY_WRITE_NAMESPACE,
  LOCK_ACQUIRED_STATE,
  type LockRecord,
} from './lock-types.js';

export const LOCK_RECORD_SCHEMA_PATH = 'docs/ai-engineering-framework/fcr/schemas/lock-record.schema.json';

export interface LockRecordConstructionInput {
  readonly ownerTransactionId: Id;
  readonly ownerIdentity: Id;
  readonly acquiredAt: Timestamp;
}

export class LockRecordConstructionError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly causeSummary?: string,
  ) {
    super(message);
    this.name = 'LockRecordConstructionError';
  }
}

export async function constructAcquiredLockRecord(
  input: LockRecordConstructionInput,
  schemaValidator: SchemaValidator,
): Promise<Readonly<LockRecord>> {
  const record: LockRecord = {
    schema_version: '2.0.0',
    lock_id: REGISTRY_WRITE_LOCK_ID,
    namespace: REGISTRY_WRITE_NAMESPACE,
    owner_transaction_id: input.ownerTransactionId,
    owner_identity: input.ownerIdentity,
    state: LOCK_ACQUIRED_STATE,
    acquired_at: input.acquiredAt,
    heartbeat_at: input.acquiredAt,
    expires_at: null,
    takeover_count: 0,
  };

  const validation = await schemaValidator.validateRecord<LockRecord>(LOCK_RECORD_SCHEMA_PATH, record);
  if (!validation.valid || !validation.value) {
    const frameworkError = validation.error;
    if (!frameworkError) throw new Error('lock record validation failed without a FrameworkError');
    throw new LockRecordConstructionError(
      'constructed lock record failed canonical schema validation',
      frameworkError,
      validation.issues.map((issue) => issue.message).join('; '),
    );
  }
  return validation.value;
}
