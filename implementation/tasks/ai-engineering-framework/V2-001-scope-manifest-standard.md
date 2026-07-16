# V2-001. Scope Manifest Standard

## Task ID
`V2-001`

## Status
`READY_FOR_MERGE`

## Category
`AI_ENGINEERING_WORKFLOW`

## Priority
`P0`

## Complexity
`M`

## Estimated Context Size
`Medium`

## Assigned Role
`Solution Architect Agent`

## Owning Module
`AI Engineering Framework`

## Module Implementation Package
`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Business Objective
Define a canonical, machine-readable scope manifest standard so every LP task can expose exact file scope, dependency, evidence and lifecycle boundaries before implementation begins.

## Business Value
Reduce workflow ambiguity and prepare the repository for deterministic scope isolation without yet implementing enforcement behavior.

## Expected User Outcome
The Product Owner and maintainers can require every future LP task to produce a consistent scope manifest at a predictable path before implementation starts.

## Technical Objective
Specify and document the task scope manifest format, schema location, examples, invalid fixtures, validator requirements, path-matching rules, precedence rules and integration points for the AI Engineering Framework.

## Exact Scope
This task includes:

- create the canonical scope manifest standard for every LP task;
- define the canonical manifest location as `implementation/workflow-state/manifests/<TASK-ID>.json`;
- define the JSON Schema location as `implementation/workflow-state/schemas/task-scope-manifest.schema.json`;
- define and create the JSON Schema for task scope manifests;
- create one valid example manifest at `implementation/workflow-state/examples/LP-AI-000004.scope.json`;
- create invalid manifest fixtures covering missing task ID, missing MIP, empty allowed files, overlapping allowed and forbidden paths, invalid lifecycle transition, missing evidence paths and unknown manifest version;
- define the validator script contract for `scripts/validate-task-scope-manifest.py`;
- create the validator script only to the extent needed to validate the schema and fixtures for this standard;
- document required manifest fields:
  - `task_id`
  - `task_title`
  - `owning_module`
  - `assigned_role`
  - `lifecycle_state`
  - `target_branch`
  - `allowed_files`
  - `forbidden_files`
  - `required_documents`
  - `required_mip`
  - `required_adrs`
  - `dependencies`
  - `expected_evidence_paths`
  - `required_commands`
  - `permitted_lifecycle_transitions`
  - `cross_module_access`
  - `generated_at`
  - `manifest_version`
- define path-matching rules for exact files, directory globs, recursive globs, explicit exclusions, repository-relative paths only, no absolute paths and no parent traversal using `..`;
- define precedence rules:
  - forbidden paths override allowed paths;
  - task-specific scope overrides generic module scope;
  - Blueprint and accepted ADR files are read-only unless explicitly allowed;
  - generated evidence paths are allowed only for the active task;
- document integration points with Task Preparation Agent, Dispatcher, Review Agent, QA Agent, Environment Preflight and Scope Isolation Engine V2-002;
- update AI Engineering Framework documentation only where required for the manifest standard;
- update V2-001 status and index records;
- persist implementation, review and QA evidence under `implementation/evidence/V2-001/`.

## Out of Scope
This task must not:

- implement V2-002 Scope Isolation Engine enforcement;
- block, filter or reject task file changes based on manifests outside the validator's fixture-level standard checks;
- modify Loyalty application code;
- modify `apps/**`, `services/**`, `packages/**`, `database/migrations/**` or `docs/blueprint/**`;
- change Product Decisions, Loyalty business behavior, accepted ADR decisions or module ownership;
- implement environment preflight behavior beyond documenting its integration point;
- implement dispatcher routing changes beyond documenting how Dispatcher will consume the manifest;
- implement one-command workflow behavior;
- perform automatic merge or production deployment.

## Dependencies
- `LP-AI-000001` must be `DONE`.
- `LP-AI-000001A` must be `DONE`.
- `LP-AI-000002` must be `DONE`.
- `LP-AI-000003` must be `DONE`.
- `LP-AI-000004` must be `DONE`.

Dependency validation:

- Completed task status is recorded in `implementation/TASK-STATUS.md`.
- Completed task evidence is recorded under `implementation/evidence/LP-AI-000001/`, `implementation/evidence/LP-AI-000001A/`, `implementation/evidence/LP-AI-000002/`, `implementation/evidence/LP-AI-000003/` and `implementation/evidence/LP-AI-000004/`.

## Required Documents
- `AGENTS.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

## Required Blueprint Documents
None.

## Required Engineering Documents
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

## Related ADRs
None required.

## Knowledge Package
### Primary
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

### Workflow
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`

### Existing Implementation Context
- `scripts/dispatch-agent-workflow.py`
- `scripts/validate-agent-response.py`
- `scripts/tests/agent-response-contract/`
- `scripts/tests/dispatcher/`

### Excluded Context
Do not load unrelated Loyalty business-domain documents unless a contradiction is discovered.

## Allowed Files
```text
docs/ai-engineering-framework/**
implementation/TASK-STATUS.md
implementation/tasks/ai-engineering-framework/**
implementation/codex-prompts/ai-engineering-framework/**
implementation/evidence/V2-001/**
implementation/workflow-state/schemas/task-scope-manifest.schema.json
implementation/workflow-state/examples/LP-AI-000004.scope.json
implementation/workflow-state/fixtures/task-scope-manifest/**
scripts/validate-task-scope-manifest.py
scripts/tests/task-scope-manifest/**
```

## Forbidden Files
```text
AGENTS.md
docs/blueprint/**
apps/**
services/**
packages/**
database/**
implementation/mip/**
.codex/**
```

## Canonical Scope Manifest Format
The canonical task scope manifest is a JSON document with `manifest_version` set to `1.0`.

Required top-level fields:

```text
task_id
task_title
owning_module
assigned_role
lifecycle_state
target_branch
allowed_files
forbidden_files
required_documents
required_mip
required_adrs
dependencies
expected_evidence_paths
required_commands
permitted_lifecycle_transitions
cross_module_access
generated_at
manifest_version
```

Canonical manifest location:

```text
implementation/workflow-state/manifests/<TASK-ID>.json
```

Canonical JSON Schema location:

```text
implementation/workflow-state/schemas/task-scope-manifest.schema.json
```

Example valid manifest:

```text
implementation/workflow-state/examples/LP-AI-000004.scope.json
```

Invalid fixture directory:

```text
implementation/workflow-state/fixtures/task-scope-manifest/
```

Required invalid fixtures:

- missing task ID;
- missing MIP;
- empty allowed files;
- overlapping allowed and forbidden paths;
- invalid lifecycle transition;
- missing evidence paths;
- unknown manifest version.

Validator script location:

```text
scripts/validate-task-scope-manifest.py
```

## Path Matching Rules
- Exact file patterns match one repository-relative file path.
- Directory glob patterns match immediate children of the specified directory.
- Recursive glob patterns match nested files below the specified directory.
- Explicit exclusions must be represented as forbidden paths or as a documented exclusion object in the schema.
- All paths must be repository-relative.
- Absolute paths are invalid.
- Parent traversal using `..` is invalid.
- Path separators must be normalized to `/`.
- Paths must not rely on shell expansion at validation time.

## Precedence Rules
- Forbidden paths override allowed paths.
- Task-specific scope overrides generic module scope.
- Blueprint and accepted ADR files are read-only unless explicitly allowed.
- Generated evidence paths are allowed only for the active task.
- If a path is both allowed and forbidden, the manifest is invalid for implementation.
- If generated evidence for another task is included, the manifest is invalid unless the task explicitly owns release or audit evidence for that other task.

## Integration Points
### Task Preparation Agent
Task Preparation Agent must create or validate the manifest before moving a task to `READY` once V2-002 or a later integration task enables enforcement.

### Dispatcher
Dispatcher must locate the manifest at `implementation/workflow-state/manifests/<TASK-ID>.json` and expose it in route output before execution once dispatcher integration is implemented.

### Review Agent
Review Agent must compare changed files against the manifest and report scope findings once V2-002 enforcement exists.

### QA Agent
QA Agent must validate that acceptance evidence and changed paths remain inside the active task manifest once V2-002 enforcement exists.

### Environment Preflight
Environment Preflight must validate manifest presence, schema validity and repository-relative path hygiene before implementation once preflight integration exists.

### Scope Isolation Engine V2-002
V2-002 must consume this standard as its authoritative input and must not redefine manifest fields, path semantics or precedence rules without a follow-up architecture task.

## Acceptance Criteria
1. V2-001 task defines the canonical manifest format and all required fields.
2. Implementation creates `implementation/workflow-state/schemas/task-scope-manifest.schema.json`.
3. Implementation creates `implementation/workflow-state/examples/LP-AI-000004.scope.json`.
4. Implementation creates invalid fixtures for missing task ID, missing MIP, empty allowed files, overlapping allowed and forbidden paths, invalid lifecycle transition, missing evidence paths and unknown manifest version.
5. Implementation defines and, where needed for fixture validation, creates `scripts/validate-task-scope-manifest.py`.
6. Validator verifies the valid example passes.
7. Validator verifies every invalid fixture fails for the expected reason.
8. Path matching rules are documented and represented in schema or validator behavior.
9. Precedence rules are documented and represented in schema or validator behavior where feasible.
10. Integration points are documented for Task Preparation Agent, Dispatcher, Review Agent, QA Agent, Environment Preflight and V2-002.
11. V2-001 does not implement V2-002 enforcement.
12. No Loyalty application code, Blueprint documents, migrations, packages or MIP files are modified.
13. No Product Decision, accepted ADR decision or Loyalty business behavior is changed.
14. Implementation, review and QA evidence are persisted under `implementation/evidence/V2-001/`.
15. Mandatory validation commands complete or are documented with exact reasons.

## Mandatory Tests
- validate JSON syntax for the schema, valid example and invalid fixtures;
- validate the valid example manifest passes `scripts/validate-task-scope-manifest.py`;
- validate missing task ID fixture fails;
- validate missing MIP fixture fails;
- validate empty allowed files fixture fails;
- validate overlapping allowed and forbidden paths fixture fails;
- validate invalid lifecycle transition fixture fails;
- validate missing evidence paths fixture fails;
- validate unknown manifest version fixture fails;
- run syntax checks for `scripts/validate-task-scope-manifest.py` if the script is created;
- run `git status --short`;
- run `git status --short apps services packages database docs/blueprint implementation/mip`;
- verify V2-002 enforcement behavior is not implemented.

## UAT References
No customer-facing UAT scenario applies. This task supports internal AI Engineering Framework readiness only.

## Required Reviewers
- Solution Architect
- QA
- Security
- DevOps
- Documentation

## Expected Deliverables
1. Prepared V2-001 task file.
2. V2-001 implementation prompt.
3. V2-001 review prompt.
4. V2-001 QA prompt.
5. Scope manifest schema.
6. Valid example manifest.
7. Invalid manifest fixtures.
8. Validator script contract and fixture validation implementation if required.
9. Implementation evidence at `implementation/evidence/V2-001/implementation.md`.
10. Review evidence at `implementation/evidence/V2-001/review.md`.
11. QA evidence at `implementation/evidence/V2-001/qa.md`.

## Documentation Requirements
Documentation changes are required.

Affected documents may include:

- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`
- `implementation/TASK-STATUS.md`
- `implementation/codex-prompts/ai-engineering-framework/V2-001-implementation.md`
- `implementation/codex-prompts/ai-engineering-framework/V2-001-review.md`
- `implementation/codex-prompts/ai-engineering-framework/V2-001-qa.md`

## Rollback
Revert the V2-001 task commit.

No database migration, external infrastructure or production data rollback is required.

## Risk Assessment
### Implementation Risk
Medium. The manifest standard becomes an input to future enforcement and must be precise.

### Architectural Risk
Medium. Ambiguous path semantics or precedence rules could cause V2-002 to block valid work or allow invalid work.

### Security Risk
Low. This task is workflow-only and does not change runtime authorization, RLS, service-role behavior, tenant data or secrets.

### Operational Risk
Medium. Incorrect manifest requirements could slow all future LP task preparation.

## Definition of Done Level
`Level 2 — Integration Ready`

## Definition of Done Reference
- `docs/engineering/55-module-definition-of-done.md`

## Preparation Evidence
- `implementation/evidence/V2-001/prepare.md`
