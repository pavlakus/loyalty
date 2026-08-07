# LP-005012 — Implement Loyalty Program Validation and Invariants

## Status
`DRAFT`

## Metadata
- Category: DOMAIN
- Priority: P0
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005004, LP-005005, LP-005006, LP-005007, LP-005008, LP-005009, LP-005010, LP-005011
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005012/`

## Objective
Compose Program aggregate validation across configuration sections without moving execution logic into the Program.

## Scope
Cross-section invariants, required version references, lifecycle/configuration compatibility, deterministic validation errors, and safe command boundaries.

## Out of Scope
Persistence, RLS, Reward/XP/Status/Benefit execution, Membership, and API controllers.

## Required Documents / Knowledge Package
MIP-005 and all prior LP-005001–LP-005011 task evidence; relevant Blueprint rules.

## Allowed Files
`services/api/src/modules/loyalty-program/**`; validation tests; this task file; evidence/status records.

## Forbidden Files
Database/RLS, unrelated modules, and Blueprint changes.

## Acceptance Criteria
Invalid cross-section configuration is rejected before activation; errors are typed and privacy-safe; no partial configuration state is accepted; aggregate ownership remains intact.

## Mandatory Tests / UAT
Cross-section invalid combinations, activation gating, deterministic errors, concurrent validation contract, and tenant-context tests.

## Deliverables / Rollback
Composed validator and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
