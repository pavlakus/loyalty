# Review Prompt: V2-003

Read `AGENTS.md` first.

## Task

`V2-003` - Environment & Repository Preflight Gate

## Phase

`review`

## Preconditions

Run review only after V2-003 implementation evidence exists and the task is in `READY_FOR_REVIEW`.

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-003-environment-repository-preflight-gate.md`
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/V2-003/implementation.md`

## Review Scope

Perform read-only review of:

- repository state validation;
- Git state validation;
- lifecycle state validation;
- task state validation;
- dependency validation;
- scope manifest validation when required;
- scope isolation validation using V2-002 contract;
- required tools validation;
- required repository structure validation;
- machine-readable output contract;
- human-readable output contract;
- PASS/FAIL coverage for every required check;
- CAN_CONTINUE YES/NO behavior;
- no repository mutation or auto-fix behavior;
- no dispatcher mutation;
- no task lifecycle mutation;
- required fixtures and tests;
- integration-point documentation for Task Preparation Agent, Dispatcher, Implementation Agent, Review Agent, QA Agent and Environment Preflight;
- no Loyalty application code changes;
- no V2-004 implementation;
- no Blueprint, MIP, database, package, app or service changes.

## Required Validation

Run or inspect exact results for:

- `python3 -m py_compile scripts/validate-environment-preflight.py`
- `python3 scripts/tests/environment-preflight/test_environment_preflight.py`
- V2-003 tests under `scripts/tests/environment-preflight/`
- all required fixture pass/fail outcomes;
- `git status --short --branch`;
- `git status --short apps services packages database docs/blueprint implementation/mip`;
- evidence that `scripts/dispatch-agent-workflow.py` was not modified unless explicitly authorized;
- evidence that V2-004 was not started.

Persist review evidence to:

```text
implementation/evidence/V2-003/review.md
```

## Required Result

Return exactly one of:

- `APPROVED`
- `APPROVED WITH FOLLOW-UP`
- `CHANGES REQUIRED`
- `BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
- If returning `CHANGES REQUIRED`, include at least one finding with Severity, File, Impact and Exact Required Correction.
- If returning `BLOCKED`, include Blocking Reason, Blocking Category, Blocking Owner, Required Action and Resume Condition.
