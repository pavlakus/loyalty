# LP-006011 — Add Membership Domain, API, Privacy, and Security Tests

## Metadata

- Category: TEST; Priority: P0; Role: QA/Test Agent; Owner: Membership
- Dependencies: LP-006002, LP-006003, LP-006004, LP-006005, LP-006006, LP-006009, LP-006010
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006011/`

## Scope

Cover enrollment, duplicate/concurrent joins, ownership, privacy, lifecycle, token/QR, event, and account-boundary contracts with in-memory/test adapters where authorized.

## Acceptance / Tests

No test may claim database/RLS, session runtime, or production distributed atomicity. Mandatory negative, race-contract, privacy, and UAT-MEM scenarios must be truthful.

## Rollback / DoD

Revert tests/evidence only; complete Review, QA, Security/Privacy, merge, post-merge validation, and evidence.
