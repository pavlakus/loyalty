# Codex Start Guide

## Purpose

This file defines the exact manual workflow for running Loyalty Platform tasks in Codex.

Codex is started from the repository root.

## Before the First Task

Confirm that the repository root contains:

```text
AGENTS.md
README.md
docs/
implementation/
```

Confirm that these files exist:

```text
implementation/mip/MIP-000-platform-foundation.md
implementation/tasks/platform-foundation/LP-000001-approve-platform-foundation-adr-set.md
implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md
```

## Starting Codex

From the repository root:

```bash
codex
```

Do not give Codex a general role description.

The concrete Codex prompt for each task already defines:

- role;
- scope;
- documents;
- allowed files;
- forbidden work;
- expected output.

## Task Execution Order

Start with:

```text
LP-000001
```

Do not start `LP-000002` until:

- the ADR files exist;
- LP-000001 review is complete;
- no blocking decision remains;
- changes are committed.

## Manual Workflow for Every Task

1. Create an agent branch.
2. Start Codex from repository root.
3. Paste the exact prompt from `implementation/codex-prompts/`.
4. Let Codex inspect and execute the task.
5. Review `git status` and `git diff`.
6. Run or verify the reported checks.
7. Update `implementation/TASK-STATUS.md`.
8. Commit the task.
9. Merge only after required review.
10. Start the next task.

## Branch for LP-000001

```bash
git checkout development
git pull
git checkout -b agent/architect/LP-000001-foundation-adrs
```

## Branch for LP-000002

Create only after LP-000001 is approved and merged:

```bash
git checkout development
git pull
git checkout -b agent/devops/LP-000002-monorepo-workspace
```

## Codex Usage Limit Handling

When Codex reports that the current usage window is ending, instruct it:

```text
Before stopping, write a continuation record to:

implementation/session-handoffs/<TASK-ID>.md

Include:

- completed work
- remaining work
- changed files
- commands executed
- test results
- blockers
- exact next step

Do not start unrelated work.
```

At the next available usage window, reopen the repository on the same branch and paste:

```text
Continue the existing task.

Read:

- AGENTS.md
- the assigned LP task
- the referenced MIP
- implementation/session-handoffs/<TASK-ID>.md

Inspect current git status and existing changes first.

Do not restart completed work.
Complete only the remaining task scope.
```
