# LP-006014 — Implement Membership Persistence and RLS (Deferred)

## Metadata

- Category: DATA/SECURITY; Priority: P1; Role: Database Agent; Owner: Membership
- Dependencies: LP-000009, LP-000016, LP-006001, LP-006003, LP-006004, LP-006005, LP-006006
- Reviewers: Database/Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006014/`

## Scope

Immutable Membership schema, unique active Customer/Program constraint, atomic enrollment, account relationships, repositories, RLS, and migration/upgrade tests after foundations are available.

## Forbidden

No implementation before Database migration and CI foundations are genuinely complete; no weakening of tenant isolation or application authorization.

## Acceptance / Tests

Clean/upgrade migrations, atomic duplicate join, RLS tenant isolation, rollback/forward-fix, and redacted failure behavior.

## Rollback / DoD

Immutable migrations require forward-fix/recovery; complete independent Review, QA, Security, merge, post-merge validation, and evidence.
