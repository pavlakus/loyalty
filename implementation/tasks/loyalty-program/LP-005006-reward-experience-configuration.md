# LP-005006 — Define Reward Experience Configuration

## Status
`DRAFT`

## Metadata
- Category: DOMAIN
- Priority: P1
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005003, LP-005004
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005006/`

## Objective
Define approved Standard and Surprise Reward Experience configuration.

## Scope
Typed Standard/Surprise options, maximum unopened opportunities, Reward Pool references, probability settings, expiration, validation, and version linkage as specified by the API contract.

## Out of Scope
Random reward execution, campaigns, notifications, Customer state, Reward Pools implementation, persistence, and RLS.

## Required Documents / Knowledge Package
MIP-005; `43-api-contract.md`; `31-instant-rewards.md`; `32-strategy-templates.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/reward-experience/**`; tests; this task file; evidence/status records.

## Forbidden Files
Instant Reward execution, provider integrations, database/RLS, Customer/Membership.

## Acceptance Criteria
Only approved experience modes are accepted; probabilities are bounded and deterministic as configuration; expiration is explicit; no random or Customer-specific behavior is implemented.

## Mandatory Tests / UAT
Mode validation, probability bounds, required fields, expiration, and no-execution-side-effects tests.

## Deliverables / Rollback
Configuration contracts and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
