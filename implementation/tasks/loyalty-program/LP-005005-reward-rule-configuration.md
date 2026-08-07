# LP-005005 — Define Reward Rule Configuration

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
- Evidence: `implementation/evidence/LP-005005/`

## Objective
Define configuration for deterministic Reward Point earning without implementing the Reward Engine.

## Scope
Represent approved amount-interval/points-granted rules, validation, rule ordering, and configuration references. Preserve the Reward Engine boundary.

## Out of Scope
Calculating or posting points, receipts, ledgers, balances, redemption, multipliers not defined by the Blueprint, persistence, and RLS.

## Required Documents / Knowledge Package
MIP-005; `03-business-rules.md`; `10-reward-engine.md`; `43-api-contract.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/reward-rules/**`; focused tests; this task file; evidence/status records.

## Forbidden Files
Reward Engine, ledger, Receipt, Membership, database, and RLS modules.

## Acceptance Criteria
Rules validate positive amounts/points, deterministic ordering, non-overlap where required, explicit version linkage, and no runtime points calculation occurs.

## Mandatory Tests / UAT
Valid/invalid intervals, ordering, overlap, zero/negative values, deterministic serialization, and boundary tests.

## Deliverables / Rollback
Rule value objects/contracts/tests. Revert only task files/evidence.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
