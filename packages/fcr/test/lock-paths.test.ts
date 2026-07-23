import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { RegistryLockPathResolver } from '../src/locking/lock-paths.js';

const TRANSITION_ID = `REL_${'A'.repeat(64)}`;

async function createRepositoryFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-paths-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

test('resolves the fixed registry-write lock and transition paths', async () => {
  const root = await createRepositoryFixture();
  try {
    const paths = new RegistryLockPathResolver(root);
    assert.equal(
      paths.resolveRegistryWriteLockPath(),
      path.join(root, 'implementation/workflow-state/registry/locks/REGISTRY_WRITE.json'),
    );
    assert.equal(
      paths.resolveRegistryWriteTransitionDirectory(),
      path.join(root, 'implementation/workflow-state/registry/lock-transitions/REGISTRY_WRITE'),
    );
    assert.equal(
      paths.resolveRegistryWriteTransitionPath(TRANSITION_ID),
      path.join(root, `implementation/workflow-state/registry/lock-transitions/REGISTRY_WRITE/${TRANSITION_ID}.json`),
    );
    await assert.rejects(fs.stat(path.join(root, 'implementation/workflow-state/registry')));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects malformed, traversing, suffixed, and path-like transition identifiers', async () => {
  const root = await createRepositoryFixture();
  try {
    const paths = new RegistryLockPathResolver(root);
    for (const value of ['', 'REL_bad', `${TRANSITION_ID}.json`, '../outside', 'a/b', 'a\\b', '/absolute', `${TRANSITION_ID}/../outside`]) {
      assert.throws(() => paths.resolveRegistryWriteTransitionPath(value));
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects a registry-root symlink escape before any path is used for mutation', async () => {
  const root = await createRepositoryFixture();
  const external = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-paths-external-'));
  try {
    await fs.mkdir(path.join(root, 'implementation/workflow-state'), { recursive: true });
    await fs.symlink(external, path.join(root, 'implementation/workflow-state/registry'), 'dir');
    const paths = new RegistryLockPathResolver(root);
    await assert.rejects(
      () => paths.assertContainedPath(paths.resolveRegistryWriteLockPath()),
    );
    assert.deepEqual(await fs.readdir(external), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(external, { recursive: true, force: true });
  }
});

test('rejects a transition-directory symlink escape and sibling-prefix paths', async () => {
  const root = await createRepositoryFixture();
  const external = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-child-external-'));
  try {
    const registryRoot = path.join(root, 'implementation/workflow-state/registry');
    await fs.mkdir(registryRoot, { recursive: true });
    await fs.symlink(external, path.join(registryRoot, 'lock-transitions'), 'dir');
    const paths = new RegistryLockPathResolver(root);
    await assert.rejects(
      () => paths.assertContainedPath(paths.resolveRegistryWriteTransitionPath(TRANSITION_ID)),
    );
    await assert.rejects(
      () => paths.assertContainedPath(`${root}-other/implementation/workflow-state/registry/locks/REGISTRY_WRITE.json`),
    );
    assert.deepEqual(await fs.readdir(external), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(external, { recursive: true, force: true });
  }
});
