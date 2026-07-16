# Re-Review Prompt: LP-AI-000001

Read `AGENTS.md` first.

## Task

`LP-AI-000001` — Stabilize Task Lifecycle

## Phase

`review`

## Purpose

Perform a fresh independent re-review of LP-AI-000001 after LP-AI-000001A adopted the Agent Response Contract.

Do not reuse the prior incomplete or follow-up review/QA outputs as approval evidence. They may be read only as historical context and as a source of unresolved findings.

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000001-stabilize-task-lifecycle.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/LP-AI-000001/implementation.md`
- `implementation/evidence/LP-AI-000001/reconciliation.md`
- `implementation/evidence/LP-AI-000001/review.md`
- `implementation/evidence/LP-AI-000001/qa.md`

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
- `docs/engineering/68-definition-of-task-ready.md` exists and active references use the canonical `.md` path.
- LP-AI-000001 remains `READY_FOR_REVIEW` unless this review returns a contract-compliant approval result.
- LP-AI-000002 remains blocked and is not prepared or implemented as part of this review.
- prior LP-AI-000001 review follow-ups and QA findings are either resolved or explicitly carried forward as findings.

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
- If returning `APPROVED WITH FOLLOW-UP`, include the mandatory Follow-up section with Type, Blocking or Non-blocking, Owner, Suggested Task ID, Reason and Merge Allowed.
- If returning `CHANGES REQUIRED`, include at least one finding with Severity, File, Impact and Exact Required Correction.
- If returning `BLOCKED`, include Blocking Reason, Blocking Category, Blocking Owner, Required Action and Resume Condition.
