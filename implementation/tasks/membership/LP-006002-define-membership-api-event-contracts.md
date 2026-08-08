# LP-006002 — Define Membership API and Event Contracts

## Metadata

- Category: CONTRACT; Priority: P0; Role: Contracts Agent; Owner: Membership
- Dependencies: LP-006001
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006002/`

## Scope

Define join, read, lifecycle, and approved Membership event contracts using existing API/event envelopes. Require authenticated context, terms version, idempotency key, stable Membership identifiers, tenant context, and privacy-safe payloads.

## Allowed / Forbidden Files

Allowed: Membership module contracts, API/event contract tests, task/evidence/status records. Forbidden: persistence/RLS, credential behavior, Customer profile changes, Reward/XP ledger behavior, and new event names.

## Acceptance / Tests

Strictly reject client status/ownership injection, phone/internal IDs in public tokens, unknown fields where required, missing terms/idempotency, and payloads without required context. Cover approved event names and versioning.

## Rollback / DoD

Revert contract/evidence artifacts. DoD requires independent Review, QA, Security/Privacy, merge, post-merge validation, and evidence.
