# LP-006003 — Implement Join Loyalty Program Command Contract

## Metadata

- Category: APPLICATION; Priority: P0; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006001, LP-006002, LP-001011, LP-005001, Product Decision for rejoin semantics
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006003/`

## Scope

Implement provider-neutral JoinLoyaltyProgram orchestration boundary: authenticated Customer reference, active Brand/Program prerequisites, terms, eligibility port, enrollment source, and idempotency input. Do not claim persistence or session integration.

## Acceptance / Tests

Validate Customer/Program context, terms, eligibility, active prerequisites, and safe failure ordering. Return typed outcomes for inactive Program, missing terms, ineligible Customer, duplicate/idempotent request, and unresolved persistence. Test no raw phone/secret logging.

## Allowed / Forbidden

Allowed Membership application ports/use cases/tests/evidence. Forbidden database repositories, RLS, provider credentials, Customer mutation, Reward/XP grants, and welcome automation execution.

## Rollback / DoD

Revert task artifacts. Full Review, QA, Security/Privacy, merge, post-merge validation, and evidence required.
