# LP-005010 — Define Benefit Definitions and Configuration

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
- Evidence: `implementation/evidence/LP-005010/`

## Objective
Define Program-owned Benefit Definitions referenced by Status Levels and future Benefit granting.

## Scope
Benefit identity, name/type/description fields justified by the Blueprint, eligibility/reference metadata, effective version linkage, and configuration validation.

## Out of Scope
Granted/active/redeemed Benefit state, Membership state, delivery, redemption, persistence, and RLS.

## Required Documents / Knowledge Package
MIP-005; `33-domain-model-v2.md`; `12-status-engine.md`; `43-api-contract.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/benefits/**`; tests; this task file; evidence/status records.

## Forbidden Files
Benefit lifecycle execution, Membership, Reward Engine, database/RLS, and UI.

## Acceptance Criteria
Definitions are distinct from granted Benefits; references are stable; invalid/ambiguous definitions are rejected; no Customer-specific state is embedded.

## Mandatory Tests / UAT
Definition validation, identity immutability, duplicate handling, reference integrity, and separation from granted state.

## Deliverables / Rollback
Benefit definition contracts and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
