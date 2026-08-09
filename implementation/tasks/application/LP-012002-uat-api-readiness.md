# LP-012002 — UAT-Ready Authenticated Tenant-Aware Loyalty API

- Task ID: LP-012002
- Category: Application integration / UAT readiness
- Priority: P0
- State: IN_PROGRESS
- Owner: Backend Application Agent
- Owning module: `services/api`
- Dependencies: LP-012001, all completed persistence tasks, ADR-012
- Required roles: independent Review, QA, Security

## Scope

Add the minimum authenticated UAT command/query surface, tenant context validation, Customer purpose-scoped PostgreSQL access, deterministic non-production UAT fixtures, and a real PostgreSQL API acceptance test for the completed Loyalty vertical.

## Out of scope

New product rules/domains, commercial OTP provider selection, UI, deployment, monitoring, advanced analytics, and production release configuration.

## Allowed files

- `services/api/src/application/**`
- `services/api/src/infrastructure/**`
- `services/api/src/bootstrap/**`
- `services/api/test/**`
- `database/migrations/20260809180000_create_customer_purpose_scoped_access.sql`
- `database/tests/uat-api-readiness.sql`
- `implementation/mip/MIP-012-uat-api-readiness.md`
- `implementation/tasks/application/**`
- `implementation/evidence/LP-012002/**`
- `implementation/TASK-STATUS.md`

## Acceptance criteria

1. Normal `/api/v1/v1/uat/**` commands and queries do not call SQL from routes.
2. Session and UAT actor context are validated centrally; request Business IDs are not authorization proof.
3. Customer access is purpose-scoped and cross-Business access is denied by PostgreSQL policy and application checks.
4. UAT OTP mode is explicit, non-production-only, and cannot be enabled in production.
5. The complete authenticated API flow passes against real PostgreSQL without `/api/v1/local-mvp/scenario`.
6. Replays are idempotent and unauthorized cross-Business access fails.

## Validation and recovery

Run frozen install, build, lint, typecheck, tests, FCR, clean/upgrade migration checks, API UAT integration tests, tenant isolation tests, and `git diff --check`. Revert through an immutable forward migration if required.
