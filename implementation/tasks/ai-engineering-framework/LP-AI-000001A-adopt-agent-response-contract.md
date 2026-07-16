# LP-AI-000001A. Adopt Agent Response Contract

## Status

`DONE`

## Priority

`P0`

## Complexity

`M`

## Assigned Role

`Documentation Agent`

## Owning Area

`AI Engineering Framework`

## MIP

`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Business Value

Ensure every AI agent returns complete, auditable and machine-readable responses so workflow decisions no longer depend on manual interpretation.

## Expected User Outcome

The Product Owner never receives incomplete outputs such as only `APPROVED WITH FOLLOW-UP` or `QA CHANGES REQUIRED` without findings, evidence and next action.

## Technical Objective

Adopt `docs/ai-engineering-framework/90-agent-response-contract.md` across the AI workflow, agent instructions, prompts and native skills.

## Dependencies

- `LP-AI-000001` implementation completed
- `docs/ai-engineering-framework/90-agent-response-contract.md` exists
- Native Codex skills exist under `.codex/skills/`

## Required Documents

- `AGENTS.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `docs/ai-engineering-framework/82-dispatcher-command-standard.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

## Exact Scope

Update the AI Engineering Framework so all supported agent roles must follow the response contract.

Required roles:

- Task Preparation Agent
- Implementation Agent
- Review Agent
- QA Agent
- Security Agent
- DevOps Agent
- Release Manager
- Dispatcher Agent

## Required Changes

### 1. Root AGENTS.md

Add `90-agent-response-contract.md` to authoritative documents.

Add a mandatory rule:

- every agent response must comply with the response contract;
- status-only responses are invalid;
- invalid responses must be regenerated before workflow continues.

### 2. Agent Framework Documents

Update:

- `78-task-preparation-agent.md`
- `79-agent-registry.md`
- `80-agent-workflow.md`
- `82-dispatcher-command-standard.md`

Add explicit references to the response contract.

### 3. Native Skills

Update all existing `.codex/skills/*/SKILL.md` files so outputs must comply with the response contract.

At minimum:

- task-preparation
- dispatcher
- review
- qa
- environment-preflight

### 4. Prompt Templates

Update all AI framework prompt templates under:

`implementation/codex-prompts/ai-engineering-framework/**`

Every prompt must:

- require the response contract;
- forbid status-only output;
- require evidence;
- require next action;
- require machine-readable workflow footer.

### 5. Response Validator

Create:

`scripts/validate-agent-response.py`

The script must validate a Markdown response file for:

- mandatory metadata;
- Executive Summary;
- Status;
- Evidence;
- Next Action;
- Workflow Result footer;
- required finding details for CHANGES REQUIRED;
- required blocker details for BLOCKED;
- required follow-up details for APPROVED WITH FOLLOW-UP.

The script must return non-zero for invalid responses.

### 6. Tests

Create test fixtures under:

`scripts/tests/agent-response-contract/`

Include:

- valid approved review;
- invalid status-only approved review;
- valid approved-with-follow-up;
- invalid approved-with-follow-up without follow-up details;
- valid QA changes-required;
- invalid QA changes-required without finding;
- valid blocked response;
- invalid blocked response without resume condition.

## Allowed Files

```text
AGENTS.md
docs/ai-engineering-framework/**
.codex/skills/**
implementation/codex-prompts/ai-engineering-framework/**
scripts/validate-agent-response.py
scripts/tests/agent-response-contract/**
implementation/evidence/LP-AI-000001A/**
implementation/tasks/ai-engineering-framework/**
implementation/TASK-STATUS.md
```

## Forbidden Files

```text
docs/blueprint/**
apps/**
services/**
packages/**
database/**
implementation/mip/MIP-000*
implementation/mip/MIP-001*
implementation/mip/MIP-002*
implementation/mip/MIP-003*
```

## Acceptance Criteria

1. All supported agent roles reference the response contract.
2. Status-only responses are explicitly invalid.
3. Dispatcher refuses invalid responses.
4. Validator script detects all supplied valid and invalid fixtures correctly.
5. Review outputs require findings/evidence/next action.
6. QA outputs require failed criteria or explicit none.
7. BLOCKED outputs require category, owner, action and resume condition.
8. APPROVED WITH FOLLOW-UP requires blocking classification and merge permission.
9. No Loyalty business behavior changes.
10. Documentation and tests pass.

## Mandatory Validation

Run:

```bash
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/valid-approved-review.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/invalid-status-only-approved.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/valid-approved-with-follow-up.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/invalid-follow-up-missing-details.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/valid-qa-changes-required.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/invalid-qa-without-finding.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/valid-blocked.md
python3 scripts/validate-agent-response.py scripts/tests/agent-response-contract/invalid-blocked-without-resume.md
```

Expected:

- valid fixtures exit `0`;
- invalid fixtures exit non-zero.

Also run:

```bash
rg "90-agent-response-contract" AGENTS.md docs/ai-engineering-framework .codex/skills implementation/codex-prompts/ai-engineering-framework
```

## Required Evidence

Create:

`implementation/evidence/LP-AI-000001A/implementation.md`

Include:

- changed files;
- commands;
- validation results;
- known limitations;
- readiness recommendation.

## Definition of Done

Target:

`Level 2 — Integration Ready`

## Completion Rule

Return `READY FOR REVIEW` only when all mandatory validation passes.
