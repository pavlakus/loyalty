import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';
import {
  constructAcquiredLockRecord,
  LockRecordConstructionError,
} from '../src/locking/lock-record.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

async function createValidator(): Promise<SchemaValidator> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  return new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
}

test('constructs the canonical initial ACQUIRED lock record', async () => {
  const validator = await createValidator();
  const record = await constructAcquiredLockRecord({
    ownerTransactionId: 'TRANSACTION-1',
    ownerIdentity: 'WORKER-1',
    acquiredAt: '2026-07-23T00:00:00Z',
  }, validator);

  assert.deepEqual(record, {
    schema_version: '2.0.0',
    lock_id: 'REGISTRY_WRITE',
    namespace: 'REGISTRY_WRITE',
    owner_transaction_id: 'TRANSACTION-1',
    owner_identity: 'WORKER-1',
    state: 'ACQUIRED',
    acquired_at: '2026-07-23T00:00:00Z',
    heartbeat_at: '2026-07-23T00:00:00Z',
    expires_at: null,
    takeover_count: 0,
  });
  assert.equal(Object.isFrozen(record), true);
});

test('construction is deterministic for identical inputs', async () => {
  const validator = await createValidator();
  const input = {
    ownerTransactionId: 'TRANSACTION-2',
    ownerIdentity: 'WORKER-2',
    acquiredAt: '2026-07-23T00:00:00Z',
  } as const;
  assert.deepEqual(
    await constructAcquiredLockRecord(input, validator),
    await constructAcquiredLockRecord(input, validator),
  );
});

test('rejects invalid owners and timestamps through canonical validation', async () => {
  const validator = await createValidator();
  const cases = [
    { ownerTransactionId: 'invalid%transaction', ownerIdentity: 'WORKER-1', acquiredAt: '2026-07-23T00:00:00Z' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: '', acquiredAt: '2026-07-23T00:00:00Z' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: '   ', acquiredAt: '2026-07-23T00:00:00Z' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: 'WORKER-1', acquiredAt: 'not-a-timestamp' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: 'WORKER-1', acquiredAt: '' },
  ] as const;

  for (const input of cases) {
    await assert.rejects(
      () => constructAcquiredLockRecord(input, validator),
      (error: unknown) => error instanceof LockRecordConstructionError
        && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED',
    );
  }
});

test('construction has no filesystem side effects', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-lock-record-'));
  try {
    const validator = await createValidator();
    await constructAcquiredLockRecord({
      ownerTransactionId: 'TRANSACTION-3',
      ownerIdentity: 'WORKER-3',
      acquiredAt: '2026-07-23T00:00:00Z',
    }, validator);
    assert.deepEqual(await fs.readdir(root), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
