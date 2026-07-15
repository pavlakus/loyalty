# Implementation Prompt: LP-000003

Paste this into Codex from the repository root only after LP-000003 is `READY`.

## Role

Act only as the DevOps Agent.

## Required Readiness Gate

Before making changes, read:

- `AGENTS.md`
- `implementation/tasks/platform-foundation/LP-000003-configure-typescript-strict-mode-and-shared-compiler-settings.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/TASK-INDEX.md`

If LP-000003 is not `READY`, or if LP-000002 is not complete, return `TASK NOT READY` and stop.

## Required Documents

Read every document listed in LP-000003 section 17, including accepted ADR-001 and ADR-008 and the referenced Engineering documents.

## Task

Configure shared TypeScript strict mode for the current workspace.

Implement only:

- root `tsconfig.base.json`;
- package, app and service `tsconfig.json` files listed in LP-000003 allowed files;
- root/package script or Turborepo adjustments needed to run type-checks;
- a negative strictness validation proving implicit `any` is rejected.

Preserve Expo and Vite compiler requirements. Do not introduce unsafe path aliases. Do not implement Loyalty business behavior.

## Constraints

Use only the allowed files listed in LP-000003. Do not modify forbidden files, Product Decisions, accepted ADR decisions, Blueprint behavior or MIP scope.

## Mandatory Validation

Run and report exact results for every validation listed in LP-000003 section 23. If a command cannot run, report the exact command, reason and risk. Do not claim skipped validations passed.

## Required Output

Return the full AGENTS.md implementation evidence format, including changed files, database/API/event/security impact, validations executed, exact results, rollback and readiness recommendation.
