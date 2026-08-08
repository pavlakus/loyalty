# LP-006006 — Define Initial Status Assignment Contract

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-005009, LP-006001, LP-006005
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006006/`

## Scope

Define assignment of the lowest active configured Status Level on enrollment through a provider-neutral Status port. Do not evaluate progression or grant Benefits.

## Acceptance / Tests

Require deterministic lowest-active selection, reject missing/ambiguous configuration, preserve Program configuration version context, and test no Reward Point/XP mutation.

## Rollback / DoD

Revert contract/tests/evidence; complete Review, QA, Security/Privacy, merge, post-merge validation, and evidence.
