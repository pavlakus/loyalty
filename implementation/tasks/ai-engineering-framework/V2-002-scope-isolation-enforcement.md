# V2-002. Scope Isolation Enforcement

## Task ID
`V2-002`

## Status
`DONE`

## Category
`AI_ENGINEERING_WORKFLOW`

## Priority
`P0`

## Complexity
`H`

## Estimated Context Size
`Large`

## Assigned Role
`DevOps Agent`

## Owning Module
`AI Engineering Framework`

## Module Implementation Package
`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Business Objective
Prevent AI workflow tasks from silently changing files outside their approved scope by enforcing the V2-001 task scope manifest against the Git working tree.

## Business Value
Reduce merge risk, protect Loyalty application code from workflow-task contamination and give Review, QA and Release agents deterministic evidence for scope compliance.

## Expected User Outcome
Maintainers can run a single validator for a task ID and receive a complete pass/fail report covering tracked, staged, unstaged, untracked, renamed and deleted files with no silently ignored paths.

## Technical Objective
Implement `scripts/validate-task-scope.py` to load the active task manifest from `implementation/workflow-state/manifests/<TASK-ID>.json`, validate the manifest against V2-001, inspect Git file states and enforce allowed/forbidden path rules with explicit dirty-worktree classification.

## Exact Scope
This task includes:

- verify V2-001 Scope Manifest Standard is `DONE` before implementation starts;
- load the active task manifest from `implementation/workflow-state/manifests/<TASK-ID>.json`;
- validate the loaded manifest using the canonical schema and manifest validator created by V2-001;
- implement `scripts/validate-task-scope.py`;
- validate file scope against:
  - tracked changes;
  - staged changes;
  - unstaged changes;
  - untracked files;
  - renamed files;
  - deleted files;
- implement path matching for:
  - exact files;
  - directory globs;
  - recursive globs;
  - explicit exclusions;
- enforce:
  - forbidden paths override allowed paths;
  - absolute paths are invalid;
  - parent traversal using `..` is invalid;
  - changes outside allowed scope fail validation;
  - generated evidence paths are allowed only for the active task;
  - unrelated dirty files are classified separately from active-task scope failures;
  - no file may be silently ignored;
- classify dirty worktree files into at least:
  - allowed active-task change;
  - forbidden active-task change;
  - unrelated dirty file;
  - invalid path;
  - missing manifest;
  - invalid manifest;
- create fixtures under `implementation/workflow-state/fixtures/task-scope/` covering:
  - valid clean task diff;
  - valid task with allowed untracked file;
  - forbidden tracked change;
  - forbidden untracked file;
  - allowed/forbidden overlap;
  - unrelated dirty worktree file;
  - renamed file outside scope;
  - deleted file outside scope;
  - missing scope manifest;
  - invalid manifest;
- create focused tests under `scripts/tests/task-scope/`;
- define a deterministic command-line contract for `scripts/validate-task-scope.py`;
- update AI Engineering Framework documentation only where needed to describe the validator contract and integration points;
- update V2-002 status and index records as lifecycle advances;
- persist implementation, review and QA evidence under `implementation/evidence/V2-002/`.

## Out of Scope
This task must not:

- implement or start V2-003;
- modify Loyalty application code;
- modify `apps/**`, `services/**`, `packages/**`, `database/**`, `docs/blueprint/**` or `implementation/mip/**`;
- change Product Decisions, Loyalty business behavior, accepted ADR decisions or module ownership;
- automatically mutate Dispatcher routing behavior unless the implementation remains inside the allowed files and only exposes the validator as a callable contract;
- automatically mutate Environment Preflight behavior unless the implementation remains inside the allowed files and only documents or tests the validator contract;
- perform automatic merge, branch protection changes or production deployment;
- mark unrelated dirty files clean, ignored or accepted.

## Dependencies
- `V2-001` must be `DONE`.
- `LP-AI-000001` must be `DONE`.
- `LP-AI-000001A` must be `DONE`.
- `LP-AI-000002` must be `DONE`.
- `LP-AI-000003` must be `DONE`.
- `LP-AI-000004` must be `DONE`.

Dependency validation:

- V2-001 status is recorded as `DONE` in `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`, `implementation/TASK-STATUS.md` and `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`.
- V2-001 release evidence exists at `implementation/evidence/V2-001/release.md`.
- V2-001 release evidence validates against `docs/ai-engineering-framework/90-agent-response-contract.md`.
- V2-001 manifest fixture tests pass.

## Required Documents
- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/workflow-state/schemas/task-scope-manifest.schema.json`
- `scripts/validate-task-scope-manifest.py`
- `implementation/evidence/V2-001/release.md`
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
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/workflow-state/schemas/task-scope-manifest.schema.json`

### Workflow
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`

### Existing Implementation Context
- `scripts/validate-task-scope-manifest.py`
- `scripts/dispatch-agent-workflow.py`
- `scripts/validate-agent-response.py`
- `scripts/tests/task-scope-manifest/`
- `scripts/tests/dispatcher/`
- `scripts/tests/agent-response-contract/`

### Excluded Context
Do not load unrelated Loyalty business-domain documents unless a contradiction is discovered.

## Allowed Files
```text
docs/ai-engineering-framework/**
implementation/TASK-STATUS.md
implementation/tasks/ai-engineering-framework/**
implementation/codex-prompts/ai-engineering-framework/**
implementation/evidence/V2-002/**
implementation/workflow-state/fixtures/task-scope/**
scripts/validate-task-scope.py
scripts/tests/task-scope/**
```

Read-only implementation context:

```text
implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md
implementation/workflow-state/schemas/task-scope-manifest.schema.json
scripts/validate-task-scope-manifest.py
scripts/dispatch-agent-workflow.py
scripts/validate-agent-response.py
scripts/tests/task-scope-manifest/**
scripts/tests/dispatcher/**
scripts/tests/agent-response-contract/**
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
implementation/evidence/V2-001/**
implementation/workflow-state/schemas/task-scope-manifest.schema.json
scripts/validate-task-scope-manifest.py
scripts/dispatch-agent-workflow.py
```

## Scope Manifest Requirements
The V2-002 implementation must consume, not redefine, the V2-001 manifest standard.

Canonical manifest path:

```text
implementation/workflow-state/manifests/<TASK-ID>.json
```

Canonical manifest schema:

```text
implementation/workflow-state/schemas/task-scope-manifest.schema.json
```

The scope validator must fail when:

- the active task manifest is missing;
- the manifest does not validate against V2-001;
- `manifest_version` is unknown;
- `allowed_files` is empty;
- allowed and forbidden rules overlap;
- paths are absolute;
- paths contain parent traversal using `..`;
- generated evidence paths are for a task other than the active task;
- any changed, renamed, deleted or untracked path cannot be classified.

## Required Validator Contract
The implementation must create:

```text
scripts/validate-task-scope.py
```

Minimum command behavior:

```text
python3 scripts/validate-task-scope.py <TASK-ID>
```

The validator must:

- resolve the repository root deterministically;
- load `implementation/workflow-state/manifests/<TASK-ID>.json`;
- validate the manifest before evaluating Git changes;
- inspect staged, unstaged, tracked, untracked, renamed and deleted file states;
- report every changed path exactly once with its classification;
- exit non-zero for missing manifest, invalid manifest, forbidden path, out-of-scope path, invalid path, renamed file outside scope, deleted file outside scope and unclassified path;
- exit zero only when every relevant path is allowed or explicitly classified as unrelated dirty state according to the command contract;
- provide machine-readable output or a stable structured text format suitable for Dispatcher, Review Agent, QA Agent and Environment Preflight consumption.

## Path Matching Rules
- Exact file rules match one repository-relative file path.
- Directory glob rules match direct children of the specified directory pattern.
- Recursive glob rules match nested files below the specified directory pattern.
- Explicit exclusions are treated as deny rules.
- All paths must be repository-relative.
- Absolute paths are invalid.
- Parent traversal using `..` is invalid.
- Path separators must be normalized to `/`.
- Shell expansion must not be required for correctness.
- Renamed files must validate both old and new paths.
- Deleted files must validate the deleted path.

## Enforcement Rules
- Forbidden paths override allowed paths.
- Task-specific scope overrides generic module scope.
- Blueprint and accepted ADR files are read-only unless explicitly allowed.
- Generated evidence paths are allowed only for the active task.
- Changes outside allowed scope fail validation.
- Unrelated dirty files must be reported as unrelated dirty files and must not be silently ignored.
- No changed path may be dropped because it is staged, unstaged, renamed, deleted or untracked.
- A path listed by more than one Git status source must be deduplicated without losing status details.

## Dirty Worktree Classification Rules
The validator must distinguish:

- active-task files allowed by the manifest;
- active-task files blocked by forbidden rules;
- files outside the active task scope;
- unrelated dirty files that pre-existed or are outside the active task;
- untracked files allowed by the manifest;
- untracked files outside or forbidden by the manifest;
- renamed paths where either source or destination is outside scope;
- deleted paths outside scope;
- invalid repository paths.

Unrelated dirty files are evidence, not an excuse to ignore scope. The validator output must make them visible to the caller so Dispatcher, Review, QA and Release can decide whether the workflow can continue.

## Integration Points
### Task Preparation Agent
Task Preparation Agent must ensure a READY task has a V2-001 compliant manifest before later enforcement gates rely on V2-002.

### Dispatcher
Dispatcher must be able to call `scripts/validate-task-scope.py <TASK-ID>` before phase transitions after integration is enabled. V2-002 defines the validator contract; broader dispatcher routing changes belong to a later integration task unless explicitly authorized.

### Review Agent
Review Agent must use validator output as scope evidence and still inspect the diff independently.

### QA Agent
QA Agent must validate acceptance evidence and changed paths remain inside the active task manifest, using validator output as one input.

### Environment Preflight
Environment Preflight must be able to report missing or invalid manifests and dirty worktree classification before implementation starts after integration is enabled.

### V2-003
V2-003 may build on V2-002 validator behavior for workflow integration. V2-002 must not start V2-003 work.

## Acceptance Criteria
1. V2-001 is verified as `DONE` before implementation starts.
2. `scripts/validate-task-scope.py` exists and loads manifests from `implementation/workflow-state/manifests/<TASK-ID>.json`.
3. The validator validates manifests against V2-001 before checking Git changes.
4. The validator checks tracked, staged, unstaged, untracked, renamed and deleted file states.
5. Exact file, directory glob, recursive glob and explicit exclusion matching are implemented.
6. Forbidden paths override allowed paths.
7. Absolute paths and parent traversal are rejected.
8. Changes outside allowed scope fail validation.
9. Generated evidence paths are allowed only for the active task.
10. Unrelated dirty files are classified separately and reported.
11. No file in Git status output is silently ignored.
12. Required fixtures exist for all cases listed in Exact Scope.
13. Tests cover all required fixtures and expected pass/fail outcomes.
14. Integration points are documented for Dispatcher, Task Preparation Agent, Review Agent, QA Agent, Environment Preflight and V2-003.
15. No Loyalty application code, Blueprint documents, migrations, packages, services, apps, MIP files or V2-003 files are modified.
16. Implementation evidence is persisted under `implementation/evidence/V2-002/implementation.md`.
17. Mandatory validation commands complete or are documented with exact reasons.

## Mandatory Tests
- `python3 -m py_compile scripts/validate-task-scope.py`
- run V2-001 manifest regression tests: `python3 scripts/tests/task-scope-manifest/test_task_scope_manifest.py`
- run V2-002 scope validator tests under `scripts/tests/task-scope/`
- validate fixture: valid clean task diff passes;
- validate fixture: valid task with allowed untracked file passes;
- validate fixture: forbidden tracked change fails;
- validate fixture: forbidden untracked file fails;
- validate fixture: allowed/forbidden overlap fails;
- validate fixture: unrelated dirty worktree file is reported and classified;
- validate fixture: renamed file outside scope fails;
- validate fixture: deleted file outside scope fails;
- validate fixture: missing scope manifest fails;
- validate fixture: invalid manifest fails;
- run `git status --short`;
- run `git status --short apps services packages database docs/blueprint implementation/mip`;
- verify `scripts/dispatch-agent-workflow.py` is not modified unless an explicit in-task correction authorizes it;
- verify V2-003 was not started.

## UAT References
No customer-facing UAT scenario applies. This task supports internal AI Engineering Framework enforcement only.

## Required Reviewers
- Solution Architect
- DevOps
- QA
- Security
- Documentation

## Expected Deliverables
1. `scripts/validate-task-scope.py`.
2. Required fixtures under `implementation/workflow-state/fixtures/task-scope/`.
3. Required tests under `scripts/tests/task-scope/`.
4. Documentation updates limited to AI Engineering Framework integration points if needed.
5. Implementation evidence at `implementation/evidence/V2-002/implementation.md`.
6. Review evidence at `implementation/evidence/V2-002/review.md`.
7. QA evidence at `implementation/evidence/V2-002/qa.md`.

## Documentation Requirements
Documentation changes are required.

Affected documents may include:

- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`
- `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`
- `implementation/TASK-STATUS.md`
- `implementation/codex-prompts/ai-engineering-framework/V2-002-implementation.md`
- `implementation/codex-prompts/ai-engineering-framework/V2-002-review.md`
- `implementation/codex-prompts/ai-engineering-framework/V2-002-qa.md`

## Rollback
Revert the V2-002 task commit.

No database migration, external infrastructure or production data rollback is required.

## Risk Assessment
### Implementation Risk
High. Incorrect Git status parsing or path matching could either block valid work or allow out-of-scope changes.

### Architectural Risk
Medium. The validator becomes a dependency for later workflow automation and must remain consistent with V2-001.

### Security Risk
Low. This task does not alter runtime authentication, authorization, RLS, tenant data, secrets or service-role behavior.

### Operational Risk
High. A noisy or incomplete scope validator could slow all future AI workflow phases.

## Definition of Done Level
`Level 2 - Integration Ready`

## Definition of Done Reference
- `docs/engineering/55-module-definition-of-done.md`

## Preparation Evidence
- `implementation/evidence/V2-002/prepare.md`
