# LP-000004. Configure linting formatting and module boundaries

## 1. File Name

`LP-000004-configure-linting-formatting-and-module-boundaries.md`

## 2. Status

`DONE`

## 3. Category

`DEVOPS`

## 4. Assigned Role

`DevOps Agent`

## 5. Owning Package

`MIP-000-platform-foundation.md`

## 6. Business Objective

Create a reliable implementation foundation for all later Loyalty Platform modules without introducing premature business behavior.

## 7. Exact Scope

- `eslint.config.js`
- `prettier.config.js`
- `boundary tooling configuration`

## 8. Out of Scope

- `business logic`

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

- LP-000002 — Initialize Monorepo and Workspace — `DONE`.
- LP-000003 — Configure TypeScript Strict Mode and Shared Compiler Settings — `DONE`.
- Accepted ADR-001 — Monorepo and Workspace Strategy.
- Accepted ADR-002 — Modular Monolith Backend.

No implementation may begin until both task dependencies are `DONE` in
`implementation/TASK-STATUS.md` and the Platform Foundation task index.

## 11a. Allowed Files

- `eslint.config.js`
- `prettier.config.js`
- root `package.json` scripts and development dependencies required for lint, formatting and boundary validation;
- `pnpm-lock.yaml` entries corresponding only to those dependencies;
- boundary tooling configuration and tests under `scripts/` and `tests/` required to enforce the acceptance criteria;
- `implementation/evidence/LP-000004/**`.

No application, service, package business source, schema, migration or product document is in scope.

## 11b. Forbidden Files

- application, service and package runtime/business source;
- database migrations and schemas;
- API and event contracts;
- completed LP-000002 or LP-000003 implementation files;
- LP-000005 and later task files;
- canonical product documents and accepted ADR decisions;
- unrelated lockfile entries;
- generated artifacts unless produced by an approved validation command.

## 12. Acceptance Criteria

- Formatting and lint commands run from root.
- Private cross-module imports are rejected.
- Circular dependencies are detected.
- Generated code paths are handled explicitly.

## 13. Mandatory Tests

- lint pass
- forbidden import test
- circular dependency test

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

## 18. Evidence and Recovery

Required evidence is `implementation/evidence/LP-000004/` with phase files for
preparation, implementation, review, QA, security when applicable, release and
post-merge closure. Rollback is a revert of the isolated LP-000004 commit;
configuration-only changes must not require data recovery or migration repair.
