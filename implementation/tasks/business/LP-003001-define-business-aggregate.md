# LP-003001 — Define Business Aggregate

## Status

`READY_FOR_MERGE`

## Category and Role

- Category: DOMAIN
- Assigned role: Backend Developer Agent
- Owning module: `business`
- Source: `implementation/mip/MIP-003-business.md`

## Business Objective

Establish Business as the SaaS tenant and primary tenant-isolation boundary without owning global Customer, Membership, Reward Transaction, or other independent aggregate state.

## Technical Objective

Implement the Business aggregate, value objects, lifecycle state machine, domain contracts, and deterministic domain tests without persistence, API transport, RLS, authentication, or infrastructure.

## Dependencies

- LP-000007 — Standard API response and error contracts
- LP-000008 — Event contract foundation

No database, migration, RLS, authentication, or CI dependency is required for this domain-only task.

## Approved Scope

- Business aggregate with `id`, `legalName`, `displayName`, `registrationNumber`, `taxNumber`, `defaultCurrency`, `timezone`, `status`, `createdAt`, and `updatedAt`.
- Non-empty normalized legal/display names.
- ISO 4217 three-letter currency codes.
- Valid IANA timezone identifiers.
- Lifecycle `ACTIVE`, `SUSPENDED`, `CLOSED` with CLOSED terminal.
- Domain contracts/events justified by the approved Business architecture.
- Unit, lifecycle, invariant, and deterministic concurrency-safe domain tests.

## Explicit Exclusions

- persistence, database schema, migrations, and RLS;
- authentication, billing, subscriptions, API keys, and external integrations;
- Brand, Loyalty Program, Membership, Customer, Reward Transaction, or other aggregate state;
- cross-aggregate orchestration or active-tenant enforcement outside Business;
- country-specific registration/tax validation;
- Business type/category enum;
- physical deletion behavior.

## Allowed Files

```text
services/api/src/modules/business/**
services/api/test/business-*.test.mjs
implementation/evidence/LP-003001/**
implementation/TASK-STATUS.md
implementation/tasks/business/LP-003001-define-business-aggregate.md
```

## Forbidden Files

```text
database/**
services/api/src/modules/customer/**
services/api/src/modules/authentication/**
services/api/src/modules/brand/**
services/api/src/modules/loyalty-program/**
services/api/src/modules/membership/**
services/api/src/modules/reward/**
services/api/src/modules/redemption/**
```

## Required Reviewers

- Solution Architect
- QA Agent
- Security Agent

## Mandatory Tests

- valid construction and normalization;
- invalid names, currency codes, timezones, timestamps, and identifiers;
- all allowed lifecycle transitions;
- rejection of CLOSED transitions;
- deterministic repeated transitions;
- no cross-aggregate state or persistence behavior.

## Acceptance Criteria

- Approved Business contract is implemented exactly.
- Business lifecycle invariants are enforced deterministically.
- No Business type/category enum is introduced.
- No country-specific registration/tax rules are introduced.
- No independent aggregate state is embedded in Business.
- Tests pass and documentation/evidence is synchronized.
- No persistence, RLS, authentication, or infrastructure behavior is claimed.

## Recovery and Rollback

Rollback removes the Business domain files and evidence from this task branch. No migration, deployed data, or external state is affected.

## Definition of Done

Implementation, focused tests, independent review, QA, Security review, merge evidence, and post-merge validation are complete.
