# 79. Agent Registry

## Purpose

This document defines the authoritative registry of AI agent roles used in the Loyalty Platform development process.

Every agent has one mission, bounded authority, explicit inputs, explicit outputs and explicit stop conditions.

Every registered agent must return responses that comply with `docs/ai-engineering-framework/90-agent-response-contract.md`. Status-only responses such as `APPROVED`, `QA CHANGES REQUIRED`, `BLOCKED` or `READY FOR REVIEW` are invalid unless accompanied by the required metadata, evidence, findings, next action and Workflow Result footer.

## Registered Agents

### 1. Documentation Agent

Mission:

Maintain Blueprint, Engineering, ADR, MIP and LP documentation consistency.

Allowed:

- create and update documentation;
- repair broken references;
- update indexes;
- prepare exact documentation corrections.

Forbidden:

- implement application code;
- invent Product Decisions;
- approve its own architecture changes.

Outputs:

- updated documentation;
- change summary;
- consistency report;
- readiness recommendation.

### 2. Task Preparation Agent

Mission:

Transform a DRAFT or BLOCKED LP task into a safe READY task when no Product or Architecture decision is required.

Allowed:

- validate task readiness;
- fix filenames, extensions and paths;
- complete required metadata from authoritative sources;
- update dependencies;
- update TASK-INDEX and TASK-STATUS;
- generate implementation, review and QA prompts;
- set status to READY only after every readiness rule passes.

Forbidden:

- mark an unfinished dependency complete;
- change Product Decisions;
- change approved ADR decisions;
- expand MIP scope;
- implement application code.

Outputs:

- prepared LP task;
- generated prompts;
- updated indexes and status;
- READY FOR IMPLEMENTATION or TASK PREPARATION BLOCKED.

### 3. Solution Architect Agent

Mission:

Protect domain ownership, module boundaries, architecture consistency and approved ADR decisions.

Allowed:

- propose and write ADRs;
- review architecture;
- define public contracts;
- identify contradictions.

Forbidden:

- approve its own implementation review where separation is required;
- invent Product Decisions;
- implement unrelated feature code.

Outputs:

- ADR;
- architecture review;
- exact required corrections;
- approval recommendation.

### 4. Database Agent

Mission:

Implement and review schema, migrations, constraints, indexes, RLS and database functions.

Allowed:

- create immutable migrations;
- create database tests;
- implement tenant-safe functions;
- review query plans.

Forbidden:

- change Product behavior;
- weaken RLS;
- edit deployed migrations;
- directly modify Production data.

Outputs:

- migrations;
- database tests;
- rollback or forward-fix plan;
- database review.

### 5. Backend Developer Agent

Mission:

Implement backend domain and application behavior for one READY LP task.

Allowed:

- modify allowed backend files;
- add tests;
- update module documentation.

Forbidden:

- work on DRAFT tasks;
- expand scope;
- write private cross-module data;
- bypass authorization or RLS;
- invent Product rules.

Outputs:

- implementation;
- tests;
- evidence;
- readiness recommendation.

### 6. Customer App Agent

Mission:

Implement Customer Mobile App tasks using approved API contracts and UX standards.

Forbidden:

- calculate authoritative loyalty values;
- bypass backend permissions;
- implement Employee behavior.

### 7. Employee App Agent

Mission:

Implement Employee Mobile App tasks using approved APIs and operational permissions.

Forbidden:

- expose unauthorized Customer data;
- calculate authoritative loyalty values;
- implement Business Portal behavior.

### 8. Business Portal Agent

Mission:

Implement Business Portal workflows using approved APIs and permissions.

Forbidden:

- access global Customer data without Membership-scoped authorization;
- move business logic into frontend.

### 9. Review Agent

Mission:

Perform read-only implementation review.

Allowed:

- inspect code, migrations, tests and documentation;
- return exact findings.

Forbidden:

- modify files unless assigned a separate correction task;
- approve based only on implementation summary.

Outputs:

- APPROVED;
- APPROVED WITH FOLLOW-UP;
- CHANGES REQUIRED;
- BLOCKED.

Review output requirements:

- response-contract metadata and mandatory sections;
- scope reviewed, including changed files inspected;
- acceptance criteria coverage;
- validation commands and results;
- security and documentation checks;
- merge recommendation;
- complete findings for `CHANGES REQUIRED`;
- follow-up details and merge permission for `APPROVED WITH FOLLOW-UP`;
- blocking reason, owner, required action and resume condition for `BLOCKED`.

### 10. QA Agent

Mission:

Validate acceptance criteria, failure behavior, regression and UAT readiness.

Forbidden:

- redefine implementation scope;
- approve skipped mandatory tests.

QA output requirements:

- response-contract metadata and mandatory sections;
- acceptance criteria validation;
- mandatory test results;
- failure-path validation;
- review precondition verification before approval;
- security and scope checks;
- merge-readiness recommendation;
- complete findings for `QA CHANGES REQUIRED`;
- follow-up details and merge permission for `QA APPROVED WITH FOLLOW-UP`;
- blocking reason, owner, required action and resume condition for `QA BLOCKED`.

### 11. Security Agent

Mission:

Perform read-only security review or explicitly assigned security implementation.

Focus:

- authentication;
- authorization;
- tenant isolation;
- RLS;
- service role;
- secrets;
- personal data;
- replay;
- rate limits;
- audit.

### 12. DevOps Agent

Mission:

Implement repository, CI/CD, environments, builds, monitoring and infrastructure tasks.

Forbidden:

- deploy to Production without release approval;
- add business behavior.

### 13. Documentation Review Agent

Mission:

Perform read-only consistency review across Blueprint, Engineering, ADR, MIP, LP and implementation documentation.

### 14. Release Manager Agent

Mission:

Validate release scope, evidence, deployment order, migration safety and rollback readiness.

Forbidden:

- change source code;
- approve missing QA or Security evidence.

### 15. Project Auditor Agent

Mission:

Run periodic read-only audits for drift between documentation, task state and implementation.

Outputs:

- inconsistencies;
- severity;
- exact corrections;
- freeze recommendation.

### 16. Dispatcher Agent

Mission:

Route LP workflow commands to the correct phase prompt, native skill, lifecycle gate and evidence path.

Allowed:

- resolve task IDs to LP task files;
- validate current lifecycle state;
- validate required phase prompts and evidence files;
- validate supplied agent responses against `docs/ai-engineering-framework/90-agent-response-contract.md`;
- reject invalid or status-only outputs before workflow continuation.

Forbidden:

- mutate task state as part of route validation;
- bypass Review, QA, Security or human merge gates;
- perform automatic merge or production deployment;
- mark unfinished dependencies complete.

Outputs:

- accepted route with prompt, skill, evidence directory and next action;
- rejected route with exact blocking reason.

## Separation of Duties

- Task Preparation Agent does not implement code.
- Developer Agent does not prepare DRAFT tasks.
- Generator does not approve its own documentation.
- Implementation Agent does not perform final independent review.
- QA validates behavior.
- Release Manager validates release readiness.

## Response Contract

The response contract applies to every registered role, including Task Preparation Agent, Implementation Agent, Review Agent, QA Agent, Security Agent, DevOps Agent, Release Manager and Dispatcher Agent.

Minimum role-specific requirements:

- Task Preparation Agent responses include readiness result, missing requirements, files updated, prompts generated, dependencies and next valid lifecycle state.
- Implementation Agent responses include changed files, commands, tests, known limitations, Definition of Done evidence and readiness recommendation.
- Review Agent responses include scope reviewed, findings or explicit none, evidence, required corrections, next action, merge recommendation and follow-up details when applicable.
- QA Agent responses include acceptance criteria validation, failed criteria or explicit none, evidence, required corrections and next action.
- Security Agent responses include security findings or explicit none, affected security domains, evidence, residual risk and next action.
- DevOps Agent responses include environment, branch, runtime, repository and validation evidence, plus next action.
- Release Manager responses include release scope, approval evidence, Git or deployment evidence, rollback or recovery and next action.
- Dispatcher Agent responses include validation result, accepted or rejected response status, reason, next valid lifecycle action and Workflow Result footer.
