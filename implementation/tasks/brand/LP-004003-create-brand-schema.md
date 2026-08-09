# LP-004003

## Title
Create Brand schema

## Source
MIP-004-brand.md

## Status
IMPLEMENTATION_COMPLETE

## Assigned Role
Database Agent

## Dependencies
- LP-000009 (DONE)
- LP-003003 (DONE)
- LP-004001 (DONE)

## Exact Scope
Create the immutable SQL-first PostgreSQL schema for the Brand aggregate root: UUID identity, immutable `business_id` ownership, approved name/default locale, lifecycle state, UTC timestamps and optimistic versioning. Brand settings and RLS remain separate follow-up scopes.

## Allowed Files
- `database/migrations/**`
- `database/tests/**`
- `implementation/evidence/LP-004003/**`
- this task specification
- `implementation/TASK-STATUS.md`

## Forbidden Files
- Customer, Business, Loyalty Program, Membership, Receipt, Reward, XP, Redemption or Analytics runtime/schema files
- RLS policy implementation outside an approved Brand RLS task
- CI, workflow and infrastructure files

## Acceptance Criteria
- Brand belongs to exactly one existing Business through an immutable foreign key.
- Brand starts in DRAFT and permits only approved lifecycle states.
- Root fields follow LP-004001; no speculative profile fields or currency override are added.
- Migration applies cleanly, reruns idempotently and has disposable schema assertions.
- RLS remains separate and is not falsely claimed.

## Mandatory Tests
- clean/upgrade migration;
- rerun/no pending migrations;
- Business foreign-key and ownership immutability inspection;
- lifecycle/default assertions;
- API regression.

## Required Reviewers
- Solution Architect; QA; Security; Database reviewer.

## Rollback / Definition of Done
Use the migration down section only for disposable databases; deployed corrections use forward migrations. DONE requires implementation, independent review, QA, Security, merge, post-merge validation and synchronized evidence.
