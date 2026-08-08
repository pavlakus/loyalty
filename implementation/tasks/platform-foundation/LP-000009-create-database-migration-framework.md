# LP-000009 — Create Database Migration Framework

## Task Metadata

- Task ID: `LP-000009`
- Category: `DATA`
- Priority: `P1`
- Owning module: Platform Foundation / Database
- Assigned role: Database Agent
- MIP: `implementation/mip/MIP-000-platform-foundation.md`
- Knowledge Package: Platform Foundation Knowledge Package from the MIP

## Module Implementation Package

`implementation/mip/MIP-000-platform-foundation.md`

## Status

`DONE`

## Objective

Provide a deterministic, portable PostgreSQL migration foundation for later platform modules without introducing business tables or business behavior.

## Business Objective

Ensure the platform can create a clean database, upgrade an existing baseline safely and observe applied migration versions before domain modules add persistent business data.

## Technical Objective

Implement the ADR-010-approved `node-pg-migrate` runner boundary, immutable SQL-first migration conventions, database connection validation and clean/upgrade/immutability verification under the existing repository layout.

## Exact Scope

- `database/migrations/**`
- `scripts/database/**`
- `database/README.md`
- `package.json` (database command wiring only)
- `pnpm-lock.yaml` (database dependency importer changes only)
- `implementation/evidence/LP-000009/**`
- LP-000009 task, status and index records and generated lifecycle prompts

## Out of Scope

- business tables or domain schema;
- transactional outbox schema;
- idempotency schema;
- tenant tables, RLS policies or authorization behavior;
- application repositories or query services;
- Supabase client or service-role access;
- authentication, secrets and public/client configuration;
- pool-tuning environment variables;
- migrations executed during application startup;
- production database access or deployment changes.

## Dependencies

- LP-000002 — Initialize Monorepo and Workspace (`DONE`)
- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md` (`Accepted`)
- `docs/adr/ADR-010-database-migration-and-runtime-architecture.md` (`Accepted`)
- `implementation/mip/MIP-000-platform-foundation.md`

## Required Documents

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-009-initial-environment-variable-contract.md`
- `docs/adr/ADR-010-database-migration-and-runtime-architecture.md`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/54-agent-development-plan.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/57-agent-prompts.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/engineering/68-definition-of-task-ready.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`

## Acceptance Criteria

1. A clean PostgreSQL database can be created from the committed migration set.
2. An existing baseline can apply pending migrations safely and report its migration version.
3. Applied migration files are immutable and order violations are rejected.
4. The runner uses the ADR-010-approved `DATABASE_URL` contract and never exposes connection credentials.
5. The local development workflow is documented for Supabase CLI/Docker PostgreSQL without creating a second migration authority.
6. No business tables, domain behavior, tenant behavior or public/client database configuration is introduced.

## Mandatory Tests

- clean database migration;
- upgrade migration from the previous baseline;
- migration version/status output;
- migration immutability and ordering check;
- connection-string redaction tests;
- unknown/test/production environment fallback rejection;
- migration failure-path and recovery documentation checks;
- package, script and repository regression validation.

## Allowed Files

- `database/migrations/**`
- `scripts/database/**`
- `database/README.md`
- `package.json` (database command wiring only)
- `pnpm-lock.yaml` (database dependency importer changes only)
- `implementation/evidence/LP-000009/**`
- LP-000009 task, status and index records and generated lifecycle prompts

## Forbidden Files

- business domain schemas and tables;
- outbox, idempotency, tenant or authentication migrations;
- application runtime modules outside database access wiring explicitly approved by ADR-010;
- client/public configuration and secrets;
- `.env` files or credentials;
- Blueprint, MIP and accepted ADR content;
- unrelated packages, lockfile importers or deployment configuration;
- production or shared database state.

## Required Reviewers and Approvals

- Independent Review Agent
- Database Review or Solution Architect Review
- QA Agent
- DevOps Review because scripts and CI/release execution are affected
- Security Agent because database credentials and redaction are in scope

## Expected Deliverables

- ADR-010-conformant migration runner and repository scripts;
- immutable migration naming/status conventions;
- clean and upgrade migration validation;
- database README with local, CI, production and recovery procedures;
- exact implementation, review, QA, security, release and post-merge evidence;
- synchronized lifecycle records and rollback/recovery instructions.

## Rollback and Recovery

Revert the isolated LP-000009 code/configuration commit before applying its migrations. Applied migrations must not be edited or deleted. A failed transactional migration is rolled back by the database transaction; non-transactional or destructive changes require a documented forward fix or approved restore procedure. No production or shared database is modified by this task.

## Definition of Done

The task is complete only when the dedicated branch contains only LP-000009 changes, clean/upgrade/immutability and redaction tests pass, independent Review, QA, Security and required DevOps/Database approvals are recorded, merge and post-merge evidence exists, no P0/P1 findings remain, and status/index/specification records are synchronized.

## Implementation Revalidation

The preserved implementation was recovered onto the current development baseline on the isolated branch
`agent/database/LP-000009-database-migrations-recovery`. Docker remains unavailable, but an isolated temporary
PostgreSQL 14 cluster was provisioned locally for the mandatory migration validation. The migration hash recording
path was corrected to account for `node-pg-migrate` reporting migration names without the `.sql` suffix. No
business tables or runtime domain behavior were added.
