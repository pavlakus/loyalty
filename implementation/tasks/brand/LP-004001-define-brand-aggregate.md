# LP-004001 — Define Brand Aggregate

## Status
`READY`

## Scope and Ownership
- Category: DOMAIN
- Assigned role: Backend Developer Agent
- Owning module: `brand`
- Source: `implementation/mip/MIP-004-brand.md`
- Dependencies: LP-003001 Business aggregate; LP-003002 Business contracts

Brand is a customer-facing commercial identity owned by exactly one Business. `businessId` is required and immutable. Brand does not own Customer, Membership, Loyalty Account, Reward Transaction, or other independent aggregate state.

## Approved Aggregate

Attributes: `id`, `businessId`, `name`, `defaultLocale`, `status`, `createdAt`, `updatedAt`.

Name trims leading/trailing whitespace, collapses repeated internal whitespace, preserves Unicode and capitalization, and does not lowercase, transliterate, slugify, or become an identifier. `defaultLocale` is a BCP 47 language tag. Brand has no currency field and inherits Business currency by future domain contract.

Statuses are `DRAFT`, `ACTIVE`, `SUSPENDED`, `CLOSED`. New Brands start DRAFT. Allowed transitions are DRAFT→ACTIVE/CLOSED, ACTIVE→SUSPENDED/CLOSED, SUSPENDED→ACTIVE/CLOSED; CLOSED is terminal.

## Exclusions

No persistence, database schema, RLS, authentication, UI, assets, external integrations, currency override, translation infrastructure, or Loyalty Program/Membership behavior.

## Allowed Files
```text
services/api/src/modules/brand/**
services/api/test/brand-*.test.mjs
implementation/evidence/LP-004001/**
implementation/TASK-STATUS.md
implementation/tasks/brand/LP-004001-define-brand-aggregate.md
```

## Review, Tests, and Rollback

Required reviewers: Solution Architect, QA Agent, Security Agent. Mandatory tests cover normalization, BCP 47 validation, immutable ownership identity, lifecycle transitions, terminal closure, and invalid inputs. Rollback removes only Brand domain files/evidence; no deployed state is affected.

## Acceptance Criteria

Implement the approved aggregate, value objects, invariants, domain events, and focused tests without cross-aggregate behavior or persistence claims. Complete review, QA, Security, merge, and post-merge evidence.
