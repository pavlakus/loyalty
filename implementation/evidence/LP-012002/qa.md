# LP-012002 QA Evidence

- Task: LP-012002 — UAT-ready authenticated tenant-aware Loyalty API
- Phase: QA
- Role: QA Agent
- Commit under test: `8eace7b6e7b237a0b3ec7988a202a529b19ac4bd`
- Date: 2026-08-09

## Acceptance validation

- Dedicated Business, Brand, Program, Customer, Membership, Receipt, Reward Account, XP/Status, Reward eligibility, Redemption, and Analytics routes are present.
- UAT route flow uses normal APIs and does not call `/api/v1/local-mvp/scenario`.
- Boundary tests confirm SQL is isolated in the PostgreSQL adapter.
- Contract tests confirm strict validation and canonical validation/authentication/authorization/not-found/conflict/internal-error responses.
- Receipt replay is idempotent and does not duplicate Reward or XP value.
- Two concurrent redemption reservations against the same available balance produce exactly one successful reservation.
- Customer purpose-scoped RLS and cross-Business isolation pass against PostgreSQL.

## Exact commands and results

- `CI=true pnpm install --frozen-lockfile` — PASS.
- `pnpm run build` — PASS.
- `pnpm run lint` — PASS; module boundary validation passed.
- `pnpm run typecheck` — PASS.
- `pnpm run test` — PASS; all workspace tests and boundary tests passed.
- `pnpm validate:fcr` — PASS; 223 JSON files, 150 schemas, 25 operation IDs, 0 errors.
- `git diff --check` — PASS.
- `NODE_ENV=development DATABASE_URL=<redacted isolated database> pnpm db:migrate` — PASS; clean migration through `20260809180000_create_customer_purpose_scoped_access`.
- `NODE_ENV=development DATABASE_URL=<redacted isolated database> pnpm db:migrate:status` — PASS; all 14 migrations applied.
- `PGPASSWORD=<redacted> psql ... -f database/tests/uat-api-readiness.sql` — PASS; purpose-scoped Customer visibility and cross-Business denial verified.
- `NODE_ENV=development DATABASE_URL=<redacted isolated database> pnpm --filter @loyalty-platform/api exec node --test test/uat-api.integration.mjs` — PASS; normal authenticated UAT vertical, receipt replay, and concurrent redemption race.
- API test suite — PASS; 164/164 tests.

No credentials, OTP values, tokens, connection strings, or raw Customer data were recorded in evidence.

## Result

`QA APPROVED`. Transition `QA -> Security`.
