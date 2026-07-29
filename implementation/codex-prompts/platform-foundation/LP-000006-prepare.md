# Task Preparation Prompt: LP-000006

Act only as the Task Preparation Agent.

Read `AGENTS.md`, `implementation/TASK-LIFECYCLE.md`, the LP-000006 specification, `implementation/mip/MIP-000-platform-foundation.md`, ADR-007, accepted ADR-009, required engineering documents, existing LP-000006 evidence and current Git state.

Verify LP-000005 is `DONE`, confirm the exact allowed and forbidden files, confirm the approved environment contract, and verify mandatory tests, reviewers, Security approval, rollback and evidence requirements. Do not implement runtime code. Update only task metadata, status/index records, prompts and preparation evidence. When all readiness checks pass, recommend `TASK_PREPARATION -> READY` and hand off to the Backend Developer Agent.

Return the full response-contract metadata and sections required by `docs/ai-engineering-framework/90-agent-response-contract.md`.
