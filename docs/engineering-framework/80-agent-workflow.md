# 80. Agent Workflow

## Purpose

This document defines the mandatory end-to-end workflow for AI-assisted development in the Loyalty Platform repository.

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

## Stage 6 — Merge

A task may become READY_FOR_MERGE only when:

- technical review approved;
- QA approved;
- Security approved where required;
- documentation synchronized;
- rollback or recovery recorded;
- TASK-STATUS updated.

Humans perform the merge.

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
