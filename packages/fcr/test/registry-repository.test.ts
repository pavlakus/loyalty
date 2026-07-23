import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryFilesystemPathResolver } from '../src/persistence/filesystem-paths.js';
import { RegistryRepository, RegistryRepositoryError } from '../src/persistence/registry-repository.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007a-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createRepository(root: string): Promise<RegistryRepository> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  return new RegistryRepository(root, errors, new SchemaValidator(new ArtifactLoader(repositoryRoot), errors));
}

const validRevision = {
  schema_version: '1.0.0',
  revision_id: 'REV-001',
  repository_id: 'REPOSITORY',
  repository_revision: 'COMMIT-001',
  record_hashes: [],
  projection_hashes: [],
  created_at: '2026-01-01T00:00:00Z',
  created_by: 'FCR',
  transaction_id: 'TRANSACTION-001',
};

test('bootstrap creates the canonical registry directories on an empty repository', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    for (const directory of ['revisions', 'transactions', 'locks', 'projections', 'staging']) {
      assert.equal((await fs.stat(path.join(root, 'implementation/workflow-state/registry', directory))).isDirectory(), true);
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('bootstrap is repeatable and never deletes existing files', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    const sentinel = path.join(repository.paths.staging, 'sentinel.txt');
    await fs.writeFile(sentinel, 'keep', 'utf8');
    await repository.bootstrap();
    assert.equal(await fs.readFile(sentinel, 'utf8'), 'keep');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('path resolver returns canonical repository paths and rejects traversal identifiers', async () => {
  const root = await createFixture();
  try {
    const resolver = new RegistryFilesystemPathResolver(root);
    assert.equal(resolver.relativePath(resolver.paths.frameworkRegistry), 'implementation/workflow-state/registry/framework-registry.json');
    assert.match(resolver.childPath('revisions', 'REV-001'), /revisions[\\/]REV-001$/);
    assert.throws(() => resolver.childPath('revisions', '../outside'));
    assert.throws(() => resolver.childPath('revisions', 'nested/id'));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('current revision reader reports missing registry deterministically', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    const readError = async (): Promise<RegistryRepositoryError> => {
      try {
        await repository.readCurrentRevision();
      } catch (error) {
        assert.ok(error instanceof RegistryRepositoryError);
        return error;
      }
      throw new Error('expected current revision read to fail');
    };
    const first = await readError();
    const second = await readError();
    assert.equal(first.frameworkError.code, 'REGISTRY_DOCUMENT_MISSING');
    assert.equal(first.failureKind, 'REPOSITORY_MISSING');
    assert.equal(first.message, second.message);
    await repository.bootstrap();
    const pointerError = await readError();
    assert.equal(pointerError.frameworkError.code, 'REGISTRY_DOCUMENT_MISSING');
    assert.equal(pointerError.failureKind, 'CURRENT_POINTER_MISSING');
    assert.equal(await repository.currentRevisionExists(), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('current revision reader detects missing and existing revisions without fabricating state', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: 'REV-001' }), 'utf8');
    assert.equal(await repository.currentRevisionExists(), false);
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.frameworkError.code === 'REGISTRY_DOCUMENT_MISSING';
    });
    await fs.writeFile(path.join(repository.paths.revisions, 'REV-001.json'), JSON.stringify(validRevision), 'utf8');
    assert.deepEqual(await repository.readCurrentRevision(), { revision_id: 'REV-001' });
    assert.equal(await repository.currentRevisionExists(), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('malformed pointer JSON is classified separately from a missing pointer', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, '{', 'utf8');
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'POINTER_JSON_MALFORMED' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('invalid pointer shape is rejected before resolving a revision path', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: '../outside' }), 'utf8');
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'POINTER_SCHEMA_INVALID' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('invalid revision JSON is not treated as an existing current revision', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: 'REV-001' }), 'utf8');
    await fs.writeFile(path.join(repository.paths.revisions, 'REV-001.json'), '{', 'utf8');
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'REFERENCED_REVISION_JSON_MALFORMED' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
    await assert.rejects(() => repository.currentRevisionExists(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'REFERENCED_REVISION_JSON_MALFORMED' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('schema-invalid revision JSON is rejected with deterministic validation metadata', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: 'REV-001' }), 'utf8');
    await fs.writeFile(path.join(repository.paths.revisions, 'REV-001.json'), JSON.stringify({ ...validRevision, revision_id: '' }), 'utf8');
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      if (!(error instanceof RegistryRepositoryError)) return false;
      const metadata = error.frameworkError.machine_metadata;
      const validationPath = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? (metadata as { readonly validation_path?: unknown }).validation_path
        : undefined;
      return error.failureKind === 'REFERENCED_REVISION_INVALID'
        && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED'
        && validationPath === 'implementation/workflow-state/registry/revisions/REV-001.json';
    });
    await assert.rejects(() => repository.currentRevisionExists(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'REFERENCED_REVISION_INVALID';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('a revision directory is not accepted as the current revision', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: 'REV-001' }), 'utf8');
    await fs.mkdir(path.join(repository.paths.revisions, 'REV-001.json'));
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'REFERENCED_REVISION_TARGET_NOT_FILE' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('registry-root symlink escapes are rejected before bootstrap writes outside the repository', async () => {
  const root = await createFixture();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007a-outside-'));
  try {
    await fs.mkdir(path.join(root, 'implementation/workflow-state'), { recursive: true });
    await fs.symlink(outside, path.join(root, 'implementation/workflow-state/registry'));
    const repository = await createRepository(root);
    await assert.rejects(() => repository.bootstrap(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'REGISTRY_PATH_ESCAPE' && error.frameworkError.code === 'REGISTRY_PATH_NORMALIZATION_FAILED';
    });
    assert.deepEqual(await fs.readdir(outside), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test('child-path symlink escapes are rejected before revision content is read', async () => {
  const root = await createFixture();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007a-outside-'));
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: 'REV-001' }), 'utf8');
    const outsideRevision = path.join(outside, 'REV-001.json');
    await fs.writeFile(outsideRevision, JSON.stringify(validRevision), 'utf8');
    await fs.symlink(outsideRevision, path.join(repository.paths.revisions, 'REV-001.json'));
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.failureKind === 'REGISTRY_PATH_ESCAPE' && error.frameworkError.code === 'REGISTRY_PATH_NORMALIZATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test('invalid current revision documents produce a canonical validation error', async () => {
  const root = await createFixture();
  try {
    const repository = await createRepository(root);
    await repository.bootstrap();
    await fs.writeFile(repository.paths.frameworkRegistry, JSON.stringify({ revision_id: 'REV-001', extra: true }), 'utf8');
    await assert.rejects(() => repository.readCurrentRevision(), (error: unknown) => {
      return error instanceof RegistryRepositoryError && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
