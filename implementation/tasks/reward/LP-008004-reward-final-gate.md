# LP-008004 — Add Reward Earning, Ledger, Idempotency, and Security Tests

## Metadata

- Category: TEST/SECURITY; Priority: P0; Role: QA/Test Agent; Owner: Reward Points
- Dependencies: LP-008001, LP-008002, LP-008003
- Allowed files: Reward tests/evidence/status/index
- Forbidden: production persistence/RLS or false integration claims
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Cover deterministic rules, currency/minor units, floor rounding, zero awards, configuration-version history, immutable transactions, pending/expiration semantics, duplicate earning prevention, and privacy/security boundaries.
