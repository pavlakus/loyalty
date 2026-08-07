# LP-002010 Implementation Evidence

- **Task ID:** LP-002010
- **Phase:** Implementation
- **Role:** Backend Developer Agent
- **Date:** 2026-08-07
- **Branch:** `agent/backend/LP-002010-customer-preferred-language`
- **Base:** `development` at `c3e2159`

## Implementation summary

Implemented the Customer-owned preferred-language resolution policy defined by MIP-002. Resolution order is explicit Customer preference, application/device locale, Brand fallback, then required platform fallback. Each selected value uses the existing canonical locale validator; invalid locales fail rather than being silently normalized or accepted. The function is pure and does not mutate profile data or historical business records.

## Changed files

- `services/api/src/modules/customer/preferred-language.ts`
- `services/api/test/customer-preferred-language.test.mjs`
- `docs/modules/customer/customer-aggregate-and-identity-link-architecture.md`
- LP-002010 lifecycle/status metadata and this evidence.

No database, migration, API route, event, authentication, RLS, infrastructure, CI, LP-000009, or LP-000016 files were changed.

## Validation

- `git diff --check` — PASS.
- `pnpm --filter @loyalty-platform/api build` — pending isolated validation.
- focused Customer preferred-language test — pending isolated validation.
- existing API contract locale validation is reused; no duplicate locale grammar was introduced.

## Business and security rules

The implementation preserves the Customer module as owner, does not alter historical records, does not trust a tenant or identity claim, and does not expose personal data. Persistence, authorization and transport integration remain with their owning tasks.

## Rollback

Revert the implementation commit; this removes one pure resolver and its tests without data migration or persisted-state impact.
