# LP-000016 — Create CI Pull Request Pipeline

## 1. File Name

`LP-000016-create-ci-pull-request-pipeline.md`

## 2. Status

`IN_PROGRESS`

## 3. Category

`DEVOPS`

## 4. Assigned Role

`DevOps Agent`

## 5. Owning Module

Platform Foundation / CI

## MIP

`implementation/mip/MIP-000-platform-foundation.md`

## 6. Business Objective

Create a reliable implementation foundation for all later Loyalty Platform modules without introducing premature business behavior.

## 7. Exact Scope

- `.github/workflows/**`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`

## 8. Out of Scope

- production, UAT, preview, or deployment workflows;
- shared or persistent databases;
- database, migration, application, or product implementation;
- credentials and production environment contracts;
- unrelated CI matrices or services;
- modifying LP-000009 implementation or migrations.

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

- LP-000002, LP-000003, and LP-000004 (all `DONE`);
- accepted ADR-003, ADR-007, and ADR-010;
- LP-000009's existing migration-validation contract;
- GitHub Actions provider established by repository origin `https://github.com/pavlakus/loyalty.git`.

## 12. Acceptance Criteria

- Pull requests targeting `development` run frozen installation and required repository validation.
- An isolated job provisions a pinned PostgreSQL service, waits for readiness, and cleans up automatically.
- `DATABASE_URL` is job-scoped and redacted; no shared, UAT, or production database is used.
- Clean, status, rerun, upgrade, ordering/hash, failure, and redaction migration checks run without weakening LP-000009.
- Secret, dependency, migration, and configuration checks run and fail the workflow on failure.
- Protected-branch and required-review expectations are documented.
- LP-000009 runtime and migration files remain unchanged.

## 13. Mandatory Tests

- workflow syntax/static validation;
- frozen install, build, lint, typecheck, test, and FCR validation;
- ephemeral PostgreSQL readiness and automatic cleanup;
- clean migration, status, rerun, upgrade, ordering/hash, unavailable database, and redaction validation;
- intentional failure verification.

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
