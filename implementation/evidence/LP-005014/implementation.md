# LP-005014 Implementation Evidence

- **Task ID:** LP-005014
- **Phase:** Implementation
- **Role:** Database Developer Agent
- **Date:** 2026-08-09
- **Branch:** `agent/database/LP-005014-program-persistence`
- **Commit:** `2130637ac25e8be9a7a3926d2f6709f441097d0c`

## Implementation summary

Added the immutable SQL-first Loyalty Program persistence foundation:

- `loyalty_programs` with Brand ownership, Business tenant key, lifecycle status, timestamps, version and one-Program-per-Brand uniqueness;
- append-only `loyalty_program_configuration_versions` with stable `<program id>:<version>` identity, effective timestamp and JSON configuration payload;
- configuration immutability trigger;
- tenant consistency trigger preventing a Program from pairing a Brand with another Business;
- forced RLS policies using the transaction-scoped `app.business_id` context;
- a non-login `loyalty_app` role with least-privilege table grants;
- focused SQL assertions for cross-Business read/update denial, configuration immutability and historical identity.

No Customer, Membership, Receipt, Reward, XP, Status, Redemption, Analytics, LP-000009 or LP-000016 implementation files were changed.

## Validation

- `git diff --check` — PASS.
- `git push origin agent/database/LP-005014-program-persistence` — PASS.
- Live workflow `31299212274` — PASS for both jobs.
- Live PostgreSQL migration filename/order/hash validation — PASS.
- Live clean migration application — PASS.
- Live migration status, rerun/idempotency, baseline upgrade and unavailable-database redaction — PASS.
- Local Docker check — NOT AVAILABLE; Docker daemon socket unavailable.
- Local PostgreSQL attempt — BLOCKED; `initdb`/server cannot create the required shared-memory segment in this sandbox (`Operation not permitted`).
- `database/tests/loyalty-program-persistence.sql` — NOT RUN; it requires an executable PostgreSQL instance to prove the RLS allow/deny and immutability assertions.

## Findings and readiness

The migration is applied successfully in live PostgreSQL, but the task cannot truthfully advance to review until the dedicated RLS assertion script has run against PostgreSQL. This is an infrastructure execution blocker, not a Product or Architecture decision.

## Recovery

Rollback is forward-fix only for deployed migrations. The migration file must not be edited after integration. The temporary local PostgreSQL data directory, if created, may be discarded because it contains no repository or production data.
