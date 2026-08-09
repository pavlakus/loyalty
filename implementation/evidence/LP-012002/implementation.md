# LP-012002 Implementation Evidence

- Task: LP-012002 — UAT-ready authenticated tenant-aware Loyalty API
- Phase: Implementation
- Role: Backend Application Agent
- Branch: `agent/backend/LP-012002-uat-api-readiness`
- Preparation commit: `64ec9bb`
- Implementation commits: `f37a521`, `0f0678d`, `07172cd`, `fdd4e22`
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

- Added a central application-level UAT service and PostgreSQL adapter boundary for UAT fixtures, business actor resolution, Customer session resolution, Business/Brand/Program/Customer/Membership/XP/Status queries, Membership enrollment, receipt orchestration, Reward Account queries, eligibility, redemption reservation/confirmation/cancellation, and Analytics queries.
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
- `NODE_ENV=development DATABASE_URL=<redacted isolated local database> pnpm --filter @loyalty-platform/api exec node --test test/uat-api.integration.mjs` — PASS (fresh database; dedicated Business, Brand, Program, Customer, Membership, XP/Status, Reward, Account, Analytics, reservation, confirmation, and authorization checks).

The API test covered fixture provisioning, OTP request/verification, persisted session use, Membership enrollment, Receipt submission, Reward earning and redemption, Reward Account query, Analytics query, and unauthorized cross-Business access rejection. No raw OTP, token, password, or database URL was written to evidence.

## Known limitations

- The local-MVP route remains available only for legacy non-production tests; the UAT receipt command now performs its own transaction and does not call the local-MVP application port.
- Business-user authentication is represented only by the explicitly non-production UAT actor fixture; no production Business identity provider was selected or introduced.
- Production OTP delivery remains deferred behind the approved provider-neutral port.

## Readiness

The implementation scope and task-scoped validation are complete. The UAT scenario uses dedicated normal API routes and does not call `/api/v1/local-mvp/scenario`. Transition: `IN_PROGRESS -> READY_FOR_REVIEW`. Independent Review, QA, Security, human merge, and post-merge validation remain required.

## Correction pass — P1 review findings

- Date: 2026-08-09
- Findings addressed: P1 raw SQL/ADR-012 boundary; P1 runtime validation and canonical FCR error mapping.
- Application boundary: `UatApiService` now depends only on `UatRepositoryPort`; PostgreSQL SQL, row mapping, transaction context and persistence queries are isolated in `PostgresUatRepository`. Domain Reward earning remains calculated by the application service before persistence coordination.
- Request boundary: UAT request bodies and query strings reject undeclared fields and malformed identifiers, amounts, currencies and timestamps before handler execution.
- Error boundary: UAT failures use canonical response envelopes and typed mappings for validation (400), authentication (401), authorization (403), not-found (404), conflicts (409), and safe unexpected failures (500). Raw database/domain details are not returned.
- Boundary tests: application source is asserted not to import or execute PostgreSQL/SQL infrastructure; adapter source is asserted to own SQL access.
- Contract tests: malformed input, unauthenticated access, cross-Business denial, unknown UAT resources, conflict mapping and internal-error redaction are covered.
- PostgreSQL regression: fresh migrations and status PASS; Customer purpose-scoped RLS PASS; normal UAT API flow PASS without `/api/v1/local-mvp/scenario`; receipt replay PASS; concurrent redemption race PASS with one successful reservation; no credentials or database URL were recorded.
- Correction validation: `CI=true pnpm install --frozen-lockfile` PASS; `pnpm run build` PASS; `pnpm run lint` PASS including module boundaries; `pnpm run typecheck` PASS; `pnpm run test` PASS; `pnpm validate:fcr` PASS; `git diff --check` PASS; API test suite PASS (164/164).
- Transition recommendation: `READY_FOR_REVIEW`.
