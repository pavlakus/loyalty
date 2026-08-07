# LP-005011 — Define Strategy Selection and Recommendation Integration

## Status
`DRAFT`

## Metadata
- Category: CONTRACT
- Priority: P1
- Assigned role: Backend Developer Agent
- Owning module: `loyalty-program`
- Source: `implementation/mip/MIP-005-loyalty-program.md`
- Dependencies: LP-005002, LP-005003, LP-005005, LP-005006, LP-005008, LP-005009, LP-005010
- Reviewers: Independent Solution Architect, QA Agent, Security Agent
- Evidence: `implementation/evidence/LP-005011/`

## Objective
Define provider-neutral, explainable Strategy selection and recommendation contracts already specified by the Blueprint.

## Scope
Business objectives, industry/template input where already documented, recommendation output, explanation, accept/modify/replace behavior, and approved Strategy events.

## Out of Scope
AI implementation, hidden scoring, automatic activation, external providers, analytics, persistence, and new industry/business rules.

## Required Documents / Knowledge Package
MIP-005; `32-strategy-templates.md`; `43-api-contract.md`; `37-event-catalog.md`.

## Allowed Files
`services/api/src/modules/loyalty-program/strategy/**`; contract/tests; this task file; evidence/status records.

## Forbidden Files
AI services, provider integrations, database/RLS, and unapproved template behavior.

## Acceptance Criteria
Recommendations are optional, explainable, business-controlled, deterministic for identical input, and cannot silently change configuration. Acceptance emits only approved events.

## Mandatory Tests / UAT
Selection, recommendation explanation, accept/modify/replace, deterministic output, invalid input, and no-autonomous-activation tests.

## Deliverables / Rollback
Strategy contracts and tests. Revert only task artifacts.

## Definition of Done
Review, QA, required Security review, merge, post-merge validation, and evidence complete.
