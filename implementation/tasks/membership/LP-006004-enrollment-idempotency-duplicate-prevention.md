# LP-006004 — Implement Enrollment Idempotency and Duplicate Prevention Contract

## Metadata

- Category: DOMAIN/CONCURRENCY; Priority: P0; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006001, LP-006003; persistence constraint deferred to LP-006014
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006004/`

## Scope

Define idempotency key scope/hash/conflict semantics and a provider-neutral atomic duplicate-prevention port. In-memory/test behavior may be implemented without production persistence claims.

## Acceptance / Tests

Identical retries return one logical outcome; same key with different payload conflicts; parallel requests cannot create two active outcomes within the adapter; production distributed atomicity remains deferred and explicit.

## Forbidden

No database unique constraint, RLS, shared cache, or production coordination implementation in this task.

## Rollback / DoD

Revert contract/adapter/tests/evidence. Review, QA, Security/Privacy, merge, post-merge validation, and evidence required.
