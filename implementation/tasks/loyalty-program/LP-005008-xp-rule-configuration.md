# LP-005008 — Define XP Rule Configuration

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
- Evidence: `implementation/evidence/LP-005008/`

## Objective
Define Program-owned XP configuration while keeping XP separate from Reward Points.

## Scope
Typed XP rule definitions, visit/engagement condition references justified by the Blueprint, deterministic ordering, validation, and version linkage.

## Out of Scope
Awarding XP, XP ledger/account, Membership Year execution, Status evaluation, persistence, and RLS.

## Required Documents / Knowledge Package
MIP-005; `12-status-engine.md`; `33-domain-model-v2.md`; `42-data-model-v1.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/xp-rules/**`; tests; this task file; evidence/status records.

## Forbidden Files
XP Engine/account/ledger, Membership, database/RLS, and Reward Points code.

## Acceptance Criteria
XP rules are typed, deterministic, versioned, and independent from Reward Point rules; invalid thresholds and ambiguous conditions are rejected.

## Mandatory Tests / UAT
Valid/invalid thresholds, ordering, separation from Reward rules, version linkage, and deterministic serialization.

## Deliverables / Rollback
XP configuration contracts and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
