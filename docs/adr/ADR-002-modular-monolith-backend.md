# ADR-002: Modular Monolith Backend

## Status

Accepted

## Date

2026-07-15

## Context

The Blueprint defines independent business engines, event-driven collaboration and strict aggregate ownership. The Engineering Playbook allows the initial backend to run as one modular service while preserving boundaries for later extraction.

## Problem

The platform needs a backend architecture that is simple enough for initial delivery but strong enough to protect domain ownership, immutable histories, tenant isolation, public contracts and asynchronous event processing.

## Decision

Start with one TypeScript modular monolith backend in `services/api`. Each business module must use the standard module structure:

- `domain`
- `application`
- `infrastructure`
- `api`
- `tests`
- public `index.ts`

The backend application will compose modules explicitly at bootstrap. Modules may collaborate only through public Commands, Queries, Events and approved API contracts. Private repository imports and direct cross-module writes are forbidden.

## Alternatives Considered

- Microservices from the start: improves physical isolation but adds deployment, observability, distributed transaction and operational complexity before product-market learning.
- Single layered application without module boundaries: fastest initial coding path, but violates ownership rules and makes later extraction risky.
- Serverless functions per endpoint: easy to deploy small endpoints, but risks fragmented business transactions, duplicated authorization logic and inconsistent event publication.

## Rationale

A modular monolith supports the Blueprint's engine-based design while avoiding premature distributed systems complexity. It keeps transaction boundaries local for critical operations such as idempotency, outbox insertion and immutable writes.

## Positive Consequences

- Simpler local development and CI in the foundation phase.
- Stronger consistency for transaction plus outbox writes.
- Easier shared validation, error mapping and observability.
- Clear path to extract modules later when operational evidence justifies it.

## Negative Consequences and Tradeoffs

- Physical deployment isolation is deferred.
- Boundary enforcement depends on tooling and review discipline.
- A single backend deployment can couple release timing across modules.
- Runtime scaling is initially service-wide rather than module-specific.

## Implementation Impact

- Build `services/api` as one deployable backend with explicit module registration.
- Enforce imports through public module entry points.
- Keep controllers thin; business behavior belongs in domain and application layers.
- Keep workers in the backend service initially, with boundaries that allow future extraction.

## Security Impact

- Centralized middleware must establish authenticated actor context, request identifiers and tenant context.
- Authorization hooks must run before domain use cases.
- Service-role paths must still validate tenant ownership and business authorization.
- Public API responses must not leak private module or database details.

## Testing Impact

- Add module-boundary tests or lint rules.
- Test each module through public interfaces.
- Add integration tests for command, transaction, outbox and idempotency behavior.
- Add security tests for forged tenant and actor identifiers.

## Migration or Adoption Impact

The modular monolith is the default for MVP. Future extraction requires a separate ADR with migration impact, public contract stability and operational justification.

## Related Blueprint Documents

- `docs/blueprint/05-system-architecture.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/33-domain-model-v2.md`
- `docs/blueprint/42-data-model-v1.md`
- `docs/blueprint/43-api-contract.md`

## Related Engineering Documents

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`

