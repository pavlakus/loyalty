import type { DeepReadonly, JsonObject, JsonValue } from '../runtime/json-values.js';

export type { DeepReadonly, JsonObject, JsonValue };

export type ArtifactCategory =
  | 'schemas'
  | 'contracts'
  | 'predicates'
  | 'transition_tables'
  | 'authority_tables'
  | 'error_catalogs'
  | 'bootstrap_contracts'
  | 'context_contracts'
  | 'examples';

export type SchemaVersion = `${number}.${number}.${number}`;
export type Id = string;
export type RepositoryPath = string;
export type Sha256 = string;
export type Timestamp = string;
export type LifecycleState = 'DRAFT' | 'TASK_PREPARATION' | 'READY' | 'ASSIGNED' | 'IN_PROGRESS' | 'IMPLEMENTATION_COMPLETE' | 'READY_FOR_REVIEW' | 'REVIEW' | 'CHANGES_REQUIRED' | 'QA' | 'READY_FOR_MERGE' | 'MERGED' | 'DONE' | 'BLOCKED' | 'CANCELLED' | 'DEFERRED';
export type ImplementationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED' | 'CANCELLED';
export type ReleaseStatus = 'NOT_RELEASED' | 'READY_FOR_RELEASE' | 'RELEASED' | 'ROLLED_BACK' | 'BLOCKED';
export type RecordState = 'ACTIVE' | 'SUPERSEDED' | 'DEPRECATED' | 'RETIRED';
export type OwnerType = 'AGENT_ROLE' | 'HUMAN' | 'TEAM';
export type DependencyType = 'TASK' | 'MODULE' | 'CONTRACT' | 'DOCUMENT' | 'EVIDENCE' | 'ADR' | 'EXTERNAL_PREREQUISITE';
export type TaskDependencyState = 'READY' | 'IMPLEMENTATION_COMPLETE' | 'READY_FOR_REVIEW' | 'READY_FOR_MERGE' | 'DONE';
export type DependencyState = TaskDependencyState | 'ACTIVE' | 'AVAILABLE' | 'EXISTS_CURRENT' | 'VALID_CURRENT' | 'ACCEPTED' | 'VERIFIED';
export type TransactionState = 'NEW' | 'STAGED' | 'VALIDATING' | 'VALIDATED' | 'COMMITTING' | 'COMMITTED_PENDING_LIFECYCLE' | 'COMMITTED' | 'RECOVERING' | 'ROLLED_BACK' | 'FAILED';
export type Phase = 'PREPARE' | 'IMPLEMENT' | 'REVIEW' | 'QA' | 'SECURITY' | 'RELEASE' | 'PREFLIGHT' | 'SCOPE_VALIDATION';
export type ResponseResult = 'PASS' | 'FAIL' | 'ERROR';
export type AuthorityClass =
  | 'REGISTRY_CANONICAL' | 'LIFECYCLE_AUTHORITY' | 'LOCKED_PRODUCT_DECISIONS' | 'FINAL_BLUEPRINT'
  | 'ACCEPTED_ADR' | 'DOMAIN_MODEL' | 'API_CONTRACT' | 'EVENT_CONTRACT' | 'SECURITY_CONTRACT'
  | 'MODULE_DEFINITION' | 'APPROVED_MIP' | 'TASK_DOCUMENT' | 'SCOPE_MANIFEST' | 'RELEASE_EVIDENCE'
  | 'SECURITY_EVIDENCE' | 'QA_EVIDENCE' | 'REVIEW_EVIDENCE' | 'IMPLEMENTATION_EVIDENCE'
  | 'ENGINEERING_STANDARD' | 'GENERATED_PROJECTION' | 'APPROVED_HUMAN_REQUEST'
  | 'UNAPPROVED_HUMAN_REQUEST' | 'LEGACY_SOURCE';
export type EmptyObject = Readonly<Record<string, never>>;

export interface RegistryIndex {
  readonly schema_version: SchemaVersion;
  readonly architecture_version: string;
  readonly document_path: string;
  readonly artifact_root: string;
  readonly schemas: readonly RepositoryPath[];
  readonly contracts: readonly RepositoryPath[];
  readonly predicates: readonly RepositoryPath[];
  readonly transition_tables: readonly RepositoryPath[];
  readonly authority_tables: readonly RepositoryPath[];
  readonly error_catalogs: readonly RepositoryPath[];
  readonly bootstrap_contracts: readonly RepositoryPath[];
  readonly context_contracts: readonly RepositoryPath[];
  readonly examples: readonly RepositoryPath[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface IndexedArtifact {
  readonly repositoryRelativePath: string;
  readonly absolutePath: string;
  readonly category: ArtifactCategory;
  readonly raw: DeepReadonly<JsonValue>;
  readonly byteLength: number;
}

export interface TaskNamespaceRecord {
  readonly schema_version: SchemaVersion;
  readonly namespace_id: Id;
  readonly prefix: Id;
  readonly sequence_width: number;
  readonly next_sequence: number;
  readonly reserved_sequences: Id;
  readonly active_reservation?: JsonObject;
  readonly lock_owner?: Id | null;
  readonly lock_timestamp?: Timestamp | null;
}

export interface ModuleRecord {
  readonly schema_version: SchemaVersion;
  readonly module_id: Id;
  readonly canonical_name: Id;
  readonly slug: Id;
  readonly aliases: Id;
  readonly status: LifecycleState;
  readonly registry_path: RepositoryPath;
  readonly owning_role: Id;
  readonly implementation_roots: Id;
  readonly documentation_roots: Id;
  readonly scope_template_refs: Id;
  readonly global_deny_rule_refs: Id;
  readonly module_deny_rule_refs: Id;
  readonly dependency_refs: Id;
  readonly contract_refs: Id;
  readonly created_at: Timestamp;
  readonly updated_at: Timestamp;
  readonly deprecated_at?: Timestamp;
  readonly replacement_module_id?: Id;
}

interface DependencyRefBase {
  readonly dependency_id: string;
  readonly edge_id: string;
}
export type DependencyRef =
  | (DependencyRefBase & { readonly dependency_type: 'TASK'; readonly required_state: TaskDependencyState })
  | (DependencyRefBase & { readonly dependency_type: 'MODULE'; readonly required_state: 'ACTIVE' })
  | (DependencyRefBase & { readonly dependency_type: 'CONTRACT'; readonly required_state: 'AVAILABLE' })
  | (DependencyRefBase & { readonly dependency_type: 'DOCUMENT'; readonly required_state: 'EXISTS_CURRENT' })
  | (DependencyRefBase & { readonly dependency_type: 'EVIDENCE'; readonly required_state: 'VALID_CURRENT' })
  | (DependencyRefBase & { readonly dependency_type: 'ADR'; readonly required_state: 'ACCEPTED' })
  | (DependencyRefBase & { readonly dependency_type: 'EXTERNAL_PREREQUISITE'; readonly required_state: 'VERIFIED' });

export interface PromptPathRef { readonly [key: string]: never; }
export interface EvidencePathRef { readonly [key: string]: never; }
export interface LegacyIdentity { readonly original_task_id: string; readonly parsed_namespace: string; readonly parsed_sequence: number; readonly legacy_suffix: string | null; readonly parse_status: 'PARSED' | 'MALFORMED' | 'DUPLICATE' | 'UNPARSED'; readonly source_path: string; }

export interface TaskRecord {
  readonly schema_version: SchemaVersion;
  readonly task_id: Id;
  readonly task_namespace: Id;
  readonly task_sequence: number;
  readonly title: string;
  readonly slug: Id;
  readonly identity_fingerprint: string;
  readonly category: Id;
  readonly module_id: Id;
  readonly assigned_role: Id;
  readonly owner_type: OwnerType;
  readonly owner_id: Id;
  readonly lifecycle_state: LifecycleState;
  readonly status: LifecycleState;
  readonly implementation_status: ImplementationStatus;
  readonly release_status: ReleaseStatus;
  readonly registry_record_state: RecordState;
  readonly dependencies: readonly DependencyRef[];
  readonly task_document_path: string;
  readonly manifest_path: string;
  readonly prompt_paths: readonly PromptPathRef[];
  readonly evidence_paths: readonly EvidencePathRef[];
  readonly repository_id: Id;
  readonly repository_revision: Id;
  readonly created_at: Timestamp;
  readonly updated_at: Timestamp;
  readonly created_by: Id;
  readonly updated_by: Id;
  readonly record_revision: Id;
  readonly legacy_identity?: LegacyIdentity | null;
}

export interface EvidenceRef {
  readonly evidence_id: string;
  readonly canonical_path: string;
  readonly required: boolean;
  readonly predicate_id: string;
}

export interface RegistryRevision {
  readonly schema_version: SchemaVersion;
  readonly revision_id: Id;
  readonly parent_revision?: string | null;
  readonly repository_id: Id;
  readonly repository_revision: Id;
  readonly record_hashes: readonly EmptyObject[];
  readonly projection_hashes: readonly EmptyObject[];
  readonly created_at: Timestamp;
  readonly created_by: Id;
  readonly transaction_id: Id;
}

export interface RegistryRevisionManifest {
  readonly schema_version: SchemaVersion;
  readonly revision_id: Id;
  readonly record_hashes: readonly EmptyObject[];
  readonly projection_hashes: readonly EmptyObject[];
  readonly canonical_hash: Sha256;
}

export interface TransactionRecord {
  readonly schema_version: SchemaVersion;
  readonly transaction_id: Id;
  readonly request_id: Id;
  readonly idempotency_key: Sha256;
  readonly repository_id: Id;
  readonly repository_revision: Id;
  readonly parent_revision?: string | null;
  readonly state: TransactionState;
  readonly owner: Id;
  readonly lock_ids: readonly EmptyObject[];
  readonly staging_root: RepositoryPath;
  readonly candidate_hashes: EmptyObject;
  readonly failure_phase?: string | null;
  readonly recovery_operation: Id;
  readonly created_at: Timestamp;
  readonly updated_at: Timestamp;
}

export interface EvidenceRecord {
  readonly schema_version: SchemaVersion;
  readonly evidence_id: Id;
  readonly task_id: Id;
  readonly phase: Phase;
  readonly canonical_path: RepositoryPath;
  readonly repository_id: Id;
  readonly repository_revision: Id;
  readonly commit?: string | null;
  readonly created_at: Timestamp;
  readonly agent_role: Id;
  readonly lifecycle_state: LifecycleState;
  readonly implementation_status: ImplementationStatus;
  readonly release_status: ReleaseStatus;
  readonly response_contract_status: ResponseContractStatus;
  readonly validation_result: ResponseResult;
  readonly validator_name: Id;
  readonly validator_version: SchemaVersion;
  readonly input_revision: Id;
  readonly content_hash: Sha256;
  readonly supersedes?: string | null;
  readonly superseded_by?: string | null;
  readonly stale: boolean;
  readonly contradictory: boolean;
  readonly valid: boolean;
  readonly findings: EmptyObject;
  readonly metadata: EmptyObject;
}

export interface BootstrapEvidence {
  readonly schema_version: SchemaVersion;
  readonly evidence_id: Id;
  readonly phase: Phase;
  readonly source_paths: readonly string[];
  readonly source_hashes: EmptyObject;
  readonly import_order: readonly string[];
  readonly conflicts: readonly EmptyObject[];
  readonly initial_revision: Id;
  readonly transaction_id: Id;
  readonly created_at: Timestamp;
  readonly valid: boolean;
}

export interface FieldProvenance {
  readonly source_id: Id;
  readonly repository_path: RepositoryPath;
  readonly source_type: Id;
  readonly authority_class: AuthorityClass;
  readonly authority_rank: number;
  readonly repository_revision: Id;
  readonly content_hash: Sha256;
  readonly source_schema_version: SchemaVersion;
  readonly observed_at: Timestamp;
}

export interface FrameworkErrorDefinition {
  readonly code: string;
  readonly schema_version: SchemaVersion;
  readonly severity: 'P0' | 'P1' | 'P2' | 'P3';
  readonly response_contract_status: ResponseContractStatus;
  readonly blocker_category: Id;
  readonly retryable: boolean;
  readonly resume_condition: string;
  readonly human_message_template: string;
  readonly machine_metadata_schema_ref: string;
  readonly evidence_requirements: readonly EvidenceRef[];
  readonly cleanup_behavior: string;
  readonly transaction_effect: string;
  readonly lifecycle_effect: string;
  readonly escalation_required: boolean;
  readonly recovery_operation: string;
  readonly terminal: boolean;
}

export type ResponseContractStatus =
  | 'TASK PREPARATION BLOCKED' | 'READY FOR IMPLEMENTATION' | 'IMPLEMENTATION BLOCKED'
  | 'READY FOR REVIEW' | 'APPROVED' | 'APPROVED WITH FOLLOW-UP' | 'CHANGES REQUIRED'
  | 'BLOCKED' | 'QA APPROVED' | 'QA APPROVED WITH FOLLOW-UP' | 'QA CHANGES REQUIRED'
  | 'QA BLOCKED' | 'READY FOR MERGE' | 'MERGED' | 'DONE';

export interface RuntimeFrameworkError {
  readonly code: string;
  readonly definition: FrameworkErrorDefinition;
  readonly message: string;
  readonly machine_metadata: Readonly<JsonValue>;
  readonly evidence: readonly EvidenceRef[];
  readonly context: Readonly<Record<string, string>>;
}

export interface ValidationIssue {
  readonly artifactPath: string;
  readonly category: ArtifactCategory | 'registry';
  readonly instancePath: string;
  readonly schemaPath: string;
  readonly keyword: string;
  readonly params: Readonly<Record<string, unknown>>;
  readonly message: string;
}

export interface ValidationResult<T = unknown> {
  readonly valid: boolean;
  readonly value?: T;
  readonly issues: readonly ValidationIssue[];
  readonly errors?: readonly RuntimeFrameworkError[];
  readonly error?: RuntimeFrameworkError;
}

export interface ArtifactLoadResult {
  readonly index: RegistryIndex;
  readonly artifacts: readonly IndexedArtifact[];
  readonly issues: readonly RuntimeFrameworkError[];
}
