# LP-005001 — Define Loyalty Program Aggregate and Lifecycle

## Status
`READY`

## Metadata
- Category: DOMAIN
- Priority: P0
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-004001
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005001/`

## Objective
Implement the Brand-owned Loyalty Program aggregate identity and lifecycle without persistence or Customer state.

## Scope
Define `id`, immutable `brandId`, `name`, `status`, `createdAt`, and `updatedAt`; use the repository identifier and UTC timestamp conventions; support the Blueprint lifecycle required for a Program to become available or stop accepting activity; emit only approved Program lifecycle facts.

## Out of Scope
Membership, Customer state, Reward/XP transactions, persistence, schema, RLS, APIs, UI, provider integrations, and configuration submodels.

## Required Documents / Knowledge Package
MIP-005; `33-domain-model-v2.md`; `03-business-rules.md`; `37-event-catalog.md`; `42-data-model-v1.md`; `43-api-contract.md`; `59-coding-standards.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/**`; `services/api/test/loyalty-program-aggregate.test.mjs`; this task file; `implementation/evidence/LP-005001/**`; `implementation/TASK-STATUS.md`.

## Forbidden Files
Database migrations, RLS, Customer/Membership/Reward/XP modules, root exports, Blueprint documents, and unrelated modules.

## Approved Lifecycle Decision

The Product Owner decision recorded in `docs/blueprint/26-product-decisions.md` defines `DRAFT`, `ACTIVE`, `SUSPENDED`, and `CLOSED`; the initial state is `DRAFT`; the allowed transition matrix is explicit; `CLOSED` is terminal; and suspension/closure preserve historical state. Settlement and cross-aggregate behavior remain out of scope.

## Acceptance Criteria
- Program has exactly one immutable Brand owner.
- Lifecycle transitions and terminal behavior match the approved Program contract.
- No Customer-specific or ledger state is owned.
- Invalid identity, timestamps, and transitions are rejected deterministically.
- Focused tests and evidence are complete.

## Mandatory Tests / UAT
Aggregate construction, immutable `brandId`, lifecycle transition matrix, terminal state, invalid inputs, and tenant-boundary tests.

## Deliverables / Rollback
Typed aggregate, value objects, approved lifecycle events, and tests. Rollback removes only LP-005001 module/test/evidence files; no persisted state exists.

## Definition of Done
Implementation, independent review, QA, required Security review, merge, post-merge validation, and evidence are complete. No persistence claim is made.
