# LP-011001 — Implement Deterministic Business Observation Metrics

- Category: Product domain/application implementation
- Priority: High
- Lifecycle state: READY
- Assigned role: Backend Implementation Agent
- Owning module: Business Observation / Analytics
- Dependencies: LP-010002 DONE; authoritative Membership, Receipt, Reward Ledger, Redemption, and Status contracts
- Knowledge Package: MIP-011, Blueprint 03/26/33/37/43, Product Decision 2026-08-08, completed domain contracts
- Allowed files: `services/api/src/modules/analytics/**`, `services/api/test/analytics-*.test.mjs`, `implementation/evidence/LP-011001/**`, this task, analytics index/status and Product Decision records
- Forbidden files: persistence, migrations, RLS, event consumers, materialized views, Customer PII, revenue/ROI/LTV/churn/cohort/campaign/liability/forecasting/AI analytics
- Required reviewers: independent Review Agent, QA Agent, Security Agent
- Mandatory validation: API build/typecheck/tests, deterministic metric tests, privacy scan, `git diff --check`
- Acceptance criteria: explicit UTC half-open period; membership/activity/reward/redemption/engagement/status metrics; currency-separated money; immutable/version-bound history; duplicate-safe aggregation; zero-data behavior; no PII.
- Rollback/recovery: revert isolated commit; no persistent data or migrations are introduced.
- Definition of Done: implementation, review, QA, Security, merge, post-merge evidence and synchronized lifecycle records.
