# Task Preparation Skill

## Trigger

Use this skill when asked to:

- prepare a task;
- make an LP Ready;
- prepare the next task;
- fix readiness blockers;
- generate implementation prompts;
- update task status or index before implementation.

## Mission

Prepare one LP task for implementation using existing project knowledge.

## Required Inputs

- task ID;
- repository root;
- root `AGENTS.md`;
- `78-task-preparation-agent.md`;
- `TASK-LIFECYCLE.md`;
- LP task;
- referenced MIP;
- TASK-INDEX;
- TASK-STATUS.

## Procedure

1. Read root `AGENTS.md`.
2. Read:
   - `docs/ai-engineering-framework/78-task-preparation-agent.md`
   - `docs/ai-engineering-framework/79-agent-registry.md`
   - `docs/ai-engineering-framework/80-agent-workflow.md`
   - `implementation/TASK-LIFECYCLE.md`
3. Locate the LP task.
4. Read its MIP and authoritative references.
5. Inspect repository and dependency state.
6. Classify blockers:
   - safe administrative/documentation issue;
   - real Product blocker;
   - real Architecture blocker;
   - real dependency blocker.
7. Automatically fix safe issues.
8. Never mark a dependency complete unless Git/task evidence proves it.
9. Complete all mandatory LP fields.
10. Create:
    - implementation prompt;
    - read-only review prompt;
    - QA prompt.
11. Update:
    - LP status;
    - TASK-INDEX;
    - TASK-STATUS.
12. Validate paths and filenames.
13. Return one final status.

## Safe Automatic Fixes

- missing `.md` extension;
- stale path;
- stale filename reference;
- missing metadata derivable from MIP;
- missing exact document lists;
- missing allowed/forbidden files derivable from MIP;
- missing UAT references already defined;
- missing review requirements;
- missing risk statement;
- missing prompt files;
- incorrect DRAFT status after all readiness rules pass.

## Forbidden Automatic Fixes

- changing Product Decisions;
- changing aggregate ownership;
- changing accepted ADR decision;
- inventing API/Event behavior;
- changing implementation scope;
- marking unfinished dependency complete;
- implementing source code.

## Output

Return exactly one:

### READY FOR IMPLEMENTATION

Include:

- task path;
- status;
- dependencies verified;
- fixes applied;
- generated prompt paths;
- updated index/status paths.

### TASK PREPARATION BLOCKED

Include:

- blocker type;
- exact file;
- exact missing decision or dependency;
- required human or architect action.

## File Naming for Prompts

```text
implementation/codex-prompts/<module>/<TASK-ID>-implementation.md
implementation/codex-prompts/<module>/<TASK-ID>-review.md
implementation/codex-prompts/<module>/<TASK-ID>-qa.md
```
