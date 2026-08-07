# LP-005004 — Implement Configuration Versioning and Effective History

## Status
`DRAFT`

## Metadata
- Category: DOMAIN
- Priority: P0
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005003
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005004/`

## Objective
Provide deterministic version identity and effective-date semantics for Program configuration where historical decisions require the applicable version.

## Scope
Define immutable configuration version records, monotonic versioning, effective timestamps, active-version selection, and historical lookup contracts without persistence implementation.

## Out of Scope
Database schema/migrations, RLS, deployment, ledger replay, and changing historical transactions.

## Required Documents / Knowledge Package
MIP-005; `42-data-model-v1.md`; `10-reward-engine.md`; `12-status-engine.md`; `43-api-contract.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/configuration/**`; versioning tests; this task file; `implementation/evidence/LP-005004/**`; status records.

## Forbidden Files
Migrations, persistence, RLS, ledger/history mutation, and unrelated modules.

## Acceptance Criteria
Identical configuration yields deterministic version identity; versions are immutable; effective lookup is deterministic; historical references remain resolvable; no in-place edit is permitted.

## Mandatory Tests / UAT
Version ordering, effective boundary timestamps, immutability, duplicate version, historical lookup, and concurrent command contract tests.

## Deliverables / Rollback
Versioning domain contracts and tests. Revert only non-persisted code/evidence.

## Definition of Done
Independent review, QA, Security where required, merge, post-merge validation, and evidence complete.
