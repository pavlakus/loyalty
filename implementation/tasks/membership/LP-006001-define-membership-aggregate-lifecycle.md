# LP-006001 — Define Membership Aggregate, Identity, and Lifecycle

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-002001, LP-003001, LP-004001, LP-005001; Product Decision for lifecycle matrix/rejoin semantics required
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006001/`

## Scope

Define Membership identity, Customer/Program/Brand references, known states, ownership boundaries, lifecycle events, and immutable historical semantics. Do not infer missing transitions or rejoin behavior.

## Allowed / Forbidden Files

Allowed: `services/api/src/modules/membership/**`, Membership tests, task/evidence/status records. Forbidden: migrations/RLS, Customer/Program configuration, Reward/XP ledger mutation, authentication credentials, and unrelated modules.

## Acceptance / Tests

Reject invalid identifiers and cross-aggregate embedding; preserve references and separate Reward/XP boundaries; test known states and any approved transition matrix, identity determinism, privacy, and terminal/history rules. No implementation may begin until the Product Decision blocker is resolved.

## Rollback / DoD

Revert task artifacts only; no external state. DoD requires Review, QA, Security/Privacy, merge, post-merge validation, and evidence.
