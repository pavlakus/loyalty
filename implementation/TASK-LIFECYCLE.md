# Task Lifecycle

This document is the authoritative lifecycle standard for LP implementation tasks. It governs AI-driven preparation, implementation, review, QA, merge readiness and closure without changing Loyalty business behavior.

All lifecycle phase responses must comply with `docs/ai-engineering-framework/90-agent-response-contract.md`. Status-only responses are invalid and must be regenerated before a transition can be accepted.

## Authoritative States

### DRAFT

Task exists but has not passed preparation. Developer Agents must not implement DRAFT tasks.

### TASK_PREPARATION

Task Preparation Agent is validating and repairing safe metadata, references, prompts, evidence paths and status records.

### READY

Task has passed the Definition of Task Ready and may be assigned for implementation. READY requires complete dependencies, complete required documents, explicit allowed and forbidden files, mandatory tests, review requirements and rollback or recovery expectations.

### ASSIGNED

Exactly one implementation agent or human owner is assigned to the task. Assignment does not authorize scope expansion.

### IN_PROGRESS

Implementation has started on a task that was READY or on an explicitly authorized correction pass from CHANGES_REQUIRED.

### IMPLEMENTATION_COMPLETE

Implementation agent reports task scope complete, documentation synchronized and mandatory self-checks executed or documented with exact reasons.

### READY_FOR_REVIEW

Implementation evidence exists under `implementation/evidence/<task-id>/implementation.md`, mandatory validations are recorded and independent review may start.

### REVIEW

Independent technical review is active. The Review Agent is read-only unless a separate correction task explicitly authorizes edits.

### CHANGES_REQUIRED

Review found mandatory corrections. A correction pass may continue only from the exact findings and must not expand task scope.

### QA

Technical review approved and QA validation is active. QA validates acceptance criteria and behavior evidence; it does not replace independent technical review.

### READY_FOR_MERGE

All required review, QA and Security approvals are persisted. Documentation, status records and rollback or recovery evidence are complete.

### MERGED

Task branch is merged into the target development branch by a human maintainer. MERGED is based on Git state, not a documentation guess.

### DONE

Post-merge checks, documentation, status records and final evidence are complete.

### BLOCKED

A real Product, Architecture, dependency, security, scope or repository-state blocker prevents progress. The blocking evidence must name the exact cause and next action.

### CANCELLED

Task will not be implemented.

### DEFERRED

Task is intentionally postponed.

## Transition Authority

| Transition | Authorized Role | Required Evidence |
|---|---|---|
| DRAFT -> TASK_PREPARATION | Task Preparation Agent | Preparation started in status records |
| TASK_PREPARATION -> READY | Task Preparation Agent | `prepare.md`, task/index/status updates, generated prompts |
| READY -> ASSIGNED | Project Manager / Human | Assigned owner and task branch expectation |
| ASSIGNED -> IN_PROGRESS | Implementation Agent | READY verification and current Git state |
| READY -> IN_PROGRESS | Implementation Agent | Allowed only when assignment is implicit in the implementation prompt |
| IN_PROGRESS -> IMPLEMENTATION_COMPLETE | Implementation Agent | Scope summary, changed files, documentation sync, validation commands |
| IMPLEMENTATION_COMPLETE -> READY_FOR_REVIEW | Implementation Agent | `implementation.md` and mandatory validation evidence |
| READY_FOR_REVIEW -> REVIEW | Review Agent | Review prompt and implementation evidence exist |
| REVIEW -> CHANGES_REQUIRED | Review Agent | `review.md` with exact findings |
| CHANGES_REQUIRED -> IN_PROGRESS | Implementation Agent | Correction prompt or explicit authorization |
| REVIEW -> QA | Review Agent | `review.md` approval or approved-with-follow-up result |
| QA -> CHANGES_REQUIRED | QA Agent | `qa.md` with exact failed acceptance criteria or validation gaps |
| QA -> READY_FOR_MERGE | QA Agent plus required reviewers | `qa.md`, required approvals and status updates |
| READY_FOR_MERGE -> MERGED | Human maintainer | Git merge evidence |
| MERGED -> DONE | Task Preparation, Documentation or Release Manager Agent | Post-merge checks and final status consistency |
| Any -> BLOCKED | Any agent with evidence | Blocker reason, impacted files/modules and required next action |
| Any -> CANCELLED | Human maintainer / Product Owner | Cancellation decision |
| Any -> DEFERRED | Human maintainer / Product Owner | Deferral decision |

## Phase Evidence

Evidence is stored under:

```text
implementation/evidence/<task-id>/
```

Required phase files:

| Phase | Evidence File | Minimum Contents |
|---|---|---|
| Preparation | `prepare.md` | readiness checklist, automatic fixes, generated prompts, blockers |
| Implementation | `implementation.md` | documents read, changes made, validation commands, test results, risks, rollback or recovery |
| Review | `review.md` | changed files inspected, findings, approval result, follow-up requirements |
| QA | `qa.md` | acceptance criteria validation, failure-path validation, regression checks, QA result |
| Security | `security.md` when required | security findings, approval result, residual risk |
| Release | `release.md` when required | release scope, deployment evidence, rollback or recovery |

Every evidence file must include the task ID, phase, agent role, date or command context, documents read, exact commands executed and exact result.

Every agent-facing response must also include the response-contract metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.

## Gate Rules

- Developer Agents execute only READY tasks, except explicitly authorized correction passes from CHANGES_REQUIRED.
- Task Preparation Agents may repair safe metadata and documentation references, but must not invent Product Decisions, change approved ADRs, expand MIP scope or mark unfinished dependencies complete.
- READY requires all real dependencies complete; documentation must not falsely close a dependency to unblock implementation.
- Implementation Agents modify only allowed files and must stop for scope expansion, missing Product Decisions, missing ADRs or security blockers.
- Review and QA approvals must be persisted before READY_FOR_MERGE.
- Security approval is required when the task requires Security review or changes authentication, authorization, tenant isolation, RLS, service-role behavior, secrets, personal data, audit, exports, integrations or admin functionality.
- Human maintainers perform merges. Agents must not auto-merge or mark MERGED without Git evidence.
- DONE requires status records, documentation consistency and post-merge evidence.
- Dispatcher must reject status-only or response-contract invalid outputs before lifecycle state advances.

## Failure Paths

### TASK PREPARATION BLOCKED

Use when preparation discovers a missing Product Decision, missing ADR, unresolved real dependency, missing MIP, critical contradiction, unsafe scope or missing business approval. The task must remain out of READY.

### BLOCKED

Use during implementation, review, QA, release or closure when progress cannot continue without a Product, Architecture, dependency, security, scope or repository-state decision. Evidence must include the exact blocker and next action.

### CHANGES_REQUIRED

Use when review or QA finds mandatory corrections inside approved scope. A correction pass may change only files required by the finding and must rerun the affected validation.

### DEFERRED or CANCELLED

Use only with human maintainer or Product Owner decision. Agents must not defer or cancel tasks merely because implementation is difficult.

## Prompt Routing

Repository prompts must route phases explicitly:

- implementation prompts read root instructions, the LP task, MIP, Knowledge Package, workflow documents and directory instructions for changed paths;
- review prompts require read-only inspection of implementation evidence, changed files, acceptance criteria, tests, security and documentation;
- QA prompts require prior review approval and validate acceptance criteria, mandatory tests, failure paths, regression and evidence completeness;
- close prompts require review, QA and required Security approvals, Git merge evidence and final status consistency.

Dispatcher commands must preserve phase boundaries: `prepare`, `execute`, `review`, `qa`, `close` and `status` are separate actions with separate evidence.

## Scope Isolation

Workflow stabilization tasks may update workflow documentation, prompts, status files, scripts and evidence when allowed by their LP task. They must not contaminate feature-task scope or modify Loyalty business behavior.
