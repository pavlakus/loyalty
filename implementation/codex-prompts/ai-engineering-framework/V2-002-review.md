# Review Prompt: V2-002

Read `AGENTS.md` first.

## Task

`V2-002` - Scope Isolation Enforcement

## Phase

`review`

## Preconditions

Run review only after V2-002 implementation evidence exists and the task is in `READY_FOR_REVIEW`.

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/workflow-state/schemas/task-scope-manifest.schema.json`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/V2-002/implementation.md`

## Review Scope

Perform read-only review of:

- manifest loading from `implementation/workflow-state/manifests/<TASK-ID>.json`;
- manifest validation against V2-001;
- Git state coverage for tracked, staged, unstaged, untracked, renamed and deleted files;
- exact file, directory glob, recursive glob and explicit exclusion matching;
- enforcement that forbidden paths override allowed paths;
- rejection of absolute paths and parent traversal;
- failure behavior for out-of-scope changes;
- generated evidence restriction to the active task;
- unrelated dirty worktree classification;
- reporting completeness so no file is silently ignored;
- required fixtures and tests;
- integration-point documentation for Dispatcher, Task Preparation Agent, Review Agent, QA Agent, Environment Preflight and V2-003;
- no Loyalty application code changes;
- no V2-003 implementation;
- no Blueprint, MIP, database, package, app or service changes.

## Required Validation

Run or inspect exact results for:

- `python3 -m py_compile scripts/validate-task-scope.py`
- `python3 scripts/tests/task-scope-manifest/test_task_scope_manifest.py`
- V2-002 tests under `scripts/tests/task-scope/`
- all required fixture pass/fail outcomes;
- `git status --short`;
- `git status --short apps services packages database docs/blueprint implementation/mip`;
- evidence that `scripts/dispatch-agent-workflow.py` was not modified unless explicitly authorized;
- evidence that V2-003 was not started.

Persist review evidence to:

```text
implementation/evidence/V2-002/review.md
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
