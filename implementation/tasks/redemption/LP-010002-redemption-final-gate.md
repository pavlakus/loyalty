# LP-010002 — Add Reward Redemption API/Event and Security Tests

- Category: API/event contract and security validation
- Priority: Critical vertical milestone
- Lifecycle state: READY
- Assigned role: API Contract Implementation Agent
- Owning module: Reward Eligibility / Redemption
- Dependencies: LP-010001 (DONE)
- Knowledge Package: MIP-010, LP-010001, Blueprint 03/26/37/43, Reward Ledger contracts
- Allowed files: `packages/api-contracts/src/redemption.ts`, `packages/api-contracts/src/index.ts`, `packages/event-contracts/src/redemption.ts`, `packages/event-contracts/src/index.ts`, scoped contract tests, this task, status/index/evidence
- Forbidden files: persistence, migrations, RLS, infrastructure, fulfillment, commercial discount calculation, XP, unrelated APIs/events
- Required reviewers: independent Review Agent, QA Agent, Security Agent
- Mandatory validation: package build/typecheck/tests, API integration regression, boundary/security inspection, `git diff --check`
- Rollback/recovery: revert the isolated contract commit; no runtime persistence or deployed data is changed
- Definition of Done: strict API/event contracts, failure/security tests, approval evidence, merge and post-merge validation

Scope: define strict create/reserve/confirm/cancel contract shapes and canonical RewardPointsReserved, RewardReservationReleased, RewardPointsRedeemed event payloads. Fixed `pointsCost` is the only MVP redemption value; no discount calculation or fulfillment claim.

Acceptance: validate insufficient balance, duplicate operations, reservation lifecycle, FIFO-compatible point consumption, privacy, Status/Benefit restrictions, and concurrency. No persistence/RLS claims.
