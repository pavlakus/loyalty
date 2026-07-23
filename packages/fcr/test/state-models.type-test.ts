import type {
  BootstrapEvidence,
  DependencyObservation,
  DependencyRef,
  EvidenceRecord,
  FieldProvenance,
  RegistryRevision,
  RegistryRevisionManifest,
  TaskExecutionState,
  TaskReadinessState,
  TransactionRecord,
} from '../src/index.js';
import type { AcquireRegistryLockInput, LockRecord } from '../src/locking/lock-types.js';
import type { LockRecordConstructionInput } from '../src/locking/lock-record.js';
import type { RegistryLockOwner } from '../src/locking/lock-types.js';

const validRegistryLockOwner: RegistryLockOwner = {
  ownerTransactionId: 'TRANSACTION-1',
  ownerIdentity: 'WORKER-1',
};
void validRegistryLockOwner;

// @ts-expect-error Ownership requires both exact owner fields.
const incompleteRegistryLockOwner: RegistryLockOwner = {
  ownerTransactionId: 'TRANSACTION-1',
};
void incompleteRegistryLockOwner;

const validLockConstructionInput: LockRecordConstructionInput = {
  ownerTransactionId: 'TRANSACTION-1',
  ownerIdentity: 'WORKER-1',
  acquiredAt: '2026-07-23T00:00:00Z',
};
void validLockConstructionInput;

const constructionWithSchemaVersion: LockRecordConstructionInput = {
  ...validLockConstructionInput,
  // @ts-expect-error Construction callers cannot provide the schema version.
  schemaVersion: '9.0.0',
};
void constructionWithSchemaVersion;

const constructionWithLeaseFields: LockRecordConstructionInput = {
  ...validLockConstructionInput,
  // @ts-expect-error Construction callers cannot provide expiry or takeover settings.
  expiresAt: null,
  takeoverCount: 0,
};
void constructionWithLeaseFields;

const validLockInput: AcquireRegistryLockInput = {
  ownerTransactionId: 'TRANSACTION-1',
  ownerIdentity: 'WORKER-1',
};
void validLockInput;

const lockInputWithNamespace: AcquireRegistryLockInput = {
  ownerTransactionId: 'TRANSACTION-1',
  ownerIdentity: 'WORKER-1',
  // @ts-expect-error Lock acquisition input cannot accept a caller-selected namespace.
  namespace: 'OTHER_NAMESPACE',
};
void lockInputWithNamespace;

const lockInputWithId: AcquireRegistryLockInput = {
  ownerTransactionId: 'TRANSACTION-1',
  ownerIdentity: 'WORKER-1',
  // @ts-expect-error Lock acquisition input cannot accept a caller-selected lock ID.
  lockId: 'OTHER_LOCK',
};
void lockInputWithId;

const validLockRecord: LockRecord = {
  schema_version: '2.0.0',
  lock_id: 'REGISTRY_WRITE',
  namespace: 'REGISTRY_WRITE',
  owner_transaction_id: 'TRANSACTION-1',
  owner_identity: 'WORKER-1',
  state: 'ACQUIRED',
  acquired_at: '2026-07-23T00:00:00Z',
  heartbeat_at: '2026-07-23T00:00:00Z',
  expires_at: null,
  takeover_count: 0,
};
void validLockRecord;

// @ts-expect-error The singleton lock ID cannot be replaced by a caller-defined value.
const lockRecordWithAlternateId: LockRecord = { ...validLockRecord, lock_id: 'OTHER_LOCK' };
void lockRecordWithAlternateId;

const completed: TaskExecutionState = {
  status: 'COMPLETE',
  completedAt: '2026-07-22T00:00:00Z',
  completionEvidenceIds: ['EVIDENCE-1'],
};
void completed;

const pending: TaskExecutionState = { status: 'NOT_STARTED' };
void pending;

// @ts-expect-error COMPLETE requires completion metadata.
const incomplete: TaskExecutionState = { status: 'COMPLETE' };
void incomplete;

const pendingWithCompletion: TaskExecutionState = {
  status: 'NOT_STARTED',
  // @ts-expect-error NOT_STARTED cannot contain completion metadata.
  completedAt: '2026-07-22T00:00:00Z',
};
void pendingWithCompletion;

const blocked: TaskReadinessState = {
  status: 'BLOCKED',
  blockingDependencyIds: ['TASK-1'],
};
void blocked;

// @ts-expect-error BLOCKED requires blocking dependency context.
const incompleteBlocked: TaskReadinessState = { status: 'BLOCKED' };
void incompleteBlocked;

const taskDependency: DependencyRef = {
  dependency_type: 'TASK',
  dependency_id: 'TASK-1',
  required_state: 'DONE',
  edge_id: 'EDGE-1',
};
const moduleDependency: DependencyRef = {
  dependency_type: 'MODULE',
  dependency_id: 'MODULE-1',
  required_state: 'ACTIVE',
  edge_id: 'EDGE-2',
};
const contractDependency: DependencyRef = {
  dependency_type: 'CONTRACT',
  dependency_id: 'CONTRACT-1',
  required_state: 'AVAILABLE',
  edge_id: 'EDGE-3',
};
const documentDependency: DependencyRef = {
  dependency_type: 'DOCUMENT',
  dependency_id: 'DOCUMENT-1',
  required_state: 'EXISTS_CURRENT',
  edge_id: 'EDGE-4',
};
const evidenceDependency: DependencyRef = {
  dependency_type: 'EVIDENCE',
  dependency_id: 'EVIDENCE-1',
  required_state: 'VALID_CURRENT',
  edge_id: 'EDGE-5',
};
const adrDependency: DependencyRef = {
  dependency_type: 'ADR',
  dependency_id: 'ADR-1',
  required_state: 'ACCEPTED',
  edge_id: 'EDGE-6',
};
const prerequisiteDependency: DependencyRef = {
  dependency_type: 'EXTERNAL_PREREQUISITE',
  dependency_id: 'PREREQUISITE-1',
  required_state: 'VERIFIED',
  edge_id: 'EDGE-7',
};

const observations: ReadonlyArray<DependencyObservation> = [
  { dependency: taskDependency, observedState: 'DONE' },
  { dependency: moduleDependency, observedState: 'ACTIVE' },
  { dependency: contractDependency, observedState: 'AVAILABLE' },
  { dependency: documentDependency, observedState: 'EXISTS_CURRENT' },
  { dependency: evidenceDependency, observedState: 'VALID_CURRENT' },
  { dependency: adrDependency, observedState: 'ACCEPTED' },
  { dependency: prerequisiteDependency, observedState: 'VERIFIED' },
];
void observations;

// @ts-expect-error TASK observations cannot use MODULE-only states.
const taskWithModuleState: DependencyObservation = {
  dependency: taskDependency,
  observedState: 'ACTIVE',
};
void taskWithModuleState;

// @ts-expect-error MODULE observations cannot use TASK-only states.
const moduleWithTaskState: DependencyObservation = {
  dependency: moduleDependency,
  observedState: 'DONE',
};
void moduleWithTaskState;

const invalidDependencyType: DependencyObservation = {
  dependency: {
    // @ts-expect-error invalid dependency type values are rejected.
    dependency_type: 'UNKNOWN',
    dependency_id: 'DEPENDENCY-1',
    required_state: 'DONE',
    edge_id: 'EDGE-8',
  },
  observedState: 'DONE',
};
void invalidDependencyType;

const invalidDependencyState: DependencyObservation = {
  dependency: taskDependency,
  // @ts-expect-error invalid dependency state values are rejected.
  observedState: 'UNKNOWN',
};
void invalidDependencyState;

// @ts-expect-error invalid status strings are rejected.
const invalidStatus: TaskExecutionState = { status: 'FAILED' };
void invalidStatus;

// @ts-expect-error TASK dependencies cannot require MODULE state values.
const invalidDependency: DependencyRef = {
  dependency_type: 'TASK',
  dependency_id: 'TASK-1',
  required_state: 'ACTIVE',
  edge_id: 'EDGE-1',
};
void invalidDependency;

// @ts-expect-error state arrays are readonly.
blocked.blockingDependencyIds.push('TASK-2');

const revision: RegistryRevision = {
  schema_version: '1.0.0',
  revision_id: 'REVISION-1',
  parent_revision: null,
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  record_hashes: [{}],
  projection_hashes: [{}],
  created_at: '2026-07-22T00:00:00Z',
  created_by: 'FCR',
  transaction_id: 'TRANSACTION-1',
};
void revision;

const manifest: RegistryRevisionManifest = {
  schema_version: '1.0.0',
  revision_id: 'REVISION-1',
  record_hashes: [{}],
  projection_hashes: [{}],
  canonical_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
};
void manifest;

const transaction: TransactionRecord = {
  schema_version: '1.0.0',
  transaction_id: 'TRANSACTION-1',
  request_id: 'REQUEST-1',
  idempotency_key: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  parent_revision: null,
  state: 'NEW',
  owner: 'FCR',
  lock_ids: [{}],
  staging_root: 'implementation/workflow-state/registry/staging/TRANSACTION-1',
  candidate_hashes: {},
  failure_phase: null,
  recovery_operation: 'NO_RECOVERY',
  created_at: '2026-07-22T00:00:00Z',
  updated_at: '2026-07-22T00:00:00Z',
};
void transaction;

const evidence: EvidenceRecord = {
  schema_version: '1.0.0',
  evidence_id: 'EVIDENCE-1',
  task_id: 'TASK-1',
  phase: 'IMPLEMENT',
  canonical_path: 'implementation/evidence/TASK-1/implementation.md',
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  commit: null,
  created_at: '2026-07-22T00:00:00Z',
  agent_role: 'DEVOPS_AGENT',
  lifecycle_state: 'IN_PROGRESS',
  implementation_status: 'IN_PROGRESS',
  release_status: 'NOT_RELEASED',
  response_contract_status: 'READY FOR REVIEW',
  validation_result: 'PASS',
  validator_name: 'FCR_VALIDATOR',
  validator_version: '1.0.0',
  input_revision: 'REVISION-1',
  content_hash: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  supersedes: null,
  superseded_by: null,
  stale: false,
  contradictory: false,
  valid: true,
  findings: {},
  metadata: {},
};
void evidence;

const bootstrapEvidence: BootstrapEvidence = {
  schema_version: '1.0.0',
  evidence_id: 'BOOTSTRAP-EVIDENCE-1',
  phase: 'IMPLEMENT',
  source_paths: ['implementation/tasks/ai-engineering-framework/TASK-INDEX.md'],
  source_hashes: {},
  import_order: ['implementation/tasks/ai-engineering-framework/TASK-INDEX.md'],
  conflicts: [{}],
  initial_revision: 'REVISION-1',
  transaction_id: 'TRANSACTION-1',
  created_at: '2026-07-22T00:00:00Z',
  valid: true,
};
void bootstrapEvidence;

const provenance: FieldProvenance = {
  source_id: 'SOURCE-1',
  repository_path: 'implementation/tasks/ai-engineering-framework/TASK-INDEX.md',
  source_type: 'TASK_DOCUMENT',
  authority_class: 'TASK_DOCUMENT',
  authority_rank: 100,
  repository_revision: 'COMMIT-1',
  content_hash: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  source_schema_version: '1.0.0',
  observed_at: '2026-07-22T00:00:00Z',
};
void provenance;

// @ts-expect-error persisted revisions require schema_version.
const revisionWithoutVersion: RegistryRevision = {
  revision_id: 'REVISION-2',
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  record_hashes: [],
  projection_hashes: [],
  created_at: '2026-07-22T00:00:00Z',
  created_by: 'FCR',
  transaction_id: 'TRANSACTION-2',
};
void revisionWithoutVersion;

// @ts-expect-error transaction states are closed.
const invalidTransactionState: TransactionRecord = { ...transaction, state: 'UNKNOWN' };
void invalidTransactionState;

// @ts-expect-error evidence phases are closed.
const invalidEvidencePhase: EvidenceRecord = { ...evidence, phase: 'UNKNOWN' };
void invalidEvidencePhase;

// @ts-expect-error provenance authority classes are closed.
const invalidAuthorityClass: FieldProvenance = { ...provenance, authority_class: 'UNKNOWN' };
void invalidAuthorityClass;

// @ts-expect-error revision collections are readonly.
revision.record_hashes.push({});

// @ts-expect-error nested record properties are readonly.
transaction.state = 'COMMITTED';

const revisionWithUndocumentedProperty: RegistryRevision = {
  schema_version: '1.0.0',
  revision_id: 'REVISION-EXTRA',
  parent_revision: null,
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  record_hashes: [{}],
  projection_hashes: [{}],
  created_at: '2026-07-22T00:00:00Z',
  created_by: 'FCR',
  transaction_id: 'TRANSACTION-1',
  // @ts-expect-error undocumented properties are rejected.
  undocumented: true,
};
void revisionWithUndocumentedProperty;

const manifestWithUndocumentedProperty: RegistryRevisionManifest = {
  schema_version: '1.0.0',
  revision_id: 'REVISION-EXTRA',
  record_hashes: [{}],
  projection_hashes: [{}],
  canonical_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  // @ts-expect-error undocumented properties are rejected.
  undocumented: true,
};
void manifestWithUndocumentedProperty;

const transactionWithUndocumentedProperty: TransactionRecord = {
  schema_version: '1.0.0',
  transaction_id: 'TRANSACTION-EXTRA',
  request_id: 'REQUEST-1',
  idempotency_key: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  parent_revision: null,
  state: 'NEW',
  owner: 'FCR',
  lock_ids: [{}],
  staging_root: 'implementation/workflow-state/registry/staging/TRANSACTION-1',
  candidate_hashes: {},
  failure_phase: null,
  recovery_operation: 'NO_RECOVERY',
  created_at: '2026-07-22T00:00:00Z',
  updated_at: '2026-07-22T00:00:00Z',
  // @ts-expect-error undocumented properties are rejected.
  undocumented: true,
};
void transactionWithUndocumentedProperty;

const evidenceWithUndocumentedProperty: EvidenceRecord = {
  schema_version: '1.0.0',
  evidence_id: 'EVIDENCE-EXTRA',
  task_id: 'TASK-1',
  phase: 'IMPLEMENT',
  canonical_path: 'implementation/evidence/TASK-1/implementation.md',
  repository_id: 'REPOSITORY-1',
  repository_revision: 'COMMIT-1',
  commit: null,
  created_at: '2026-07-22T00:00:00Z',
  agent_role: 'DEVOPS_AGENT',
  lifecycle_state: 'IN_PROGRESS',
  implementation_status: 'IN_PROGRESS',
  release_status: 'NOT_RELEASED',
  response_contract_status: 'READY FOR REVIEW',
  validation_result: 'PASS',
  validator_name: 'FCR_VALIDATOR',
  validator_version: '1.0.0',
  input_revision: 'REVISION-1',
  content_hash: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  supersedes: null,
  superseded_by: null,
  stale: false,
  contradictory: false,
  valid: true,
  findings: {},
  metadata: {},
  // @ts-expect-error undocumented properties are rejected.
  undocumented: true,
};
void evidenceWithUndocumentedProperty;

const bootstrapEvidenceWithUndocumentedProperty: BootstrapEvidence = {
  schema_version: '1.0.0',
  evidence_id: 'BOOTSTRAP-EVIDENCE-EXTRA',
  phase: 'IMPLEMENT',
  source_paths: ['implementation/tasks/ai-engineering-framework/TASK-INDEX.md'],
  source_hashes: {},
  import_order: ['implementation/tasks/ai-engineering-framework/TASK-INDEX.md'],
  conflicts: [{}],
  initial_revision: 'REVISION-1',
  transaction_id: 'TRANSACTION-1',
  created_at: '2026-07-22T00:00:00Z',
  valid: true,
  // @ts-expect-error undocumented properties are rejected.
  undocumented: true,
};
void bootstrapEvidenceWithUndocumentedProperty;

const provenanceWithUndocumentedProperty: FieldProvenance = {
  source_id: 'SOURCE-EXTRA',
  repository_path: 'implementation/tasks/ai-engineering-framework/TASK-INDEX.md',
  source_type: 'TASK_DOCUMENT',
  authority_class: 'TASK_DOCUMENT',
  authority_rank: 100,
  repository_revision: 'COMMIT-1',
  content_hash: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  source_schema_version: '1.0.0',
  observed_at: '2026-07-22T00:00:00Z',
  // @ts-expect-error undocumented properties are rejected.
  undocumented: true,
};
void provenanceWithUndocumentedProperty;
