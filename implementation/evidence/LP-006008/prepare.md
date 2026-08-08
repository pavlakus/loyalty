# LP-006008 Task Preparation

- Task ID: LP-006008
- Phase: Task Preparation
- Role: Task Preparation Agent
- Date: 2026-08-08
- Branch: `agent/backend/LP-006008-membership-year-contracts`
- Dependencies: LP-006001, LP-006005, LP-006006 — DONE.
- Scope: explicit canonical UTC Membership Year boundaries, immutable completion, and renewal identity/idempotency contract.
- Excluded: Status evaluation, downgrade policy, XP/Visit aggregation, calendar derivation, persistence/RLS, notifications, and Benefit processing.

Period boundaries are supplied explicitly by the owning renewal flow; this task does not invent timezone or leap-day derivation semantics.

LP-006008 is READY for implementation.
