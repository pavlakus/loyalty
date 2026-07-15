Read `AGENTS.md` first.

Then read and execute:

`implementation/tasks/ai-engineering-framework/LP-AI-000001A-adopt-agent-response-contract.md`

Use the Documentation Agent role.

Implement the full task.

Do not stop after producing only a plan.

Do not modify Loyalty business code or Blueprint documents.

Persist implementation evidence at:

`implementation/evidence/LP-AI-000001A/implementation.md`

Return a complete response compliant with:

`docs/ai-engineering-framework/90-agent-response-contract.md`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with `docs/ai-engineering-framework/90-agent-response-contract.md`.
- Status-only responses are invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
- Include evidence files generated or inspected and the exact next workflow action.
- `APPROVED WITH FOLLOW-UP`, `CHANGES REQUIRED`, `BLOCKED` and `QA CHANGES REQUIRED` require all mandatory supporting sections defined by the response contract.
- The workflow must not continue if the response contract is incomplete.

Do not commit.
Do not merge.
