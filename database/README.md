# Database Foundation

LP-000009 establishes the repository migration boundary. It does not create business tables.

## Authority

- Canonical migrations: `database/migrations/*.sql`.
- Runner: pinned `node-pg-migrate` through `scripts/database/migrate.mjs`.
- Runtime driver contract: `node-postgres` (`pg`), to be used by later backend database tasks.
- Local PostgreSQL orchestration: Supabase CLI with Docker only.

Applied migration files are immutable. Edit an applied migration only by creating a new forward migration; never rewrite migration history.

## Commands

```text
pnpm db:migrate:check
NODE_ENV=development pnpm db:migrate
NODE_ENV=development pnpm db:migrate:status
```

The development fallback is used only when `NODE_ENV=development` and Supabase local PostgreSQL is running. Test, CI, production and unknown environments must provide `DATABASE_URL` explicitly. The value must never be logged, included in evidence, returned by health endpoints or exposed to clients.

## Local workflow

1. Install the project-pinned Supabase CLI and run `supabase start`.
2. Run `NODE_ENV=development pnpm db:migrate`.
3. Run database and application tests.
4. Use `supabase db reset` only for disposable local rebuilds.

## CI and release workflow

CI provisions an isolated PostgreSQL database and supplies `DATABASE_URL`. It runs `db:migrate:check`, applies migrations from a clean database, validates upgrade behavior and then runs tests. The database is destroyed after the job.

Production migrations run once in a serialized release step before application rollout. Application startup never runs migrations. A failed migration blocks rollout. Transactional failures roll back with the database transaction; non-transactional or destructive changes require a documented forward fix or approved recovery procedure.

Migration output may contain migration names and status, but must not contain connection strings, passwords or credentials.
