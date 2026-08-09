# Receipt Processing Task Index

- LP-007001 — Define Receipt aggregate and immutable lifecycle
- LP-007002 — Define Receipt API and event contracts
- LP-007003 — Implement receipt validation and idempotency contract
- LP-007004 — Implement receipt cancellation compensating-record contract
- LP-007005 — Add Receipt domain, privacy, concurrency, and security tests
- LP-007006 — Implement Receipt persistence, RLS, and transactional outbox (READY)

Execution order is aggregate → contracts → validation/idempotency → cancellation → tests/gate → persistence/RLS/outbox. LP-007006 is READY because LP-000009, LP-000010, LP-000016, and LP-007001–LP-007004 are DONE. Reward/XP engines consume Receipt events later; Receipt does not own their state.
