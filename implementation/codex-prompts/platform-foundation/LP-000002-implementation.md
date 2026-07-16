# Implementation Prompt: LP-000002

Paste this into Codex from the repository root only after LP-000002 is READY.

## Role

Act only as the DevOps Agent.

## Required Readiness Gate

Before making application or workspace changes, read:

- `AGENTS.md`
- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/TASK-INDEX.md`

If LP-000002 is not `READY`, or if LP-000001 is not complete, return `TASK NOT READY` and stop.

## Required Documents

Read every document listed in the LP task's Required Documents section, including:

- accepted ADR-001 through ADR-008 under `docs/adr/`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/engineering/68-definition-of-task-ready.md`

## Task

Initialize the Loyalty Platform monorepo and workspace exactly within LP-000002 scope.

Create only:

- root package manager and runtime pinning;
- pnpm workspace configuration;
- deterministic lockfile;
- Turborepo configuration;
- root scripts for install, build, typecheck, lint and test placeholders;
- Customer Mobile and Employee Mobile Expo skeletons;
- Business Portal and Platform Admin web skeletons;
- API service package skeleton;
- approved shared package placeholders;
- approved top-level directories;
- documentation for actual workspace commands where required.

Do not implement Loyalty business behavior. Do not start LP-000003.

## Constraints

Use only the allowed files listed in LP-000002. Do not modify forbidden files, Product Decisions, accepted ADR decisions, Blueprint behavior or MIP scope.

## Mandatory Validation

Run and report exact results for every validation listed in LP-000002 section 21. If a command cannot run, report the exact command, reason and risk. Do not claim skipped validations passed.

## Remaining Required Corrections

Before returning implementation evidence:

1. Add root scripts:
   - `lint`
   - `typecheck`
2. Add matching Turborepo task definitions:
   - `lint`
   - `typecheck`
3. Add placeholder `lint` and `typecheck` scripts to every current workspace package, app and service.
4. Ensure all of these commands pass:
   - `pnpm run lint`
   - `pnpm run typecheck`
   - `pnpm exec turbo run lint`
   - `pnpm exec turbo run typecheck`
5. Do not claim full strict TypeScript implementation; LP-000003 still owns strict compiler configuration.
6. Keep unrelated workflow/documentation assets and local artifacts out of the LP-000002 implementation commit.
7. After all implementation validation passes and the working tree is scope-clean for LP-000002, update LP-000002 lifecycle state to `READY_FOR_REVIEW`.

## Required Output

Return the full AGENTS.md implementation evidence format, including changed files, database/API/event/security impact, validations executed, exact results, rollback and readiness recommendation.
