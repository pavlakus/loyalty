# Implementation Prompt: LP-AI-000003

Read `AGENTS.md` first.

## Task

`LP-AI-000003` - Implement QA Evidence Engine

## Phase

`implementation`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000003-implement-qa-evidence-engine.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/LP-AI-000003/prepare.md`

## Implementation Scope

Implement only the QA Evidence Engine capability.

You may:

- define or update QA evidence requirements;
- add or update QA evidence validation scripts;
- add or update focused QA evidence test fixtures;
- update AI Engineering Framework documentation only where required;
- update LP-AI-000003 status/index evidence as the workflow advances.

You must not:

- implement Dispatcher Agent behavior reserved for LP-AI-000004;
- implement Native Codex Skills reserved for LP-AI-000005;
- implement Scope Isolation Engine behavior reserved for LP-AI-000006;
- change Loyalty business behavior;
- modify `apps/**`, `services/**`, `database/migrations/**` or `docs/blueprint/**`;
- auto-merge or mark later lifecycle gates complete.

## Mandatory Validation

Run the tests required by the LP task, including:

- valid QA approved evidence fixture passes;
- valid QA approved-with-follow-up evidence fixture passes;
- valid QA changes-required evidence fixture passes;
- valid QA blocked evidence fixture passes;
- invalid status-only QA output fails;
- invalid QA approved-with-follow-up without follow-up details fails;
- invalid QA changes-required without finding or failed acceptance criterion details fails;
- invalid QA blocked without resume condition fails;
- invalid QA approval without review approval or explicit blocked state fails;
- syntax checks for changed scripts;
- `git status --short`;
- forbidden-path status check for `apps`, `services`, `database/migrations` and `docs/blueprint`.

Persist implementation evidence under:

```text
implementation/evidence/LP-AI-000003/implementation.md
```

## Required Result

Return exactly one of:

- `READY FOR REVIEW`
- `IMPLEMENTATION BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
- Include changed files, commands, tests, known limitations, Definition of Done evidence and readiness recommendation.
- If returning `IMPLEMENTATION BLOCKED`, include Blocking Reason, Blocking Category, Blocking Owner, Required Action and Resume Condition.
