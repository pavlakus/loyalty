# LP-AI-000001. Stabilize Task Lifecycle

## Task ID
`LP-AI-000001`

## Status
`READY_FOR_REVIEW`

## Category
`AI_ENGINEERING_WORKFLOW`

## Priority
`P0`

## Complexity
`M`

## Estimated Context Size
`Medium`

## Assigned Role
`Solution Architect Agent`

## Owning Module
`AI Engineering Framework`

## Module Implementation Package
`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Business Objective
Stabilize the authoritative task lifecycle so AI agents and maintainers can move tasks through preparation, implementation, review, QA, merge readiness and completion without manual status ambiguity.

## Business Value
Reduce manual workflow maintenance and prevent repeated readiness, evidence, scope and lifecycle errors.

## Expected User Outcome
The Product Owner can trigger the correct workflow stage without manually editing task metadata or copying long prompts.

## Technical Objective
Create a documentation-only lifecycle stabilization foundation for the AI Engineering Framework that defines authoritative states, allowed transitions, evidence requirements and prompt routing expectations without changing Loyalty business behavior.

## Exact Scope
This task includes:

- reconcile the task lifecycle documentation for AI-driven task phases;
- document allowed status transitions and separation-of-duties gates;
- define evidence expectations for prepare, implementation, review and QA phases;
- keep workflow automation auditable and human-approval preserving;
- update AI Engineering Framework documentation needed by this lifecycle capability;
- update repository prompts for LP-AI-000001 implementation, review and QA;
- update task index and task status records for LP-AI-000001;
- persist implementation evidence under `implementation/evidence/LP-AI-000001/`.

## Out of Scope
This task must not:

- implement Loyalty business behavior;
- modify mobile apps, web apps, backend services or database migrations;
- create automatic merge or production deployment behavior;
- mark unfinished dependencies complete;
- bypass independent review, QA, Security or human merge approval;
- implement LP-AI-000002 or later AI Engineering Framework capabilities.

## Dependencies
No prerequisite LP task is required.

Required prerequisite documents:

- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `implementation/TASK-LIFECYCLE.md`

Task Preparation Agent validation completed for READY.

## Required Documents
- `AGENTS.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/TASK-LIFECYCLE.md`

## Required Blueprint Documents
None.

## Required Engineering Documents
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready`

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
- `implementation/TASK-LIFECYCLE.md`

### Engineering
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready`

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
1. `implementation/TASK-LIFECYCLE.md` defines authoritative lifecycle states and transition authority for AI workflow phases.
2. Lifecycle documentation preserves the rule that Developer Agents execute only READY tasks.
3. Lifecycle documentation preserves the rule that Review and QA approvals must be persisted before merge readiness.
4. Lifecycle documentation preserves the rule that human maintainers perform merges and agents do not auto-merge.
5. Lifecycle documentation preserves the rule that unfinished dependencies must not be marked complete.
6. Evidence expectations are documented for prepare, implementation, review and QA phases.
7. Generated LP-AI-000001 implementation, review and QA prompts instruct agents to read authoritative workflow documents and persist evidence under `implementation/evidence/LP-AI-000001/`.
8. No files under `apps/**`, `services/**` or `database/migrations/**` are modified by this task.
9. No Loyalty business behavior, Product Decision or approved ADR decision is changed.
10. Mandatory validation commands complete or are documented with exact reasons.

## Mandatory Tests
- inspect lifecycle transitions for prepare → READY → implementation → review → QA → READY_FOR_MERGE → MERGED → DONE;
- validate failure paths for TASK PREPARATION BLOCKED, CHANGES_REQUIRED and BLOCKED;
- validate Git-state rule that MERGED is based on Git state and human merge;
- run `git status --short`;
- search changed files to prove no `apps/**`, `services/**` or `database/migrations/**` files were modified by LP-AI-000001;
- regression check that LP-000001/LP-000002 lessons remain represented: dependencies are not falsely completed, review/QA approval is required, and unrelated scope must not contaminate task work.

## UAT References
No customer-facing UAT scenario applies. This task supports internal workflow readiness only.

## Required Reviewers
- Solution Architect
- QA
- Security
- DevOps
- Documentation

## Expected Deliverables
1. Updated lifecycle documentation
2. Updated LP-AI-000001 task status and readiness metadata
3. Updated AI Engineering Framework task index/status records
4. Generated implementation prompt
5. Generated review prompt
6. Generated QA prompt
7. Evidence under `implementation/evidence/LP-AI-000001/`
8. Validation command results

## Documentation Requirements
Documentation changes are required.

Affected documents:

- `implementation/TASK-LIFECYCLE.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000001-stabilize-task-lifecycle.md`
- `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`
- `implementation/TASK-STATUS.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000001-implementation.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000001-review.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000001-qa.md`
- `implementation/evidence/LP-AI-000001/prepare.md`

## Rollback
Revert the task commit.

No database migration, external infrastructure or production data rollback is required.

## Risk Assessment
### Implementation Risk
Medium. Lifecycle text is central to agent behavior.

### Architectural Risk
Medium. The task must preserve separation of duties and human approval gates.

### Security Risk
Low. No credentials or application behavior are in scope.

### Operational Risk
Medium. Incorrect lifecycle guidance can cause future workflow drift.

## Definition of Done Level
`Level 2 — Integration Ready`

## Definition of Done Reference
- `docs/engineering/55-module-definition-of-done.md`

## Preparation Evidence
- `implementation/evidence/LP-AI-000001/prepare.md`
