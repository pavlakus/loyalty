# LP-007004 — Implement Receipt Cancellation Compensating-Record Contract

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Receipt Processing
- Dependencies: LP-007001, LP-007002, LP-007003
- Knowledge Package: MIP-007, Blueprint cancellation/reversal rules, event catalog
- Allowed files: Receipt cancellation domain contract/tests/evidence/status
- Forbidden: mutation/deletion of original Receipt, direct Reward/XP reversal ledger writes, persistence/RLS
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Model cancellation request and compensating cancellation record/event while preserving the original immutable Receipt. Reject duplicate or invalid cancellation transitions according to approved event semantics. Downstream Reward/XP reversal remains owned by those ledgers.

## Required validation and recovery

Run focused cancellation tests, typecheck/build, and diff checks. Revert only task-scoped changes.
