# LP-009005 — Implement XP/Status Persistence, RLS, and Distributed Concurrency

## Metadata

- Category: DATABASE/INFRASTRUCTURE; Priority: P0; Role: Database Agent; Owner: XP and Status
- Dependencies: LP-000009, LP-000016, LP-009001–LP-009004
- State: REVIEW
- Allowed files: immutable XP migrations, RLS, repositories, concurrency/outbox tests
- Forbidden: implementation before declared dependencies are DONE; mutation of XP history or completed Status history

## Scope and acceptance

Implement production XP history/account persistence, tenant isolation, uniqueness, and atomic concurrency only after infrastructure foundations are available.
