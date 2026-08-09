# LP-011003 — Implement Production Analytics Projection, Persistence, and RLS

- Task ID: LP-011003
- Category: Persistence / read-only analytics projection
- Priority: P1 product vertical completion
- State: QA
- Owner: Database / Backend Implementation Agent
- Owning module: Business Observation and Analytics
- Dependencies: LP-000009, LP-000016, LP-011001, LP-011002 (all DONE)
- Knowledge Package: MIP-011; approved Business Observation Product Decision; Blueprint 03, 26, 33, 37, 42, 43, 44; LP-011001 and LP-011002 contracts; database/RLS standards.

## Objective

Persist a tenant-scoped, read-only analytics projection from authoritative transactional outcomes without making analytics a source of truth or recalculating historical rules.

## Scope

- immutable/version-bound projection records for approved Membership, Receipt, Reward Point, Redemption, and Status metrics;
- explicit UTC half-open reporting periods and currency-separated monetary totals;
- Business-scoped RLS and read-only application access;
- idempotent projection application keyed by authoritative source identity;
- replay-safe projection/query contract and deterministic zero-data behavior;
- focused PostgreSQL clean/upgrade/RLS/privacy tests.

## Out of scope

Revenue/ROI/LTV/churn/cohorts/campaign attribution, forecasting, AI recommendations, Customer PII, transactional-domain mutation, alternate BI engines, FX conversion, deployment infrastructure, and unapproved real-time guarantees.

## Allowed files

- `database/migrations/20260809160000_create_analytics_projection.sql`
- `database/tests/analytics-persistence.sql`
- `services/api/src/modules/analytics/**` only for the approved persistence/query adapter contract
- `services/api/test/analytics-persistence*.test.mjs` only for adapter tests
- `implementation/evidence/LP-011003/**`
- this task, `implementation/tasks/analytics/TASK-INDEX.md`, and `implementation/TASK-STATUS.md`

## Forbidden files

Other product modules, existing immutable migrations, business rules, Reward/XP/Receipt source tables, authentication, deployment/CI, secrets, Customer PII storage, and analytics metrics outside the approved initial catalog.

## Acceptance criteria

1. Clean and upgrade migrations succeed through the analytics migration.
2. Projection rows retain Business, Brand, Program, source identity, configuration context, metric period, and UTC timestamps.
3. Replaying the same authoritative source does not inflate a metric; conflicting payloads fail closed.
4. Queries support explicit half-open `from <= timestamp < to` periods and return zero/empty results for valid empty periods.
5. Monetary totals remain separated by currency and use integer minor units; no FX conversion exists.
6. Business A cannot read or mutate Business B analytics rows under forced RLS.
7. Analytics is read-only with respect to authoritative transactional domains and does not expose Customer PII.
8. Migration filename/order/hash/status validation passes.

## Required review and validation

Independent Review, QA, and Security review are required. Mandatory validation: `pnpm install --frozen-lockfile`, clean/upgrade PostgreSQL migration, rerun/status/hash checks, analytics persistence test, build, lint, typecheck, test, FCR, and `git diff --check`.

## Rollback / recovery

Use the repository forward-fix policy for deployed migrations; projection rows may be rebuilt from authoritative history. Roll back an unmerged branch by reverting its isolated commit. Never edit authoritative source history.

## Evidence / Definition of Done

Evidence is under `implementation/evidence/LP-011003/` with `prepare.md`, `implementation.md`, `review.md`, `qa.md`, `security.md`, `merge.md`, and `post-merge.md`. DONE requires all approvals, merge evidence, post-merge validation, synchronized status/index/spec, and no unresolved P0/P1 findings.
