# LP-007006 Implementation Evidence

## Implementation

- Task ID: LP-007006
- Phase: Implementation
- Role: Database Implementation Agent
- Branch: `agent/database/LP-007006-receipt-persistence`
- Scope: immutable Receipt persistence, tenant-scoped source/idempotency enforcement, cancellation history, transactional outbox emission, and PostgreSQL RLS.
- Deferred: Reward/XP consumers, production scheduling, distributed processing beyond the transactional outbox, and unrelated domain behavior.

### Files

- `database/migrations/20260809120000_create_receipt_persistence.sql`
- `database/tests/receipt-persistence.sql`

### Implementation Notes

- Receipt source identity is unique per Business and is protected by a database constraint.
- Receipt ingestion is idempotent by Business and request key, with request-fingerprint mismatch rejection.
- Receipt context is validated against Membership, Brand, Loyalty Program, and Business ownership.
- Accepted Receipt rows are append-only; cancellation is represented by a separate immutable record and outbox event.
- Tenant-scoped RLS is enforced through `app.tenant_id`; application-facing access is granted through `loyalty_app` and security-definer command functions.
- Receipt recording and cancellation emit `ReceiptRecorded` and `ReceiptCancelled` in the existing transactional outbox.

### Validation

- `NODE_ENV=test DATABASE_URL=postgresql://*** pnpm run db:migrate` against disposable PostgreSQL database `loyalty_lp7006_clean_v4`: PASS; all eight migrations applied from zero.
- `psql ... -f database/tests/receipt-persistence.sql`: PASS; tenant isolation, source/idempotency replay and mismatch, immutable history, cancellation replay, and outbox integration passed.
- Repeated `pnpm run db:migrate`: PASS; no migrations to run.
- `pnpm run db:migrate:status`: PASS; eight migrations recorded in order.
- `pnpm run db:migrate:check`: PASS; eight valid, ordered migration files and hashes validated.
- `pnpm run build`: PASS.
- `pnpm run lint`: PASS; module boundary validation passed.
- `pnpm run typecheck`: PASS.
- `pnpm run test`: PASS; API 157/157, FCR 118/118, boundary 3/3.
- `pnpm validate:fcr`: PASS; 223 JSON files, 150 schemas, 25 operation IDs, 0 errors.
- `git diff --check`: PASS.

DATABASE_URL was redacted from evidence and command descriptions.
