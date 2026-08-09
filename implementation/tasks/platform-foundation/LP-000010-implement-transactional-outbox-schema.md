# LP-000010. Implement transactional outbox schema

## 1. File Name

`LP-000010-implement-transactional-outbox-schema.md`

## 2. Status

`IN_PROGRESS`

## 3. Category

`DATA`

## 4. Assigned Role

`Database Agent`

## 5. Owning Package

`MIP-000-platform-foundation.md`

## 6. Business Objective

Create a reliable implementation foundation for all later Loyalty Platform modules without introducing premature business behavior.

## 7. Exact Scope

- `database/migrations/**`
- `database/functions/**`
- `database/tests/**`

## 8. Out of Scope

- `domain consumers`

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

LP-000009 Database Migration Framework is DONE. LP-000008 Event Contract Foundation and ADR-004 are accepted; domain consumers remain out of scope.

## 12. Acceptance Criteria

- Outbox record includes required metadata.
- Outbox insert can participate in a business transaction.
- Claiming is atomic.
- Failed processing remains observable.
- Outbox insertion is tenant-scoped and supports atomic claim, completion, retry, and dead-letter transitions without exposing secrets.

## 13. Mandatory Tests

- schema test
- atomic claim test
- parallel claim test

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

## Preparation Readiness

- Allowed implementation files are limited to `database/migrations/**`, `database/functions/**`, `database/tests/**`, and LP-000010 lifecycle/evidence records.
- The migration must provide immutable event payload records, aggregate-stream ordering metadata, tenant context, retry/claim/dead-letter state, and PostgreSQL-safe `SKIP LOCKED` claim behavior.
- LP-000011 worker orchestration, LP-000012 idempotency service, domain consumers, external brokers, and business behavior are forbidden.
- Validation uses isolated PostgreSQL clean/upgrade migration, rollback, RLS, atomic claim, retry/dead-letter, and redaction checks.
