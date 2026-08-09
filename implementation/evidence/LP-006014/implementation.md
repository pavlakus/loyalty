# LP-006014 Implementation Evidence

- **Task ID:** LP-006014
- **Phase:** Implementation
- **Role:** Database Agent
- **Branch:** `agent/database/LP-006014-membership-persistence`
- **Date:** 2026-08-09

## Implementation Summary

Added one immutable SQL-first migration for Membership persistence. The schema preserves the durable Customer + Loyalty Program identity with a database uniqueness constraint, references Business/Brand/Program ownership, stores Reward/XP account relationship identifiers without claiming their deferred ledger persistence, enforces active enrollment prerequisites, validates lifecycle transitions, preserves closed history, and records enrollment idempotency context.

RLS is forced on Membership and enrollment idempotency tables using the existing `app.business_id` tenant context. The `loyalty_app` role can read/insert/update only within its tenant; no delete privilege is granted. SECURITY DEFINER validation functions use a fixed search path and have PUBLIC execution revoked. Errors contain no phone numbers, credentials, OTPs, or connection strings.

## Files Changed

- `database/migrations/20260809100000_create_membership_persistence.sql`
- `database/tests/membership-persistence.sql`
- `implementation/evidence/LP-006014/implementation.md`

## Validation

- `CI=true pnpm install --frozen-lockfile` — PASS; lockfile unchanged.
- `DATABASE_URL=postgresql://postgres@127.0.0.1:55440/loyalty_lp6014_clean_v2 NODE_ENV=test pnpm db:migrate` — PASS; clean database applied all 6 migrations.
- `psql .../loyalty_lp6014_clean_v2 -v ON_ERROR_STOP=1 -f database/tests/membership-persistence.sql` — PASS; Business A read/mutation denial, durable uniqueness, lifecycle terminality, identity immutability, and idempotency-context assertions passed.
- rerun `pnpm db:migrate` on the clean database — PASS; `No migrations to run!`.
- `pnpm db:migrate:check` — PASS; 6 migration files validated.
- upgrade database seeded with the five prior migrations, followed by `pnpm db:migrate` — PASS; LP-006014 applied as the sixth migration.
- `pnpm db:migrate:status` on the upgrade database — PASS; all six migrations recorded in order.
- `git diff --check` — PASS.

The node-pg-migrate timestamp warnings are an existing runner display quirk; every migration command exited successfully and migration status/hash validation passed.

## Scope and Deferrals

No runtime Loyalty product code, Reward/XP ledger tables, authentication, receipt, redemption, analytics, CI, or infrastructure implementation was changed. Distributed atomicity beyond PostgreSQL constraints/policies remains deferred to the later persistence tasks and deployment validation.

## Recommendation

Proceed to independent database architecture review. The implementation is ready for review with the required PostgreSQL evidence preserved.
