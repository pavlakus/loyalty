# 80. Agent Workflow

## Purpose

This document defines the mandatory end-to-end workflow for AI-assisted development in the Loyalty Platform repository.

Every workflow stage must return a response compliant with `docs/ai-engineering-framework/90-agent-response-contract.md`. Status-only responses are invalid and must be regenerated before the workflow can advance.

## Workflow

```text
Product / Blueprint
        ↓
Approved MIP
        ↓
Draft LP Task
        ↓
Task Preparation Agent
        ↓
READY Gate
        ↓
Implementation Agent
        ↓
Implementation Evidence
        ↓
Independent Review Agent
        ↓
Correction Cycle if needed
        ↓
QA Agent
        ↓
READY_FOR_MERGE
        ↓
Human Merge
        ↓
Release Manager
```

## Stage 1 — Task Preparation

Input:

- LP task ID;
- MIP;
- repository state;
- TASK-INDEX;
- TASK-STATUS;
- authoritative documents.

The Task Preparation Agent must:

1. read `AGENTS.md`;
2. read `78-task-preparation-agent.md`;
3. read the LP task;
4. read the MIP;
5. verify dependencies;
6. verify exact required documents;
7. fix safe metadata and path issues;
8. generate implementation, review and QA prompts;
9. update status and index;
10. return READY FOR IMPLEMENTATION.

The returned response must include response-contract metadata, evidence, next action and Workflow Result footer.

It must stop for:

- missing Product Decision;
- missing ADR;
- unresolved real dependency;
- missing MIP;
- critical contradiction;
- unsafe scope.

## Stage 2 — Implementation

The implementation agent may start only when:

- LP status is READY;
- dependencies are complete;
- implementation prompt exists;
- branch matches task;
- required documents exist.

The agent must:

- implement only scope;
- run mandatory tests;
- update documentation;
- produce evidence;
- return READY FOR REVIEW or BLOCKED.

The returned response must comply with `docs/ai-engineering-framework/90-agent-response-contract.md`, including changed files, commands, tests, known limitations, Definition of Done evidence and readiness recommendation.

Implementation evidence must be persisted at:

```text
implementation/evidence/<TASK-ID>/implementation.md
```

The evidence must record documents read, files changed, acceptance criteria coverage, mandatory validations, exact command results, security considerations, risks, known limitations and rollback or recovery.

## Stage 3 — Independent Review

A new Codex session must perform read-only review.

The reviewer must not rely only on the implementation response.

The reviewer must inspect:

- git diff;
- changed files;
- tests;
- migrations;
- security;
- documentation;
- task acceptance criteria.

Review evidence must be persisted at:

```text
implementation/evidence/<TASK-ID>/review.md
```

Review returns one of: APPROVED, APPROVED WITH FOLLOW-UP, CHANGES_REQUIRED or BLOCKED.

Review responses must comply with `docs/ai-engineering-framework/90-agent-response-contract.md`. They must include scope reviewed, findings or explicit none, evidence, required corrections, next action and merge recommendation. `APPROVED WITH FOLLOW-UP` must classify the follow-up as blocking or non-blocking and state whether merge is allowed.

## Stage 4 — Correction

If review returns CHANGES REQUIRED:

- create or use a correction prompt;
- apply only exact corrections;
- rerun tests;
- rerun independent review.

## Stage 5 — QA

QA runs only after technical review approval.

QA validates:

- acceptance criteria;
- regression;
- failure paths;
- UAT scenarios;
- security outcomes;
- concurrency where required.

QA evidence must be persisted at:

```text
implementation/evidence/<TASK-ID>/qa.md
```

QA returns one of: QA APPROVED, QA CHANGES REQUIRED or QA BLOCKED.

QA responses must comply with `docs/ai-engineering-framework/90-agent-response-contract.md`. They must include failed acceptance criteria or explicit none, evidence, required corrections, next action and Workflow Result footer.

## Stage 6 — Merge

A task may become READY_FOR_MERGE only when:

- technical review approved;
- QA approved;
- Security approved where required;
- documentation synchronized;
- rollback or recovery recorded;
- TASK-STATUS updated.

Humans perform the merge.

Merge and close responses must comply with `docs/ai-engineering-framework/90-agent-response-contract.md`; they must include Git evidence, remaining approvals, next action and Workflow Result footer.

## Stage 7 — Release

Release Manager validates:

- release scope;
- migration safety;
- configuration;
- feature flags;
- smoke tests;
- monitoring;
- rollback;
- release evidence.

## Status Transitions

```text
DRAFT
→ TASK_PREPARATION
→ READY
→ ASSIGNED
→ IN_PROGRESS
→ IMPLEMENTATION_COMPLETE
→ READY_FOR_REVIEW
→ REVIEW
→ QA
→ READY_FOR_MERGE
→ MERGED
→ DONE
```

Alternative states:

- BLOCKED
- CHANGES_REQUIRED
- CANCELLED
- DEFERRED

Failure paths:

- TASK PREPARATION BLOCKED is used before READY when preparation cannot safely complete.
- CHANGES_REQUIRED is used after review or QA finds mandatory in-scope corrections.
- BLOCKED is used when Product, Architecture, dependency, security, scope or repository state prevents progress.

Gate rules:

- Developer Agents execute only READY tasks, except explicitly authorized correction passes from CHANGES_REQUIRED.
- Review and QA approvals must be persisted before READY_FOR_MERGE.
- Human maintainers perform merges; agents do not auto-merge.
- MERGED is based on Git state.
- No agent may mark an unfinished dependency complete.

## Usage-Limit Continuation

Before a Codex usage window ends, the active agent must create:

`implementation/session-handoffs/<TASK-ID>.md`

The handoff includes:

- completed work;
- remaining work;
- changed files;
- commands;
- tests;
- blockers;
- exact next action.

A later session continues the same branch and same task.
