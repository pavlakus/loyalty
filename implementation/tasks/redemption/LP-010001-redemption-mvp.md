# LP-010001 — Implement Reward Definition Eligibility and Redemption MVP

- Category: Product domain implementation
- Priority: Critical vertical milestone
- Lifecycle state: READY
- Assigned role: Backend Implementation Agent
- Owning module: Reward Eligibility / Redemption
- Dependencies: LP-008004, LP-009004, LP-005010
- Knowledge Package: MIP-010, Blueprint 03, 26, 33, 37 and 43, Reward Ledger contracts
- Allowed files: `services/api/src/modules/redemption/**`, `services/api/src/modules/reward/reward-ledger.ts` only for required projection compatibility, `services/api/test/reward-redemption.test.mjs`, `implementation/evidence/LP-010001/**`, this task record, and synchronized status/index records
- Forbidden files: persistence, migrations, RLS, infrastructure, inventory, fulfillment, provider integrations, commercial monetary calculations, XP spending, unrelated modules
- Required reviewers: independent Review Agent, QA Agent, Security Agent
- Mandatory validation: API build, API typecheck, API test suite, `git diff --check`, boundary/security inspection
- UAT references: fixed-cost reserve/confirm, cancellation, expiration, insufficient balance, duplicate request, concurrent overspend prevention
- Rollback/recovery: revert the isolated task commit; no deployed migration or mutable history is introduced; preserve existing ledger history
- Definition of Done: domain contracts and tests pass, evidence and status records are synchronized, Review/QA/Security approvals are recorded, and post-merge validation is complete

Acceptance: fixed positive pointsCost; enabled/status/Benefit/ACTIVE Membership/Program/AVAILABLE balance eligibility; reservation, confirmation, cancellation, 15-minute expiration; immutable history context; idempotency and in-process concurrency invariants. Persistence/RLS/distributed enforcement remains LP-010003 and is not claimed complete.
