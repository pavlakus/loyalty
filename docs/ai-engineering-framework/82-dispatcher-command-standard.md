# 82. Dispatcher Command Standard

Supported commands:

```text
prepare <TASK-ID>
execute <TASK-ID>
review <TASK-ID>
qa <TASK-ID>
close <TASK-ID>
status <TASK-ID>
```

The dispatcher locates the task and MIP, validates lifecycle, invokes the matching skill, persists evidence and returns the next valid action.

The dispatcher must validate every agent response against `docs/ai-engineering-framework/90-agent-response-contract.md`. Status-only responses are invalid. If validation fails, the dispatcher rejects the response, records the validation failure and requires the agent to regenerate a compliant response before workflow continues.

Repository-local dispatcher routing is implemented by:

```text
scripts/dispatch-agent-workflow.py
```

The script resolves the LP task file, current lifecycle state, phase prompt, native skill and evidence directory. It validates the requested command against the allowed lifecycle starting point and can validate a supplied response with `scripts/validate-agent-response.py` before allowing workflow continuation.

When a task scope manifest exists at `implementation/workflow-state/manifests/<TASK-ID>.json`, Dispatcher must treat it as route context and expose its path in command output. Dispatcher must not enforce file-scope decisions until V2-002 or a later integration task explicitly adds that behavior.

## Command Responsibilities

| Command | Valid Starting Point | Required Result |
|---|---|---|
| `prepare <TASK-ID>` | DRAFT, BLOCKED when preparation blocker was resolved | READY FOR IMPLEMENTATION or TASK PREPARATION BLOCKED |
| `execute <TASK-ID>` | READY, or CHANGES_REQUIRED with explicit correction authorization | READY FOR REVIEW or BLOCKED |
| `review <TASK-ID>` | READY_FOR_REVIEW | APPROVED, APPROVED WITH FOLLOW-UP, CHANGES REQUIRED or BLOCKED |
| `qa <TASK-ID>` | QA after review approval | QA APPROVED, QA CHANGES REQUIRED or QA BLOCKED |
| `close <TASK-ID>` | READY_FOR_MERGE or MERGED | MERGED, DONE or BLOCKED |
| `status <TASK-ID>` | Any state | Current lifecycle state and next valid action |

## Evidence Routing

The dispatcher must preserve separate phase evidence under:

```text
implementation/evidence/<TASK-ID>/
```

Required files by phase:

- `prepare.md`
- `implementation.md`
- `review.md`
- `qa.md`
- `security.md` when required
- `release.md` when required

The dispatcher must not collapse preparation, implementation, review and QA into a single approval. Review, QA, Security and human merge gates remain separate.

Every phase response must include required metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and the machine-readable Workflow Result footer.

## Scope Manifest Routing

The canonical task scope manifest schema is:

```text
implementation/workflow-state/schemas/task-scope-manifest.schema.json
```

The canonical task scope manifest path is:

```text
implementation/workflow-state/manifests/<TASK-ID>.json
```

Manifests include allowed files, forbidden files, required documents, required MIP, required ADRs, dependencies, expected evidence paths, required commands, permitted lifecycle transitions and cross-module access.

Scope isolation validation is provided by:

```text
scripts/validate-task-scope.py <TASK-ID>
```

The validator loads the canonical manifest, validates it against the V2-001 manifest standard and checks Git changed paths across staged, unstaged, tracked, untracked, renamed and deleted states. Dispatcher integrations may consume its JSON output as route evidence once a later integration task enables automatic enforcement. Unrelated dirty worktree blocking is controlled by an explicit caller policy flag.

## Guardrails

- Do not route `execute` unless the task is READY or an authorized CHANGES_REQUIRED correction pass.
- Do not route `qa` before independent review approval.
- Do not route `close` to DONE without Git evidence for MERGED and completed status records.
- Do not mark unfinished dependencies complete.
- Do not perform automatic merge or production deployment.
- Do not accept status-only or response-contract invalid agent outputs.
- Do not mutate task state from the dispatcher routing check; state transitions remain phase-agent or Release Manager responsibilities.
