import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createFcrRuntime } from '../src/index.js';
import { repositoryRoot, validErrorMetadata, validTaskRecord } from './test-helpers.js';
import { copyFcrFixture, readJson, writeJson } from './fixture-helpers.js';
import assertFs from 'node:assert/strict';

test('loads and validates the complete indexed FCR artifact set', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const result = await runtime.validator.validateCompleteArtifactSet();
  assert.equal(result.valid, true);
  assert.equal(result.issues.length, 0);
});

test('validates TaskRecord and normalizes AJV issues without mutating input', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const valid = validTaskRecord();
  const validResult = await runtime.validator.validateTaskRecord(valid);
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.value, valid);
  assert.notEqual(validResult.value, valid);
  const immutable = validResult.value as Readonly<typeof valid>;
  assert.throws(() => { (immutable as { title: string }).title = 'changed'; });
  assert.throws(() => { (immutable.dependencies as unknown[]).push({}); });
  (valid as { title: string }).title = 'changed after validation';
  assert.equal(immutable.title, 'Example Task');

  const invalid = { ...valid, unknown_property: true } as unknown;
  const invalidResult = await runtime.validator.validateTaskRecord(invalid);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.error);
  assert.ok(invalidResult.issues.some((issue) => issue.keyword === 'additionalProperties'));
  assert.equal((invalid as Record<string, unknown>).unknown_property, true);
});

test('returns detached deeply immutable values from generic record validation', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const input = validTaskRecord();
  const result = await runtime.validator.validateRecord<typeof input>('docs/ai-engineering-framework/fcr/schemas/task-record.schema.json', input);
  assert.equal(result.valid, true);
  assert.ok(result.value);
  assert.notEqual(result.value, input);
  assert.equal(Object.isFrozen(result.value), true);
  assert.equal(Object.isFrozen(result.value.dependencies), true);
  assert.throws(() => { (result.value.dependencies as unknown[]).push({}); });
  input.title = 'changed after validation';
  assert.equal(result.value.title, 'Example Task');
});

test('rejects invalid TaskRecord required fields and closed values', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const cases: Array<[string, unknown]> = [
    ['missing required field', { ...validTaskRecord(), title: undefined }],
    ['invalid task id', { ...validTaskRecord(), task_id: 'invalid id' }],
    ['invalid schema version', { ...validTaskRecord(), schema_version: '1' }],
    ['invalid lifecycle state', { ...validTaskRecord(), lifecycle_state: 'UNKNOWN' }],
    ['invalid dependency reference', { ...validTaskRecord(), dependencies: [{ dependency_type: 'task' }] }],
    ['invalid record revision', { ...validTaskRecord(), record_revision: '../revision' }],
  ];
  for (const [label, input] of cases) {
    const result = await runtime.validator.validateTaskRecord(input);
    assert.equal(result.valid, false, label);
    assert.ok(result.error, label);
  }
});

test('validates the framework error catalog through the canonical schema', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const error = runtime.errors.create('REGISTRY_VALIDATION_FAILED', { metadata: validErrorMetadata });
  const result = await runtime.errors.validate(error, (schemaPath, value) => runtime.validator.validateRecord(schemaPath, value));
  assert.equal(result.valid, true);
});

test('rejects duplicate schema IDs, unresolved refs, invalid metaschemas, and remote refs before record validation', async () => {
  const duplicateRoot = await copyFcrFixture(repositoryRoot);
  try {
    const taskSchemaPath = 'docs/ai-engineering-framework/fcr/schemas/task-record.schema.json';
    const moduleSchemaPath = 'docs/ai-engineering-framework/fcr/schemas/module-record.schema.json';
    const taskSchema = await readJson<Record<string, unknown>>(duplicateRoot, taskSchemaPath);
    const moduleSchema = await readJson<Record<string, unknown>>(duplicateRoot, moduleSchemaPath);
    moduleSchema.$id = taskSchema.$id;
    await writeJson(duplicateRoot, moduleSchemaPath, moduleSchema);
    await assertFs.rejects(() => createFcrRuntime(duplicateRoot).then((runtime) => runtime.validator.validateTaskRecord(validTaskRecord())), { name: 'FcrRuntimeError' });
  } finally { await fs.rm(duplicateRoot, { recursive: true, force: true }); }

  const unresolvedRoot = await copyFcrFixture(repositoryRoot);
  try {
    const taskSchemaPath = 'docs/ai-engineering-framework/fcr/schemas/task-record.schema.json';
    const unresolved = await readJson<Record<string, unknown>>(unresolvedRoot, taskSchemaPath);
    const unresolvedProperties = unresolved.properties as Record<string, unknown>;
    unresolvedProperties.task_id = { $ref: './missing.schema.json' };
    await writeJson(unresolvedRoot, taskSchemaPath, unresolved);
    await assertFs.rejects(() => createFcrRuntime(unresolvedRoot).then((runtime) => runtime.validator.validateTaskRecord(validTaskRecord())), { name: 'FcrRuntimeError' });
  } finally { await fs.rm(unresolvedRoot, { recursive: true, force: true }); }

  const invalidMetaRoot = await copyFcrFixture(repositoryRoot);
  try {
    const taskSchemaPath = 'docs/ai-engineering-framework/fcr/schemas/task-record.schema.json';
    const invalidMeta = await readJson<Record<string, unknown>>(invalidMetaRoot, taskSchemaPath);
    invalidMeta.type = 42;
    await writeJson(invalidMetaRoot, taskSchemaPath, invalidMeta);
    await assertFs.rejects(() => createFcrRuntime(invalidMetaRoot).then((runtime) => runtime.validator.validateTaskRecord(validTaskRecord())), { name: 'FcrRuntimeError' });
  } finally { await fs.rm(invalidMetaRoot, { recursive: true, force: true }); }

  const remoteRoot = await copyFcrFixture(repositoryRoot);
  try {
    const taskSchemaPath = 'docs/ai-engineering-framework/fcr/schemas/task-record.schema.json';
    const remote = await readJson<Record<string, unknown>>(remoteRoot, taskSchemaPath);
    const remoteProperties = remote.properties as Record<string, unknown>;
    remoteProperties.task_id = { $ref: 'https://example.invalid/missing.schema.json' };
    await writeJson(remoteRoot, taskSchemaPath, remote);
    await assertFs.rejects(() => createFcrRuntime(remoteRoot).then((runtime) => runtime.validator.validateTaskRecord(validTaskRecord())), { name: 'FcrRuntimeError' });
  } finally { await fs.rm(remoteRoot, { recursive: true, force: true }); }
});

test('returns all category failures in stable order', async () => {
  const root = await copyFcrFixture(repositoryRoot);
  const mutations: Array<[string, string]> = [
    ['docs/ai-engineering-framework/fcr/authority/authority-classes.json', 'schema_version'],
    ['docs/ai-engineering-framework/fcr/bootstrap/bootstrap-activation-contract.json', 'schema_version'],
    ['docs/ai-engineering-framework/fcr/context/path-grammar.json', 'schema_version'],
    ['docs/ai-engineering-framework/fcr/predicates/preparation-complete.json', 'canonical_path_pattern'],
  ];
  for (const [relative, field] of mutations) {
    const record = await readJson<Record<string, unknown>>(root, relative);
    delete record[field];
    await writeJson(root, relative, record);
  }
  try {
    const runtime = await createFcrRuntime(root);
    const result = await runtime.validator.validateCompleteArtifactSet();
    assert.equal(result.valid, false);
    assert.ok((result.errors?.length ?? 0) >= mutations.length);
    assert.deepEqual(result.errors?.map((error) => error.code), [...(result.errors ?? [])].map((error) => error.code).sort());
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('validates the registry through its canonical schema and rejects registry_index', async () => {
  const root = await copyFcrFixture(repositoryRoot);
  const registry = await readJson<Record<string, unknown>>(root, 'docs/ai-engineering-framework/fcr/registry.json');
  registry.registry_index = 'forbidden';
  await writeJson(root, 'docs/ai-engineering-framework/fcr/registry.json', registry);
  try {
    const runtime = await createFcrRuntime(root);
    await assertFs.rejects(() => runtime.validator.validateCompleteArtifactSet(), (error: unknown) => {
      assert.equal((error as { frameworkError?: { code?: string } }).frameworkError?.code, 'REGISTRY_VALIDATION_FAILED');
      return true;
    });
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('resolves fragment-only references and reports unknown schema IDs', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const authority = await runtime.validator.validateRecord('docs/ai-engineering-framework/fcr/schemas/authority-record.schema.json', await readJson(repositoryRoot, 'docs/ai-engineering-framework/fcr/authority/authority-classes.json'));
  assert.equal(authority.valid, true);
  const unknown = await runtime.validator.validateSchemaId('https://loyalty.example/fcr/schema/unknown/1.0.0', {});
  assert.equal(unknown.valid, false);
  assert.equal(unknown.error?.code, 'REGISTRY_SCHEMA_INVALID');
});

test('supports valid and invalid records through a recursive local schema', async () => {
  const root = await copyFcrFixture(repositoryRoot);
  const schemaPath = 'docs/ai-engineering-framework/fcr/schemas/recursive-test.schema.json';
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://loyalty.example/fcr/schema/recursive-test/1.0.0',
    title: 'Recursive test schema',
    type: 'object',
    required: ['value', 'next'],
    properties: { value: { type: 'string' }, next: { anyOf: [{ type: 'null' }, { $ref: '#' }] } },
    additionalProperties: false,
  };
  try {
    await writeJson(root, schemaPath, schema);
    const registry = await readJson<Record<string, unknown>>(root, 'docs/ai-engineering-framework/fcr/registry.json');
    (registry.schemas as string[]).push(schemaPath);
    await writeJson(root, 'docs/ai-engineering-framework/fcr/registry.json', registry);
    const runtime = await createFcrRuntime(root);
    const valid = await runtime.validator.validateRecord(schemaPath, { value: 'root', next: { value: 'leaf', next: null } });
    assert.equal(valid.valid, true);
    const invalid = await runtime.validator.validateRecord(schemaPath, { value: 'root', next: { value: 42, next: null } });
    assert.equal(invalid.valid, false);
    assert.ok(invalid.issues.every((issue) => issue.artifactPath === schemaPath && issue.category === 'schemas'));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects invalid registry contents before indexed artifact consumption', async () => {
  const mutations: Array<[string, (registry: Record<string, unknown>) => void]> = [
    ['registry_index', (registry) => { registry.registry_index = 'forbidden'; }],
    ['unknown property', (registry) => { registry.unknown_property = true; }],
    ['external path', (registry) => { (registry.schemas as string[])[0] = 'package.json'; }],
    ['traversal path', (registry) => { (registry.schemas as string[])[0] = 'docs/ai-engineering-framework/fcr/../84.md'; }],
  ];
  for (const [label, mutate] of mutations) {
    const root = await copyFcrFixture(repositoryRoot);
    try {
      const registry = await readJson<Record<string, unknown>>(root, 'docs/ai-engineering-framework/fcr/registry.json');
      mutate(registry);
      await writeJson(root, 'docs/ai-engineering-framework/fcr/registry.json', registry);
      await assertFs.rejects(() => createFcrRuntime(root).then((runtime) => runtime.validator.validateCompleteArtifactSet()), (error: unknown) => {
        assert.ok((error as { frameworkError?: { code?: string } }).frameworkError?.code === 'REGISTRY_VALIDATION_FAILED', label);
        return true;
      });
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }
});
