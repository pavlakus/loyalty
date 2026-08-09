# LP-002003 Implementation Evidence

- **Task ID:** LP-002003
- **Phase:** Implementation
- **Role:** Database Agent
- **Date:** 2026-08-08
- **Branch:** `agent/database/LP-002003-customer-schema`
- **Base:** `development` at `2c92041`

## Documents reviewed

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- LP-002003 task specification
- `implementation/mip/MIP-002-customer.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/33-domain-model-v2.md`
- `docs/blueprint/37-event-catalog.md`
- `docs/blueprint/42-data-model-v1.md`
- `docs/blueprint/43-api-contract.md`
- `docs/blueprint/44-permission-matrix.md`
- `database/README.md`
- ADR-010

## Implementation summary

Added the SQL-first Customer schema migration and disposable schema assertion script. The global Customer root has UUID identity, verified normalized-phone uniqueness, explicit lifecycle constraints, UTC timestamps, anonymization metadata and optimistic versioning. Profile, append-only profile-history metadata and privacy-action records preserve the approved Customer ownership boundary. No `business_id` is added to the global Customer root.

RLS and purpose-scoped authorization are deliberately not claimed; they remain LP-002014/LP-002021 scope.

## Validation

- `CI=true pnpm install --frozen-lockfile` → PASS; lockfile current, 17 workspace projects, 717 packages installed.
- `git diff --check` → PASS.
- `pnpm db:migrate:check` → PASS; 2 migration files validated.
- `NODE_ENV=test DATABASE_URL=[REDACTED] pnpm db:migrate` on isolated PostgreSQL database `lp002003` → PASS; both migrations applied from empty database.
- `NODE_ENV=test DATABASE_URL=[REDACTED] pnpm db:migrate` rerun → PASS; no migrations to run.
- `NODE_ENV=test DATABASE_URL=[REDACTED] pnpm db:migrate:status` → PASS; platform hash and Customer schema migrations recorded.
- `psql ... -f database/tests/customer-schema.sql` → PASS; inserts, defaults, profile/history/privacy rows and assertions completed, transaction rolled back.
- Duplicate `normalized_phone_reference` assertion → PASS; duplicate insert rejected by `customers_normalized_phone_reference_key` with PostgreSQL exit 1, expected by the test.
- `pnpm --filter @loyalty-platform/api test` → PASS; 157 passed, 0 failed.
- `pnpm --filter @loyalty-platform/api build` → PASS.
- `pnpm run typecheck` → PASS; 16 successful, 16 total.

The connection string was supplied only through the command environment and is redacted in this evidence.

## Acceptance status

- Global Customer ownership and no `business_id` on the root: PASS.
- Verified normalized identity uniqueness and duplicate prevention: PASS.
- Lifecycle, anonymization metadata, UTC timestamps and optimistic version: PASS.
- Profile, append-only profile-history metadata and privacy-action tables: PASS.
- RLS/purpose-scoped access: deferred to LP-002014/LP-002021; not claimed here.
- Clean migration, rerun/idempotence, schema assertions and API regression: PASS.

## Rollback / recovery

The migration has an explicit down section for disposable rollback. Applied migrations remain immutable; deployed corrections must use a new forward migration. The migration hash runner protects the file after application.
