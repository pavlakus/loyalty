# LP-005002 — Define Loyalty Program API and Event Contracts

## Status
`DRAFT`

## Metadata
- Category: CONTRACT
- Priority: P0
- Assigned role: API Contract Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005001
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005002/`

## Objective
Define stable API and event contracts already named by the Blueprint for Program creation, lifecycle, strategy, and configuration.

## Scope
Document and type contracts for `POST /api/v1/brands/{brandId}/loyalty-program`, Program reads, strategy selection/acceptance, reward rules, reward experience, Status Levels, Benefit Definitions, and approved events `LoyaltyProgramCreated`, `LoyaltyProgramActivated`, `LoyaltyProgramDeactivated`, `StrategySelected`, `StrategyRecommendationGenerated`, `StrategyAccepted`, and `StrategyConfigurationChanged`.

## Out of Scope
HTTP controller implementation, persistence, RLS, provider behavior, Membership, execution engines, and new event names.

## Required Documents / Knowledge Package
MIP-005; `37-event-catalog.md`; `43-api-contract.md`; `33-domain-model-v2.md`; `90-agent-response-contract.md`.

## Allowed Files
`packages/api-contracts/**`; `packages/event-contracts/**`; `services/api/src/modules/loyalty-program/contracts/**`; contract tests; this task file; `implementation/evidence/LP-005002/**`; status records.

## Forbidden Files
Database, RLS, deployment, Customer/Membership runtime, and Blueprint changes.

## Acceptance Criteria
Contracts use `/api/v1`, stable envelopes, tenant context, correlation/causation IDs, versioned past-tense events, and no unnecessary personal data. Repeated Brand Program creation is represented as existing/conflict behavior.

## Mandatory Tests / UAT
Contract shape, event versioning, tenant context, invalid payload, and no-secret/no-personal-data tests.

## Deliverables / Rollback
Typed contracts, event definitions, and tests. Revert only contract files/evidence; no database rollback is required.

## Definition of Done
Review, QA, Security where required, merge, post-merge validation, and evidence complete.
