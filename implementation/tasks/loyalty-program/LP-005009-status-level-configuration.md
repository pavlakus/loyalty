# LP-005009 — Define Status Level Configuration

## Status
`DRAFT`

## Metadata
- Category: DOMAIN
- Priority: P0
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005003, LP-005004, LP-005008
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005009/`

## Objective
Define configurable Membership Status Levels without implementing Status Engine evaluation.

## Scope
Status level identity, display name, ordering, XP/visit qualification conditions, Benefit references, and optional maximum-downgrade policy only where represented by the Blueprint.

## Out of Scope
Membership Status state, upgrades/downgrades, Membership Years, Benefit granting, persistence, and RLS.

## Required Documents / Knowledge Package
MIP-005; `12-status-engine.md`; `33-domain-model-v2.md`; `43-api-contract.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/status-levels/**`; tests; this task file; evidence/status records.

## Forbidden Files
Status Engine, Membership, Benefit runtime, database/RLS, and Customer state.

## Acceptance Criteria
Levels have deterministic order; conditions are explicit; thresholds are valid; configuration cannot make Reward Point balance affect status; downgrade policy is not executed here.

## Mandatory Tests / UAT
Ordering, condition validation, duplicate levels, threshold boundaries, Benefit references, and Reward/XP separation tests.

## Deliverables / Rollback
Status configuration contracts and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
