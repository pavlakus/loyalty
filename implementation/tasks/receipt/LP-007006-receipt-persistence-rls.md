# LP-007006 — Implement Receipt Persistence, RLS, and Transactional Outbox

## Metadata

- Category: DATABASE/INFRASTRUCTURE; Priority: P0; Role: Database Developer Agent; Owner: Receipt Processing
- Dependencies: LP-000009, LP-000016, LP-007001, LP-007002, LP-007003, LP-007004
- State: QA
- Allowed files: immutable database migrations, RLS policies, repositories, outbox integration, database tests/evidence
- Forbidden: implementation until Database/Migration and CI foundations are complete; mutation of immutable Receipt history

## Scope and acceptance

Implement immutable Receipt persistence, source/idempotency uniqueness, cancellation records, tenant isolation, and same-transaction `ReceiptRecorded`/cancellation outbox integration. Receipt context must match Membership and Loyalty Program ownership. Clean/upgrade migrations, rollback, redacted failure, and database/RLS tests are mandatory. Reward/XP consumers and ledger mutation remain out of scope.

## Preparation Readiness

- LP-000009, LP-000010, LP-000016, LP-007001, LP-007002, LP-007003, and LP-007004 are DONE.
- The authoritative Receipt model uses integer minor-unit money, explicit ISO currency, canonical UTC timestamps, immutable accepted records, and compensating cancellation records.
- Allowed implementation files are limited to Receipt migrations/functions/RLS, Receipt-specific database tests, and LP-007006 evidence/status records.
- No Reward/XP ledger, redemption, analytics consumer, external broker, or migration-history rewrite is authorized.
