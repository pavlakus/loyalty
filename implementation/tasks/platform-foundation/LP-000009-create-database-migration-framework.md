# LP-000009 — Create Database Migration Framework

## 1. File Name

`LP-000009-create-database-migration-framework.md`

## 2. Status

`BLOCKED`

## 3. Category

`DATA`

## 4. Assigned Role

`Database Agent`

## 5. Owning Package

`MIP-000-platform-foundation.md`

## Module Implementation Package

`implementation/mip/MIP-000-platform-foundation.md`

## 6. Business Objective

Create a reliable implementation foundation for all later Loyalty Platform modules without introducing premature business behavior.

## 7. Exact Scope

- `database/migrations/**`
- `scripts/database/**`
- `database/README.md`

## 8. Out of Scope

- `business tables`

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

- `LP-000002` — DONE
- `ADR-003` — Accepted
- An additional accepted architecture decision is required before implementation: migration runner/tooling, SQL execution and connection-management contract, and database environment contract are not selected by the current repository documents.

The task cannot move to `READY` until that architecture decision is recorded and accepted. Preparation must not select a tool or invent database environment variables.

## 12. Acceptance Criteria

- Empty database can be created from migrations.
- Existing baseline can upgrade safely.
- Migration version is observable.
- Applied migrations are immutable.

## 13. Mandatory Tests

- clean migration
- upgrade migration
- migration immutability check

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

## Preparation Blocker

The current repository specifies PostgreSQL with a Supabase-compatible approach and immutable migrations, but it does not select a migration runner or define the connection/runtime contract required to implement this task. Candidate choices would materially affect dependencies, scripts, local development, CI, rollback and operational behavior. An accepted ADR is therefore required before implementation.
