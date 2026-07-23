import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryLockPathResolver } from '../src/locking/lock-paths.js';
import {
  RegistryLockTransitionIdentityError,
  RegistryLockTransitionIdentityService,
} from '../src/locking/lock-transition-identity.js';
import type { LockRecord } from '../src/locking/lock-types.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const validLock: LockRecord = {
  schema_version: '2.0.0',
  lock_id: 'REGISTRY_WRITE',
  namespace: 'REGISTRY_WRITE',
  owner_transaction_id: 'TRANSACTION-IDENTITY-1',
  owner_identity: 'WORKER-IDENTITY-1',
  state: 'ACQUIRED',
  acquired_at: '2026-07-23T00:00:00Z',
  heartbeat_at: '2026-07-23T00:00:00Z',
  expires_at: null,
  takeover_count: 0,
};

async function createService(): Promise<RegistryLockTransitionIdentityService> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  return new RegistryLockTransitionIdentityService(errors);
}

test('derives a deterministic canonical transition ID', async () => {
  const service = await createService();
  const occurredAt = '2026-07-23T00:00:01Z';
  const first = service.deriveRegistryLockReleaseTransitionId(validLock, occurredAt);
  const second = service.deriveRegistryLockReleaseTransitionId({ ...validLock }, occurredAt);
  assert.equal(first, second);
  assert.equal(first, 'REL_3278E4BFDF4510071B6757CF7E5DF423B26F77304F66EEF8811516A4CE8B171A');
  assert.match(first, /^REL_[A-F0-9]{64}$/);
  assert.equal(first.endsWith('.json'), false);
  assert.equal(first.includes('/'), false);
  assert.equal(first.includes('\\'), false);
  new RegistryLockPathResolver(repositoryRoot).resolveRegistryWriteTransitionPath(first);
});

test('changes identity when release-defining fields change', async () => {
  const service = await createService();
  const base = service.deriveRegistryLockReleaseTransitionId(validLock, '2026-07-23T00:00:01Z');
  assert.notEqual(base, service.deriveRegistryLockReleaseTransitionId({ ...validLock, owner_transaction_id: 'TRANSACTION-IDENTITY-2' }, '2026-07-23T00:00:01Z'));
  assert.notEqual(base, service.deriveRegistryLockReleaseTransitionId({ ...validLock, owner_identity: 'WORKER-IDENTITY-2' }, '2026-07-23T00:00:01Z'));
  assert.notEqual(base, service.deriveRegistryLockReleaseTransitionId({ ...validLock, acquired_at: '2026-07-23T00:00:02Z', heartbeat_at: '2026-07-23T00:00:02Z' }, '2026-07-23T00:00:03Z'));
  assert.equal(base, service.deriveRegistryLockReleaseTransitionId(validLock, '2026-07-23T00:00:02Z'));
});

test('rejects invalid singleton identity, state, timestamps, and chronology', async () => {
  const service = await createService();
  const cases: LockRecord[] = [
    { ...validLock, lock_id: 'OTHER_LOCK' as 'REGISTRY_WRITE' },
    { ...validLock, namespace: 'OTHER_NAMESPACE' as 'REGISTRY_WRITE' },
    { ...validLock, state: 'RELEASED' },
    { ...validLock, owner_identity: '' },
    { ...validLock, acquired_at: 'not-a-timestamp' },
  ];
  for (const lock of cases) {
    assert.throws(
      () => service.deriveRegistryLockReleaseTransitionId(lock, '2026-07-23T00:00:01Z'),
      (error: unknown) => error instanceof RegistryLockTransitionIdentityError && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED',
    );
  }
  assert.throws(
    () => service.deriveRegistryLockReleaseTransitionId(validLock, '2026-07-22T23:59:59Z'),
    (error: unknown) => error instanceof RegistryLockTransitionIdentityError,
  );
  assert.throws(
    () => service.deriveRegistryLockReleaseTransitionId(validLock, 'invalid'),
    (error: unknown) => error instanceof RegistryLockTransitionIdentityError,
  );
});

test('is independent of source object property insertion order and has no side effects', async () => {
  const service = await createService();
  const reordered = {
    takeover_count: 0,
    expires_at: null,
    heartbeat_at: validLock.heartbeat_at,
    acquired_at: validLock.acquired_at,
    state: validLock.state,
    owner_identity: validLock.owner_identity,
    owner_transaction_id: validLock.owner_transaction_id,
    namespace: validLock.namespace,
    lock_id: validLock.lock_id,
    schema_version: validLock.schema_version,
  } as LockRecord;
  const original = structuredClone(validLock);
  assert.equal(
    service.deriveRegistryLockReleaseTransitionId(validLock, '2026-07-23T00:00:01Z'),
    service.deriveRegistryLockReleaseTransitionId(reordered, '2026-07-23T00:00:01Z'),
  );
  assert.deepEqual(validLock, original);
});
