# Receipt Processing Task Index

- LP-007001 — Define Receipt aggregate and immutable lifecycle
- LP-007002 — Define Receipt API and event contracts
- LP-007003 — Implement receipt validation and idempotency contract
- LP-007004 — Implement receipt cancellation compensating-record contract
- LP-007005 — Add Receipt domain, privacy, concurrency, and security tests
- LP-007006 — Implement Receipt persistence, RLS, and transactional outbox (BLOCKED)

Execution order is aggregate → contracts → validation/idempotency → cancellation → tests/gate. LP-007006 depends on LP-000009 and LP-000016. Reward/XP engines consume Receipt events later; Receipt does not own their state.
