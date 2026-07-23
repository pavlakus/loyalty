import test from 'node:test';
import assert from 'node:assert/strict';
import { createFcrRuntime } from '../src/index.js';
import { planForArtifact } from '../src/validation/artifact-schema-map.js';
import { repositoryRoot } from './test-helpers.js';

test('maps every indexed artifact deterministically and validates every normative category', async () => {
  const runtime = await createFcrRuntime(repositoryRoot);
  const loaded = await runtime.loader.load();
  const plans = loaded.artifacts.map((artifact) => planForArtifact(artifact));
  assert.equal(plans.length, loaded.artifacts.length);
  assert.ok(plans.some((plan) => plan.kind === 'RECORD'));
  assert.ok(plans.some((plan) => plan.kind === 'SCHEMA'));
  const result = await runtime.validator.validateCompleteArtifactSet();
  assert.equal(result.valid, true);
  assert.equal(result.value?.failedRecordCount, 0);
  assert.equal(result.value?.normativeRecordCount, result.value?.validatedRecordCount);
});

test('fails closed for an unknown indexed artifact category', () => {
  assert.throws(() => planForArtifact({
    repositoryRelativePath: 'docs/ai-engineering-framework/fcr/unknown.json',
    absolutePath: '/tmp/unknown.json',
    category: 'unknown' as never,
    raw: {},
    byteLength: 2,
  }));
});
