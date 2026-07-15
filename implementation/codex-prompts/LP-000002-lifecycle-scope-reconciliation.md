# LP-000002 Lifecycle and Scope Reconciliation Prompt

Read `AGENTS.md` first.

Use the Task Preparation skill.

You are not implementing Loyalty business behavior.

Your task is to reconcile the project lifecycle state and prepare LP-000002 for a final correction pass.

## Inputs

Read:

- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/TASK-INDEX.md`
- `implementation/tasks/platform-foundation/LP-000001-approve-platform-foundation-adr-set.md`
- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/codex-prompts/platform-foundation/LP-000002-implementation.md`
- `implementation/codex-prompts/platform-foundation/LP-000002-review.md`
- the current Git branch, history and working tree

## Verified Evidence to Check in Git

Do not trust this text without checking Git.

Expected evidence:

- `development` contains merge commit `0b937ab`;
- architect commit `37e4500` is an ancestor of `development`;
- LP-000001 independent architecture review returned `APPROVED`;
- LP-000001 ADR files exist and are Accepted.

Run:

```bash
git branch --show-current
git log --oneline --decorate -10
git merge-base --is-ancestor agent/architect/LP-000001-foundation-adrs development
git status --short
git diff --name-only development
git ls-files --others --exclude-standard
```

## Part A — Reconcile LP-000001

If Git confirms LP-000001 is merged and the approved ADR set is present:

1. Set `LP-000001` task status to `DONE`.
2. Update `implementation/TASK-STATUS.md` to `DONE`.
3. Update `implementation/tasks/platform-foundation/TASK-INDEX.md` to `DONE`.
4. Record the merge commit and approval evidence in the task/index notes.
5. Do not change ADR content.

If evidence is insufficient, return `TASK PREPARATION BLOCKED`.

## Part B — Reconcile LP-000002 Lifecycle

Set a single consistent current state:

- LP task file: `IN_PROGRESS`
- TASK-STATUS: `IN_PROGRESS`
- TASK-INDEX: `IN_PROGRESS`
- Review status/note: `CHANGES_REQUIRED`

Do not set READY_FOR_REVIEW yet.

Add a note that the remaining implementation corrections are:

- root `lint` script;
- root `typecheck` script;
- Turborepo tasks for lint/typecheck;
- final validation;
- scope-clean working tree;
- then transition to READY_FOR_REVIEW.

## Part C — Separate Unrelated Working Tree Artifacts

Classify every changed and untracked path into:

1. LP-000002 implementation scope;
2. project workflow/documentation already required by the repository;
3. unrelated local artifact.

LP-000002 implementation scope includes only files authorized by the task, including:

- root workspace files;
- approved app/service/package skeleton files;
- `.nvmrc` or `.node-version`;
- `turbo.json`;
- README workspace documentation;
- allowed placeholder directories.

Unrelated local artifacts include examples such as:

- `.DS_Store`;
- downloaded `.zip` files;
- duplicate extracted package folders;
- temporary prompt copies outside the canonical prompt directory.

Rules:

- Do not delete authored project documentation.
- Do not delete files when ownership is uncertain.
- Add `.DS_Store` and archive artifacts to `.gitignore` if not already ignored.
- Move clearly downloaded ZIP artifacts outside the repository only if safe; otherwise list them for manual removal.
- Do not include unrelated artifacts in the LP-000002 implementation diff.
- Produce an exact list of paths that remain outside LP-000002 scope.

If workflow files such as `AGENTS.md`, `.codex/**`, `CODEX-START.md`, AI framework documents or canonical prompt files are uncommitted but required project assets:

- do not include them in the LP-000002 implementation commit;
- prepare a separate list for a dedicated workflow/documentation commit;
- do not discard them.

## Part D — Update the LP-000002 Implementation Prompt

Update:

`implementation/codex-prompts/platform-foundation/LP-000002-implementation.md`

Add the exact remaining correction requirements:

1. Add root scripts:
   - `lint`
   - `typecheck`
2. Add matching Turborepo task definitions.
3. Add placeholder `lint` and `typecheck` scripts to every current workspace package, app and service.
4. Ensure:
   - `pnpm run lint` passes;
   - `pnpm run typecheck` passes;
   - `pnpm exec turbo run lint` passes;
   - `pnpm exec turbo run typecheck` passes.
5. Do not claim full strict TypeScript implementation; LP-000003 still owns strict compiler configuration.
6. After all implementation validation passes, update LP-000002 lifecycle state to `READY_FOR_REVIEW`.

## Part E — Required Output

Return:

1. Git evidence
2. LP-000001 final reconciled status
3. LP-000002 reconciled status
4. Files changed
5. Unrelated artifacts found
6. Paths safe for LP-000002 implementation
7. Paths excluded from LP-000002 implementation
8. Updated implementation prompt path
9. Remaining implementation corrections
10. Final status:
   - `READY FOR IMPLEMENTATION CORRECTION`
   - or `TASK PREPARATION BLOCKED`

Do not implement the lint/typecheck code in this task.
Do not commit.
Do not merge.
