# LP-006007 — Implement Membership Suspension and Closure Operations

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006001 and Product Decision for lifecycle transitions/reactivation
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006007/`

## Scope

Implement only approved explicit suspension/closure operations, preserving historical state and blocking appropriate downstream actions through contracts. No earning/redemption behavior.

## Acceptance / Tests

Test only transitions explicitly approved by Product Decision, terminal/history invariants, idempotency, audit events, and privacy-safe errors.

## Rollback / DoD

Revert domain/tests/evidence; full independent lifecycle required.
