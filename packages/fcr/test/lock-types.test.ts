import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE,
  LOCK_ACQUIRED_STATE,
  LOCK_ENTITY_TYPE,
  LOCK_RELEASED_STATE,
  REGISTRY_WRITE_LOCK_FILENAME,
  REGISTRY_WRITE_LOCK_ID,
  REGISTRY_WRITE_NAMESPACE,
  type AcquireRegistryLockInput,
  type LockRecord,
  type LockTransitionRecord,
  type RegistryLockOwner,
} from '../src/locking/lock-types.js';

test('defines the fixed singleton registry-write identity', () => {
  assert.equal(REGISTRY_WRITE_NAMESPACE, 'REGISTRY_WRITE');
  assert.equal(REGISTRY_WRITE_LOCK_ID, 'REGISTRY_WRITE');
  assert.equal(REGISTRY_WRITE_LOCK_FILENAME, 'REGISTRY_WRITE.json');
});

test('defines the fixed release transition vocabulary', () => {
  assert.equal(LOCK_ENTITY_TYPE, 'LOCK');
  assert.equal(LOCK_ACQUIRED_STATE, 'ACQUIRED');
  assert.equal(LOCK_RELEASED_STATE, 'RELEASED');
  assert.equal(LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE, 'LOCK_ACQUIRED_RELEASED');
});

test('runtime representations contain only the canonical lock fields', () => {
  const input: AcquireRegistryLockInput = {
    ownerTransactionId: 'TX-001',
    ownerIdentity: 'WORKER-001',
  };
  const owner: RegistryLockOwner = input;
  const lock: LockRecord = {
    schema_version: '2.0.0',
    lock_id: REGISTRY_WRITE_LOCK_ID,
    namespace: REGISTRY_WRITE_NAMESPACE,
    owner_transaction_id: owner.ownerTransactionId,
    owner_identity: owner.ownerIdentity,
    state: LOCK_ACQUIRED_STATE,
    acquired_at: '2026-07-23T00:00:00Z',
    heartbeat_at: '2026-07-23T00:00:00Z',
    expires_at: null,
    takeover_count: 0,
  };
  const transition: LockTransitionRecord = {
    schema_version: '1.0.0',
    transition_id: 'REL_ABC',
    entity_type: LOCK_ENTITY_TYPE,
    entity_id: REGISTRY_WRITE_LOCK_ID,
    namespace: REGISTRY_WRITE_NAMESPACE,
    from_state: LOCK_ACQUIRED_STATE,
    to_state: LOCK_RELEASED_STATE,
    owner_transaction_id: owner.ownerTransactionId,
    owner_identity: owner.ownerIdentity,
    acquired_at: lock.acquired_at,
    occurred_at: '2026-07-23T00:00:01Z',
    transition_type: LOCK_ACQUIRED_RELEASED_TRANSITION_TYPE,
  };

  assert.deepEqual(Object.keys(input).sort(), ['ownerIdentity', 'ownerTransactionId'].sort());
  assert.deepEqual(Object.keys(lock).sort(), [
    'schema_version', 'lock_id', 'namespace', 'owner_transaction_id', 'owner_identity',
    'state', 'acquired_at', 'heartbeat_at', 'expires_at', 'takeover_count',
  ].sort());
  assert.deepEqual(Object.keys(transition).sort(), [
    'schema_version', 'transition_id', 'entity_type', 'entity_id', 'namespace',
    'from_state', 'to_state', 'owner_transaction_id', 'owner_identity',
    'acquired_at', 'occurred_at', 'transition_type',
  ].sort());
});
