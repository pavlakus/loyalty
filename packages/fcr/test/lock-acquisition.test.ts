import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { CanonicalJsonService } from '../src/canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryRepository } from '../src/persistence/registry-repository.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';
import { TransactionService } from '../src/transactions/transaction-service.js';
import { TransactionServiceError } from '../src/transactions/transaction-service.js';
import { RegistryLockAcquisitionError, RegistryLockAcquisitionService } from '../src/locking/lock-acquisition.js';
import type { AcquireRegistryLockInput } from '../src/locking/lock-types.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-acquisition-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createServices(root: string): Promise<{
  readonly transactionService: TransactionService;
  readonly repository: RegistryRepository;
  readonly validator: SchemaValidator;
  readonly errors: FrameworkErrorService;
  readonly acquisition: RegistryLockAcquisitionService;
}> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
  const repository = new RegistryRepository(root, errors, validator);
  const transactionService = new TransactionService(repository, errors, validator);
  return {
    transactionService,
    repository,
    validator,
    errors,
    acquisition: new RegistryLockAcquisitionService(transactionService, validator, errors, root),
  };
}

const transactionInput = {
  request_id: 'REQUEST-ACQUIRE-1',
  idempotency_key: 'a'.repeat(64),
  repository_id: 'REPOSITORY-1',
  repository_revision: 'REVISION-1',
  owner: 'FCR',
  recovery_operation: 'NONE',
} as const;

test('acquires and persists the canonical registry-write lock', async () => {
  const root = await createFixture();
  try {
    const { transactionService, repository, validator, acquisition } = await createServices(root);
    await transactionService.createTransaction({ ...transactionInput, transaction_id: 'TRANSACTION-ACQUIRE-1' });
    await fs.rm(repository.paths.locks, { recursive: true, force: true });

    const record = await acquisition.acquireRegistryWriteLock({
      ownerTransactionId: 'TRANSACTION-ACQUIRE-1',
      ownerIdentity: 'WORKER-1',
    });
    const lockPath = path.join(repository.paths.locks, 'REGISTRY_WRITE.json');
    const bytes = await fs.readFile(lockPath);
    assert.equal(bytes.toString('utf8'), `${new CanonicalJsonService().canonicalize(record)}\n`);
    const parsed = JSON.parse(bytes.toString('utf8')) as unknown;
    const validation = await validator.validateRecord('docs/ai-engineering-framework/fcr/schemas/lock-record.schema.json', parsed);
    assert.equal(validation.valid, true);
    assert.equal(record.state, 'ACQUIRED');
    assert.equal(record.expires_at, null);
    assert.equal(record.heartbeat_at, record.acquired_at);
    await assert.rejects(fs.stat(path.join(repository.paths.registryRoot, 'lock-transitions')));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('exclusive creation preserves an existing lock and does not inspect or replace it', async () => {
  const root = await createFixture();
  try {
    const { transactionService, repository, acquisition } = await createServices(root);
    await transactionService.createTransaction({ ...transactionInput, transaction_id: 'TRANSACTION-ACQUIRE-2' });
    const lockPath = path.join(repository.paths.locks, 'REGISTRY_WRITE.json');
    const existing = '{"existing":"lock"}\n';
    await fs.writeFile(lockPath, existing, 'utf8');
    await assert.rejects(
      () => acquisition.acquireRegistryWriteLock({ ownerTransactionId: 'TRANSACTION-ACQUIRE-2', ownerIdentity: 'WORKER-2' }),
      (error: unknown) => error instanceof RegistryLockAcquisitionError
        && error.frameworkError.code === 'REGISTRY_LOCK_CONFLICT',
    );
    assert.equal(await fs.readFile(lockPath, 'utf8'), existing);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('creates only the active-lock parent directory', async () => {
  const root = await createFixture();
  try {
    const { transactionService, repository, acquisition } = await createServices(root);
    await transactionService.createTransaction({ ...transactionInput, transaction_id: 'TRANSACTION-ACQUIRE-3' });
    await fs.rm(repository.paths.locks, { recursive: true, force: true });
    await acquisition.acquireRegistryWriteLock({ ownerTransactionId: 'TRANSACTION-ACQUIRE-3', ownerIdentity: 'WORKER-3' });
    assert.equal((await fs.stat(repository.paths.locks)).isDirectory(), true);
    await assert.rejects(fs.stat(path.join(repository.paths.registryRoot, 'lock-transitions')));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects invalid transaction or owner input before creating a lock file', async () => {
  const root = await createFixture();
  try {
    const { transactionService, repository, acquisition } = await createServices(root);
    await assert.rejects(
      () => acquisition.acquireRegistryWriteLock({ ownerTransactionId: 'TRANSACTION-MISSING', ownerIdentity: 'WORKER-4' }),
      (error: unknown) => error instanceof TransactionServiceError
        && error.frameworkError.code === 'REGISTRY_TRANSACTION_MISSING',
    );
    assert.equal(await fs.stat(path.join(root, 'implementation/workflow-state/registry')).then(() => true).catch(() => false), false);

    await transactionService.createTransaction({ ...transactionInput, transaction_id: 'TRANSACTION-ACQUIRE-4' });
    await assert.rejects(
      () => acquisition.acquireRegistryWriteLock({ ownerTransactionId: 'TRANSACTION-ACQUIRE-4', ownerIdentity: '' }),
      (error: unknown) => error instanceof Error && error.name === 'LockRecordConstructionError',
    );
    await assert.rejects(fs.stat(path.join(repository.paths.locks, 'REGISTRY_WRITE.json')));

    await assert.rejects(
      () => acquisition.acquireRegistryWriteLock({ ownerTransactionId: 'TRANSACTION-ACQUIRE-4', ownerIdentity: 'WORKER/INVALID' }),
      (error: unknown) => error instanceof Error && error.name === 'LockRecordConstructionError',
    );
    await assert.rejects(fs.stat(path.join(repository.paths.locks, 'REGISTRY_WRITE.json')));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
