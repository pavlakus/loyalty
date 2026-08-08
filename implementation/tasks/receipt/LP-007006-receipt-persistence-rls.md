# LP-007006 — Implement Receipt Persistence, RLS, and Transactional Outbox

## Metadata

- Category: DATABASE/INFRASTRUCTURE; Priority: P0; Role: Database Developer Agent; Owner: Receipt Processing
- Dependencies: LP-000009, LP-000016, LP-007001, LP-007002, LP-007003, LP-007004
- State: BLOCKED
- Allowed files: immutable database migrations, RLS policies, repositories, outbox integration, database tests/evidence
- Forbidden: implementation until Database/Migration and CI foundations are complete; mutation of immutable Receipt history

## Scope and acceptance

Implement production persistence, tenant isolation, uniqueness/idempotency constraints, transactional outbox, clean/upgrade migrations, and database/RLS tests only after dependencies are DONE. This task is not executable now.
