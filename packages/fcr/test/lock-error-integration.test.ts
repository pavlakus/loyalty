import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { FrameworkErrorService } from '../src/errors/framework-error-service.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const repositoryMetadata = {
  transaction_id: 'TRANSACTION-ERROR-1',
  request_id: 'UNAVAILABLE',
  task_id: 'UNAVAILABLE',
  module_id: 'FCR',
  repository_id: 'UNAVAILABLE',
  repository_revision: 'UNAVAILABLE',
  registry_revision: 'UNAVAILABLE',
  failure_phase: 'VALIDATION',
  source_ids: 'REGISTRY_WRITE',
  validator_name: 'FCR',
  validator_version: 'V2-007C',
  recovery_id: 'NONE',
  lock_id: 'REGISTRY_WRITE',
  observed_heartbeat: 'UNAVAILABLE',
} as const;

test('all approved V2-007C lock errors are registered with stable definitions', async () => {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  for (const code of ['REGISTRY_TRANSACTION_MISSING', 'REGISTRY_LOCK_MISSING', 'REGISTRY_LOCK_CONFLICT', 'REGISTRY_OWNERSHIP_CONFLICT', 'REGISTRY_INVALID_TRANSITION', 'REGISTRY_TRANSITION_CONFLICT']) {
    assert.equal(errors.has(code), true, code);
    assert.equal(errors.getDefinition(code).code, code);
  }
  assert.equal(errors.createOccurrence('REGISTRY_TRANSACTION_MISSING', repositoryMetadata).code, 'REGISTRY_TRANSACTION_MISSING');
  assert.equal(errors.createOccurrence('REGISTRY_LOCK_MISSING', repositoryMetadata).code, 'REGISTRY_LOCK_MISSING');
  assert.equal(errors.createOccurrence('REGISTRY_LOCK_CONFLICT', repositoryMetadata).code, 'REGISTRY_LOCK_CONFLICT');
  assert.equal(errors.createOccurrence('REGISTRY_TRANSITION_CONFLICT', repositoryMetadata).code, 'REGISTRY_TRANSITION_CONFLICT');
});
