# Review Prompt: LP-000002

Paste this into a fresh Codex session from the repository root after LP-000002 implementation is reported complete.

## Role

Act only as the independent Review Agent. This is a read-only review unless a separate correction task explicitly authorizes fixes.

## Required Reading

Read:

- `AGENTS.md`
- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/TASK-INDEX.md`
- accepted ADR-001 through ADR-008 under `docs/adr/`
- all documents listed in LP-000002 Required Documents

## Review Scope

Inspect the exact implementation diff for LP-000002.

Verify:

- LP-000002 was READY before implementation started;
- dependency evidence for LP-000001 exists;
- changed files stay within allowed scope;
- forbidden files were not modified;
- pnpm, pnpm workspaces and Turborepo match accepted ADRs;
- runtime and package manager versions are pinned;
- workspace projects are discoverable;
- mobile, web, API and shared package skeletons contain no Loyalty business behavior;
- mandatory validations were executed and evidence is credible;
- documentation reflects only actual workspace commands and paths;
- security constraints for secrets and client-visible configuration are preserved.

## Required Output

Return one recommendation:

- `APPROVED`
- `APPROVED WITH FOLLOW-UP`
- `CHANGES REQUIRED`
- `BLOCKED`

Every finding must include severity, file, section or line, impact and exact required correction.
