# ADR-012: Application Persistence and Composition Boundary

Accepted

## Context

The Loyalty Platform domain and PostgreSQL persistence milestones are complete, but the API bootstrap does not yet compose them into a runnable local vertical.

## Decision

The local MVP uses a ports-and-adapters application-service boundary:

`HTTP/API → validation/authentication → application handler → domain → repository port → PostgreSQL adapter → transaction commit → response/events`.

The application layer owns orchestration, transaction boundaries, tenant-context propagation, idempotency coordination, and contract mapping. PostgreSQL adapters own SQL, row mapping, locking, and database error translation. HTTP routes never execute SQL or call `pg` directly, and adapters do not implement Loyalty business rules.

One composition root wires the pool, transaction context, repository adapters, application handlers, authentication/session services, routes, and outbox integration. No hidden global repository singleton is introduced. Existing node-postgres, SQL-first migration, RLS, outbox, and canonical FCR decisions remain authoritative.

## Consequences

- The first local MVP integration task may add a small typed application layer and plain Node HTTP routing without introducing a new framework.
- All multi-resource commands share one PostgreSQL transaction.
- Tenant context is normalized centrally; legacy `app.tenant_id` and `app.business_id` database contracts are both set by the transaction adapter until their owning migrations are superseded by an authorized forward fix.
- Production provider delivery, deployment infrastructure, and analytics event-consumer operations remain outside this MVP task.
