# LP-012002 Independent Review

- Task: LP-012002 — UAT-ready authenticated tenant-aware Loyalty API
- Phase: Review
- Role: Independent Review Agent
- Reviewed commit: `abcefd3d280868556d41fd52d0681225b8401d08`
- Reviewed branch: `agent/backend/LP-012002-uat-api-readiness`
- Date: 2026-08-09

## Documents and artifacts reviewed

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- LP-012002 task specification and MIP-012
- ADR-012 application persistence/composition boundary
- implementation evidence and committed diff from `f37a521` through `abcefd3`
- UAT API integration test and Customer purpose-scoped migration/test
- authentication, persistence, domain, RLS, idempotency, and redemption implementations

## Positive validation

- Dedicated UAT routes exist for the validated Business, Brand, Program, Customer, Membership, Receipt, Reward, XP/Status, Account, Redemption, and Analytics paths.
- The UAT integration test does not call `/api/v1/local-mvp/scenario`.
- The normal receipt path performs its own transaction and uses the approved receipt, ledger, XP, and analytics database functions.
- Session and UAT actor resolution are centralized, and Customer purpose-scoped RLS is present.

## Findings

### P1 — PostgreSQL adapter boundary is violated

- Location: `services/api/src/application/uat-api-service.ts`, all `transactions.withTransaction(... db.query(...))` operations.
- Impact: The application service owns raw SQL and row-shape mapping, contrary to ADR-012 and the LP-012002 allowed composition boundary. This makes authorization/query behavior difficult to review as repository policy and bypasses the required repository-port abstraction.
- Required correction: Introduce typed UAT repository/application ports and move SQL, row mapping, database constraint translation, and transaction-specific persistence queries into `services/api/src/infrastructure/postgres/**` adapters. Keep orchestration and domain calls in the application service.

### P1 — API validation and canonical error mapping are bypassed

- Location: `services/api/src/bootstrap/create-application.ts`, UAT route handlers; `services/api/src/application/uat-api-service.ts`, input methods.
- Impact: Request payloads are cast directly without runtime validation, and the route-level catch converts all failures to generic `403`. This violates the API/FCR contract, can misclassify validation/database/security failures, and prevents stable client error behavior.
- Required correction: Add runtime validators using the existing API contract/FCR conventions, reject unknown or malformed fields before application execution, and map typed domain/application/database errors to canonical FCR responses with appropriate status codes. Do not expose raw SQL or credential data.

## Decision

`CHANGES_REQUIRED`. These P1 findings block Review approval and therefore block QA, Security, READY_FOR_MERGE, and merge.

## Correction review — APPROVED

- Reviewed commit: `8eace7b6e7b237a0b3ec7988a202a529b19ac4bd`
- Date: 2026-08-09
- The application service now depends on the typed `UatRepositoryPort`; no SQL, `pg`, transaction-manager, or infrastructure imports remain in the application service. SQL and row mapping are owned by `PostgresUatRepository`.
- The UAT routes now perform strict body/query validation, reject undeclared fields, use canonical success/error envelopes, and map authentication, authorization, not-found, conflict, validation, and unexpected errors without leaking internals.
- Boundary and contract tests are present and passed. The normal UAT API test remains independent of `/api/v1/local-mvp/scenario`.
- No new P1/P2 findings identified. The two prior P1 findings are resolved within LP-012002 scope.

## Decision

`APPROVED`. Transition `REVIEW -> QA`.
