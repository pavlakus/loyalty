# ADR-010: Database Migration and Runtime Architecture

## Status

Accepted

## Date

2026-07-29

## Decision Owner

Solution Architect

## Context

LP-000009 is blocked because the repository selects PostgreSQL and a Supabase-compatible deployment approach, but does not select a migration runner, a Node.js database access layer, or the minimum database environment contract.

The decision must preserve:

- ADR-003: PostgreSQL is the system of record and migrations are immutable;
- portable PostgreSQL-first database design;
- the existing Node.js/TypeScript monorepo;
- the LP-000009 scope of `database/migrations/**`, `scripts/database/**` and `database/README.md`;
- backend ownership of business behavior;
- future tenant isolation, RLS, transactional outbox and idempotency work;
- local, CI and managed Supabase-compatible operation without exposing database credentials to clients.

This ADR is an architecture proposal only. It does not add dependencies, migrations, environment files or runtime code.

## Decision

Adopt the following architecture if this ADR is accepted:

1. Use `node-pg-migrate` as the repository migration runner.
2. Store canonical migration files under `database/migrations/`.
3. Use plain PostgreSQL SQL as the migration language wherever practical, with the runner providing ordering, history, locking and execution. Migration modules may contain only the minimal runner glue required to execute reviewed SQL.
4. Use `node-postgres` (`pg`) as the backend runtime database driver.
5. Keep migrations and runtime access separate: the migration runner owns schema change execution; the runtime driver owns application queries and transactions.
6. Use Supabase CLI with Docker for local Supabase-compatible PostgreSQL development and inspection, but do not make the Supabase CLI migration directory a second schema authority.
7. Use one server-only `DATABASE_URL` variable as the database connection contract. Do not introduce Supabase client variables, service-role variables or pool-tuning variables in LP-000009.
8. Run migrations as an explicit CI/release step, never implicitly during application startup.

This choice preserves the current repository layout and PostgreSQL portability while remaining compatible with a later managed Supabase deployment.

## Migration Framework Evaluation

### Supabase CLI migrations

Advantages:

- first-party fit with the accepted Supabase-compatible platform direction;
- local stack, migration creation, reset, list, push and database testing in one tool;
- migration history is tracked in `supabase_migrations.schema_migrations`;
- good developer experience for Docker-based local development and Supabase deployment.

Disadvantages:

- the documented project convention is `supabase/migrations/`, while LP-000009 already scopes canonical files to `database/migrations/**`;
- introduces Supabase project configuration and CLI lifecycle into the repository even when the database is self-hosted PostgreSQL;
- the CLI is a provider-oriented operational surface rather than a small Node-native library;
- using it as a second authority beside `database/migrations/` would create migration drift.

Operational complexity is low for a Supabase-first project and moderate for a portable PostgreSQL project. CI compatibility is good when the CLI and Docker are available. Rollback is primarily forward-fix based; local reset is destructive and must not be used for production. Developer experience is excellent for Supabase users. Compatibility with ADR-003 is good, but compatibility with the current LP-000009 path is poor without changing the task scope.

Recommendation: use for local Supabase orchestration and inspection, not as the canonical migration authority.

### Flyway

Advantages:

- mature versioned SQL migration model;
- checksum-backed history and strong immutability discipline;
- broad database and CI/CD support;
- explicit baseline, validate and repair operations.

Disadvantages:

- adds a JVM/Java operational tool to a Node/TypeScript monorepo;
- introduces a second runtime and configuration model for a foundation task;
- undo migrations are optional and do not remove the need for forward-fix planning;
- more deployment packaging and local setup than the current repository needs.

Operational complexity is moderate. CI/CD compatibility is strong, production safety is strong when validation and repair are controlled, and developer experience is weaker for a Node-native team. It is PostgreSQL-compatible and portable, but not repository-native.

Recommendation: reject for the initial foundation; reconsider only if a later platform-wide database operations requirement justifies a JVM tool.

### Liquibase

Advantages:

- mature change-set history, checksums, preconditions, tags and rollback model;
- supports SQL and modeled changelogs;
- strong governance and audit capabilities.

Disadvantages:

- adds JVM tooling and a larger operational model;
- modeled changelogs introduce another representation of database intent;
- SQL rollback must be authored and maintained explicitly;
- disproportionate complexity for the current empty/foundation database.

Operational complexity is high relative to this repository stage. CI/CD and production safety are strong, but developer experience and repository fit are weaker than a Node-native tool.

Recommendation: reject for the initial foundation.

### Prisma Migrate

Advantages:

- strong TypeScript developer experience;
- committed SQL migration history;
- clear development and production commands (`migrate dev`, `migrate deploy`, `migrate status`);
- good CI integration when Prisma schema is the intended schema authority.

Disadvantages:

- makes the Prisma schema a second architectural commitment;
- the repository has not selected Prisma as its runtime or data-modeling layer;
- generated migrations and Prisma conventions can obscure PostgreSQL-specific ownership if not tightly governed;
- introduces an ORM/schema generator before domain data models exist.

Operational complexity is moderate. CI/CD compatibility is good, and production deployment is well-defined, but migration safety depends on disciplined schema history and review. It is maintainable in a Prisma application, not in the current driver-first foundation.

Recommendation: reject until a separate ADR selects Prisma as the platform data-access authority.

### Drizzle Kit

Advantages:

- TypeScript-native workflow;
- generated SQL migrations and direct migration execution;
- good fit for teams that want a typed schema definition;
- can support custom SQL where generation is insufficient.

Disadvantages:

- makes a Drizzle schema representation an additional source of truth;
- couples migration generation and runtime choices more tightly than this foundation requires;
- generated SQL still requires review for PostgreSQL features, data changes and tenant/RLS behavior;
- the repository has not selected Drizzle ORM.

Operational complexity is moderate. CI/CD compatibility is good. Production safety is acceptable with reviewed SQL and immutable history, but repository fit is lower than a migration runner that does not require an ORM schema.

Recommendation: reject until a separate ADR selects Drizzle as the data-access and schema authority.

### Knex migrations

Advantages:

- Node-native and mature;
- supports migration files, transactions and PostgreSQL;
- can be used with or without Knex query building;
- easy to run from workspace scripts.

Disadvantages:

- migration files are commonly JavaScript/TypeScript builders rather than reviewed SQL;
- adds a broad query-builder surface when LP-000009 only needs migrations;
- migration locking, naming and operational conventions would need to be standardized locally;
- does not improve compatibility with Supabase beyond PostgreSQL compatibility.

Operational complexity is low to moderate. CI/CD compatibility is good and developer experience is familiar to Node teams. Production safety depends more on repository conventions than on the tool’s migration model.

Recommendation: reject in favor of the narrower `node-pg-migrate` choice.

### `node-pg-migrate`

Advantages:

- Node-native and compatible with the existing TypeScript monorepo;
- supports a repository-selected migration directory, migration ordering, migration history and a PostgreSQL connection URL;
- supports transaction-wrapped migration execution and migration locking without adding an ORM schema authority;
- can run from `scripts/database/**` and use the exact LP-000009 layout;
- keeps PostgreSQL SQL and provider portability visible in code review;
- easy to exercise against local Supabase PostgreSQL and ephemeral CI PostgreSQL.

Disadvantages:

- smaller ecosystem and fewer enterprise governance features than Flyway or Liquibase;
- migration authors must understand PostgreSQL and write safe changes;
- down migrations are not a substitute for data recovery or a production rollback plan;
- the repository must define naming, locking, checksum/immutability validation and destructive-change policy explicitly.

Operational complexity is low to moderate. CI/CD compatibility is strong through Node and pnpm. Production safety is strong enough for the foundation when migrations are immutable, reviewed, validated and run as a release gate. Developer experience is good because it uses the existing runtime and repository layout.

Recommendation: select as the canonical migration runner.

## Database Access and Runtime Evaluation

### `node-postgres` (`pg`)

`pg` is the recommended runtime driver. It is low-level, PostgreSQL-native, supports pooling and gives explicit transaction control. Its low abstraction level preserves backend ownership of SQL, locking, RLS context and transaction boundaries. The application must use one checked-out client for all statements in a transaction and release it in `finally` blocks.

Performance is predictable and avoids ORM query-generation overhead. Testing can use the same driver against local or ephemeral PostgreSQL. It is directly compatible with `node-pg-migrate` and the repository’s PostgreSQL-first ADR.

### `postgres.js`

`postgres.js` offers a modern Node API, tagged SQL and transaction helpers with good developer ergonomics. It is a credible alternative, but it adds a different driver abstraction from the migration recommendation and has less direct continuity with the repository’s existing architectural language. It should not be introduced without a separate driver decision.

### Supabase client

The Supabase client is rejected as the backend foundation driver. It is useful for provider APIs, but using it for authoritative backend database access would couple runtime behavior to provider-specific APIs and can encourage service-role or client-exposed access patterns. PostgreSQL remains the system of record and the backend must own authorization, tenant validation and transaction boundaries.

### Kysely

Kysely is a strong typed query builder with PostgreSQL dialects and migration primitives. It could be introduced later if typed query composition materially improves a domain module. Selecting it now would add a query-builder schema/type layer before the platform has an approved database model, so it is not part of LP-000009.

### Drizzle ORM

Drizzle provides typed schema and query capabilities, but selecting it would couple runtime access and migration generation to a new schema authority. That is explicitly deferred until a separate architecture decision is justified.

### Repository-native custom access layer

A thin repository-owned adapter around `pg` is recommended. It should expose pool creation, health checks, transaction execution and shutdown, while keeping SQL and domain repositories in their owning modules. A custom migration engine is not recommended; the adapter must not duplicate migration history or execution semantics.

## Environment Contract

This contract is proposed for the database foundation and is separate from the already accepted initial application contract in ADR-009.

| Variable | Visibility | Required | Type / format | Default | Validation | Production | Development | CI |
|---|---|---|---|---|---|---|---|---|
| `DATABASE_URL` | Server-only; secret-bearing | Required in production and CI; optional only for local development fallback | PostgreSQL URL accepted by `pg`; credentials URL-encoded; no client exposure | In development only, if absent, use the documented local Supabase URL `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Parse as a PostgreSQL URL; require host, database and credentials as appropriate; reject unsupported schemes; reject loopback/default credentials outside development; require TLS mode in production | Must be supplied by the deployment secret manager; must use a non-loopback host and TLS; never commit or log the value | May be omitted when local Supabase is running; the local fallback is development-only and must never be used for shared or production data | Must be explicitly supplied for an ephemeral CI database; no fallback and no committed credentials |

No client/public database variables are approved. No `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, pool-size, password, host or port variables are introduced by this ADR. The single URL keeps the contract minimal and allows provider-specific connection details to remain deployment-managed.

`NODE_ENV` remains governed by ADR-009. Database configuration validation must not weaken its production requirement or expose database values through configuration endpoints, logs, error envelopes or client bundles.

## Local Development

Use Supabase CLI and a Docker-compatible runtime for the local PostgreSQL environment:

1. Install the pinned project-local Supabase CLI.
2. Run `supabase start` for the local stack.
3. Resolve the local database URL from the CLI output or the documented development fallback.
4. Run the repository migration command against that URL.
5. Run `supabase db reset` only for local destructive rebuilds, followed by migration and seed verification.
6. Run application and database tests against the local instance.
7. Stop the stack when not in use; local data is disposable.

The migration authority remains `database/migrations/` and the repository scripts. Supabase CLI is the local PostgreSQL/container provider, not a second migration source.

## CI Strategy

CI shall:

1. Provision an ephemeral PostgreSQL service or isolated Supabase-local database.
2. Set `DATABASE_URL` through the CI secret/service environment, never through a committed file.
3. Run migration status and apply all committed migrations from a clean database.
4. Run migration immutability/order checks.
5. Run database and application tests in the same isolated job or explicitly isolated database.
6. Collect migration logs and test results as evidence.
7. Destroy the ephemeral database/container after the job, including on failure.

CI must test both clean creation and upgrade from the immediately previous migration baseline. CI must not run against shared development or production databases.

## Production Deployment and Recovery

- Migrations run in a dedicated, serialized release step before application rollout.
- The release job uses the pinned repository Node/pnpm toolchain and `DATABASE_URL` from the production secret manager.
- Application deployment proceeds only after migration success and health verification.
- Migrations must be backward-compatible with the currently deployed application during rolling deployment whenever possible.
- Applied migration files are immutable. Corrections use a new forward migration, never editing or deleting an applied file.
- Destructive or long-running changes require an explicit migration plan, backup verification, lock/timeout plan and staged expand/contract rollout.
- A transaction failure rolls back the failed transactional migration. Non-transactional PostgreSQL operations require a task-specific recovery or forward-fix procedure.
- Database restore is a recovery operation, not the normal rollback mechanism. Backups and point-in-time recovery remain deployment/platform responsibilities and must be verified before production changes.
- A failed migration blocks application rollout and leaves the failure visible in release evidence. It must not be silently retried by every application instance.

## Consequences

### Positive

- Keeps the repository’s existing `database/migrations/**` scope.
- Avoids introducing Prisma or Drizzle as premature schema authorities.
- Uses the existing Node/TypeScript toolchain for both migration scripts and runtime access.
- Preserves PostgreSQL portability and Supabase compatibility.
- Uses one minimal server-only connection contract.
- Supports clean, upgrade, immutability and CI isolation tests required by LP-000009.

### Negative and trade-offs

- The team owns SQL review discipline, migration naming and recovery conventions.
- `node-pg-migrate` does not remove the need for database-specific operational expertise.
- Supabase CLI and Docker remain local development prerequisites, although production runtime is not coupled to the Supabase client.
- A future typed query builder may require a separate ADR and adapter boundary.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Editing an applied migration | Schema drift and unreproducible deployments | CI immutability/checksum validation; new migration for every correction |
| Concurrent migration execution | DDL conflict or partial rollout | Serialized release job; retain runner locking; prohibit application-startup migrations |
| Destructive migration | Data loss or incompatible rolling deployment | Expand/contract pattern, backup/PITR verification, staged rollout and explicit recovery plan |
| Database URL leakage | Credential compromise | Server-only validation, secret manager injection, redacted logs, no client config export |
| Local/CI drift | False confidence | Clean reset and upgrade tests on isolated PostgreSQL instances |
| Supabase provider coupling | Migration portability loss | PostgreSQL SQL-first migrations; Supabase CLI limited to local/operational tooling |
| Pool misuse | Connection exhaustion or broken transactions | One process pool, bounded defaults, checked-out client transaction helper, release in `finally` |
| Missing RLS coverage in later tables | Cross-tenant data exposure | Tenant-owned tables require RLS and security tests in their owning tasks; LP-000009 creates no business tables |

## Implementation Impact

If accepted, LP-000009 must:

- add the pinned `node-pg-migrate` development dependency and scripts;
- create `database/migrations/` with migration naming and immutability rules;
- create the migration runner wrapper under `scripts/database/`;
- add database URL validation using the approved environment contract;
- add local Supabase/Docker setup documentation without committing secrets;
- add clean, upgrade, order/immutability and failure-path tests;
- document production execution, rollback/recovery and backup expectations;
- keep the first migration limited to approved cross-cutting foundation structures;
- not add business tables, tenant behavior, authentication, Supabase client access or public database configuration.

The LP-000009 task specification must add `ADR-010` as an accepted dependency after approval and should explicitly include `DATABASE_URL` and the selected runner in its allowed scope.

## Rejected Alternatives Summary

- Supabase CLI as canonical migration authority: rejected because it conflicts with the existing `database/migrations/**` scope and would add a second provider-oriented source boundary.
- Flyway: rejected because JVM tooling is disproportionate to the Node monorepo.
- Liquibase: rejected because its governance/modeling surface is excessive for the foundation stage.
- Prisma Migrate: rejected because Prisma schema would become an unapproved source of truth.
- Drizzle Kit: rejected for the same premature schema-authority coupling.
- Knex: rejected because a broad query builder is unnecessary for migration-only work.
- Custom migration engine: rejected because it duplicates mature migration semantics and increases operational risk.
- Supabase client for runtime queries: rejected because it weakens provider portability and backend ownership boundaries.
- `postgres.js`, Kysely or Drizzle ORM at runtime: deferred pending a separate runtime data-access ADR.

## Adoption and Approval

This ADR has been accepted by the authorized Solution Architect. Acceptance is subject to the following implementation clarifications:

- The local `DATABASE_URL` fallback is permitted only when `NODE_ENV=development`; it is forbidden in test, CI, production and unknown environments.
- LP-000009 must not introduce pool-tuning environment variables or undocumented production pool sizing. It must use bounded, documented driver defaults unless later repository evidence requires a separate decision.
- Database URLs and credentials must be redacted from logs, errors, evidence, health endpoints and configuration output.
- Migration status and failure output may identify migration names, but must never expose the connection string.

Acceptance is followed by:

1. updating LP-000009 dependencies and preparation evidence;
2. re-running Task Preparation;
3. moving LP-000009 to `READY` only after its exact scope and validation requirements are synchronized;
4. implementing the approved architecture through the normal lifecycle.

## References

Repository references:

- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-009-initial-environment-variable-contract.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `implementation/tasks/platform-foundation/LP-000009-create-database-migration-framework.md`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`

External technical references:

- [Supabase CLI reference](https://supabase.com/docs/reference/cli/overview)
- [Supabase local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Flyway versioned migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)
- [Liquibase rollback](https://docs.liquibase.com/oss/reference-guide-4-33/init-update-and-rollback-commands/rollback)
- [Prisma Migrate](https://docs.prisma.io/docs/orm/prisma-migrate)
- [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)
- [node-postgres pooling](https://node-postgres.com/features/pooling)
- [node-postgres transactions](https://node-postgres.com/features/transactions)
- [Kysely](https://www.kysely.dev/)
- [node-pg-migrate](https://salsita.github.io/node-pg-migrate/)

