import type { Id, Timestamp } from '../artifacts/artifact-types.js';

export const REGISTRY_WRITE_NAMESPACE = 'REGISTRY_WRITE' as const;
export const REGISTRY_WRITE_LOCK_ID = 'REGISTRY_WRITE' as const;
export const REGISTRY_WRITE_LOCK_FILENAME = 'REGISTRY_WRITE.json' as const;

export const LOCK_ENTITY_TYPE = 'LOCK' as const;
export const LOCK_ACQUIRED_STATE = 'ACQUIRED' as const;
export const LOCK_RELEASED_STATE = 'RELEASED' as const;
export const LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE = 'LOCK_ACQUIRED_RELEASED' as const;

export type LockState = 'ACQUIRED' | 'RELEASED' | 'EXPIRED' | 'TAKEOVER_PENDING';

export interface AcquireRegistryLockInput {
  readonly ownerTransactionId: Id;
  readonly ownerIdentity: Id;
}

export interface RegistryLockOwner {
  readonly ownerTransactionId: Id;
  readonly ownerIdentity: Id;
}

export interface LockRecord {
  readonly schema_version: '2.0.0';
  readonly lock_id: typeof REGISTRY_WRITE_LOCK_ID;
  readonly namespace: typeof REGISTRY_WRITE_NAMESPACE;
  readonly owner_transaction_id: Id;
  readonly owner_identity: Id;
  readonly state: LockState;
  readonly acquired_at: Timestamp;
  readonly heartbeat_at: Timestamp;
  readonly expires_at: Timestamp | null;
  readonly takeover_count: number;
}

export interface LockTransitionRecord {
  readonly schema_version: '1.0.0';
  readonly transition_id: Id;
  readonly entity_type: typeof LOCK_ENTITY_TYPE;
  readonly entity_id: typeof REGISTRY_WRITE_LOCK_ID;
  readonly namespace: typeof REGISTRY_WRITE_NAMESPACE;
  readonly from_state: typeof LOCK_ACQUIRED_STATE;
  readonly to_state: typeof LOCK_RELEASED_STATE;
  readonly owner_transaction_id: Id;
  readonly owner_identity: Id;
  readonly acquired_at: Timestamp;
  readonly occurred_at: Timestamp;
  readonly transition_type: typeof LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE;
}
