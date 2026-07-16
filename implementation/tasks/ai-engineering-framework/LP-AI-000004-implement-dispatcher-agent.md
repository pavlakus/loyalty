# LP-AI-000004. Implement Dispatcher Agent

## Status
`READY_FOR_MERGE`

## Category
`AI_ENGINEERING_WORKFLOW`

## Priority
`P0`

## Complexity
`M`

## Estimated Context Size
`Medium`

## Assigned Role
`DevOps Agent`

## Owning Module
`AI Engineering Framework`

## Module Implementation Package
`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Business Objective
Allow maintainers to trigger the correct LP workflow phase through a deterministic dispatcher command without manually choosing prompts, editing task state or interpreting incomplete agent responses.

## Business Value
Reduce manual workflow maintenance and prevent repeated readiness, evidence, scope and lifecycle errors.

## Expected User Outcome
The Product Owner can trigger the correct workflow stage without manually editing task metadata or copying long prompts.

## Technical Objective
Implement the Dispatcher Agent capability from `MIP-AI-001` so repository commands route `prepare`, `execute`, `review`, `qa`, `close` and `status` to the correct skill, prompt, lifecycle gate and evidence path while enforcing `docs/ai-engineering-framework/90-agent-response-contract.md`.

## Exact Scope
This task includes:

- implement dispatcher command routing for `prepare <TASK-ID>`, `execute <TASK-ID>`, `review <TASK-ID>`, `qa <TASK-ID>`, `close <TASK-ID>` and `status <TASK-ID>`;
- validate lifecycle starting state before routing each command;
- locate the LP task, MIP, phase prompt and evidence directory for a task ID;
- invoke or instruct use of the matching native repository skill where applicable;
- reject status-only or response-contract invalid agent output before workflow continuation;
- preserve separate preparation, implementation, review, QA, Security and release evidence files;
- enforce dispatcher guardrails from `docs/ai-engineering-framework/82-dispatcher-command-standard.md`;
- add focused dispatcher tests or fixtures for happy paths and failure paths;
- update AI Engineering Framework documentation only where required for Dispatcher Agent behavior;
- update LP-AI-000004 implementation, review and QA prompts;
- persist implementation, review and QA evidence under `implementation/evidence/LP-AI-000004/`;
- update LP-AI-000004 task status and index records during the workflow.

## Out of Scope
This task must not:

- implement Loyalty business behavior;
- modify mobile apps, web apps, backend services or database migrations;
- implement Native Codex Skills reserved for LP-AI-000005;
- implement Scope Isolation Engine behavior reserved for LP-AI-000006;
- implement Workflow Commit Strategy reserved for LP-AI-000007;
- implement Repository Hygiene Controls reserved for LP-AI-000008;
- implement Environment Validation reserved for LP-AI-000009;
- implement One Command Workflow reserved for LP-AI-000010;
- create automatic merge or production deployment behavior;
- bypass independent review, QA, Security or human merge approval;
- mark later AI Engineering Framework tasks complete.

## Dependencies
- `LP-AI-000003` must be `DONE`.

Dependency validation:

- `LP-AI-000003` is `DONE` in `implementation/TASK-STATUS.md`.
- `LP-AI-000003` is `DONE` in `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`.
- Git merge evidence for LP-AI-000003 is recorded at `implementation/evidence/LP-AI-000003/release.md`.

## Required Documents
- `AGENTS.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `.codex/skills/dispatcher/SKILL.md`

## Required Blueprint Documents
None.

## Required Engineering Documents
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

## Related ADRs
None.

## Knowledge Package
### Primary
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

### Workflow
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `.codex/skills/dispatcher/SKILL.md`

### Engineering
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

### Existing Implementation Context
- `.codex/skills/dispatcher/SKILL.md`
- `.codex/skills/task-preparation/SKILL.md`
- `.codex/skills/review/SKILL.md`
- `.codex/skills/qa/SKILL.md`
- `scripts/validate-agent-response.py`
- `scripts/tests/agent-response-contract/`
- `scripts/tests/review-evidence-engine/`
- `scripts/tests/qa-evidence-engine/`

### Excluded Context
Do not load unrelated Loyalty business-domain documents unless a contradiction is discovered.

## Allowed Files
```text
AGENTS.md
.codex/**
docs/ai-engineering-framework/**
implementation/TASK-LIFECYCLE.md
implementation/TASK-STATUS.md
implementation/tasks/ai-engineering-framework/**
implementation/codex-prompts/ai-engineering-framework/**
implementation/evidence/**
scripts/**
.gitignore
README.md
```

## Forbidden Files
```text
docs/blueprint/**
services/**
apps/**
database/migrations/**
```

## Acceptance Criteria
1. Dispatcher Agent capability matches `MIP-AI-001` and `docs/ai-engineering-framework/82-dispatcher-command-standard.md`.
2. Dispatcher supports `prepare`, `execute`, `review`, `qa`, `close` and `status` command routing.
3. Dispatcher validates lifecycle starting point before routing each command.
4. Dispatcher resolves the LP task, MIP, task-specific phase prompt, required skill and evidence path from a task ID.
5. Dispatcher validates agent responses against `docs/ai-engineering-framework/90-agent-response-contract.md`.
6. Dispatcher rejects status-only or incomplete responses and prevents workflow continuation when validation fails.
7. Dispatcher preserves separate phase evidence and does not collapse preparation, implementation, review, QA, Security or release evidence.
8. Dispatcher does not route `execute` unless the task is `READY` or an explicitly authorized `CHANGES_REQUIRED` correction pass.
9. Dispatcher does not route `qa` before independent review approval.
10. Dispatcher does not route `close` to `DONE` without Git evidence for merged state and completed status records.
11. Dispatcher does not perform automatic merge or production deployment.
12. Dispatcher does not mark unfinished dependencies complete.
13. Native dispatcher skill exists and remains aligned with dispatcher routing behavior.
14. No Loyalty business behavior, Product Decision or approved ADR decision is changed.
15. No files under `apps/**`, `services/**`, `database/migrations/**` or `docs/blueprint/**` are modified.
16. Mandatory validation commands complete or are documented with exact reasons.

## Mandatory Tests
- simulate valid `prepare <TASK-ID>` routing from DRAFT to READY;
- simulate valid `execute <TASK-ID>` routing for a READY task;
- simulate valid `review <TASK-ID>` routing from READY_FOR_REVIEW;
- simulate valid `qa <TASK-ID>` routing only after review approval;
- simulate valid `close <TASK-ID>` routing with Git merge evidence;
- simulate `status <TASK-ID>` for at least one task in each major lifecycle state available in fixtures;
- validate unknown task ID failure;
- validate missing prompt failure;
- validate missing required evidence failure;
- validate invalid lifecycle transition failure;
- validate status-only response rejection;
- validate response-contract invalid output rejection;
- validate that Review, QA, Security and human merge gates are not bypassed;
- validate no automatic merge or production deployment occurs;
- validate no unfinished dependency is marked complete;
- run syntax checks for any added or changed scripts;
- run `git status --short`;
- verify no `apps/**`, `services/**`, `database/migrations/**` or `docs/blueprint/**` files were modified.

## UAT References
No customer-facing UAT scenario applies. This task supports internal workflow routing only.

## Required Reviewers
- Solution Architect
- QA
- Security
- DevOps
- Documentation

## Expected Deliverables
1. Dispatcher Agent implementation or dispatcher-supporting script/skill changes.
2. Dispatcher routing tests or fixtures.
3. Response-contract validation integration for dispatcher-routed outputs.
4. Updated implementation prompt.
5. Updated review prompt.
6. Updated QA prompt.
7. Implementation evidence at `implementation/evidence/LP-AI-000004/implementation.md`.
8. Review evidence at `implementation/evidence/LP-AI-000004/review.md`.
9. QA evidence at `implementation/evidence/LP-AI-000004/qa.md`.
10. Validation command results.

## Documentation Requirements
Documentation changes are required.

Affected documents may include:

- `.codex/skills/dispatcher/SKILL.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000004-implement-dispatcher-agent.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000004-implementation.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000004-review.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000004-qa.md`

## Rollback
Revert the task commit.

No database migration, external infrastructure or production data rollback is required.

## Risk Assessment
### Implementation Risk
Medium. Dispatcher behavior controls workflow continuation and evidence routing.

### Architectural Risk
Low. This task extends the existing AI Engineering Framework workflow and native skill pattern without introducing new infrastructure.

### Security Risk
Low. No runtime authentication, authorization, RLS, service-role, tenant data or secret handling changes are in scope.

### Operational Risk
Medium. Incorrect dispatcher routing could block valid work or advance invalid workflow states.

## Definition of Done Level
`Level 2 — Integration Ready`

## Definition of Done Reference
- `docs/engineering/55-module-definition-of-done.md`

## Preparation Evidence
- `implementation/evidence/LP-AI-000004/prepare.md`
