# LP-000002 Correction Prompt

Read `AGENTS.md` first.

You are continuing implementation task `LP-000002` on the current branch.

The independent review returned `CHANGES REQUIRED`.

Read:

- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`
- `docs/adr/ADR-008-cross-platform-mobile-architecture.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/59-coding-standards.md`

Apply only these corrections.

## 1. Customer Mobile Expo Skeleton

Update `apps/customer-mobile/package.json`.

Create:

- `apps/customer-mobile/app.config.ts`
- `apps/customer-mobile/App.tsx`
- `apps/customer-mobile/index.ts`
- `apps/customer-mobile/tsconfig.json`

Requirements:

- React Native with Expo;
- one neutral placeholder screen;
- no authentication, Membership, QR or Loyalty behavior;
- scripts for start, android, ios and web;
- no EAS credentials or store publication.

## 2. Employee Mobile Expo Skeleton

Update `apps/employee-mobile/package.json`.

Create:

- `apps/employee-mobile/app.config.ts`
- `apps/employee-mobile/App.tsx`
- `apps/employee-mobile/index.ts`
- `apps/employee-mobile/tsconfig.json`

Use the same constraints as Customer Mobile.

## 3. Business Portal Minimal Web Skeleton

Update `apps/business-portal/package.json`.

Create a minimal separate TypeScript web application with:

- application entry;
- root component;
- TypeScript configuration;
- HTML entry where required;
- start and build scripts.

Neutral placeholder page only. No dashboard, auth, API integration or Loyalty behavior.

## 4. Platform Admin Minimal Web Skeleton

Update `apps/platform-admin/package.json`.

Create the same minimum valid web structure as Business Portal, but as a separate application.

## 5. Pin Node Runtime

Create exactly one:

- `.nvmrc`
- `.node-version`

Use a version compatible with the current pnpm and Expo setup. Keep root `package.json` engines consistent.

## 6. README Update

Document:

- required Node version;
- required pnpm version;
- install command;
- workspace listing;
- root build and test commands;
- start commands for both mobile apps and both web apps;
- that current build/test validates skeletons only;
- that no Loyalty business functionality exists yet.

## 7. Resolve Task Status Conflict

Inspect:

- `implementation/TASK-STATUS.md`
- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`

If conflict markers exist, resolve them.

Preserve:

- LP-000001 = MERGED;
- LP-000002 = IN_PROGRESS.

Do not set LP-000002 to READY_FOR_MERGE or DONE.

## 8. Preserve Turborepo

Keep the current valid `turbo.json`.

Ensure new applications integrate with:

- `turbo run build`
- `turbo run test`

Do not start LP-000003 strict TypeScript work.

## 9. Validation

Run and report:

- `pnpm install`
- `pnpm install --frozen-lockfile`
- `pnpm run workspace:list`
- `pnpm exec turbo run build`
- `pnpm exec turbo run test`
- Customer Mobile Expo config validation
- Employee Mobile Expo config validation
- Business Portal build
- Platform Admin build
- Node version file check
- `rg '^(<<<<<<<|=======|>>>>>>>)'`
- forbidden business-module search
- tracked and untracked `.env` search
- `git status --short`
- `git diff --name-only`

## 10. Scope Rules

Do not:

- implement business behavior;
- create Authentication, Membership or QR;
- create database schema;
- create CI;
- start LP-000003;
- modify Blueprint documents;
- modify accepted ADR decisions.

## 11. Return

Return exactly:

1. Corrections implemented
2. Exact files changed
3. Mobile skeleton details
4. Web skeleton details
5. Node runtime decision
6. Task status conflict resolution
7. Commands executed
8. Exact validation results
9. Remaining limitations
10. Recommendation: `READY FOR RE-REVIEW` or `BLOCKED`

Do not commit.
Do not merge.
