# LP-006010 — Define Membership Read and List Contracts

## Metadata

- Category: API; Priority: P1; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006002, LP-006005, LP-006006, LP-006009
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006010/`

## Scope

Define Customer-owned Membership read/list and approved Business-scoped views without unrestricted Customer exposure or cross-tenant leakage.

## Acceptance / Tests

Test own-membership authorization, Business role scope, pagination, status/account summaries without ledger mutation, and privacy-safe fields.

## Rollback / DoD

Revert contract/tests/evidence; complete independent lifecycle.
