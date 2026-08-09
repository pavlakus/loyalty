# LP-006014 Task Preparation Evidence

- **Task ID:** LP-006014
- **Phase:** Task Preparation
- **Role:** Task Preparation Agent
- **Date:** 2026-08-09
- **Task:** Implement Membership Persistence and RLS

## Documents Reviewed

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/mip/MIP-006-membership.md`
- `implementation/tasks/membership/LP-006014-membership-persistence-rls.md`
- `implementation/tasks/membership/TASK-INDEX.md`
- approved Membership aggregate, enrollment, account relationship, and lifecycle evidence
- `docs/blueprint/33-domain-model-v2.md`
- `docs/blueprint/42-data-model-v1.md`
- `docs/blueprint/44-permission-matrix.md`
- accepted ADR-010 and LP-005014 persistence/RLS evidence

## Readiness Assessment

All declared dependencies are DONE and present in repository records:

- LP-000009 — Database Migration Framework: DONE.
- LP-000016 — CI Pull Request Pipeline: DONE; live PostgreSQL validation passed in run `31298833087`.
- LP-006001, LP-006003, LP-006004, LP-006005, LP-006006: DONE.

The approved Membership Product Decision resolves the historical generic “inactive” wording. Persistence must enforce one durable `(customer_id, loyalty_program_id)` identity, ACTIVE/SUSPENDED/CLOSED lifecycle values, and terminal closure without replacement/rejoin.

## Authorized Scope

- Membership schema and immutable migrations.
- Customer/Program/Brand references and durable identity constraints.
- Reward Account and XP Account relationship identifiers only; their ledger/account persistence remains separate.
- Atomic enrollment/duplicate prevention at the database boundary.
- Membership tenant derivation and RLS for Business-scoped operational access.
- Clean and upgrade migration tests, cross-tenant read/write denial, rollback/forward-fix evidence, and redacted failures.

Forbidden: product behavior outside Membership persistence, edits to deployed migrations, weakening RLS, credentials, shared/production databases, or changes to LP-000009/LP-000016.

## Validation Plan

Run the repository-authorized PostgreSQL validation through the existing CI workflow and an isolated local PostgreSQL instance when available: frozen install, clean migration, upgrade migration, migration status/hash validation, duplicate enrollment race/constraint checks, RLS allow/deny checks for two Businesses, immutability checks, `git diff --check`, and `git status --short`. No full product behavior is claimed by this preparation record.

## Lifecycle Recommendation

`BLOCKED → READY` recorded in synchronized task status and Membership index. Implementation may begin only on a dedicated `agent/database/LP-006014-membership-persistence` branch after this preparation commit is integrated.
