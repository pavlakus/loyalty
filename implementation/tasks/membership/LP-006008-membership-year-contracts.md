# LP-006008 — Define Membership Year Boundary Contracts

## Metadata

- Category: DOMAIN; Priority: P1; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006001, LP-006005, LP-006006, `40-event-storming-status-and-membership-year.md`
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006008/`

## Scope

Define Membership Year identity, start/end boundaries, immutable completed history, and renewal/idempotency contracts. Status downgrade remains renewal-owned.

## Acceptance / Tests

Test UTC/calendar semantics only where Blueprint-defined, renewal idempotency, historical immutability, and no direct balance mutation.

## Rollback / DoD

Revert domain contracts/tests/evidence; complete Review, QA, Security/Privacy, merge, post-merge validation, and evidence.
