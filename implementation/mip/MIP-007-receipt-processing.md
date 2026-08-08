# MIP-007 — Receipt Processing

## Purpose

Define the authoritative commercial activity record used by later Reward and XP processing.

## Boundaries

Receipt belongs to Business Activity and references Membership, Employee/integration context, and Location. It does not own Reward Points, XP, Status, Redemption, Program configuration, or ledger state. Receipt is immutable after acceptance; cancellation is represented by compensating records/events.

## Approved semantics

- Monetary amounts use integer minor units and explicit ISO currency context; no floating point or implicit FX.
- Receipt timestamps are canonical UTC timestamps and remain available for deterministic Program configuration-version selection.
- Accepted receipts are immutable and are the source of truth for purchase processing.
- Duplicate delivery must not create duplicate authoritative activity or duplicate downstream earning.
- Receipt cancellation follows the approved compensating-record model and emits the repository-standard cancellation events; it must not delete or rewrite the original receipt.
- Reward/XP evaluation and ledger mutation remain separate downstream responsibilities.

## Deferred foundations

Repositories, database constraints/RLS, transactional outbox, and production distributed idempotency are deferred until LP-000009/LP-000016 foundations are available. Domain/application contracts may use provider-neutral or non-production test adapters without production claims.

## Definition of Done

Each task has isolated scope, focused tests, review, QA/security evidence where required, merge evidence, post-merge validation, and synchronized status records.
