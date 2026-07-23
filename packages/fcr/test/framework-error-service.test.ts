import test from 'node:test';
import assert from 'node:assert/strict';
import { createFcrRuntime } from '../src/index.js';
import { repositoryRoot, validErrorMetadata } from './test-helpers.js';

test('loads all canonical error definitions and rejects unknown codes', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const catalog = await runtime.loader.load();
  const catalogArtifact = catalog.artifacts.find((artifact) => artifact.repositoryRelativePath.endsWith('framework-error-catalog.json'));
  assert.ok(catalogArtifact);
  const errors = (catalogArtifact.raw as { errors: unknown[] }).errors;
  assert.equal(errors.length, 58);
  assert.equal(runtime.errors.has('REGISTRY_DOCUMENT_MISSING'), true);
  assert.throws(() => runtime.errors.get('NOT_A_CANONICAL_ERROR'));
});

test('constructs schema-valid errors and validates metadata against its referenced schema', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const error = await runtime.errors.createValidated(
    'REGISTRY_DOCUMENT_MISSING',
    { metadata: validErrorMetadata },
    (schemaPath, value) => runtime.validator.validateRecord(schemaPath, value),
  );
  assert.equal(error.code, 'REGISTRY_DOCUMENT_MISSING');
  await assert.rejects(() => runtime.errors.createValidated(
    'REGISTRY_DOCUMENT_MISSING',
    { metadata: { unexpected: true } },
    (schemaPath, value) => runtime.validator.validateRecord(schemaPath, value),
  ));
  assert.throws(() => runtime.errors.createOccurrence('REGISTRY_DOCUMENT_MISSING', validErrorMetadata, [{ evidence_id: 'bad', canonical_path: 'bad', required: true, predicate_id: 'bad' }]));
  assert.throws(() => runtime.errors.createOccurrence('REGISTRY_DOCUMENT_MISSING', { ...validErrorMetadata, unexpected: true }));
  const first = runtime.errors.getDefinition('REGISTRY_DOCUMENT_MISSING');
  assert.equal(first.retryable, false);
  assert.notEqual(runtime.errors.createOccurrence('REGISTRY_DOCUMENT_MISSING', validErrorMetadata).definition, undefined);
});
