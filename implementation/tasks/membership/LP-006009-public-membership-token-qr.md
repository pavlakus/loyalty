# LP-006009 — Define Public Membership Token and QR Contracts

## Metadata

- Category: CONTRACT/SECURITY; Priority: P1; Role: Backend Developer Agent; Owner: Membership
- Dependencies: LP-006001, LP-006002
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent
- Evidence: `implementation/evidence/LP-006009/`

## Scope

Define opaque public Membership token and backend-resolved QR representation. No phone number or internal database ID may be encoded.

## Acceptance / Tests

Test opacity, non-enumerability contract, privacy-safe serialization, offline display versus online authorization boundaries, and tenant/context checks.

## Rollback / DoD

Revert contract/tests/evidence; complete independent lifecycle.
