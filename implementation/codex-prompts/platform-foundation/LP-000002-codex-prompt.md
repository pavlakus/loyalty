# Codex Prompt — LP-000002

Use only after `LP-000001` is approved and merged.

Paste the text below into Codex from the repository root.

---

You are executing the DevOps task `LP-000002`.

Read `AGENTS.md` first and follow it as the root instruction.

Then read:

- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- all Accepted ADRs under `docs/adr/`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`

ROLE

Act only as the DevOps Agent for repository bootstrap.

TASK

Initialize the Loyalty Platform monorepo and workspace according to the Accepted ADRs.

Create the approved top-level structure:

- `apps/customer-mobile/`
- `apps/employee-mobile/`
- `apps/business-portal/`
- `apps/platform-admin/`
- `services/api/`
- `packages/`
- `database/`
- `tests/`
- `infrastructure/`
- `scripts/`
- `.github/`

Create only project skeletons and workspace configuration.

Do not implement Loyalty business behavior.

REQUIRED OUTCOMES

- pinned package manager;
- deterministic lockfile;
- workspace configuration;
- root package scripts;
- approved task-runner configuration;
- application and service placeholder packages;
- shared package placeholders required by `MIP-000`;
- repository installs from a clean checkout;
- root workspace commands can discover all projects;
- no unrelated starter/demo business code;
- existing documentation remains intact.

MOBILE SKELETON

Create Customer and Employee mobile application skeletons using the Accepted mobile ADR.

Do not implement real login, Membership, QR or loyalty screens.

WEB SKELETON

Create Business Portal and Platform Admin skeletons.

Do not implement business workflows.

BACKEND SKELETON

Create the API package boundary only.

Do not implement Authentication, Customer, Business or other modules.

ALLOWED FILES

Follow the exact allowed files from the LP task and MIP.

Do not modify:

- Blueprint documents;
- approved ADR decisions;
- existing MIP business rules;
- LP task definitions.

VALIDATION

Run the commands required to prove:

- clean install;
- workspace discovery;
- placeholder builds where available;
- no missing package references;
- deterministic lockfile.

If a runtime or package-manager dependency is not installed locally, document the exact command and do not claim it passed.

RETURN

1. Task Readiness result
2. Selected branch and repository status
3. Workspace structure created
4. Changed files
5. Commands executed
6. Exact results
7. Tests or validations not executed
8. Risks and limitations
9. Rollback instructions
10. Definition of Done evidence
11. Recommendation: `READY FOR REVIEW` or `BLOCKED`

Do not start `LP-000003`.
Do not commit or merge unless explicitly instructed.
