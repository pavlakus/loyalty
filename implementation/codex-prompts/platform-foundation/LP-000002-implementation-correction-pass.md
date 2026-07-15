# LP-000002 Implementation Correction Pass

Read `AGENTS.md` first.

You are continuing task `LP-000002` after an independent review returned `CHANGES_REQUIRED`.

This is not a new implementation start.

The current valid lifecycle state is:

- LP-000001 = DONE
- LP-000002 = IN_PROGRESS
- Review status = CHANGES_REQUIRED

You are explicitly authorized to continue LP-000002 from `IN_PROGRESS / CHANGES_REQUIRED`.

Do not require LP-000002 to be READY for this correction pass.

Read:

- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/TASK-INDEX.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/59-coding-standards.md`

Apply only the remaining approved corrections.

## Required Corrections

1. Add root `lint` script.
2. Add root `typecheck` script.
3. Add Turborepo `lint` task.
4. Add Turborepo `typecheck` task.
5. Add placeholder `lint` and `typecheck` scripts to every current workspace app, service and package.
6. Preserve LP-000003 ownership of strict TypeScript configuration.
7. Do not implement business behavior.
8. Do not modify Blueprint or accepted ADR decisions.
9. Do not start LP-000003.

## Validation

Run and report:

- `pnpm install --frozen-lockfile`
- `pnpm run workspace:list`
- `pnpm run build`
- `pnpm run test`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm exec turbo run build`
- `pnpm exec turbo run test`
- `pnpm exec turbo run lint`
- `pnpm exec turbo run typecheck`
- conflict-marker search
- forbidden business-module search
- tracked and untracked `.env` search
- `git status --short`
- `git diff --name-only`

## Lifecycle Update

If every required correction and validation passes:

- set LP-000002 task status to `READY_FOR_REVIEW`;
- update `implementation/TASK-STATUS.md`;
- update `implementation/tasks/platform-foundation/TASK-INDEX.md`;
- preserve review note that prior findings were corrected;
- do not set READY_FOR_MERGE;
- do not set DONE.

If validation fails:

- keep LP-000002 `IN_PROGRESS`;
- return `BLOCKED` with exact failures.

## Return

Return exactly:

1. Lifecycle state accepted
2. Corrections implemented
3. Exact files changed
4. Commands executed
5. Exact validation results
6. Remaining limitations
7. Lifecycle files updated
8. Final status:
   - `READY FOR RE-REVIEW`
   - or `BLOCKED`

Do not commit.
Do not merge.
