# LP-003002 — Define Business API Contracts

## Status
`QA`

## Role and Scope
- Category: CONTRACT
- Assigned role: Backend Developer Agent
- Owning module: `business`
- Source: `implementation/mip/MIP-003-business.md`

Define typed, runtime-validatable contracts for the approved Business commands and queries. This task does not implement routes, persistence, authentication, RLS, or database behavior.

## Dependencies
- LP-000007 — Standard API response and error contracts
- LP-003001 — Business aggregate

## Approved Contract Surface
- `POST /api/v1/businesses`
- `GET /api/v1/businesses/{id}`
- `PATCH /api/v1/businesses/{id}`
- `POST /api/v1/businesses/{id}/activate`
- `POST /api/v1/businesses/{id}/suspend`
- Business command/query request and response types matching MIP-003.

## Exclusions
- HTTP route/controller implementation;
- database schema, migrations, persistence, RLS;
- authentication/authorization enforcement;
- Brand, Customer, Membership, Loyalty Program, Reward, or transaction contracts;
- unapproved fields or business rules.

## Allowed Files
```text
packages/api-contracts/src/business.ts
packages/api-contracts/src/index.ts
packages/api-contracts/test/business*.test.mjs
implementation/evidence/LP-003002/**
implementation/TASK-STATUS.md
implementation/tasks/business/LP-003002-define-business-api-contracts.md
```

## Review and Tests
- Review: Solution Architect
- QA: QA Agent
- Security: Security Agent
- Tests: runtime validation, stable envelopes/errors, tenant identifier boundaries, and contract determinism.

## Acceptance Criteria
- Contracts match MIP-003 and LP-003001 ownership.
- Runtime validation rejects malformed inputs and unknown fields where applicable.
- No authentication, tenant authorization, persistence, or route behavior is claimed.
- Focused tests, documentation, review, QA, Security, merge, and post-merge evidence pass.

## Rollback
Remove only the Business contract files and evidence; no deployed state is affected.
