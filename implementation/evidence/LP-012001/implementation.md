# LP-012001 Implementation Evidence

- Task ID: LP-012001
- Phase: Implementation
- Role: Backend Application Agent
- Branch: `agent/backend/LP-012001-local-mvp-application`
- Preparation commit: `0032a8e`

## Scope completed

Implemented the ADR-012 ports-and-adapters boundary with a shared PostgreSQL transaction context, PostgreSQL persistence adapter for the local MVP vertical, composition root, non-production-only API scenario route, persisted OTP challenge/session adapter, and provider-neutral local OTP flow. HTTP handlers contain no SQL or `pg` imports. Production startup rejects the capturing OTP adapter and local MVP routes are unavailable in production.

## Persisted vertical

The real API scenario executes Business → Brand → active Loyalty Program → Customer → Membership → Receipt/outbox → Reward earning → Reward Ledger/Account → XP transaction → Reward Definition → reservation → confirmation → Analytics observations in one PostgreSQL transaction. Replaying the same request returns the same projection without duplicating receipt, earning, XP, redemption, or analytics records.

## Commands and exact results

- `CI=true pnpm install --frozen-lockfile` — PASS; lockfile current.
- `pnpm run build --filter @loyalty-platform/api` — PASS.
- `pnpm --filter @loyalty-platform/api lint` — PASS.
- `pnpm --filter @loyalty-platform/api typecheck` — PASS.
- `pnpm --filter @loyalty-platform/api test` — PASS, 157/157.
- `NODE_ENV=test DATABASE_URL=[REDACTED_LOCAL_DATABASE_URL] pnpm --filter @loyalty-platform/api test:local-mvp` — PASS, 2/2.
- `git diff --check` — PASS.
- Clean isolated database migration through `20260809170000_create_authentication_session_persistence.sql` — PASS.
- Real API scenario response — PASS: `pointsEarned=100`, `xpEarned=10`, `availablePoints=60`, `redeemedPoints=40`, `analyticsRows=7`.
- Same API request replay — PASS: identical projection and no duplicate logical outcome.
- Provider-neutral OTP request/verification — PASS: persisted challenge and session; request response contained no `otpCode`; raw OTP remained in the non-production delivery adapter memory only.
- Application-role tenant read check — PASS: unrelated Business sees 0 Programs; owning Business sees 1.
- `psql -v ON_ERROR_STOP=1 ... -f database/tests/local-mvp-application.sql` — PASS.
- `NODE_ENV=test DATABASE_URL=... pnpm db:migrate:check` — PASS; 13 migration files validated.

## Known limitation

The local MVP scenario is explicitly a non-production composition fixture. Individual production API commands, Customer purpose-scoped RLS completion, and production OTP delivery remain outside this task and require their existing follow-up foundations. No production integration claim is made for those boundaries.
