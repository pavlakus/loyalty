# ADR-010 Acceptance Evidence

## Decision Metadata

- ADR: ADR-010 — Database Migration and Runtime Architecture
- Phase: Architecture Approval
- Role: Authorized Solution Architect
- Date: 2026-07-29
- Branch: `agent/architect/ADR-010-database-migration-runtime`

## Accepted Architecture

- `node-pg-migrate` is the canonical migration runner.
- Immutable PostgreSQL SQL-first migrations are stored under `database/migrations/`.
- `node-postgres` (`pg`) is the backend runtime driver.
- Supabase CLI with Docker is used for local PostgreSQL orchestration only.
- `DATABASE_URL` is the only database environment variable approved by this ADR and is server-only.
- CI and release migrations run explicitly and serially; application startup does not run migrations.
- Applied migration history is immutable; corrections use forward fixes.

## Implementation Clarifications

- The local `DATABASE_URL` fallback is allowed only with `NODE_ENV=development`.
- The fallback is forbidden in test, CI, production and unknown environments.
- No pool-tuning variables or invented production pool sizing may be added by LP-000009.
- Database URLs and credentials must be redacted from logs, errors, evidence, health endpoints and configuration output.
- Migration names may appear in status/failure output, but connection strings must not.

## Documents Reviewed

- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-009-initial-environment-variable-contract.md`
- `docs/adr/ADR-010-database-migration-and-runtime-architecture.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `implementation/tasks/platform-foundation/LP-000009-create-database-migration-framework.md`

## Validation

- ADR status changed from `Proposed` to `Accepted`.
- ADR index synchronized.
- Acceptance clarifications recorded.
- No runtime code, migrations, tests or product behavior changed.
- LP-000009 may resume Task Preparation after its dependency and scope records are synchronized.
