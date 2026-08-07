# LP-005007 — Define Pending Period and Point Expiration Configuration

## Status
`DRAFT`

## Metadata
- Category: DOMAIN
- Priority: P0
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005003, LP-005004
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005007/`

## Objective
Define Program policy for Pending Points and expiration.

## Scope
Pending days and the approved No Expiration, Rolling Expiration, and Fixed Calendar Expiration policy contracts with validation and version linkage.

## Out of Scope
Timers, release/expiration jobs, transactions, ledger mutation, database, RLS, and Customer state.

## Required Documents / Knowledge Package
MIP-005; `03-business-rules.md`; `10-reward-engine.md`; `43-api-contract.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/reward-policy/**`; tests; this task file; evidence/status records.

## Forbidden Files
Reward Engine execution, ledger, jobs, migrations, RLS, and unrelated modules.

## Acceptance Criteria
Pending duration is explicit and non-negative; each expiration model validates its required fields; policy does not alter immutable history; no clock or job side effects exist in this task.

## Mandatory Tests / UAT
Boundary durations, all expiration modes, invalid dates, timezone/calendar validation, serialization, and policy immutability tests.

## Deliverables / Rollback
Policy contracts and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
