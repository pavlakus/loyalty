# Implementation Prompt: LP-AI-000004

Read `AGENTS.md` first.

## Task

`LP-AI-000004` - Implement Dispatcher Agent

## Phase

`implementation`

## Required Skill

Use the native dispatcher skill:

```text
.codex/skills/dispatcher/SKILL.md
```

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000004-implement-dispatcher-agent.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `.codex/skills/dispatcher/SKILL.md`
- `.codex/skills/task-preparation/SKILL.md`
- `.codex/skills/review/SKILL.md`
- `.codex/skills/qa/SKILL.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

## Preconditions

- Confirm LP-AI-000004 status is `READY`.
- Confirm dependency LP-AI-000003 is `DONE`.
- Confirm the native dispatcher skill exists.
- Confirm `docs/ai-engineering-framework/82-dispatcher-command-standard.md` exists.

If any precondition fails, stop and return `IMPLEMENTATION BLOCKED` with complete response-contract evidence.

## Implementation Scope

Implement only the Dispatcher Agent capability:

- route `prepare <TASK-ID>`, `execute <TASK-ID>`, `review <TASK-ID>`, `qa <TASK-ID>`, `close <TASK-ID>` and `status <TASK-ID>`;
- validate lifecycle starting point before routing;
- resolve LP task, MIP, phase prompt, native skill and evidence path from task ID;
- validate agent responses against `docs/ai-engineering-framework/90-agent-response-contract.md`;
- reject status-only and incomplete responses before workflow continuation;
- preserve separate phase evidence;
- enforce the dispatcher guardrails from `docs/ai-engineering-framework/82-dispatcher-command-standard.md`;
- add focused dispatcher tests or fixtures;
- update AI Engineering Framework documentation only where required.

## Forbidden Scope

Do not:

- implement Loyalty business behavior;
- modify `apps/**`, `services/**`, `database/migrations/**` or `docs/blueprint/**`;
- implement Native Codex Skills beyond dispatcher updates required by this task;
- implement Scope Isolation Engine, Workflow Commit Strategy, Repository Hygiene, Environment Validation or One Command Workflow;
- perform automatic merge or production deployment;
- bypass independent Review, QA, Security or human merge gates;
- mark LP-AI-000005 or later tasks complete.

## Mandatory Validation

Run or document exact inability to run:

- dispatcher routing simulation for `prepare`;
- dispatcher routing simulation for `execute`;
- dispatcher routing simulation for `review`;
- dispatcher routing simulation for `qa`;
- dispatcher routing simulation for `close`;
- dispatcher routing simulation for `status`;
- unknown task ID failure;
- missing prompt failure;
- missing evidence failure;
- invalid lifecycle transition failure;
- status-only response rejection;
- response-contract invalid output rejection;
- gate regression proving Review, QA, Security and human merge gates are not bypassed;
- no automatic merge or production deployment check;
- no unfinished dependency marked complete check;
- syntax checks for changed scripts;
- `git status --short`;
- `git status --short apps services database/migrations docs/blueprint`.

## Evidence

Persist implementation evidence to:

```text
implementation/evidence/LP-AI-000004/implementation.md
```

Implementation evidence must include documents read, files changed, acceptance criteria coverage, exact commands and results, security/scope considerations, risks, known limitations, rollback or recovery and Definition of Done evidence.

## Required Result

Return exactly one of:

- `READY FOR REVIEW`
- `IMPLEMENTATION BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
