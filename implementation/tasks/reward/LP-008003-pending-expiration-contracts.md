# LP-008003 — Implement Pending and Expiration Decision Contracts

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Developer Agent; Owner: Reward Points
- Dependencies: LP-008001, LP-008002, LP-005007
- Allowed files: pending/expiration contracts, tests, evidence, status/index
- Forbidden: scheduler, persistence/RLS, ledger mutation, XP, redemption
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Apply approved Program pending/expiration configuration to earning decisions without rewriting historical transactions. Preserve deterministic dates and version binding. No background jobs or production storage.
