# LP-009002 — Implement Deterministic XP Earning and Idempotency Contract

## Metadata

- Category: DOMAIN/CONCURRENCY; Priority: P0; Role: Backend Agent; Owner: XP and Status
- Dependencies: LP-009001, LP-005008, LP-007001
- Allowed files: XP earning/idempotency domain/tests/evidence/status
- Forbidden: Reward Points, persistence/RLS, distributed production claims

## Scope and acceptance

Consume approved XP Rules and Receipt/activity context, produce additive XP decisions bound to configuration version, and prevent the same source activity/rule from awarding twice through deterministic domain identity.
