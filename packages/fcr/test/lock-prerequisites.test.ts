import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryRepository } from '../src/persistence/registry-repository.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';
import { TransactionService, TransactionServiceError } from '../src/transactions/transaction-service.js';
import {
  assertRegistryLockOwner,
  isRegistryLockOwner,
  RegistryLockOwnershipError,
  validateRegistryLockAcquisitionTransaction,
} from '../src/locking/lock-prerequisites.js';
import type { LockRecord, RegistryLockOwner } from '../src/locking/lock-types.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-prerequisite-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createServices(root: string): Promise<{ readonly service: TransactionService; readonly repository: RegistryRepository; readonly errors: FrameworkErrorService }> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
  const repository = new RegistryRepository(root, errors, validator);
  return { service: new TransactionService(repository, errors, validator), repository, errors };
}

const owner: RegistryLockOwner = {
  ownerTransactionId: 'TRANSACTION-1',
  ownerIdentity: 'WORKER-1',
};

const lockRecord: LockRecord = {
  schema_version: '2.0.0',
  lock_id: 'REGISTRY_WRITE',
  namespace: 'REGISTRY_WRITE',
  owner_transaction_id: owner.ownerTransactionId,
  owner_identity: owner.ownerIdentity,
  state: 'ACQUIRED',
  acquired_at: '2026-07-23T00:00:00Z',
  heartbeat_at: '2026-07-23T00:00:00Z',
  expires_at: null,
  takeover_count: 0,
};

test('accepts an existing valid NEW transaction without creating lock state', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createServices(root);
    const transaction = await service.createTransaction({
      transaction_id: owner.ownerTransactionId,
      request_id: 'REQUEST-1',
      idempotency_key: 'a'.repeat(64),
      repository_id: 'REPOSITORY-1',
      repository_revision: 'REVISION-1',
      owner: 'FCR',
      recovery_operation: 'NONE',
    });
    const transactionPath = path.join(repository.paths.transactions, `${owner.ownerTransactionId}.json`);
    const before = await fs.readFile(transactionPath, 'utf8');
    const result = await validateRegistryLockAcquisitionTransaction(service, owner.ownerTransactionId);
    assert.deepEqual(result, transaction);
    assert.equal(await fs.readFile(transactionPath, 'utf8'), before);
    await assert.rejects(fs.stat(path.join(repository.paths.locks, 'REGISTRY_WRITE.json')));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('preserves existing transaction errors for missing, malformed, invalid, and non-NEW records', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createServices(root);
    await assert.rejects(
      () => validateRegistryLockAcquisitionTransaction(service, 'TRANSACTION-MISSING'),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_MISSING',
    );

    await repository.bootstrap();
    const transactionPath = (id: string) => path.join(repository.paths.transactions, `${id}.json`);
    await fs.writeFile(transactionPath('TRANSACTION-MALFORMED'), '{', 'utf8');
    await assert.rejects(
      () => validateRegistryLockAcquisitionTransaction(service, 'TRANSACTION-MALFORMED'),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_INVALID',
    );

    await fs.writeFile(transactionPath('TRANSACTION-SCHEMA'), JSON.stringify({ schema_version: '1.0.0', transaction_id: 'TRANSACTION-SCHEMA' }), 'utf8');
    await assert.rejects(
      () => validateRegistryLockAcquisitionTransaction(service, 'TRANSACTION-SCHEMA'),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_INVALID',
    );

    const created = await service.createTransaction({
      transaction_id: 'TRANSACTION-STAGED',
      request_id: 'REQUEST-2',
      idempotency_key: 'b'.repeat(64),
      repository_id: 'REPOSITORY-1',
      repository_revision: 'REVISION-1',
      owner: 'FCR',
      recovery_operation: 'NONE',
    });
    await fs.writeFile(transactionPath('TRANSACTION-STAGED'), JSON.stringify({ ...created, state: 'STAGED' }), 'utf8');
    await assert.rejects(
      () => validateRegistryLockAcquisitionTransaction(service, 'TRANSACTION-STAGED'),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_STATE_UNSUPPORTED',
    );

    await assert.rejects(
      () => validateRegistryLockAcquisitionTransaction(service, '../outside'),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_INVALID',
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('ownership matches only when transaction ID and identity both match exactly', () => {
  assert.equal(isRegistryLockOwner(lockRecord, owner), true);
  assert.equal(isRegistryLockOwner(lockRecord, { ...owner, ownerTransactionId: 'TRANSACTION-2' }), false);
  assert.equal(isRegistryLockOwner(lockRecord, { ...owner, ownerIdentity: 'WORKER-2' }), false);
  assert.equal(isRegistryLockOwner(lockRecord, { ownerTransactionId: 'TRANSACTION-2', ownerIdentity: 'WORKER-2' }), false);
  assert.equal(isRegistryLockOwner(lockRecord, { ...owner, ownerIdentity: 'worker-1' }), false);
  assert.equal(isRegistryLockOwner(lockRecord, { ...owner, ownerIdentity: ' WORKER-1' }), false);
});

test('ownership assertion succeeds for the exact owner and rejects mismatches', async () => {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  assert.doesNotThrow(() => assertRegistryLockOwner(lockRecord, owner, errors));
  assert.throws(
    () => assertRegistryLockOwner(lockRecord, { ...owner, ownerIdentity: 'WORKER-2' }, errors),
    (error: unknown) => error instanceof RegistryLockOwnershipError
      && error.frameworkError.code === 'REGISTRY_OWNERSHIP_CONFLICT',
  );
});

test('owner input validation rejects invalid canonical IDs without mutation', async () => {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  for (const invalidOwner of [
    { ownerTransactionId: '', ownerIdentity: 'WORKER-1' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: '' },
    { ownerTransactionId: 'transaction-1', ownerIdentity: 'WORKER-1' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: 'WORKER/1' },
    { ownerTransactionId: 'TRANSACTION-1', ownerIdentity: 'WORKER-1', unsupported: true } as RegistryLockOwner,
  ]) {
    assert.throws(
      () => assertRegistryLockOwner(lockRecord, invalidOwner, errors),
      (error: unknown) => error instanceof RegistryLockOwnershipError
        && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED',
    );
  }
});
