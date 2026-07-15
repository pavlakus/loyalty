# Prepare Next Task

Paste this into Codex from the repository root.

---

Use the repository Task Preparation skill.

Read:

- `AGENTS.md`
- `.codex/skills/task-preparation/SKILL.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/TASK-STATUS.md`

TASK ID:

`[REPLACE_WITH_TASK_ID]`

Act only as the Task Preparation Agent.

Prepare the specified LP task for implementation.

Automatically fix all safe:

- metadata;
- path;
- extension;
- naming;
- exact reference;
- Knowledge Package;
- allowed and forbidden file;
- UAT;
- review;
- risk;
- prompt;
- TASK-INDEX;
- TASK-STATUS

issues.

Do not implement application code.

Do not change Product Decisions, MIP scope or accepted ADR decisions.

Do not mark an incomplete dependency complete.

Create these exact prompt files:

- `implementation/codex-prompts/<module>/<TASK-ID>-implementation.md`
- `implementation/codex-prompts/<module>/<TASK-ID>-review.md`
- `implementation/codex-prompts/<module>/<TASK-ID>-qa.md`

Return exactly one:

- `READY FOR IMPLEMENTATION`
- `TASK PREPARATION BLOCKED`

If blocked, provide the exact decision or dependency required.
