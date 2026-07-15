# ADR-004: Transactional Outbox

## Status

Accepted

## Date

2026-07-15

## Context

The platform is event-driven. Business Events are immutable facts and must be published only after successful business state changes. Critical flows such as receipt recording, reward earning, redemption and automation cannot tolerate lost or duplicated business effects.

## Problem

Publishing events directly to a worker or external broker during a business transaction can produce inconsistency if the database commit succeeds but event publication fails, or if event publication succeeds but the transaction rolls back.

## Decision

Use a transactional outbox stored in PostgreSQL. Business use cases that create durable state and Business Events must write the domain state, audit where required, idempotency result and outbox event in the same database transaction.

An event dispatcher worker will atomically claim outbox records, deliver them to in-process handlers or later event infrastructure, record attempts, classify failures, support retries and expose dead-letter visibility. Event handlers must be idempotent.

Ordering is guaranteed only within the same aggregate stream when business correctness requires it. The platform does not guarantee global ordering across unrelated aggregates or Businesses. Every outbox record must contain aggregate type, aggregate ID and aggregate version or equivalent ordering metadata so workers and consumers can reason about stream-local order.

Workers must claim rows atomically using a PostgreSQL-safe pattern such as `FOR UPDATE SKIP LOCKED` or an equivalent atomic database function. Claimed rows must record worker or claim identity and claim time. The same row must not be processed concurrently by multiple workers.

Replay must be explicit and auditable. Replayed Events retain the original Event ID and original business occurrence time. Consumers remain idempotent, and replay must not create duplicate customer-visible or financial side effects.

Permanent failures move into a visible failed or dead-letter state. Recovery ownership belongs to Platform Operations or Release/Support tooling. Recovery requires reason, actor, timestamp and retry evidence. Recovery never rewrites the original Event payload.

Temporary failures use bounded exponential backoff with jitter. Retry count and next attempt time are persisted. Poison messages must not block unrelated Event processing.

## Alternatives Considered

- Publish directly from application memory after commit: simple but can lose events during process failure.
- Publish to an external broker inside the transaction: not generally atomic with PostgreSQL and introduces distributed transaction risk.
- Database triggers to emit business events: hides domain behavior in the database and violates the rule that business behavior belongs to owning modules.
- Poll module tables directly: couples consumers to private data and bypasses public event contracts.

## Rationale

The transactional outbox preserves consistency between authoritative state and emitted Business Events. It supports the initial modular monolith and can later feed a distributed broker without changing domain semantics.

## Positive Consequences

- No committed business state is missing its required event.
- Event dispatch can retry independently of the originating request.
- Workers can be paused and resumed safely during releases.
- Event metadata can preserve correlation, causation, tenant context and idempotency identifiers.

## Negative Consequences and Tradeoffs

- Adds outbox storage and worker operational complexity.
- Event delivery is asynchronous, so clients may see accepted or processing states.
- Event ordering must be designed explicitly where required.
- Dead-letter handling and replay procedures must be implemented.

## Implementation Impact

- Add outbox table through a foundation migration.
- Define a versioned event envelope in `packages/event-contracts`.
- Add atomic claim behavior using row locks or `SKIP LOCKED`.
- Add dispatcher metrics, retry classification and dead-letter state.
- Keep domain-specific consumers out of the foundation task.

## Security Impact

- Event payloads must not contain secrets, tokens or unnecessary personal data.
- Tenant context must be included where relevant.
- Service-role worker execution must still validate consumer permissions and domain rules where it invokes commands.
- Dead-letter inspection must be access-controlled.

## Testing Impact

- Test transaction rollback does not leave an outbox event.
- Test successful commit creates exactly one outbox event.
- Test atomic worker claim under concurrency.
- Test temporary retry and permanent failure classification.
- Test replay or duplicate delivery does not duplicate side effects.

## Migration or Adoption Impact

The foundation creates outbox infrastructure only. Business modules adopt it as they introduce events. Later migration to a broker must consume from the outbox and preserve event versions and replay semantics.

## Related Blueprint Documents

- `docs/blueprint/05-system-architecture.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`
- `docs/blueprint/43-api-contract.md`

## Related Engineering Documents

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
