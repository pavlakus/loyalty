# Review Prompt: V2-001

Read `AGENTS.md` first.

## Task

`V2-001` - Scope Manifest Standard

## Phase

`review`

## Preconditions

Run review only after V2-001 implementation evidence exists and the task is in `READY_FOR_REVIEW`.

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
- `implementation/evidence/V2-001/implementation.md`

## Review Scope

Perform read-only review of:

- canonical scope manifest format and all required fields;
- canonical manifest location;
- JSON Schema location and content;
- valid example manifest;
- invalid fixtures for all required failure cases;
- validator script behavior and limits;
- path-matching rules;
- precedence rules;
- integration points with Task Preparation Agent, Dispatcher, Review Agent, QA Agent, Environment Preflight and V2-002;
- evidence that V2-002 enforcement was not implemented;
- documentation consistency;
- no Loyalty application code changes;
- no Blueprint, MIP, database, package, app or service changes.

## Required Validation

Run or inspect exact results for:

- JSON syntax validation for schema, example and fixtures;
- valid example passing the manifest validator;
- every invalid fixture failing the manifest validator;
- syntax check for the validator script;
- `git status --short`;
- `git status --short apps services packages database docs/blueprint implementation/mip`;
- evidence that V2-002 enforcement behavior is absent.

Persist review evidence to:

```text
implementation/evidence/V2-001/review.md
```

## Required Result

Return exactly one of:

- `APPROVED`
- `APPROVED WITH FOLLOW-UP`
- `CHANGES REQUIRED`
- `BLOCKED`

## Response Contract

- Read `docs/ai-engineering-framework/90-agent-response-contract.md` before returning a result.
- Return a complete response compliant with the contract.
- Status-only output is invalid and must be regenerated before workflow continues.
- Include mandatory metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.
- If returning `CHANGES REQUIRED`, include at least one finding with Severity, File, Impact and Exact Required Correction.
- If returning `BLOCKED`, include Blocking Reason, Blocking Category, Blocking Owner, Required Action and Resume Condition.
