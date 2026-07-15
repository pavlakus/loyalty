# ADR-006: Observability and Correlation Context

## Status

Accepted

## Date

2026-07-15

## Context

The platform must be observable across APIs, background workers, outbox processing, automation execution, notifications, migrations and release operations. Blueprint and Engineering documents require request identifiers, correlation identifiers and causation identifiers to explain business outcomes.

## Problem

Without a standard observability and context model, logs, metrics and traces become inconsistent. Debugging duplicate requests, tenant isolation failures, event chains and worker retries becomes slow and unreliable.

## Decision

Define a platform correlation context propagated through HTTP requests, application commands, database transactions, outbox events and workers. The context includes:

- `request_id` for transport request tracking;
- `correlation_id` for a full business flow;
- `causation_id` for the direct parent command or event;
- actor type and safe actor identifier where applicable;
- Business or tenant context where verified;
- module, operation and environment fields.

Use structured JSON logs, OpenTelemetry-compatible traces and metrics with bounded-cardinality labels. Foundation must provide context creation, propagation and logging interfaces, but not business-specific dashboards.

## Alternatives Considered

- Plain text logs only: simple but weak for distributed event flows and machine analysis.
- Per-module logging conventions: flexible but inconsistent and hard to correlate.
- Full vendor-specific observability SDK from the start: powerful but creates early lock-in before deployment topology is stable.
- Use only request IDs: insufficient for asynchronous event chains and causation analysis.

## Rationale

A standard context model makes event-driven flows auditable and debuggable. OpenTelemetry-compatible boundaries preserve portability while allowing later provider selection.

## Positive Consequences

- Requests, commands, events and worker attempts can be connected.
- Incident response can identify root and parent causes.
- Metrics can track latency, error rate, queue lag and retry behavior.
- Sensitive logging rules can be enforced consistently.

## Negative Consequences and Tradeoffs

- Every layer must accept and propagate context explicitly.
- Logging discipline is required to avoid sensitive data leakage.
- Trace and metric naming must be governed to prevent noise and high cardinality.
- Initial foundation work is larger than basic logging.

## Implementation Impact

- Add shared observability package and backend context middleware.
- Add logger, metrics and trace integration points.
- Add event envelope fields for correlation and causation.
- Add worker context reconstruction from outbox records.
- Add health and readiness endpoints in the backend foundation.

## Security Impact

- Logs must never contain OTP codes, access tokens, refresh tokens, API keys, service-role credentials, full personal data or provider credentials.
- Actor identifiers in logs must be minimized and safe.
- Trace propagation must not expose internal identifiers to untrusted clients.
- Operational dashboards must respect environment and tenant access controls.

## Testing Impact

- Test request ID generation when missing.
- Test propagation from API request to command, outbox event and worker.
- Test safe error envelope includes request or correlation reference without internals.
- Test logging redaction for known sensitive fields.
- Test health and readiness endpoints do not leak secrets.

## Migration or Adoption Impact

Foundation establishes the observability interfaces. Later modules must use these interfaces instead of custom logging or metric patterns. Provider-specific exporters can be added by DevOps tasks without changing domain code.

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

