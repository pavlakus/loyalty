# Implementation Prompt: V2-002

Read `AGENTS.md` first.

## Task

`V2-002` - Scope Isolation Enforcement

## Phase

`implementation`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-002-scope-isolation-enforcement.md`
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

## Preconditions

- Confirm V2-002 status is `READY`.
- Confirm V2-001 is `DONE`.
- Confirm V2-001 release evidence validates.
- Confirm this task remains within `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`.
- Inspect `git status --short --branch` and classify any pre-existing dirty files before making changes.

If any precondition fails, stop and return `IMPLEMENTATION BLOCKED` with complete response-contract evidence.

## Implementation Scope

Implement only Scope Isolation Enforcement:

- create `scripts/validate-task-scope.py`;
- load manifests from `implementation/workflow-state/manifests/<TASK-ID>.json`;
- validate manifests using the V2-001 schema/validator before evaluating Git changes;
- inspect tracked, staged, unstaged, untracked, renamed and deleted file states;
- implement exact file, directory glob, recursive glob and explicit exclusion matching;
- enforce forbidden-over-allowed precedence;
- reject absolute paths and parent traversal;
- fail changes outside allowed scope;
- allow generated evidence only for the active task;
- classify unrelated dirty files separately;
- ensure every path from Git status is reported and none are silently ignored;
- create fixtures under `implementation/workflow-state/fixtures/task-scope/`;
- create tests under `scripts/tests/task-scope/`;
- update AI Engineering Framework documentation only where required for the validator contract.

## Forbidden Scope

Do not:

- implement or start V2-003;
- modify Loyalty application code;
- modify `apps/**`, `services/**`, `packages/**`, `database/**`, `docs/blueprint/**` or `implementation/mip/**`;
- modify `implementation/evidence/V2-001/**`;
- modify `implementation/workflow-state/schemas/task-scope-manifest.schema.json`;
- modify `scripts/validate-task-scope-manifest.py`;
- modify `scripts/dispatch-agent-workflow.py` unless an explicit in-task correction authorizes it;
- change Product Decisions, accepted ADR decisions or Loyalty business behavior;
- perform automatic merge or production deployment.

## Mandatory Validation

Run or document exact inability to run:

- `python3 -m py_compile scripts/validate-task-scope.py`
- `python3 scripts/tests/task-scope-manifest/test_task_scope_manifest.py`
- V2-002 tests under `scripts/tests/task-scope/`
- fixture validation for valid clean task diff;
- fixture validation for valid task with allowed untracked file;
- fixture validation for forbidden tracked change;
- fixture validation for forbidden untracked file;
- fixture validation for allowed/forbidden overlap;
- fixture validation for unrelated dirty worktree classification;
- fixture validation for renamed file outside scope;
- fixture validation for deleted file outside scope;
- fixture validation for missing scope manifest;
- fixture validation for invalid manifest;
- `git status --short`;
- `git status --short apps services packages database docs/blueprint implementation/mip`;
- inspection that V2-003 was not started.

## Evidence

Persist implementation evidence to:

```text
implementation/evidence/V2-002/implementation.md
```

Implementation evidence must include documents read, files changed, acceptance criteria coverage, exact commands and results, security/scope considerations, dirty worktree classification, risks, known limitations, rollback or recovery and Definition of Done evidence.

## Required Result

Return exactly one of:

- `READY FOR REVIEW`
- `IMPLEMENTATION BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
