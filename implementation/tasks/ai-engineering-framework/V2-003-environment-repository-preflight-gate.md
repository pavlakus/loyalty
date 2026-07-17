# V2-003. Environment & Repository Preflight Gate

## Task ID
`V2-003`

## Status
`READY_FOR_REVIEW`

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
Prevent implementation tasks from starting when the repository, Git state, task lifecycle, dependencies, scope manifest, scope isolation, required tools or repository structure are not ready.

## Business Value
Reduce wasted implementation cycles, prevent unsafe task starts and give maintainers a deterministic preflight gate with explicit PASS/FAIL outcomes before any developer work begins.

## Expected User Outcome
Maintainers can run one preflight validator before implementation starts and receive both human-readable and machine-readable output covering repository state, Git state, lifecycle state, task state, dependencies, scope manifest validity, scope isolation, required tools and repository structure.

## Technical Objective
Design and implement a repository/environment preflight validator that runs before any implementation task starts, returns PASS/FAIL for every check, returns CAN_CONTINUE YES/NO, and never mutates repository state, dispatcher behavior or task lifecycle state.

## Exact Scope
This task includes:

- define a deterministic preflight validator contract for the AI Engineering Framework;
- implement `scripts/validate-environment-preflight.py` as the repository preflight entry point;
- validate repository state;
- validate Git state;
- validate lifecycle state;
- validate task state;
- validate dependencies;
- validate scope manifest presence and validity when the active workflow requires it;
- validate scope isolation by consuming the scope isolation validator contract from V2-002;
- validate required tools;
- validate required repository structure;
- produce machine-readable output;
- produce human-readable output;
- return PASS/FAIL for every check;
- return CAN_CONTINUE YES/NO;
- integrate with existing AI Engineering Framework workflow docs only where required to describe the preflight contract and handoff points;
- create fixtures and tests that cover the preflight pass and failure modes;
- persist implementation, review and QA evidence under `implementation/evidence/V2-003/`.

## Out of Scope
This task must not:

- implement or start V2-004;
- modify dispatcher routing behavior;
- modify task lifecycle definitions or transitions;
- auto-fix repository, Git, dependency or tool problems;
- mutate repository state as a side effect;
- modify Loyalty application code;
- modify `apps/**`, `services/**`, `packages/**`, `database/**`, `docs/blueprint/**` or `implementation/mip/**`;
- change Product Decisions, Loyalty business behavior, accepted ADR decisions or module ownership;
- treat preflight failures as warnings;
- silently ignore failing checks;
- weaken scope isolation or scope manifest validation;
- perform automatic merge or production deployment.

## Dependencies
- `V2-001` must be `DONE`.
- `V2-002` must be `DONE`.
- `LP-AI-000001` must be `DONE`.
- `LP-AI-000001A` must be `DONE`.
- `LP-AI-000002` must be `DONE`.
- `LP-AI-000003` must be `DONE`.
- `LP-AI-000004` must be `DONE`.

Dependency validation:

- V2-001 status is recorded as `DONE` in `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`, `implementation/TASK-STATUS.md` and `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`.
- V2-002 status is recorded as `DONE` in `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`, `implementation/TASK-STATUS.md` and `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`.
- V2-001 and V2-002 release evidence exist at `implementation/evidence/V2-001/release.md` and `implementation/evidence/V2-002/release.md`.
- The V2-002 release evidence validates against `docs/ai-engineering-framework/90-agent-response-contract.md`.

## Required Documents
- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`
- `implementation/evidence/V2-001/release.md`
- `implementation/evidence/V2-002/release.md`
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
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`

### Workflow
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`

### Existing Implementation Context
- `scripts/validate-task-scope-manifest.py`
- `scripts/validate-task-scope.py`
- `scripts/dispatch-agent-workflow.py`
- `scripts/validate-agent-response.py`
- `scripts/tests/task-scope-manifest/`
- `scripts/tests/task-scope/`
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
implementation/evidence/V2-003/**
implementation/workflow-state/fixtures/environment-preflight/**
scripts/validate-environment-preflight.py
scripts/tests/environment-preflight/**
```

Read-only implementation context:

```text
implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md
implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md
implementation/evidence/V2-001/release.md
implementation/evidence/V2-002/release.md
scripts/validate-task-scope-manifest.py
scripts/validate-task-scope.py
scripts/dispatch-agent-workflow.py
scripts/validate-agent-response.py
scripts/tests/task-scope-manifest/**
scripts/tests/task-scope/**
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
implementation/evidence/V2-002/**
scripts/dispatch-agent-workflow.py
scripts/validate-task-scope-manifest.py
scripts/validate-task-scope.py
```

## Preflight Validator Contract
The preflight validator must be a read-only gate executed before implementation begins.

Canonical command:

```text
python3 scripts/validate-environment-preflight.py <TASK-ID>
```

The validator must:

- resolve the repository root deterministically;
- validate repository state;
- validate Git state;
- validate lifecycle state;
- validate task state;
- validate dependencies;
- validate scope manifest presence and validity when required;
- validate scope isolation by consuming the scope validation contract from V2-002;
- validate required tools;
- validate required repository structure;
- report every check with an explicit PASS or FAIL result;
- report CAN_CONTINUE as YES only when every required check passes;
- report CAN_CONTINUE as NO when any required check fails;
- produce machine-readable output suitable for automation;
- produce human-readable output suitable for maintainers;
- never modify repository state, task lifecycle state or dispatcher behavior;
- never auto-fix problems;
- never silently downgrade a failure to a warning;
- never start V2-004.

## Output Contract
The implementation must define two stable output channels:

- human-readable summary output;
- machine-readable structured output.

The structured output must include at minimum:

- task_id
- repository_root
- overall_status
- can_continue
- checks
- failures
- timestamp

Each check entry must include:

- name
- status
- details

## Required Checks
At minimum the validator must check:

- repository state;
- Git state;
- lifecycle state;
- task state;
- dependency completion;
- scope manifest presence and validity;
- scope isolation;
- required tools;
- required repository structure.

## Required Failure Behavior
The validator must fail closed when:

- the working tree is not in an acceptable state for implementation start;
- Git state is invalid or ambiguous;
- the task is not in a valid lifecycle state;
- dependencies are incomplete;
- the scope manifest is missing or invalid when required;
- scope isolation validation fails;
- required tools are missing;
- required repository structure is missing or malformed;
- output cannot be produced in either format.

## Mandatory Validation
The implementation must create and validate:

- preflight pass fixture;
- clean repository state fixture;
- dirty repository state fixture;
- invalid Git state fixture;
- lifecycle mismatch fixture;
- task dependency failure fixture;
- missing scope manifest fixture;
- invalid scope manifest fixture;
- scope isolation failure fixture;
- missing tool fixture;
- missing repository structure fixture;
- machine-readable output fixture;
- human-readable output fixture.

## Expected Deliverables
- `scripts/validate-environment-preflight.py`
- fixtures under `implementation/workflow-state/fixtures/environment-preflight/`
- tests under `scripts/tests/environment-preflight/`
- updated AI Engineering Framework documentation for the preflight contract and integration points only where needed
- implementation evidence under `implementation/evidence/V2-003/implementation.md`
- review evidence under `implementation/evidence/V2-003/review.md`
- QA evidence under `implementation/evidence/V2-003/qa.md`
- release evidence under `implementation/evidence/V2-003/release.md`

## Acceptance Criteria
1. The validator reports repository state, Git state, lifecycle state, task state, dependency state, scope manifest state, scope isolation state, required tools and repository structure.
2. Every required check returns PASS or FAIL.
3. The validator returns CAN_CONTINUE YES only when every required check passes.
4. The validator returns CAN_CONTINUE NO when any required check fails.
5. The validator emits both machine-readable and human-readable output.
6. The validator never mutates repository state.
7. The validator never mutates dispatcher behavior.
8. The validator never mutates task lifecycle state.
9. The validator never auto-fixes problems.
10. The validator never starts V2-004.

## Mandatory Tests
- `python3 -m py_compile scripts/validate-environment-preflight.py`
- `python3 scripts/tests/environment-preflight/test_environment_preflight.py`
- preflight pass fixture validation
- clean repository state fixture validation
- dirty repository state fixture validation
- invalid Git state fixture validation
- lifecycle mismatch fixture validation
- dependency failure fixture validation
- missing scope manifest fixture validation
- invalid scope manifest fixture validation
- scope isolation failure fixture validation
- missing tool fixture validation
- missing repository structure fixture validation
- machine-readable output validation
- human-readable output validation

## UAT References
None.

## Required Reviewers
- Review Agent
- QA Agent
- Release Manager

## Rollback or Recovery
If the validator contract or documentation proves invalid, revert the validator changes, fixtures, tests and prompt updates for V2-003 only; do not modify previously merged V2-001 or V2-002 history.

## Definition of Done Level
`Module Definition of Done`
