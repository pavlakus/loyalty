# Review Prompt: LP-AI-000004

Read `AGENTS.md` first.

## Task

`LP-AI-000004` - Implement Dispatcher Agent

## Phase

`review`

## Preconditions

Run review only after LP-AI-000004 implementation evidence exists and the task is in `READY_FOR_REVIEW`.

## Required Reading

- `AGENTS.md`
- `implementation/tasks/ai-engineering-framework/LP-AI-000004-implement-dispatcher-agent.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`
- `.codex/skills/dispatcher/SKILL.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/evidence/LP-AI-000004/implementation.md`

## Review Scope

Perform read-only review of:

- dispatcher command routing for `prepare`, `execute`, `review`, `qa`, `close` and `status`;
- lifecycle starting-point validation for every command;
- task ID to LP task, MIP, prompt, skill and evidence-path resolution;
- native dispatcher skill alignment;
- response-contract validation and rejection of status-only or incomplete outputs;
- evidence phase separation;
- guardrails preventing bypass of Review, QA, Security and human merge;
- guardrails preventing automatic merge or production deployment;
- guardrails preventing unfinished dependencies from being marked complete;
- dispatcher tests or fixtures;
- documentation consistency;
- no Loyalty business behavior changes;
- no Blueprint changes;
- no application code changes outside allowed scope.

## Required Validation

Run or inspect exact results for:

- dispatcher happy-path simulations or tests for all six commands;
- dispatcher failure-path simulations or tests for unknown task, missing prompt, missing evidence and invalid lifecycle transitions;
- response-contract invalid output rejection;
- status-only output rejection;
- syntax checks for changed scripts;
- `git status --short`;
- `git status --short apps services database/migrations docs/blueprint`.

Persist review evidence to:

```text
implementation/evidence/LP-AI-000004/review.md
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
