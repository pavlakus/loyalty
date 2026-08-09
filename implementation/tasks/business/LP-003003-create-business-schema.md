# LP-003003

## Title
Create Business schema

## Module
Business

## Status
READY

## Assigned Role
Database Agent

## Module Implementation Package
`implementation/mip/MIP-003-business.md`

## Dependencies
- LP-000009 (DONE)
- LP-003001 (DONE)

## Exact Scope
Create the immutable SQL-first PostgreSQL schema for the Business aggregate root: UUID identity, approved profile attributes, lifecycle constraints, ISO currency and IANA timezone storage, UTC timestamps, and optimistic versioning. The root remains the tenant boundary and must not own Customer rows. Business settings and administrator relationships are not required by the first persisted Loyalty flow and require a separate approved decomposition before implementation.

## Allowed Files
- `database/migrations/**`
- `database/tests/**`
- `implementation/evidence/LP-003003/**`
- this task specification
- `implementation/TASK-STATUS.md`

## Forbidden Files
- Customer, Brand, Loyalty Program, Membership, Receipt, Reward, XP, Redemption or Analytics runtime/schema files
- RLS policy implementation outside an approved Business RLS task
- CI, workflow and infrastructure files

## Source
MIP-003-business.md

## Acceptance Criteria
- Business is the tenant root with UUID identity and approved attributes.
- Lifecycle is constrained to ACTIVE, SUSPENDED and CLOSED; CLOSED is terminal.
- Currency and timezone are stored as canonical text values validated by approved application contracts.
- UTC timestamps and optimistic version are present.
- No Customer ownership or `customer_id` is added.
- Migration applies cleanly, reruns idempotently and has disposable schema assertions.
- RLS remains a separate follow-up and is not falsely claimed.

## Mandatory Tests
- clean and upgrade migration;
- rerun/no pending migrations;
- lifecycle/status constraints;
- UUID/FK and Customer tenant-boundary inspection;
- schema regression/API test suite.

## Required Reviewers
- Solution Architect;
- QA;
- Security;
- Database reviewer.

## Rollback / Definition of Done
Use the migration down section only for disposable databases; deployed corrections use forward migrations. DONE requires implementation, independent review, QA, Security, merge, post-merge validation and synchronized status/evidence.
