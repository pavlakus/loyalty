import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { normalizeRepositoryRelativePath, resolveRepositoryRoot } from '../src/config/repository-paths.js';
import { copyFcrFixture, readJson, writeJson } from './fixture-helpers.js';
import { repositoryRoot } from './test-helpers.js';

const indexPath = 'docs/ai-engineering-framework/fcr/registry.json';

test('loads the canonical registry with deterministic artifact ordering', async () => {
  const result = await new ArtifactLoader(repositoryRoot).load();
  assert.equal(result.issues.length, 0);
  assert.ok(result.artifacts.length > 0);
  assert.deepEqual(result.artifacts.map((artifact) => artifact.repositoryRelativePath), [...result.artifacts.map((artifact) => artifact.repositoryRelativePath)].sort());
});

test('resolves the repository from a nested package directory', async () => {
  const result = await new ArtifactLoader(resolveRepositoryRoot(path.join(repositoryRoot, 'packages/fcr/src'))).load();
  assert.equal(result.issues.length, 0);
  assert.equal(result.index.artifact_root, 'docs/ai-engineering-framework/fcr');
});

test('resolves a repository accessed through a symlink without leaking real paths', async () => {
  const actualRoot = await copyFcrFixture(repositoryRoot);
  const linkRoot = path.join(os.tmpdir(), `fcr-loader-link-${process.pid}-${Date.now()}`);
  try {
    await fs.symlink(actualRoot, linkRoot, 'dir');
    const result = await new ArtifactLoader(linkRoot).load();
    assert.equal(result.issues.length, 0);
    assert.ok(result.artifacts.every((artifact) => artifact.repositoryRelativePath.startsWith('docs/ai-engineering-framework/fcr/')));
    assert.ok(result.artifacts.every((artifact) => !artifact.repositoryRelativePath.includes(path.sep === '/' ? '/private/' : '\\')));
    assert.ok(result.artifacts.every((artifact) => !artifact.repositoryRelativePath.startsWith('/')));
  } finally {
    await fs.rm(linkRoot, { recursive: true, force: true });
    await fs.rm(actualRoot, { recursive: true, force: true });
  }
});

test('freezes the loader result and artifact wrappers', async () => {
  const result = await new ArtifactLoader(repositoryRoot).load();
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.index), true);
  assert.equal(Object.isFrozen(result.artifacts), true);
  assert.equal(Object.isFrozen(result.artifacts[0]), true);
  assert.equal(Object.isFrozen(result.artifacts[0].raw), true);
  const nestedObject = findNestedObject(result.artifacts[0].raw);
  assert.ok(nestedObject);
  assert.equal(Object.isFrozen(nestedObject), true);
  assert.equal(Reflect.set(result.artifacts[0] as object, 'category', 'examples'), false);
});

function findNestedObject(value: unknown): object | undefined {
  if (!value || typeof value !== 'object') return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findNestedObject(item);
      if (nested) return nested;
    }
    return undefined;
  }
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') return child;
  }
  return undefined;
}

test('rejects absolute and parent-traversing repository paths', () => {
  assert.throws(() => normalizeRepositoryRelativePath('/absolute.json'));
  assert.throws(() => normalizeRepositoryRelativePath('../outside.json'));
});

async function withFixture(mutator: (root: string) => Promise<void>, assertion: (root: string) => Promise<void>): Promise<void> {
  const root = await copyFcrFixture(repositoryRoot);
  try {
    await mutator(root);
    await assertion(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function expectLoaderIssue(root: string, code: string): Promise<void> {
  try {
    const result = await new ArtifactLoader(root).load();
    assert.ok(result.issues.some((issue) => issue.code === code), `expected ${code}`);
  } catch (error) {
    assert.equal((error as { frameworkError?: { code?: string } }).frameworkError?.code, code, `expected ${code}`);
  }
}

test('rejects an external repository file', async () => {
  await withFixture(async (root) => {
    const index = await readJson<Record<string, unknown>>(root, indexPath);
    (index.schemas as string[])[0] = 'package.json';
    await writeJson(root, indexPath, index);
  }, (root) => expectLoaderIssue(root, 'REGISTRY_VALIDATION_FAILED'));
});

test('rejects a missing registry', async () => {
  await withFixture(async (root) => {
    await fs.rm(path.join(root, indexPath));
  }, async (root) => assert.rejects(() => new ArtifactLoader(root).load(), { name: 'FcrRuntimeError' }));
});

test('rejects a malformed registry', async () => {
  await withFixture(async (root) => {
    await fs.writeFile(path.join(root, indexPath), '{invalid');
  }, async (root) => assert.rejects(() => new ArtifactLoader(root).load(), { name: 'FcrRuntimeError' }));
});

test('rejects an absolute path', async () => {
  await withFixture(async (root) => {
    const index = await readJson<Record<string, unknown>>(root, indexPath);
    (index.schemas as string[])[0] = '/etc/passwd';
    await writeJson(root, indexPath, index);
  }, (root) => expectLoaderIssue(root, 'REGISTRY_VALIDATION_FAILED'));
});

test('rejects parent and nested traversal paths', async () => {
  for (const value of ['docs/ai-engineering-framework/fcr/../84.md', 'docs/ai-engineering-framework/fcr/schemas/../registry.json']) {
    await withFixture(async (root) => {
      const index = await readJson<Record<string, unknown>>(root, indexPath);
      (index.schemas as string[])[0] = value;
      await writeJson(root, indexPath, index);
    }, (root) => expectLoaderIssue(root, 'REGISTRY_VALIDATION_FAILED'));
  }
});

test('rejects an fcr-evil prefix path', async () => {
  await withFixture(async (root) => {
    const index = await readJson<Record<string, unknown>>(root, indexPath);
    (index.schemas as string[])[0] = 'docs/ai-engineering-framework/fcr-evil/file.json';
    await writeJson(root, indexPath, index);
  }, (root) => expectLoaderIssue(root, 'REGISTRY_VALIDATION_FAILED'));
});

test('rejects a directory target', async () => {
  await withFixture(async (root) => {
    const index = await readJson<Record<string, unknown>>(root, indexPath);
    (index.schemas as string[])[0] = 'docs/ai-engineering-framework/fcr/schemas';
    await writeJson(root, indexPath, index);
  }, (root) => expectLoaderIssue(root, 'REGISTRY_DOCUMENT_MISSING'));
});

test('rejects a missing target', async () => {
  await withFixture(async (root) => {
    const index = await readJson<Record<string, unknown>>(root, indexPath);
    (index.schemas as string[])[0] = 'docs/ai-engineering-framework/fcr/missing.json';
    await writeJson(root, indexPath, index);
  }, (root) => expectLoaderIssue(root, 'REGISTRY_DOCUMENT_MISSING'));
});

test('rejects a symlink escaping the FCR root', async () => {
  await withFixture(async (root) => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-loader-outside-'));
    try {
      const outsideFile = path.join(outside, 'outside.json');
      await fs.writeFile(outsideFile, '{}');
      await fs.symlink(outsideFile, path.join(root, 'docs/ai-engineering-framework/fcr/escape.json'));
      const index = await readJson<Record<string, unknown>>(root, indexPath);
      (index.schemas as string[])[0] = 'docs/ai-engineering-framework/fcr/escape.json';
      await writeJson(root, indexPath, index);
      await expectLoaderIssue(root, 'REGISTRY_PATH_NORMALIZATION_FAILED');
    } finally {
      await fs.rm(outside, { recursive: true, force: true });
    }
  }, async () => undefined);
});

test('rejects malformed indexed JSON', async () => {
  await withFixture(async (root) => {
    const malformed = 'docs/ai-engineering-framework/fcr/malformed.json';
    await fs.writeFile(path.join(root, malformed), '{invalid');
    const index = await readJson<Record<string, unknown>>(root, indexPath);
    (index.schemas as string[]).push(malformed);
    await writeJson(root, indexPath, index);
  }, (root) => expectLoaderIssue(root, 'REGISTRY_SCHEMA_INVALID'));
});

async function temporaryRepository(registry: unknown): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-loader-'));
  await fs.mkdir(path.join(root, 'docs/ai-engineering-framework/fcr/errors'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/ai-engineering-framework/fcr/schemas'), { recursive: true });
  await fs.writeFile(path.join(root, 'package.json'), '{}');
  const completeRegistry = {
    schema_version: '1.0.0', architecture_version: '1.0.0', document_path: 'docs/ai-engineering-framework/84-framework-canonical-registry-architecture.md',
    artifact_root: 'docs/ai-engineering-framework/fcr', created_at: '2026-07-20T00:00:00Z', updated_at: '2026-07-20T00:00:00Z',
    ...registry,
  };
  await fs.writeFile(path.join(root, indexPath), JSON.stringify(completeRegistry));
  for (const filename of ['registry-index.schema.json', 'common-types.schema.json']) {
    await fs.copyFile(path.join(repositoryRoot, 'docs/ai-engineering-framework/fcr/schemas', filename), path.join(root, 'docs/ai-engineering-framework/fcr/schemas', filename));
  }
  const definition = {
    schema_version: '1.0.0', severity: 'P1', response_contract_status: 'TASK PREPARATION BLOCKED', blocker_category: 'REGISTRY',
    retryable: false, resume_condition: 'repair', human_message_template: 'registry failure',
    machine_metadata_schema_ref: 'docs/ai-engineering-framework/fcr/errors/schemas/registry-document-missing-metadata.schema.json',
    evidence_requirements: [], cleanup_behavior: 'NONE', transaction_effect: 'FAILED', lifecycle_effect: 'NONE',
    escalation_required: false, recovery_operation: 'NONE', terminal: true,
  };
  await fs.mkdir(path.join(root, 'docs/ai-engineering-framework/fcr/errors/schemas'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/ai-engineering-framework/fcr/errors/schemas/registry-document-missing-metadata.schema.json'), JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', $id: 'https://example.test/fcr/metadata', type: 'object', additionalProperties: true }));
  await fs.writeFile(path.join(root, 'docs/ai-engineering-framework/fcr/errors/framework-error-catalog.json'), JSON.stringify({ errors: [
    { code: 'REGISTRY_DOCUMENT_MISSING', ...definition },
    { code: 'REGISTRY_VALIDATION_FAILED', ...definition },
    { code: 'REGISTRY_PATH_NORMALIZATION_FAILED', ...definition },
    { code: 'REGISTRY_SCHEMA_INVALID', ...definition },
  ] }));
  return root;
}

test('reports missing indexed artifacts and duplicate indexed paths', async () => {
  const registry = {
    schemas: ['docs/ai-engineering-framework/fcr/missing.schema.json', 'docs/ai-engineering-framework/fcr/missing.schema.json'],
    contracts: [], predicates: [], transition_tables: [], authority_tables: [], error_catalogs: [],
    bootstrap_contracts: [], context_contracts: [], examples: [],
  };
  const root = await temporaryRepository(registry);
  try {
    await assert.rejects(() => new ArtifactLoader(root).load(), { name: 'FcrRuntimeError' });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('reports a missing indexed artifact', async () => {
  const root = await temporaryRepository({
    schemas: ['docs/ai-engineering-framework/fcr/missing.schema.json'], contracts: [], predicates: [], transition_tables: [], authority_tables: [], error_catalogs: [],
    bootstrap_contracts: [], context_contracts: [], examples: [],
  });
  try {
    const result = await new ArtifactLoader(root).load();
    assert.ok(result.issues.some((issue) => issue.code === 'REGISTRY_DOCUMENT_MISSING'));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('reports an unindexed normative JSON artifact', async () => {
  const root = await temporaryRepository({
    schemas: [], contracts: [], predicates: [], transition_tables: [], authority_tables: [], error_catalogs: [],
    bootstrap_contracts: [], context_contracts: [], examples: [],
  });
  try {
    await fs.writeFile(path.join(root, 'docs/ai-engineering-framework/fcr/unindexed.json'), '{}');
    const result = await new ArtifactLoader(root).load();
    assert.ok(result.issues.some((issue) => issue.code === 'REGISTRY_VALIDATION_FAILED'));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('reports a symlink that resolves outside the repository', async () => {
  const root = await temporaryRepository({
    schemas: ['docs/ai-engineering-framework/fcr/linked.json'], contracts: [], predicates: [], transition_tables: [], authority_tables: [], error_catalogs: [],
    bootstrap_contracts: [], context_contracts: [], examples: [],
  });
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-outside-'));
  try {
    const outsideFile = path.join(outside, 'outside.json');
    await fs.writeFile(outsideFile, '{}');
    await fs.symlink(outsideFile, path.join(root, 'docs/ai-engineering-framework/fcr/linked.json'));
    const result = await new ArtifactLoader(root).load();
    assert.ok(result.issues.some((issue) => issue.code === 'REGISTRY_PATH_NORMALIZATION_FAILED'));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});
