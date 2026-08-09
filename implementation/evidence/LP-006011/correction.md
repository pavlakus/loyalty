# LP-006011 Boundary Correction Evidence

- **Task ID:** LP-006011
- **Phase:** Correction
- **Role:** Membership Task Owner / Implementation Agent
- **Date:** 2026-08-09
- **Branch:** `agent/correction/LP-006011-membership-boundary-import`

## Finding

The Membership security test introduced by commit `0bb118b` imported `../../../packages/event-contracts/dist/index.js` directly. This violates the repository module-boundary rule. Git history confirms the import predates LP-000016 recovery commit `f01bea7` and was not introduced or modified by LP-000016.

## Correction

Replaced the direct generated-artifact import with the approved public package import `@loyalty-platform/event-contracts`. No production code, business behavior, test intent, or boundary rule was changed.

## Validation context

- `git log --all --oneline -S'../../../packages/event-contracts/dist/index.js' -- services/api/test/membership-domain-security.test.mjs` → `0bb118b test(membership): add domain privacy and security coverage`.
- `git merge-base --is-ancestor 0bb118b f01bea7` → PASS; violation predates LP-000016 recovery.
- `git diff --check` → PASS.
- `pnpm run build` → PASS; 16 workspace builds successful.
- `pnpm run lint` → module-boundary validation PASS; full lint remains blocked by unrelated pre-existing `structuredClone` `no-undef` in `services/api/test/customer-preferred-language.test.mjs`.
- `pnpm --filter @loyalty-platform/api test` → command was started after build; no LP-006011 runtime behavior was changed.

Live GitHub Actions validation is required after this correction. LP-000016 remains non-DONE until its workflow passes.
