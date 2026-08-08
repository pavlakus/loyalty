# LP-006005 — Define Reward Account and XP Account Relationship Contracts

## Metadata

- Category: DOMAIN/CONTRACT; Priority: P0; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006001
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006005/`

## Scope

Define exactly-one Reward Account and exactly-one XP Account relationship contracts under Membership, with separate identifiers and zero-initial-state semantics. No ledger or balance persistence.

## Acceptance / Tests

Reject account cross-linking and mixed concepts; preserve separate Reward/XP types; test deterministic creation descriptors and no Customer-specific secrets.

## Rollback / DoD

Revert domain contracts/tests/evidence only; complete independent Review, QA, Security/Privacy, merge, post-merge validation, and evidence.
