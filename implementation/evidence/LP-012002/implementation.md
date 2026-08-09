# LP-012002 Implementation Evidence

- Task: LP-012002 — UAT-ready authenticated tenant-aware Loyalty API
- Phase: Implementation
- Role: Backend Application Agent
- Branch: `agent/backend/LP-012002-uat-api-readiness`
- Preparation commit: `64ec9bb`
- Date: 2026-08-09

## Documents reviewed

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/mip/MIP-012-uat-api-readiness.md`
- `implementation/tasks/application/LP-012002-uat-api-readiness.md`
- ADR-012 application persistence/composition boundary
- completed LP-012001 evidence and API/application implementation
- Customer, Authentication, Membership, Receipt, Reward, XP/Status, Redemption, and Analytics persistence migrations

## Implementation summary

- Added a central application-level UAT service and PostgreSQL adapter boundary for UAT fixtures, business actor resolution, Customer session resolution, Membership enrollment, receipt orchestration, Reward Account queries, and Analytics queries.
- Added normal `/api/v1/uat/*` command/query routes. Routes parse requests and delegate; SQL remains in PostgreSQL adapters/functions.
- Added explicit non-production UAT Business actor fixtures. Fixture tokens are hashed at rest and UAT fixtures are rejected in production.
- Added bearer session resolution through a security-definer database function. Raw session tokens are not persisted or logged.
- Added Customer purpose-scoped RLS. Customer remains global; Loyalty Operations visibility is granted only through Membership in the current Business context.
- Preserved `/api/v1/local-mvp/scenario` as non-production-only; the UAT test does not call it.

## Files changed

- `services/api/src/application/authentication-ports.ts`
- `services/api/src/application/uat-api-service.ts`
- `services/api/src/bootstrap/create-application.ts`
- `services/api/src/bootstrap/start-server.ts`
- `services/api/src/infrastructure/postgres/authentication-persistence.ts`
- `services/api/src/infrastructure/postgres/composition-root.ts`
- `services/api/src/infrastructure/postgres/transaction-context.ts`
- `services/api/test/uat-api.integration.mjs`
- `database/migrations/20260809180000_create_customer_purpose_scoped_access.sql`
- `database/tests/uat-api-readiness.sql`
- task/MIP/status/evidence records under `implementation/`

## Security, authorization, idempotency, and concurrency

- Business actor identity is resolved from a hashed non-production fixture token; a request Business ID is never authorization proof.
- Customer identity is resolved from a persisted session token digest.
- PostgreSQL RLS uses Business context and `LOYALTY_OPERATIONS` purpose context; cross-Business Customer visibility is denied.
- Existing receipt, Reward Ledger, XP, redemption, and analytics PostgreSQL functions preserve idempotency and immutable-history behavior.
- Existing redemption reservation/confirmation transaction and ledger locking behavior remains authoritative.
- UAT fixture mode is explicitly rejected in production; the local capturing OTP delivery remains non-production-only.

## Validation executed

- `CI=true pnpm install --frozen-lockfile` — PASS.
- `pnpm run build` — PASS.
- `pnpm run lint` — PASS; module-boundary validation PASS.
- `pnpm run typecheck` — PASS.
- `pnpm run test` — PASS.
- `pnpm validate:fcr` — PASS.
- Fresh database migration through `20260809180000_create_customer_purpose_scoped_access` — PASS.
- `psql -v ON_ERROR_STOP=1 -f database/tests/uat-api-readiness.sql` — PASS; Business B saw no unrelated Customer, Business A saw its purpose-scoped Customer.
- `NODE_ENV=development DATABASE_URL=<redacted isolated local database> pnpm --filter @loyalty-platform/api exec node --test test/uat-api.integration.mjs` — PASS.

The API test covered fixture provisioning, OTP request/verification, persisted session use, Membership enrollment, Receipt submission, Reward earning and redemption, Reward Account query, Analytics query, and unauthorized cross-Business access rejection. No raw OTP, token, password, or database URL was written to evidence.

## Known limitations

- The UAT receipt command currently composes the already-approved local MVP application orchestration; separate production command handlers for every sub-step remain follow-up work before production release.
- Business-user authentication is represented only by the explicitly non-production UAT actor fixture; no production Business identity provider was selected or introduced.
- Production OTP delivery remains deferred behind the approved provider-neutral port.

## Readiness

Implementation scope and task-scoped validation are complete. Transition: `IMPLEMENTATION_COMPLETE -> READY_FOR_REVIEW`. Independent Review, QA, Security, human merge, and post-merge validation remain required.
