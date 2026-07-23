import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { CanonicalJsonService } from '../src/canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryLockPathResolver } from '../src/locking/lock-paths.js';
import { RegistryLockTransitionIdentityService } from '../src/locking/lock-transition-identity.js';
import { RegistryLockTransitionPersistenceError, RegistryLockTransitionPersistenceService } from '../src/locking/lock-transition-persistence.js';
import type { LockRecord } from '../src/locking/lock-types.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

const validLock: LockRecord = {
  schema_version: '2.0.0',
  lock_id: 'REGISTRY_WRITE',
  namespace: 'REGISTRY_WRITE',
  owner_transaction_id: 'TRANSACTION-PERSIST-1',
  owner_identity: 'WORKER-PERSIST-1',
  state: 'ACQUIRED',
  acquired_at: '2026-07-23T00:00:00Z',
  heartbeat_at: '2026-07-23T00:00:00Z',
  expires_at: null,
  takeover_count: 0,
};

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-transition-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createService(root: string): Promise<{ service: RegistryLockTransitionPersistenceService; validator: SchemaValidator }> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
  const identity = new RegistryLockTransitionIdentityService(errors);
  return {
    service: new RegistryLockTransitionPersistenceService(validator, errors, root, identity),
    validator,
  };
}

test('constructs and persists the canonical immutable release transition', async () => {
  const root = await createFixture();
  try {
    const { service, validator } = await createService(root);
    const record = await service.persistReleaseTransition({ lockRecord: validLock, occurredAt: '2026-07-23T00:00:01Z' });
    assert.deepEqual(record, {
      schema_version: '1.0.0',
    transition_id: 'REL_81F8EF0A866042851C882CEA611803FB07941A7C63716D730C25871D15D2AB59',
      entity_type: 'LOCK',
      entity_id: 'REGISTRY_WRITE',
      namespace: 'REGISTRY_WRITE',
      from_state: 'ACQUIRED',
      to_state: 'RELEASED',
      owner_transaction_id: 'TRANSACTION-PERSIST-1',
      owner_identity: 'WORKER-PERSIST-1',
      acquired_at: '2026-07-23T00:00:00Z',
      occurred_at: '2026-07-23T00:00:01Z',
      transition_type: 'LOCK_ACQUIRED_RELEASED',
    });
    const paths = new RegistryLockPathResolver(root);
    const transitionPath = paths.resolveRegistryWriteTransitionPath(record.transition_id);
    const bytes = await fs.readFile(transitionPath);
    assert.equal(bytes.toString('utf8'), `${new CanonicalJsonService().canonicalize(record)}\n`);
    assert.equal((await validator.validateRecord('docs/ai-engineering-framework/fcr/schemas/lock-transition-record.schema.json', JSON.parse(bytes.toString('utf8')))).valid, true);
    assert.equal(await fs.stat(path.join(root, 'implementation/workflow-state/registry/locks')).then(() => true).catch(() => false), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('persistence is deterministic and creates only transition history', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    const first = await service.persistReleaseTransition({ lockRecord: validLock, occurredAt: '2026-07-23T00:00:01Z' });
    const firstBytes = await fs.readFile(new RegistryLockPathResolver(root).resolveRegistryWriteTransitionPath(first.transition_id));
    const secondRoot = await createFixture();
    try {
      const { service: secondService } = await createService(secondRoot);
      const second = await secondService.persistReleaseTransition({ lockRecord: validLock, occurredAt: '2026-07-23T00:00:01Z' });
      const secondBytes = await fs.readFile(new RegistryLockPathResolver(secondRoot).resolveRegistryWriteTransitionPath(second.transition_id));
      assert.deepEqual(second, first);
      assert.deepEqual(secondBytes, firstBytes);
    } finally {
      await fs.rm(secondRoot, { recursive: true, force: true });
    }
    assert.equal(await fs.stat(path.join(root, 'implementation/workflow-state/registry/lock-transitions/REGISTRY_WRITE')).then(() => true).catch(() => false), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('exclusive collision preserves existing transition bytes and does not retry', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    const first = await service.constructReleaseTransition({ lockRecord: validLock, occurredAt: '2026-07-23T00:00:01Z' });
    const transitionPath = new RegistryLockPathResolver(root).resolveRegistryWriteTransitionPath(first.transition_id);
    await fs.mkdir(path.dirname(transitionPath), { recursive: true });
    const existing = Buffer.from('existing transition\n', 'utf8');
    await fs.writeFile(transitionPath, existing, { flag: 'wx' });
    await assert.rejects(
      () => service.persistReleaseTransition({ lockRecord: validLock, occurredAt: '2026-07-23T00:00:01Z' }),
      (error: unknown) => error instanceof RegistryLockTransitionPersistenceError && error.frameworkError.code === 'REGISTRY_TRANSITION_CONFLICT',
    );
    assert.deepEqual(await fs.readFile(transitionPath), existing);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('invalid transition input creates no transition files', async () => {
  const cases: LockRecord[] = [
    { ...validLock, lock_id: 'OTHER' as 'REGISTRY_WRITE' },
    { ...validLock, namespace: 'OTHER' as 'REGISTRY_WRITE' },
    { ...validLock, state: 'RELEASED' },
    { ...validLock, acquired_at: 'not-a-timestamp' },
  ];
  for (const lockRecord of cases) {
    const root = await createFixture();
    try {
      const { service } = await createService(root);
      await assert.rejects(() => service.persistReleaseTransition({ lockRecord, occurredAt: '2026-07-23T00:00:01Z' }));
      assert.equal(await fs.stat(path.join(root, 'implementation')).then(() => true).catch(() => false), false);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }
});

test('path containment rejects a symlinked transition-history root before mutation', async () => {
  const root = await createFixture();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007c-transition-outside-'));
  try {
    const { service } = await createService(root);
    const registryRoot = path.join(root, 'implementation/workflow-state/registry');
    await fs.mkdir(registryRoot, { recursive: true });
    await fs.symlink(outside, path.join(registryRoot, 'lock-transitions'), 'dir');
    await assert.rejects(() => service.persistReleaseTransition({ lockRecord: validLock, occurredAt: '2026-07-23T00:00:01Z' }));
    assert.deepEqual(await fs.readdir(outside), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});
