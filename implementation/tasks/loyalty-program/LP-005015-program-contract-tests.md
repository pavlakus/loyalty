# LP-005015 — Add Loyalty Program Domain, API, and Security Contract Tests

## Status
`DRAFT`

## Metadata
- Category: TEST
- Priority: P0
- Assigned role: QA/Test Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005002, LP-005012, LP-005013
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005015/`

## Objective
Provide executable non-persistence regression and security coverage for the Program baseline.

## Scope
Domain, contract, invariants, tenant-boundary, privacy, idempotency, concurrency contract, event, and error tests for completed non-persistence tasks.

## Out of Scope
Production database/RLS tests until LP-005014 is unblocked, UI, load testing, and unrelated modules.

## Required Documents / Knowledge Package
MIP-005; all preceding LP-005 task specs/evidence; `55-module-definition-of-done.md`; `56-uat-scenarios.md`.

## Allowed Files
`services/api/test/loyalty-program-*.test.mjs`; `packages/*/test/**` for Program contracts; this task file; evidence/status records.

## Forbidden Files
Production behavior changes, migrations, unrelated test baselines, and bypasses/mocks that claim production coverage.

## Acceptance Criteria
Mandatory tests run truthfully; deferred database/RLS coverage is explicitly identified; no test weakens tenant, privacy, immutability, or security guarantees.

## Mandatory Tests / UAT
All scoped domain/API/event/security tests, negative paths, race contracts, and UAT scenarios applicable without persistence.

## Deliverables / Rollback
Focused tests and evidence. Revert only test/evidence files.

## Definition of Done
Review, QA, Security, merge, post-merge validation, and evidence complete.
