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

## Review handoff

Implementation commit: `117bd9c`. The task branch is clean and contains only the preferred-language resolver, focused test, synchronized Customer documentation, lifecycle metadata, and evidence. It is ready for independent review.

## Correction: Node runtime global lint baseline

- **Task ID:** LP-002010
- **Phase:** Correction
- **Role:** Implementation Agent
- **Date:** 2026-08-09
- **Owner commit:** `117bd9ce746d4644c7138d2d7054655d6ee0067a`
- **Correction branch:** `agent/correction/LP-002010-structuredclone-lint`

The live validation failure identified `structuredClone` in `services/api/test/customer-preferred-language.test.mjs` as an undefined ESLint global. Git history shows the usage was introduced by the owner commit above and predates LP-000016 recovery commit `f01bea7d6f0212923f09e0ddfffa9765dd738393`. `structuredClone` is a standard global in the repository-pinned Node 22 runtime, so the smallest standards-compliant correction is to declare it as a read-only ESLint global in the shared configuration. No runtime behavior or test assertion was changed.

### Changed files

- `eslint.config.js` — declare the supported Node runtime global `structuredClone`.
- `implementation/evidence/LP-002010/implementation.md` — this correction record.

### Validation

- `node --version` — PASS; current local runtime is Node 25.2.1 and the repository requires Node `>=22.18.0 <26`.
- `git merge-base --is-ancestor 117bd9ce746d4644c7138d2d7054655d6ee0067a f01bea7d6f0212923f09e0ddfffa9765dd738393` — PASS; usage predates LP-000016 recovery.
- `git diff --check` — PASS.
- Full CI validation remains pending the maintainer-integrated GitHub Actions rerun.

### Recovery

Revert the correction commit if the shared ESLint configuration must be restored; no database or persisted-state recovery is required.
