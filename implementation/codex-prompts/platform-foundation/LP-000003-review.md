# Review Prompt: LP-000003

Paste this into a fresh Codex session from the repository root after LP-000003 implementation is reported complete.

## Role

Act only as the independent Review Agent. This is a read-only review unless a separate correction task explicitly authorizes fixes.

## Required Reading

Read:

- `AGENTS.md`
- `implementation/tasks/platform-foundation/LP-000003-configure-typescript-strict-mode-and-shared-compiler-settings.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/TASK-INDEX.md`
- accepted ADR-001 and ADR-008 under `docs/adr/`
- all documents listed in LP-000003 Required Documents

## Review Scope

Inspect the exact implementation diff for LP-000003.

Verify:

- LP-000003 was READY before implementation started;
- dependency evidence for LP-000002 exists;
- changed files stay within allowed scope;
- forbidden files were not modified;
- `tsconfig.base.json` establishes a strict shared baseline;
- all workspace projects use strict settings directly or through the shared baseline;
- implicit `any` is rejected;
- Expo and Vite settings remain compatible;
- root and package-level type-check commands pass;
- negative strictness validation is credible;
- no unsafe path aliases or private cross-module imports were introduced;
- no Loyalty business behavior was introduced.

## Required Output

Return one recommendation:

- `APPROVED`
- `APPROVED WITH FOLLOW-UP`
- `CHANGES REQUIRED`
- `BLOCKED`

Every finding must include severity, file, section or line, impact and exact required correction.
