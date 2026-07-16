---
name: dispatcher
description: Route prepare, execute, review, qa, close and status commands.
---

# dispatcher

1. Read root `AGENTS.md`.
2. Read the assigned task and MIP.
3. Validate prerequisites.
4. Modify only allowed files.
5. Persist evidence where required.
6. Stop for Product, Architecture, dependency or security blockers.
7. Validate and return only responses compliant with `docs/ai-engineering-framework/90-agent-response-contract.md`; reject status-only outputs and require regeneration before routing continues.

## Routing

Use `scripts/dispatch-agent-workflow.py` for deterministic local routing checks.

Supported commands:

- `prepare <TASK-ID>`
- `execute <TASK-ID>`
- `review <TASK-ID>`
- `qa <TASK-ID>`
- `close <TASK-ID>`
- `status <TASK-ID>`

The dispatcher resolves the LP task file, lifecycle state, phase prompt, native skill and evidence directory. It validates command starting state before routing and may validate a supplied agent response with `scripts/validate-agent-response.py`.

The dispatcher must not mutate task state, perform automatic merges, deploy, collapse Review/QA/Security/release evidence, or mark dependencies complete.
