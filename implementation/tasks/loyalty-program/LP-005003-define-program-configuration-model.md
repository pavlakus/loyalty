# LP-005003 — Define Loyalty Program Configuration Model

## Status
`DRAFT`

## Metadata
- Category: DOMAIN
- Priority: P0
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005001
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005003/`

## Objective
Define the Program-owned configuration boundary without implementing execution engines.

## Scope
Define typed configuration sections for reward rules, reward experience, pending/expiration, XP rules, Status Levels, Benefits, strategy, and audit metadata. Keep configuration separate from execution and immutable history.

## Out of Scope
Configuration version persistence, migrations, RLS, Customer/Membership state, ledgers, reward calculation, status evaluation, and UI.

## Required Documents / Knowledge Package
MIP-005; `33-domain-model-v2.md`; `10-reward-engine.md`; `12-status-engine.md`; `32-strategy-templates.md`; `42-data-model-v1.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/configuration/**`; focused configuration tests; this task file; `implementation/evidence/LP-005003/**`; status records.

## Forbidden Files
Database/RLS, execution modules, Customer/Membership, and undocumented configuration fields.

## Acceptance Criteria
Configuration ownership and section boundaries are explicit; Reward Points and XP remain separate; presentation configuration cannot alter business rules; no speculative business category is introduced.

## Mandatory Tests / UAT
Configuration shape, section isolation, required-field validation, unknown-field rejection, and cross-aggregate ownership tests.

## Deliverables / Rollback
Typed configuration model and tests. Revert only configuration files/evidence.

## Definition of Done
Independent review, QA, required Security review, merge, post-merge validation, and evidence complete.
