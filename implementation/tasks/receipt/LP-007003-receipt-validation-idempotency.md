# LP-007003 — Implement Receipt Validation and Idempotency Contract

## Metadata

- Category: DOMAIN/CONCURRENCY; Priority: P0; Role: Backend Developer Agent; Owner: Receipt Processing
- Dependencies: LP-007001, LP-007002
- Knowledge Package: MIP-007, Blueprint idempotency/receipt requirements, LP-006004 patterns
- Allowed files: Receipt validation/idempotency ports, non-production test adapter, tests/evidence/status
- Forbidden: database uniqueness/RLS, shared production cache, reward/XP ledger mutation
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Define source-activity identity and request fingerprint semantics. Same scoped key and same request replays one result; same key with a different request conflicts; concurrent in-process attempts cannot produce two accepted outcomes. Adapter is explicitly NON_PRODUCTION. Preserve source timestamp/context for later configuration-version selection.

## Required validation and recovery

Run typecheck/build, focused duplicate/race-contract tests, and diff checks. Persistent/distributed atomicity remains deferred to LP-007006.
