# LP-008005 — Implement Reward Ledger Persistence, RLS, and Concurrency Enforcement

## Metadata

- Category: DATABASE/INFRASTRUCTURE; Priority: P0; Role: Database Developer Agent; Owner: Reward Points
- Dependencies: LP-000009, LP-000016, LP-008001, LP-008002, LP-008003, LP-008004
- State: QA
- Allowed files: immutable migrations, RLS, repositories, outbox/concurrency tests
- Forbidden: implementation before declared dependencies are DONE; mutation of posted ledger history or direct mutable balance authority

## Scope and acceptance

Implement production ledger/account persistence, tenant isolation, uniqueness/idempotency enforcement, and atomic balance derivation only after the declared infrastructure dependencies are complete.
