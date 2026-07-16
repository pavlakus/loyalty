# Review Prompt: LP-AI-000002

Read `AGENTS.md` first.

## Task

`LP-AI-000002` - Implement Review Evidence Engine

## Phase

`review`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000002-implement-review-evidence-engine.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/LP-AI-000002/prepare.md`
- `implementation/evidence/LP-AI-000002/implementation.md`

## Review Scope

Perform a read-only review. Verify:

- all LP-AI-000002 acceptance criteria;
- Review Evidence Engine capability matches `MIP-AI-001`;
- response-contract compliance for review evidence outcomes;
- validation of `APPROVED`, `APPROVED WITH FOLLOW-UP`, `CHANGES REQUIRED` and `BLOCKED`;
- review evidence remains separate from implementation, QA, Security and release evidence;
- automation does not bypass review, QA, Security or human merge gates;
- mandatory validation evidence is present;
- no Loyalty business behavior changed;
- no Product Decision or approved ADR changed;
- no files under `apps/**`, `services/**`, `database/migrations/**` or `docs/blueprint/**` were modified.

Persist review evidence under:

```text
implementation/evidence/LP-AI-000002/review.md
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
- If returning `APPROVED WITH FOLLOW-UP`, include the mandatory Follow-up section with Type, Blocking or Non-blocking, Owner, Suggested Task ID, Reason and Merge Allowed.
- If returning `CHANGES REQUIRED`, include at least one finding with Severity, File, Impact and Exact Required Correction.
- If returning `BLOCKED`, include Blocking Reason, Blocking Category, Blocking Owner, Required Action and Resume Condition.
