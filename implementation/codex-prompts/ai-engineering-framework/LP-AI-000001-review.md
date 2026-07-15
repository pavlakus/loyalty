# Review Prompt: LP-AI-000001

Read `AGENTS.md` first.

## Task

`LP-AI-000001` — Stabilize Task Lifecycle

## Phase

`review`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000001-stabilize-task-lifecycle.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/LP-AI-000001/implementation.md`

## Review Scope

Perform a read-only review. Verify:

- all acceptance criteria;
- lifecycle transition authority;
- separation of duties;
- evidence persistence;
- prompt routing expectations for implementation, review and QA;
- failure paths for TASK PREPARATION BLOCKED, CHANGES_REQUIRED and BLOCKED;
- no automatic merge or production deployment behavior;
- no Loyalty business behavior changes;
- changed files remain inside LP-AI-000001 allowed files;
- mandatory validation evidence is present.

Persist review evidence under `implementation/evidence/LP-AI-000001/review.md`.

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
- Include evidence files generated or inspected and the exact next workflow action.
