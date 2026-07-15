# Close Merged Task and Prepare Next

Paste this into Codex from the repository root after a task branch has been merged.

---

Use the Task Preparation skill.

COMPLETED TASK:

`[REPLACE_WITH_COMPLETED_TASK_ID]`

NEXT TASK:

`[REPLACE_WITH_NEXT_TASK_ID]`

Verify from Git and repository evidence that the completed task is actually merged.

If verified:

1. update the completed LP status to `MERGED` or `DONE` according to `TASK-LIFECYCLE.md`;
2. update `implementation/TASK-STATUS.md`;
3. update the module `TASK-INDEX.md`;
4. prepare the next task;
5. generate implementation, review and QA prompts for the next task;
6. set the next task to READY only if every dependency is complete.

Do not implement source code.

Do not mark any task merged based only on user text; verify Git state.

Return:

- completed task final status;
- next task readiness;
- files updated;
- prompts generated;
- blockers.
