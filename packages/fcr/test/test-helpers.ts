import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskRecord } from '../src/artifacts/artifact-types.js';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export function validTaskRecord(): TaskRecord {
  return {
    schema_version: '1.0.0',
    task_id: 'LP-AI-000001',
    task_namespace: 'LP-AI',
    task_sequence: 1,
    title: 'Example Task',
    slug: 'EXAMPLE-TASK',
    identity_fingerprint: 'a'.repeat(64),
    category: 'ARCHITECTURE',
    module_id: 'FCR',
    assigned_role: 'SOLUTION_ARCHITECT',
    owner_type: 'AGENT_ROLE',
    owner_id: 'SOLUTION_ARCHITECT',
    lifecycle_state: 'READY',
    status: 'READY',
    implementation_status: 'NOT_STARTED',
    release_status: 'NOT_RELEASED',
    registry_record_state: 'ACTIVE',
    dependencies: [],
    task_document_path: 'implementation/tasks/example.md',
    manifest_path: 'implementation/workflow-state/manifests/LP-AI-000001.json',
    prompt_paths: [],
    evidence_paths: [],
    repository_id: 'LOYALTY',
    repository_revision: 'REVISION-1',
    created_at: '2026-07-20T00:00:00Z',
    updated_at: '2026-07-20T00:00:00Z',
    created_by: 'SOLUTION_ARCHITECT',
    updated_by: 'SOLUTION_ARCHITECT',
    record_revision: 'REG-00000001',
    legacy_identity: null,
  };
}

export const validErrorMetadata = {
  transaction_id: 'TX-1', request_id: 'REQ-1', task_id: 'TASK-1', module_id: 'FCR', repository_id: 'LOYALTY',
  repository_revision: 'REV-1', registry_revision: 'REG-1', failure_phase: 'LOAD', source_ids: 'registry',
  validator_name: 'AJV', validator_version: '8.20.0', recovery_id: 'RETRY', validation_path: 'registry.json',
} as const;
