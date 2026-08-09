# LP-006014 — Implement Membership Persistence and RLS

## Status

`IN_PROGRESS`

## Metadata

- Category: DATA/SECURITY; Priority: P1; Role: Database Agent; Owner: Membership
- Dependencies: LP-000009, LP-000016, LP-006001, LP-006003, LP-006004, LP-006005, LP-006006
- Reviewers: Database/Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006014/`

## Scope

Immutable Membership schema, durable Customer/Program identity constraint, atomic enrollment, account relationships, repositories, RLS, and migration/upgrade tests. The Customer/Program pair has at most one Membership identity, including after closure; suspension/reactivation never creates a replacement record.

## Forbidden

No implementation before Database migration and CI foundations are genuinely complete; no weakening of tenant isolation or application authorization.

## Acceptance / Tests

Clean/upgrade migrations, atomic duplicate join, durable Customer/Program uniqueness, RLS tenant isolation, cross-tenant read/write denial, rollback/forward-fix, and redacted failure behavior.

## Rollback / DoD

Immutable migrations require forward-fix/recovery; complete independent Review, QA, Security, merge, post-merge validation, and evidence. Account identifiers are relationship boundaries only; Reward/XP ledger state remains owned by their persistence tasks.

## Preparation Readiness

- LP-000009 and LP-000016 are DONE; LP-000016 live PostgreSQL validation passed in run `31298833087`.
- LP-006001, LP-006003, LP-006004, LP-006005, and LP-006006 are DONE with independent approval evidence.
- The approved Membership lifecycle and rejoin decision requires one durable Customer + Loyalty Program identity, ACTIVE/SUSPENDED/CLOSED states, and no rejoin after CLOSED.
- Allowed implementation files are limited to Membership persistence migrations, Membership-specific database/RLS/integration tests, and LP-006014 lifecycle/evidence records. No unrelated domain or infrastructure changes are authorized.
