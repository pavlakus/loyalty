# LP-AI-000011 — Continuous Backlog Dispatcher

## Status

`QA`

## Category

`WORKFLOW`

## Priority

`P1`

## Assigned Role

`DevOps Agent`

## Owning Module

Repository workflow dispatcher

## Module Implementation Package

`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Objective

Add a minimal continuous execution mode to the existing dispatcher. Preserve task-specific routing while allowing the dispatcher to select the next executable approved Loyalty Platform task and continue through the existing repository lifecycle until no executable task remains or a genuine human-required blocker is reached.

## Scope

- Add one repository-consistent continuous command to `scripts/dispatch-agent-workflow.py`.
- Read existing `TASK-STATUS.md`, task indexes, task specifications, lifecycle rules and evidence only.
- Reconcile stale lifecycle information before excluding a candidate.
- Select tasks deterministically using the approved priority order and tie-breakers.
- Prevent duplicate execution of an active task.
- Add focused dispatcher tests.
- Create and maintain LP-AI-000011 lifecycle evidence.

## Non-Goals

- No second backlog registry or state file.
- No new lifecycle states or transitions.
- No changes to Loyalty business behavior or task requirements.
- No automatic merge or deployment outside existing lifecycle authority.
- No implementation of LP-000006 or any other product task during this task.
- No unrelated workflow refactoring.

## Dependencies

- LP-AI-000004 — Implement Dispatcher Agent — `DONE`
- LP-AI-000001 — Stabilize Task Lifecycle — `DONE`
- LP-AI-000001A — Adopt Agent Response Contract — `DONE`
- LP-AI-000002 — Implement Review Evidence Engine — `DONE`
- LP-AI-000003 — Implement QA Evidence Engine — `DONE`
- `implementation/TASK-LIFECYCLE.md`
- `docs/governance/AUTONOMOUS_EXECUTION.md`
- Human maintainer authorization recorded in task preparation evidence

## Allowed Files

- `scripts/dispatch-agent-workflow.py`
- `scripts/tests/dispatcher/test_dispatcher.py`
- `implementation/tasks/ai-engineering-framework/LP-AI-000011-continuous-backlog-dispatcher.md`
- `implementation/TASK-STATUS.md` (LP-AI-000011 row only)
- `implementation/tasks/ai-engineering-framework/TASK-INDEX.md` (LP-AI-000011 row and evidence note only)
- `implementation/evidence/LP-AI-000011/**`

## Forbidden Files

- Loyalty product runtime code
- LP-000006 or any other Loyalty task implementation
- Existing task specifications except lifecycle synchronization required by this task
- `TASK-LIFECYCLE.md`
- MIP content and approved ADR decisions
- Any second backlog registry or state file
- Unrelated scripts, tests, packages or configuration

## Required Independent Roles

- Independent Review Agent
- Independent QA Agent
- Security review only if the implementation changes security-sensitive behavior
- Repository Maintainer for merge
- Release / QA Agent for post-merge closure

## Acceptance Criteria

1. Existing task-specific dispatcher commands remain behaviorally compatible.
2. A continuous command exists and uses only authoritative repository sources.
3. Candidate priority is: active incomplete lifecycle, awaiting review/QA/security/merge/closure, preparation, READY, then eligible DRAFT.
4. Equal candidates use repository priority, dependency order, task-index order and task ID.
5. DONE, CANCELLED, unsatisfied-dependency and genuinely human-blocked tasks are excluded.
6. Stale BLOCKED records are reconciled from authoritative evidence before exclusion.
7. Duplicate execution of an active task is rejected.
8. Continuous execution resumes selection after a task reaches DONE.
9. Continuous execution stops when no executable task remains or a genuine human-required blocker is reached.
10. No duplicate backlog source, product scope, lifecycle state or unrelated behavior is introduced.

## Required Tests

- Existing task-specific mode compatibility.
- Active incomplete lifecycle preferred over new work.
- READY preferred over eligible DRAFT.
- Unsatisfied dependencies excluded.
- Deterministic equal-candidate ordering.
- Stale BLOCKED reconciliation.
- Duplicate active execution rejected.
- Continuation after DONE.
- Stop when no executable task remains.

## Validation

- `python3 -m unittest discover -s scripts/tests -p 'test_*.py'`
- `python3 scripts/dispatch-agent-workflow.py status LP-AI-000011`
- `git diff --check`
- Repository-standard build, lint, typecheck and test commands during implementation, review and QA.

## Evidence

`implementation/evidence/LP-AI-000011/` with `prepare.md`, `implementation.md`, `review.md`, `qa.md`, `release.md` and `post-merge.md` as applicable.

## Rollback and Failure Recovery

Revert the isolated LP-AI-000011 commits. The existing task-specific dispatcher remains the fallback. Continuous mode must not mutate authoritative state on candidate-selection failure and must surface the exact repository blocker or stop condition.

## Definition of Done

Implementation is complete only after focused tests and repository validation pass, independent review and QA approve, required security review is complete if applicable, the isolated branch is merged by the maintainer, post-merge validation passes, evidence is complete, and status/index records are synchronized.
