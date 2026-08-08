# LP-007001 — Define Receipt Aggregate and Immutable Lifecycle

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Receipt Processing
- Dependencies: LP-006001, LP-006002, LP-006003, LP-005001, LP-005003, LP-005004
- Knowledge Package: MIP-007, Blueprint domain/data/API/event documents, completed Membership and Program contracts
- Allowed files: Receipt module runtime/tests, task/evidence/status/index records
- Forbidden: migrations/RLS, ledger/balance/XP mutation, Program configuration mutation, Redemption, provider credentials
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Define Receipt identity/context, integer minor-unit money, canonical timestamps, accepted processing state, immutable record invariants, and references to Membership/Business/Brand/Program/Location without embedding other aggregates. Emit the approved ReceiptRecorded fact. Reject invalid amounts, currency, timestamps, missing context, and mutation of accepted history. Tests must prove deterministic snapshots and no cross-aggregate state ownership.

## Required validation and recovery

Run API typecheck/build, focused Receipt tests, and diff checks. Revert only this task’s Receipt source/tests/evidence/status. No production persistence claim.
