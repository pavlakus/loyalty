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
import { RegistryLockLoadingError, RegistryLockLoadingService } from '../src/locking/lock-loading.js';
import type { LockRecord } from '../src/locking/lock-types.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-loading-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createService(root: string): Promise<{ service: RegistryLockLoadingService; repository: RegistryRepository; validator: SchemaValidator }> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
  const repository = new RegistryRepository(root, errors, validator);
  return { service: new RegistryLockLoadingService(validator, errors, root), repository, validator };
}

const validRecord: LockRecord = {
  schema_version: '2.0.0',
  lock_id: 'REGISTRY_WRITE',
  namespace: 'REGISTRY_WRITE',
  owner_transaction_id: 'TRANSACTION-LOAD-1',
  owner_identity: 'WORKER-LOAD-1',
  state: 'ACQUIRED',
  acquired_at: '2026-07-23T00:00:00Z',
  heartbeat_at: '2026-07-23T00:00:00Z',
  expires_at: null,
  takeover_count: 0,
};

async function writeLock(repository: RegistryRepository, value: unknown = validRecord): Promise<string> {
  await fs.mkdir(repository.paths.locks, { recursive: true });
  const lockPath = path.join(repository.paths.locks, 'REGISTRY_WRITE.json');
  const content = typeof value === 'string'
    ? value
    : `${new CanonicalJsonService().canonicalize(value)}\n`;
  await fs.writeFile(lockPath, content, 'utf8');
  return lockPath;
}

test('existence detection reports only a present regular active lock', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    assert.equal(await service.registryWriteLockExists(), false);
    assert.equal(await fs.stat(repository.paths.registryRoot).then(() => true).catch(() => false), false);
    await writeLock(repository);
    assert.equal(await service.registryWriteLockExists(), true);
    await fs.writeFile(path.join(repository.paths.locks, 'REGISTRY_WRITE.json.bak'), 'x', 'utf8');
    await fs.mkdir(path.join(repository.paths.registryRoot, 'lock-transitions'), { recursive: true });
    assert.equal(await service.registryWriteLockExists(), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('loads a valid ACQUIRED singleton without changing canonical bytes', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    const lockPath = await writeLock(repository);
    const before = await fs.readFile(lockPath);
    const loaded = await service.loadRegistryWriteLock();
    assert.deepEqual(loaded, validRecord);
    assert.deepEqual(await fs.readFile(lockPath), before);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('missing load returns REGISTRY_LOCK_MISSING and creates no filesystem state', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await assert.rejects(
      () => service.loadRegistryWriteLock(),
      (error: unknown) => error instanceof RegistryLockLoadingError
        && error.failureKind === 'LOCK_MISSING'
        && error.frameworkError.code === 'REGISTRY_LOCK_MISSING',
    );
    assert.equal(await service.registryWriteLockExists(), false);
    assert.equal(await fs.stat(path.join(root, 'implementation')).then(() => true).catch(() => false), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('malformed JSON is rejected and remains unchanged', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    const lockPath = await writeLock(repository, '{"broken":');
    const before = await fs.readFile(lockPath);
    await assert.rejects(() => service.loadRegistryWriteLock(), (error: unknown) => error instanceof RegistryLockLoadingError && error.frameworkError.code === 'REGISTRY_SCHEMA_INVALID');
    assert.deepEqual(await fs.readFile(lockPath), before);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('schema-invalid, alternate identity, and non-ACQUIRED records are rejected', async () => {
const cases: Array<{ name: string; value: unknown }> = [
    { name: 'missing required field', value: (() => { const { owner_identity: _omitted, ...record } = validRecord; return record; })() },
    { name: 'wrong schema version', value: { ...validRecord, schema_version: '1.0.0' } },
    { name: 'invalid timestamp', value: { ...validRecord, acquired_at: 'not-a-timestamp' } },
    { name: 'invalid takeover count', value: { ...validRecord, takeover_count: -1 } },
    { name: 'extra property', value: { ...validRecord, extra: true } },
    { name: 'alternate lock id', value: { ...validRecord, lock_id: 'OTHER_LOCK' } },
    { name: 'alternate namespace', value: { ...validRecord, namespace: 'OTHER_NAMESPACE' } },
  ];
  for (const item of cases) {
    const root = await createFixture();
    try {
      const { service, repository } = await createService(root);
      await writeLock(repository, item.value);
      await assert.rejects(
        () => service.loadRegistryWriteLock(),
        (error: unknown) => error instanceof RegistryLockLoadingError
          && (error.frameworkError.code === 'REGISTRY_SCHEMA_INVALID'
            || error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED'
            || error.frameworkError.code === 'REGISTRY_INVALID_TRANSITION'),
        item.name,
      );
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }

  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await writeLock(repository, { ...validRecord, state: 'RELEASED' });
    const loaded = await service.loadRegistryWriteLock();
    assert.equal(loaded.state, 'RELEASED');
    assert.equal(await service.registryWriteLockExists(), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('wrong target type is not reported as absence', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await fs.mkdir(path.join(repository.paths.locks, 'REGISTRY_WRITE.json'), { recursive: true });
    assert.equal(await service.registryWriteLockExists(), false);
    await assert.rejects(() => service.loadRegistryWriteLock(), (error: unknown) => error instanceof RegistryLockLoadingError && error.failureKind === 'LOCK_INVALID');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('loading rejects a symlink that escapes the repository', async () => {
  const root = await createFixture();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-loading-outside-'));
  try {
    const { service, repository } = await createService(root);
    await fs.mkdir(repository.paths.locks, { recursive: true });
    await fs.writeFile(path.join(outside, 'lock.json'), JSON.stringify(validRecord), 'utf8');
    await fs.symlink(path.join(outside, 'lock.json'), path.join(repository.paths.locks, 'REGISTRY_WRITE.json'));
    await assert.rejects(() => service.loadRegistryWriteLock(), (error: unknown) => error instanceof RegistryLockLoadingError && error.failureKind === 'LOCK_PATH_ESCAPE');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});
