# LP-000012. Implement reusable idempotency foundation

## 1. File Name

`LP-000012-implement-reusable-idempotency-foundation.md`

## 2. Status

`DRAFT`

## 3. Category

`FEATURE`

## 4. Assigned Role

`Backend Developer Agent`

## 5. Owning Package

`MIP-000-platform-foundation.md`

## 6. Business Objective

Create a reliable implementation foundation for all later Loyalty Platform modules without introducing premature business behavior.

## 7. Exact Scope

- `services/api/src/shared/idempotency/**`
- `database/migrations/**`
- `database/functions/**`

## 8. Out of Scope

- `module-specific command behavior`

## 9. Required Documents

- `MIP-000-platform-foundation.md`
- `51-engineering-implementation-guide.md`
- `52-repository-structure.md`
- `54-agent-development-plan.md`
- `55-module-definition-of-done.md`
- `57-agent-prompts.md`
- `58-project-knowledge-map.md`
- `59-coding-standards.md`
- `60-release-strategy.md`
- relevant accepted ADRs

## 10. Knowledge Package

Platform Foundation Knowledge Package from `MIP-000-platform-foundation.md`.

## 11. Dependencies

Dependencies must be identified before this task moves to `READY`.

## 12. Acceptance Criteria

- Key is scoped by tenant, command and actor.
- Same key and request returns original result.
- Same key and different request returns conflict.
- Parallel duplicates produce one execution.

## 13. Mandatory Tests

- duplicate request test
- parallel race test
- payload mismatch test
- timeout retry test

## 14. Required Reviewers

- Solution Architect where architecture is affected
- QA
- Security where security or credentials are affected
- DevOps where CI, environments or infrastructure are affected
- Documentation reviewer where documentation changes

## 15. Expected Deliverables

- implementation or review summary;
- changed or reviewed files;
- tests added;
- tests executed;
- test results;
- risks;
- known limitations;
- rollback or recovery instructions;
- documentation updates;
- Definition of Done evidence;
- readiness recommendation.

## 16. Rollback Expectation

The change must be reversible through configuration rollback, code rollback, migration recovery or forward fix as appropriate. Immutable migration history must not be rewritten.

## 17. Completion Rule

The task may be marked complete only when all acceptance criteria and mandatory tests pass and required review evidence exists.
