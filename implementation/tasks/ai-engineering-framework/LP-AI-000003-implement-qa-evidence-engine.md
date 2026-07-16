# LP-AI-000003. Implement QA Evidence Engine

## Status
`DONE`

## Category
`AI_ENGINEERING_WORKFLOW`

## Priority
`P0`

## Complexity
`M`

## Estimated Context Size
`Medium`

## Assigned Role
`QA Agent`

## Owning Module
`AI Engineering Framework`

## Module Implementation Package
`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Business Objective
Make QA evidence consistent, contract-compliant and auditable so QA lifecycle decisions can rely on complete validation outputs instead of manual interpretation.

## Business Value
Reduce manual workflow maintenance and prevent repeated readiness, evidence, scope and lifecycle errors.

## Expected User Outcome
The Product Owner can trigger the correct workflow stage without manually editing task metadata or copying long prompts.

## Technical Objective
Implement the QA Evidence Engine capability from `MIP-AI-001` by defining and validating complete QA evidence for LP workflow tasks without changing Loyalty business behavior.

## Exact Scope
This task includes:

- define QA evidence requirements for QA phases;
- ensure QA evidence complies with `docs/ai-engineering-framework/90-agent-response-contract.md`;
- add or update scripts that validate QA evidence files;
- add focused tests or fixtures for valid and invalid QA evidence outcomes;
- update AI Engineering Framework documentation only where required for the QA Evidence Engine;
- update LP-AI-000003 implementation, review and QA prompts;
- persist implementation, review and QA evidence under `implementation/evidence/LP-AI-000003/`;
- update LP-AI-000003 task status and index records during the workflow.

## Out of Scope
This task must not:

- implement Loyalty business behavior;
- modify mobile apps, web apps, backend services or database migrations;
- implement Dispatcher Agent behavior reserved for LP-AI-000004;
- implement Native Codex Skills reserved for LP-AI-000005;
- implement Scope Isolation Engine behavior reserved for LP-AI-000006;
- create automatic merge or production deployment behavior;
- bypass independent review, QA, Security or human merge approval;
- mark later AI Engineering Framework tasks complete.

## Dependencies
- `LP-AI-000002` must be `DONE`.

Dependency validation:

- `LP-AI-000002` is `DONE` in `implementation/TASK-STATUS.md`.
- `LP-AI-000002` is `DONE` in `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`.
- Git merge evidence for LP-AI-000002 is recorded at `implementation/evidence/LP-AI-000002/release.md`.

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

### Engineering
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

### Existing Implementation Context
- `scripts/validate-agent-response.py`
- `scripts/tests/agent-response-contract/`
- `scripts/tests/review-evidence-engine/`

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
1. QA Evidence Engine capability matches `MIP-AI-001`.
2. QA evidence validation requires response-contract metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and Workflow Result footer.
3. QA outcomes support `QA APPROVED`, `QA APPROVED WITH FOLLOW-UP`, `QA CHANGES REQUIRED` and `QA BLOCKED`.
4. `QA APPROVED WITH FOLLOW-UP` requires follow-up details and merge permission.
5. `QA CHANGES REQUIRED` requires at least one failed acceptance criterion or finding with severity, file, impact and exact correction.
6. `QA BLOCKED` requires blocking reason, category, owner, required action and resume condition.
7. QA evidence includes acceptance criteria coverage, mandatory test results, failure-path validation, security/scope checks, review precondition verification and merge-readiness recommendation.
8. QA evidence remains separate from implementation, review, Security and release evidence.
9. Automation does not bypass review, QA, Security or human merge gates.
10. No Loyalty business behavior, Product Decision or approved ADR decision is changed.
11. No files under `apps/**`, `services/**` or `database/migrations/**` are modified.
12. Mandatory validation commands complete or are documented with exact reasons.

## Mandatory Tests
- validate a compliant QA approved evidence fixture;
- validate a compliant QA approved-with-follow-up evidence fixture;
- validate a compliant QA changes-required evidence fixture;
- validate a compliant QA blocked evidence fixture;
- validate invalid status-only QA output fails;
- validate invalid QA approved-with-follow-up without follow-up details fails;
- validate invalid QA changes-required without finding or failed acceptance criterion details fails;
- validate invalid QA blocked without resume condition fails;
- validate QA evidence requires review approval or explicit blocked state before approval;
- run syntax checks for any added or changed scripts;
- run `git status --short`;
- verify no `apps/**`, `services/**` or `database/migrations/**` files were modified;
- regression check that QA evidence does not collapse Review, Security or human merge gates.

## UAT References
No customer-facing UAT scenario applies. This task supports internal workflow evidence only.

## Required Reviewers
- Solution Architect
- QA
- Security
- DevOps
- Documentation

## Expected Deliverables
1. QA evidence engine documentation or script changes.
2. QA evidence validation tests or fixtures.
3. Updated implementation prompt.
4. Updated review prompt.
5. Updated QA prompt.
6. Implementation evidence at `implementation/evidence/LP-AI-000003/implementation.md`.
7. Review evidence at `implementation/evidence/LP-AI-000003/review.md`.
8. QA evidence at `implementation/evidence/LP-AI-000003/qa.md`.
9. Validation command results.

## Documentation Requirements
Documentation changes are required.

Affected documents may include:

- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/tasks/ai-engineering-framework/TASK-INDEX.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000003-implement-qa-evidence-engine.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000003-implementation.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000003-review.md`
- `implementation/codex-prompts/ai-engineering-framework/LP-AI-000003-qa.md`

## Rollback
Revert the task commit.

No database migration, external infrastructure or production data rollback is required.

## Risk Assessment
### Implementation Risk
Medium. QA evidence controls workflow advancement toward merge readiness.

### Architectural Risk
Low. This task extends the existing AI Engineering Framework evidence pattern and does not introduce a new infrastructure technology.

### Security Risk
Low. No runtime authentication, authorization, RLS, service-role, tenant data or secret handling changes are in scope.

### Operational Risk
Medium. Incorrect QA evidence validation could block or incorrectly advance workflow tasks.

## Definition of Done Level
`Level 2 — Integration Ready`

## Definition of Done Reference
- `docs/engineering/55-module-definition-of-done.md`

## Preparation Evidence
- `implementation/evidence/LP-AI-000003/prepare.md`
