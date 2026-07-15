# Codex Prompt — LP-000002 Ready Version

Read `AGENTS.md` first.

You are executing the DevOps task `LP-000002`.

Read:

- `implementation/tasks/platform-foundation/LP-000002-initialize-monorepo-and-workspace.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- all Accepted ADRs under `docs/adr/`
- all documents listed in the task's Required Documents section.

Act only as the DevOps Agent.

First perform a Task Readiness Check against the updated LP task.

If the task is not Ready, return `TASK NOT READY` with exact missing information and stop.

If Ready, implement the task directly.

Do not stop after returning only a plan.

Follow the task's:

- exact scope;
- allowed files;
- forbidden files;
- acceptance criteria;
- mandatory validations;
- review requirements;
- rollback rules.

Do not implement Loyalty business behavior.

Do not start `LP-000003`.

Before finishing, run all mandatory validations from the task and report exact results.

Return exactly:

1. Task Readiness result
2. Workspace structure created
3. Tool and version choices
4. Changed files
5. Commands created
6. Commands executed
7. Exact results
8. Validation not executed
9. Dependency or vulnerability findings
10. Risks and known limitations
11. Rollback instructions
12. Documentation changes
13. Definition of Done evidence
14. Recommendation: `READY FOR REVIEW` or `BLOCKED`

Do not commit.
Do not merge.
