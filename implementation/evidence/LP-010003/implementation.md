# LP-010003 Implementation Evidence

## Implementation

- Task ID: LP-010003
- Phase: Implementation
- Role: Database Implementation Agent
- Branch: `agent/database/LP-010003-redemption-persistence`
- Scope: Reward Definition persistence, redemption reservation/confirmation/cancellation/expiration state, immutable Reward Ledger integration, tenant RLS, durable idempotency, and atomic point reservation.
- Deferred: fulfillment, inventory, commercial discount calculation, production scheduling, and unrelated infrastructure.

### Files

- `database/migrations/20260809150000_create_redemption_persistence.sql`
- `database/tests/redemption-persistence.sql`

### Implemented controls

- Reward definitions are configuration-version bound and tenant scoped.
- Reservations require an ACTIVE Membership, enabled Reward Definition, matching Program/configuration context, and available points through the existing atomic ledger function.
- Reservation retries replay the original result; a reused idempotency key with a different fingerprint fails.
- Confirmation, cancellation, and expiration are explicit transitions backed by new immutable ledger transactions; existing history is not edited.
- Confirmation uses a distinct ledger transaction identity and rejects confirmation at or after reservation expiry.
- Redemptions use forced RLS and SECURITY DEFINER functions with explicit tenant checks.

### Validation

- `psql -h 127.0.0.1 -p 55440 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE loyalty_lp10003_clean_v2"`: PASS.
- `NODE_ENV=test DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55440/loyalty_lp10003_clean_v2 pnpm run db:migrate`: PASS; all migrations through `20260809150000_create_redemption_persistence` applied.
- `psql -h 127.0.0.1 -p 55440 -U postgres -d loyalty_lp10003_clean_v2 -v ON_ERROR_STOP=1 -f database/tests/redemption-persistence.sql`: PASS; reservation projection, confirmation projection, immutable ledger integration, and rollback completed without errors.

### Recommendation

Proceed to independent Review, QA, and Security review. Do not merge until those gates and required live validation pass.
