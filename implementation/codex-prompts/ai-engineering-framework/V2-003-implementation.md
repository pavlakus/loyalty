# Implementation Prompt: V2-003

Read `AGENTS.md` first.

## Task

`V2-003` - Environment & Repository Preflight Gate

## Phase

`implementation`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-003-environment-repository-preflight-gate.md`
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/evidence/V2-002/release.md`
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

## Preconditions

- Confirm V2-003 status is `READY`.
- Confirm V2-001 is `DONE`.
- Confirm V2-002 is `DONE`.
- Confirm V2-001 and V2-002 release evidence validate.
- Confirm this task remains within `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`.
- Inspect `git status --short --branch` and classify any pre-existing dirty files before making changes.

If any precondition fails, stop and return `IMPLEMENTATION BLOCKED` with complete response-contract evidence.

## Implementation Scope

Implement only the repository/environment preflight gate:

- create `scripts/validate-environment-preflight.py`;
- validate repository state;
- validate Git state;
- validate lifecycle state;
- validate task state;
- validate dependencies;
- validate scope manifest presence and validity when required;
- validate scope isolation by consuming `scripts/validate-task-scope.py <TASK-ID>`;
- validate required tools;
- validate required repository structure;
- produce machine-readable output;
- produce human-readable output;
- return PASS/FAIL for every check;
- return CAN_CONTINUE YES/NO;
- define the output contract in AI Engineering Framework documentation only where needed;
- create fixtures under `implementation/workflow-state/fixtures/environment-preflight/`;
- create tests under `scripts/tests/environment-preflight/`;
- update AI Engineering Framework documentation only where required for the preflight contract and integration points.

## Forbidden Scope

Do not:

- implement or start V2-004;
- modify dispatcher routing behavior;
- modify task lifecycle definitions or transitions;
- auto-fix repository, Git, dependency or tool problems;
- mutate repository state as a side effect;
- modify Loyalty application code;
- modify `apps/**`, `services/**`, `packages/**`, `database/**`, `docs/blueprint/**` or `implementation/mip/**`;
- modify `implementation/evidence/V2-001/**` or `implementation/evidence/V2-002/**`;
- change Product Decisions, accepted ADR decisions or Loyalty business behavior;
- perform automatic merge or production deployment.

## Mandatory Validation

Run or document exact inability to run:

- `python3 -m py_compile scripts/validate-environment-preflight.py`
- `python3 scripts/tests/environment-preflight/test_environment_preflight.py`
- fixture validation for preflight pass;
- fixture validation for clean repository state;
- fixture validation for dirty repository state;
- fixture validation for invalid Git state;
- fixture validation for lifecycle mismatch;
- fixture validation for dependency failure;
- fixture validation for missing scope manifest;
- fixture validation for invalid scope manifest;
- fixture validation for scope isolation failure;
- fixture validation for missing tool;
- fixture validation for missing repository structure;
- fixture validation for machine-readable output;
- fixture validation for human-readable output;
- `git status --short --branch`;
- `git status --short apps services packages database docs/blueprint implementation/mip`;
- inspection that V2-004 was not started.

## Evidence

Persist implementation evidence to:

```text
implementation/evidence/V2-003/implementation.md
```

Implementation evidence must include documents read, files changed, acceptance criteria coverage, exact commands and results, security/scope considerations, preflight failure handling, risks, known limitations, rollback or recovery and Definition of Done evidence.

## Required Result

Return exactly one of:

- `READY FOR REVIEW`
- `IMPLEMENTATION BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
