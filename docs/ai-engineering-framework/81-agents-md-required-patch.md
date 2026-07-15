# 81. Required AGENTS.md Patch

Apply the following changes to root `AGENTS.md`.

## Add to Authoritative Documents

Add:

- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `implementation/TASK-LIFECYCLE.md`

## Add New Section — Agent Workflow

```markdown
## Agent Workflow

Every implementation task follows:

Documentation
→ Task Preparation
→ READY
→ Implementation
→ Independent Review
→ QA
→ READY_FOR_MERGE
→ Human Merge
→ Release

Developer Agents may execute only tasks with status READY.

Task Preparation Agents may repair safe documentation and metadata issues, but may not invent Product Decisions, change accepted ADR decisions, expand MIP scope or mark unfinished dependencies complete.
```

## Replace Developer Readiness Behavior

Replace any rule implying the Developer should repair readiness issues with:

```markdown
If a task is not READY, the Developer Agent must stop and return TASK NOT READY.

The Task Preparation Agent must then prepare the task using:

- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `.codex/skills/task-preparation/SKILL.md`
- `implementation/TASK-LIFECYCLE.md`
```
