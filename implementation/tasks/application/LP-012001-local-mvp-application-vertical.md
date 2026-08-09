# LP-012001 — Compose PostgreSQL-Backed Local MVP Application Vertical

- Task ID: LP-012001
- Category: Application integration
- Priority: P0 local MVP
- State: READY_FOR_MERGE
- Owner: Backend Application Agent
- Owning module: `services/api`
- Dependencies: LP-000009, LP-000010, LP-000016, LP-002003, LP-003003, LP-004003, LP-005014, LP-006014, LP-007006, LP-008005, LP-009005, LP-010003, LP-011003, ADR-012 (all complete/accepted)
- Required roles: independent Review, QA, and Security Agents

## Scope

Implement the minimum typed ports, PostgreSQL adapters, transaction context, composition root, authentication challenge/session persistence, and API-backed local scenario required by ADR-012.

## Out of scope

New product rules, new domains, external providers, deployment, production credentials, framework adoption, frontend work, and changes to authoritative domain calculations.

## Allowed files

- `services/api/src/application/**`
- `services/api/src/infrastructure/**`
- `database/migrations/20260809170000_create_authentication_session_persistence.sql`
- `database/tests/local-mvp-application.sql`
- `services/api/src/bootstrap/**`
- `services/api/src/server.ts`
- `services/api/package.json`, workspace lockfile
- `services/api/test/**`
- `implementation/mip/MIP-012-local-mvp-application-integration.md`
- `implementation/tasks/application/**`
- `implementation/evidence/LP-012001/**`

## Acceptance criteria

1. No route executes SQL or imports `pg` directly.
2. PostgreSQL adapters use typed ports and a shared transaction context.
3. Tenant context sets the repository’s approved RLS settings and rejects mismatched request ownership.
4. A local provider-neutral OTP/session flow persists challenge/session state and never logs secrets.
5. The real API and real PostgreSQL execute the approved Business → Brand → Program → Customer → Membership → Receipt → Reward/XP/Status → Redemption → Analytics scenario.
6. API-backed tests prove cross-tenant denial, idempotency, and redemption concurrency.

## Mandatory validation and recovery

Run frozen install, clean/upgrade/status/hash migration checks, repository gates, PostgreSQL repository/application tests, and API-backed end-to-end tests. Revert the isolated commit before merge; deployed database corrections use immutable forward-fix migrations.
