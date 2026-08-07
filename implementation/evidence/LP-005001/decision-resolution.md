# LP-005001 Product Decision Resolution

- Task: LP-005001 — Define Loyalty Program aggregate and lifecycle
- Phase: Task Preparation resolution
- Decision owner: Authorized Product Owner
- Date: 2026-08-07
- Decision record: `docs/blueprint/26-product-decisions.md`

The Product Owner approved the canonical lifecycle: `DRAFT`, `ACTIVE`, `SUSPENDED`, `CLOSED`; initial `DRAFT`; transitions `DRAFT → ACTIVE/CLOSED`, `ACTIVE → SUSPENDED/CLOSED`, `SUSPENDED → ACTIVE/CLOSED`; and terminal `CLOSED`.

The decision explicitly preserves historical configuration, Memberships, balances, ledgers, rewards, audits, and transactions during suspension/closure, while deferring settlement and cross-aggregate behavior to the owning domains.

Result: the preparation blocker is resolved and LP-005001 is `READY`.
