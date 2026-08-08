# LP-007002 — Define Receipt API and Event Contracts

## Metadata

- Category: CONTRACT; Priority: P0; Role: Contracts Agent; Owner: Receipt Processing
- Dependencies: LP-007001
- Knowledge Package: MIP-007, Blueprint API/event catalog, completed Membership/Program contracts
- Allowed files: Receipt API/event contracts/tests/evidence/status/index
- Forbidden: controllers, persistence/RLS, ledger/XP behavior, provider credentials
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Define strict preview/record/read/cancel request and response contracts from the Blueprint, including idempotency and context fields, plus ReceiptRecorded, ReceiptCancellationRequested, ReceiptCancelled, and ReceiptProcessingFailed event payload boundaries. Reject unknown fields, PII leakage, client-controlled ownership, and floating-point money.

## Required validation and recovery

Run package typecheck/build and contract tests. Revert only contract/tests/evidence/status.
