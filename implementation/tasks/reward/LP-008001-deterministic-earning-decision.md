# LP-008001 — Define Deterministic Reward Points Earning Decision

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Reward Points
- Dependencies: LP-005004, LP-005005, LP-006001, LP-007001
- Allowed files: Reward earning domain/application contracts, tests, evidence, status/index
- Forbidden: Receipt mutation, XP/Status, redemption, ledger persistence, RLS
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Evaluate approved Reward Rules against authoritative Receipt inputs, effective immutable Program configuration version, currency context, and Membership eligibility context. Produce deterministic whole-point decisions using approved floor rounding; valid below-threshold activity may produce zero; decision carries source Receipt/activity identity, rule identity, and configuration-version identity. No ledger mutation.

## Validation and recovery

Run API typecheck/build, deterministic earning tests, and diff checks. Revert only task-scoped changes.
