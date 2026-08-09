# LP-005014 — Implement Loyalty Program Persistence and RLS

## Status
`DONE`

## Metadata
- Category: DATABASE
- Priority: P0
- Assigned role: Database Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-000009, LP-000016, LP-005004, LP-005012, LP-005013
- Reviewers: Independent Database Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005014/`

## Objective
Persist Program configuration and enforce tenant isolation only after the approved migration and CI foundations are available.

## Scope
Immutable migrations, Program/configuration/version tables, constraints, indexes, RLS, clean/upgrade migration tests, and recovery documentation.

## Out of Scope
Application execution engines, Customer/Membership state, deployment credentials, and changing LP-000009/LP-000016 scope.

## Required Documents / Knowledge Package
MIP-005; ADR-010; `42-data-model-v1.md`; `17-security.md`; `44-permission-matrix.md`; LP-000009 and LP-000016 evidence.

## Allowed Files
`database/migrations/**`; `services/api/src/modules/loyalty-program/persistence/**`; database/RLS tests; this task file; evidence/status records.

Clarified allowed test and policy paths: `database/policies/**`; `database/tests/**`; `tests/migration/**`; `tests/security/**`; `tests/integration/**` only for Loyalty Program persistence/RLS scenarios.

## Forbidden Files
LP-000009/LP-000016 implementation, secrets, unrelated schemas, and history rewrites.

## Acceptance Criteria
Blocked until both declared foundations are DONE; then migrations are immutable, tenant isolation is proven, clean/upgrade tests pass, and rollback is forward-fix only.

## Mandatory Tests / UAT
Clean migration, upgrade migration, RLS allow/deny matrix, cross-tenant rejection, migration immutability/hash, and failure recovery.

## Deliverables / Rollback
Migration/persistence/RLS implementation and evidence. Rollback uses forward-fix; deployed migrations are never edited.

## Definition of Done
Only after dependencies, review, QA, Security, merge, and post-merge validation are complete.
