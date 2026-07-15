# ADR-003: PostgreSQL and Supabase-Compatible Data Platform

## Status

Accepted

## Date

2026-07-15

## Context

The platform requires immutable business history, transactional writes, tenant isolation, RLS, deterministic migrations, atomic queue claiming and strong relational constraints. Blueprint documents identify PostgreSQL and Supabase as the initial technology direction.

## Problem

The foundation must choose a database strategy that supports multi-tenant security, reliable transactions, local development, migration testing and future managed deployment without binding domain logic to provider-specific shortcuts.

## Decision

Use PostgreSQL as the system of record with a Supabase-compatible approach for local development and managed deployment options. Database design must rely on portable PostgreSQL features first. Supabase-specific capabilities may be used only where they do not weaken portability, testability, tenant validation or backend ownership.

All schema changes must use immutable migrations. Tenant-owned tables must use RLS once introduced. Service-role access may be used only in backend-controlled paths that validate application authorization and tenant ownership.

## Alternatives Considered

- Plain self-managed PostgreSQL only: strong portability and control, but less immediate support for local Supabase workflows and future managed platform capabilities.
- Supabase-only design using provider features everywhere: accelerates setup, but risks provider lock-in and accidental client-side access patterns.
- Document database: flexible schema, but weaker fit for immutable ledgers, relational ownership, constraints, RLS and accounting-style reconciliation.
- Multiple databases per tenant: strong physical isolation, but excessive operational complexity for the initial 500-1000 business target.

## Rationale

PostgreSQL supports transactions, constraints, row locks, advisory locks, `SKIP LOCKED`, indexes, JSON where appropriate and RLS. A Supabase-compatible setup aligns with the Blueprint while preserving the backend as the owner of business behavior.

## Positive Consequences

- Strong data integrity for ledgers, receipts, events and audit.
- Database-level tenant isolation through RLS.
- Reliable local and CI migration testing.
- Compatibility with Supabase tooling and managed deployment.
- Clear path for backup, restore and point-in-time recovery procedures.

## Negative Consequences and Tradeoffs

- RLS policies require careful testing and can be complex.
- PostgreSQL operational knowledge is required.
- Supabase service-role credentials are powerful and must be tightly controlled.
- Some provider features may need explicit portability review before adoption.

## Implementation Impact

- Add migration framework and migration tests.
- Use UUID internal identifiers and opaque public tokens where required.
- Add tenant references and constraints to tenant-owned tables.
- Add RLS policy harnesses before business tables are considered complete.
- Keep SQL functions documented, module-owned and tested.

## Security Impact

- RLS is mandatory for tenant-owned data.
- Service-role credentials must never be exposed to clients.
- Client-provided tenant identifiers must never be trusted.
- Backups and database credentials must follow least privilege and environment isolation.

## Testing Impact

- Clean database migration tests are required.
- Existing database upgrade tests are required.
- RLS denial tests are required for tenant-owned tables.
- Query plan checks are required for high-volume transactional and projection tables.
- Backup restore exercises are required before production readiness.

## Migration or Adoption Impact

Foundation migrations may create only cross-cutting infrastructure such as migration metadata, idempotency records, event outbox, event processing records and audit foundation where approved. Business tables belong to later module tasks.

## Related Blueprint Documents

- `docs/blueprint/05-system-architecture.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`
- `docs/blueprint/42-data-model-v1.md`
- `docs/blueprint/44-permission-matrix.md`

## Related Engineering Documents

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`

