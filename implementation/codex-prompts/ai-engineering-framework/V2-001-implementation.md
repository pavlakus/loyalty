# Implementation Prompt: V2-001

Read `AGENTS.md` first.

## Task

`V2-001` - Scope Manifest Standard

## Phase

`implementation`

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/V2-001-scope-manifest-standard.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/68-definition-of-task-ready.md`

## Preconditions

- Confirm V2-001 status is `READY`.
- Confirm LP-AI-000001, LP-AI-000001A, LP-AI-000002, LP-AI-000003 and LP-AI-000004 are `DONE`.
- Confirm this task remains within `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`.

If any precondition fails, stop and return `IMPLEMENTATION BLOCKED` with complete response-contract evidence.

## Implementation Scope

Implement only the Scope Manifest Standard:

- create `implementation/workflow-state/schemas/task-scope-manifest.schema.json`;
- create `implementation/workflow-state/examples/LP-AI-000004.scope.json`;
- create invalid fixtures under `implementation/workflow-state/fixtures/task-scope-manifest/` for:
  - missing task ID;
  - missing MIP;
  - empty allowed files;
  - overlapping allowed and forbidden paths;
  - invalid lifecycle transition;
  - missing evidence paths;
  - unknown manifest version;
- define and create `scripts/validate-task-scope-manifest.py` only as needed to validate the schema, valid example and invalid fixtures;
- document canonical manifest location `implementation/workflow-state/manifests/<TASK-ID>.json`;
- document manifest fields, path-matching rules, precedence rules and integration points;
- update AI Engineering Framework documentation only where required.

## Forbidden Scope

Do not:

- implement V2-002 Scope Isolation Engine enforcement;
- modify Loyalty application code;
- modify `apps/**`, `services/**`, `packages/**`, `database/**`, `docs/blueprint/**` or `implementation/mip/**`;
- change Product Decisions, accepted ADR decisions or Loyalty business behavior;
- implement environment preflight, dispatcher v2 routing, review enforcement, QA enforcement or one-command workflow;
- perform automatic merge or production deployment.

## Mandatory Validation

Run or document exact inability to run:

- JSON syntax validation for the schema, valid example and invalid fixtures;
- `python3 scripts/validate-task-scope-manifest.py implementation/workflow-state/examples/LP-AI-000004.scope.json`;
- validator failure for missing task ID fixture;
- validator failure for missing MIP fixture;
- validator failure for empty allowed files fixture;
- validator failure for overlapping allowed and forbidden paths fixture;
- validator failure for invalid lifecycle transition fixture;
- validator failure for missing evidence paths fixture;
- validator failure for unknown manifest version fixture;
- syntax check for `scripts/validate-task-scope-manifest.py`;
- `git status --short`;
- `git status --short apps services packages database docs/blueprint implementation/mip`;
- search or inspect evidence that V2-002 enforcement was not implemented.

## Evidence

Persist implementation evidence to:

```text
implementation/evidence/V2-001/implementation.md
```

Implementation evidence must include documents read, files changed, acceptance criteria coverage, exact commands and results, security/scope considerations, risks, known limitations, rollback or recovery and Definition of Done evidence.

## Required Result

Return exactly one of:

- `READY FOR REVIEW`
- `IMPLEMENTATION BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
