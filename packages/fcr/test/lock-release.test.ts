import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { CanonicalJsonService } from '../src/canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryLockLoadingService } from '../src/locking/lock-loading.js';
import { RegistryLockPathResolver } from '../src/locking/lock-paths.js';
import { RegistryLockReleaseError, RegistryLockReleaseService } from '../src/locking/lock-release.js';
import { RegistryLockTransitionIdentityService } from '../src/locking/lock-transition-identity.js';
import { RegistryLockTransitionPersistenceService } from '../src/locking/lock-transition-persistence.js';
import type { LockRecord, RegistryLockOwner } from '../src/locking/lock-types.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

const owner: RegistryLockOwner = {
  ownerTransactionId: 'TRANSACTION-RELEASE-1',
  ownerIdentity: 'WORKER-RELEASE-1',
};
const lock: LockRecord = {
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

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-release-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createService(root: string): Promise<{ release: RegistryLockReleaseService; paths: RegistryLockPathResolver; transitions: RegistryLockTransitionPersistenceService; identity: RegistryLockTransitionIdentityService }> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
  const loading = new RegistryLockLoadingService(validator, errors, root);
  const identity = new RegistryLockTransitionIdentityService(errors);
  const transitions = new RegistryLockTransitionPersistenceService(validator, errors, root, identity);
  return { release: new RegistryLockReleaseService(loading, transitions, errors, root, validator), paths: new RegistryLockPathResolver(root), transitions, identity };
}

async function writeActiveLock(paths: RegistryLockPathResolver, value: unknown = lock): Promise<string> {
  const lockPath = paths.resolveRegistryWriteLockPath();
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  await fs.writeFile(lockPath, `${new CanonicalJsonService().canonicalize(value)}\n`, 'utf8');
  return lockPath;
}

test('releases the active lock only after persisting the transition', async () => {
  const root = await createFixture();
  try {
    const { release, paths } = await createService(root);
    const lockPath = await writeActiveLock(paths);
    const transition = await release.releaseRegistryWriteLock(owner, '2026-07-23T00:00:01Z');
    assert.equal(transition.to_state, 'RELEASED');
    assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), false);
    const transitionPath = paths.resolveRegistryWriteTransitionPath(transition.transition_id);
    assert.equal((await fs.stat(transitionPath)).isFile(), true);
    assert.equal((await fs.readFile(transitionPath, 'utf8')), `${new CanonicalJsonService().canonicalize(transition)}\n`);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('ownership failure leaves the active lock unchanged and creates no transition', async () => {
  const root = await createFixture();
  try {
    const { release, paths } = await createService(root);
    const lockPath = await writeActiveLock(paths);
    const before = await fs.readFile(lockPath);
    await assert.rejects(
      () => release.releaseRegistryWriteLock({ ...owner, ownerIdentity: 'WORKER-OTHER' }, '2026-07-23T00:00:01Z'),
      (error: unknown) => error instanceof Error && (error.name === 'RegistryLockOwnershipError' || error.name === 'RegistryLockReleaseError'),
    );
    assert.deepEqual(await fs.readFile(lockPath), before);
    assert.equal(await fs.stat(path.join(root, 'implementation/workflow-state/registry/lock-transitions')).then(() => true).catch(() => false), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('missing lock preserves canonical missing behavior and creates no transition', async () => {
  const root = await createFixture();
  try {
    const { release } = await createService(root);
    await assert.rejects(
      () => release.releaseRegistryWriteLock(owner, '2026-07-23T00:00:01Z'),
      (error: unknown) => error instanceof Error && error.name === 'RegistryLockLoadingError' && 'frameworkError' in error && (error as { frameworkError: { code: string } }).frameworkError.code === 'REGISTRY_LOCK_MISSING',
    );
    assert.equal(await fs.stat(path.join(root, 'implementation')).then(() => true).catch(() => false), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('transition persistence failure leaves the active lock unchanged', async () => {
  const root = await createFixture();
  try {
    const { release, paths } = await createService(root);
    const lockPath = await writeActiveLock(paths);
    const before = await fs.readFile(lockPath);
    const transitionPath = paths.resolveRegistryWriteTransitionPath('REL_3693F77145FCC622F0E528A3123B40B4BE1A056D4443B7C857C0702F0804D1F7');
    await fs.mkdir(path.dirname(transitionPath), { recursive: true });
    await fs.writeFile(transitionPath, 'existing transition\n', 'utf8');
    await assert.rejects(() => release.releaseRegistryWriteLock(owner, '2026-07-23T00:00:01Z'));
    assert.deepEqual(await fs.readFile(lockPath), before);
    assert.equal(await fs.readFile(transitionPath, 'utf8'), 'existing transition\n');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('invalid release timestamp fails before transition persistence or deletion', async () => {
  const root = await createFixture();
  try {
    const { release, paths } = await createService(root);
    const lockPath = await writeActiveLock(paths);
    await assert.rejects(() => release.releaseRegistryWriteLock(owner, 'not-a-timestamp'), (error: unknown) => error instanceof RegistryLockReleaseError);
    assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), true);
    assert.equal(await fs.stat(path.join(root, 'implementation/workflow-state/registry/lock-transitions')).then(() => true).catch(() => false), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('deletion failure preserves the persisted transition and surfaces the failure', async () => {
  const root = await createFixture();
  try {
    const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
    const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
    const loading = new RegistryLockLoadingService(validator, errors, root);
    const identity = new RegistryLockTransitionIdentityService(errors);
    const transitions = new RegistryLockTransitionPersistenceService(validator, errors, root, identity);
    const paths = new RegistryLockPathResolver(root);
    const lockPath = await writeActiveLock(paths);
    const release = new RegistryLockReleaseService(
      loading,
      transitions,
      errors,
      root,
      validator,
      async () => { throw new Error('forced unlink failure'); },
    );
    const transitionId = identity.deriveRegistryLockReleaseTransitionId(lock, '2026-07-23T00:00:01Z');
    await assert.rejects(
      () => release.releaseRegistryWriteLock(owner, '2026-07-23T00:00:01Z'),
      (error: unknown) => error instanceof RegistryLockReleaseError && error.frameworkError.code === 'REGISTRY_PARTIAL_WRITE',
    );
    assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), true);
    assert.equal(await fs.stat(paths.resolveRegistryWriteTransitionPath(transitionId)).then(() => true).catch(() => false), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('retry reuses matching immutable transition evidence and deletes the active lock', async () => {
  const root = await createFixture();
  try {
    const { release, paths, transitions } = await createService(root);
    const lockPath = await writeActiveLock(paths);
    const transition = await transitions.constructReleaseTransition({ lockRecord: lock, occurredAt: '2026-07-23T00:00:01Z' });
    const transitionPath = paths.resolveRegistryWriteTransitionPath(transition.transition_id);
    await fs.mkdir(path.dirname(transitionPath), { recursive: true });
    const bytes = Buffer.from(`${new CanonicalJsonService().canonicalize(transition)}\n`, 'utf8');
    await fs.writeFile(transitionPath, bytes, { flag: 'wx' });
    const result = await release.retryRegistryWriteRelease(owner, '2026-07-23T00:00:01Z');
    assert.deepEqual(result, transition);
    assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), false);
    assert.deepEqual(await fs.readFile(transitionPath), bytes);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('retry falls back to one fresh release when deterministic transition history is missing', async () => {
  const root = await createFixture();
  try {
    const { release, paths } = await createService(root);
    const lockPath = await writeActiveLock(paths);
    const result = await release.retryRegistryWriteRelease(owner, '2026-07-23T00:00:01Z');
    assert.equal(result.to_state, 'RELEASED');
    assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), false);
    assert.equal(await fs.stat(paths.resolveRegistryWriteTransitionPath(result.transition_id)).then(() => true).catch(() => false), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('invalid or mismatched transition evidence prevents deletion and preserves bytes', async () => {
  for (const mode of ['malformed', 'mismatched'] as const) {
    const root = await createFixture();
    try {
      const { release, paths, transitions } = await createService(root);
      const lockPath = await writeActiveLock(paths);
      const expected = await transitions.constructReleaseTransition({ lockRecord: lock, occurredAt: '2026-07-23T00:00:01Z' });
      const transitionPath = paths.resolveRegistryWriteTransitionPath(expected.transition_id);
      await fs.mkdir(path.dirname(transitionPath), { recursive: true });
      const existing = mode === 'malformed'
        ? Buffer.from('{malformed\n', 'utf8')
        : Buffer.from(`${new CanonicalJsonService().canonicalize({ ...expected, owner_identity: 'WORKER-OTHER' })}\n`, 'utf8');
      await fs.writeFile(transitionPath, existing, { flag: 'wx' });
      await assert.rejects(() => release.retryRegistryWriteRelease(owner, '2026-07-23T00:00:01Z'));
      assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), true);
      assert.deepEqual(await fs.readFile(transitionPath), existing);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }
});

test('retry deletion failure performs one deletion attempt and preserves both records', async () => {
  const root = await createFixture();
  try {
    const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
    const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
    const loading = new RegistryLockLoadingService(validator, errors, root);
    const identity = new RegistryLockTransitionIdentityService(errors);
    const transitions = new RegistryLockTransitionPersistenceService(validator, errors, root, identity);
    const paths = new RegistryLockPathResolver(root);
    const lockPath = await writeActiveLock(paths);
    const expected = await transitions.constructReleaseTransition({ lockRecord: lock, occurredAt: '2026-07-23T00:00:01Z' });
    const transitionPath = paths.resolveRegistryWriteTransitionPath(expected.transition_id);
    await fs.mkdir(path.dirname(transitionPath), { recursive: true });
    const bytes = Buffer.from(`${new CanonicalJsonService().canonicalize(expected)}\n`, 'utf8');
    await fs.writeFile(transitionPath, bytes, { flag: 'wx' });
    let unlinkCalls = 0;
    const release = new RegistryLockReleaseService(loading, transitions, errors, root, validator, async () => {
      unlinkCalls += 1;
      throw new Error('forced unlink failure');
    });
    await assert.rejects(() => release.retryRegistryWriteRelease(owner, '2026-07-23T00:00:01Z'));
    assert.equal(unlinkCalls, 1);
    assert.equal(await fs.stat(lockPath).then(() => true).catch(() => false), true);
    assert.deepEqual(await fs.readFile(transitionPath), bytes);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
