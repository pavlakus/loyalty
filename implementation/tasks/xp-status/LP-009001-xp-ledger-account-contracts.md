# LP-009001 — Define Immutable XP Transaction and XP Account Projection Contracts

## Metadata

- Category: DOMAIN/CONTRACT; Priority: P0; Role: Backend/Contracts Agent; Owner: XP and Status
- Dependencies: LP-005008, LP-006001, LP-006008, LP-007001
- Allowed files: XP module contracts/tests/evidence/status/index
- Forbidden: Reward Points, persistence/RLS, Status mutation, Benefit grants, redemption
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Define immutable version-bound XP transaction descriptors and deterministic XP Account projection for current, lifetime, and Membership Year XP. Preserve source Receipt/activity, XP Rule, Membership, Program, and configuration-version identities. No mutable XP authority or persistence claim.
