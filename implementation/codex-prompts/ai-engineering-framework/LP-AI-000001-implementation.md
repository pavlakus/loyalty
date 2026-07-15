# Implementation Prompt: LP-AI-000001

Read `AGENTS.md` first.

## Task

`LP-AI-000001` — Stabilize Task Lifecycle

## Phase

`implementation`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000001-stabilize-task-lifecycle.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready`
- `implementation/TASK-LIFECYCLE.md`

## Execution Rules

- Use the matching repository skill.
- Modify only files allowed by LP-AI-000001.
- Do not change Loyalty business behavior.
- Do not modify `apps/**`, `services/**` or `database/migrations/**`.
- Do not bypass human merge, independent review, QA or Security gates.
- Persist evidence under `implementation/evidence/LP-AI-000001/implementation.md`.
- Record exact lifecycle transition checks, evidence-path checks and separation-of-duties checks in implementation evidence.
- If branch, merge-state or worktree state prevents a compliant task branch, document the exact Git-state blocker instead of altering unrelated work.

## Mandatory Validation

- workflow simulation;
- failure-path validation;
- Git-state validation where applicable;
- regression against LP-000001/LP-000002 lessons;
- `git status --short`;
- search proving no Loyalty business behavior changed.

## Required Result

Return `READY FOR REVIEW` only if scope is complete and mandatory validation evidence is recorded. Otherwise return `BLOCKED` with exact reasons.

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
- Include evidence files generated or inspected and the exact next workflow action.
