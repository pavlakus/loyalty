# AGENTS.md

## 1. Purpose

This file is the root instruction document for all AI agents and Codex sessions working in the Loyalty Platform repository.

It defines:

- which documents are authoritative;
- what every agent must read;
- how tasks are executed;
- what agents may and may not change;
- how module ownership is protected;
- how implementation evidence is returned;
- when work must stop and be escalated.

This file does not introduce new Product Decisions.

All agents must follow this file before reading directory-level `AGENTS.md` files.

---

## 2. Project Status

The project has completed:

- Blueprint v1.0;
- Engineering Playbook v1.0;
- Global Consistency Review;
- Implementation Framework;
- AI Engineering Framework;
- initial Module Implementation Packages;
- initial LP task catalogs.

Implementation has not yet replaced the Blueprint as the source of truth.

---

## 3. Documentation Priority

When documents overlap or conflict, use this priority order:

1. Locked Product Decisions
2. Final Blueprint Documents
3. Engineering Playbook
4. Approved ADRs
5. Current API and Event Contracts
6. Approved Module Implementation Package
7. Approved LP Task
8. Module Documentation
9. Implementation Code
10. Historical or Deprecated Documents

Higher-priority documents always override lower-priority documents.

Implementation code is never authoritative when it contradicts approved documentation.

---

## 4. Authoritative Documents

Every agent must know the following authoritative references.

### Terminology

- `docs/blueprint/00-platform-glossary.md`

### Product Scope and Decisions

- `docs/blueprint/01-product-vision.md`
- `docs/blueprint/03-business-rules.md`
- `docs/blueprint/26-product-decisions.md`
- `docs/blueprint/49-open-questions-final.md`

### Domain Ownership

- `docs/blueprint/33-domain-model-v2.md`

### Events

- `docs/blueprint/37-event-catalog.md`

### Data Model

- `docs/blueprint/42-data-model-v1.md`

### API Contracts

- `docs/blueprint/43-api-contract.md`

### Permissions and Security

- `docs/blueprint/17-security.md`
- `docs/blueprint/44-permission-matrix.md`

### Engineering Rules

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/53-development-roadmap.md`
- `docs/engineering/54-agent-development-plan.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/56-uat-scenarios.md`
- `docs/engineering/57-agent-prompts.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/engineering/61-global-consistency-review.md`

### AI Engineering Framework

- `docs/ai-engineering-framework/72-mip-generation-standard.md`
- `docs/ai-engineering-framework/73-lp-generation-standard.md`
- `docs/ai-engineering-framework/74-task-quality-checklist.md`
- `docs/ai-engineering-framework/75-agent-document-generation-prompt.md`
- `docs/ai-engineering-framework/76-agent-document-review-prompt.md`
- `docs/ai-engineering-framework/77-project-document-generator.md`

---

## 5. Historical and Deprecated Documents

Historical documents may be read only for design rationale.

They must never be used as the sole implementation source.

Examples:

- `04-domain-model.md`
- `06-database-design.md`
- `07-domain-aggregates.md`
- `08-data-model.md`
- `28-glossary.md`

When a historical document conflicts with an authoritative document, the authoritative document wins.

---

## 6. Required Reading Before Any Task

Before starting work, the assigned agent must read:

1. this root `AGENTS.md`;
2. the assigned LP task;
3. the referenced MIP;
4. the task-specific Knowledge Package;
5. relevant Blueprint documents;
6. relevant Engineering documents;
7. relevant ADRs;
8. directory-level `AGENTS.md` files for every changed path;
9. existing implementation and tests in the affected module.

The agent must not start implementation before confirming that the task is Ready according to:

- `docs/engineering/68-definition-of-task-ready.md`

---

## 7. Mandatory Task Inputs

Every implementation task must define:

- task ID;
- title;
- category;
- priority;
- business objective;
- technical objective;
- exact scope;
- out of scope;
- assigned role;
- owning module;
- dependencies;
- required documents;
- Knowledge Package;
- allowed files;
- forbidden files;
- acceptance criteria;
- mandatory tests;
- UAT references;
- required reviewers;
- expected deliverables;
- rollback or recovery expectations;
- Definition of Done level.

If any mandatory input is missing, the agent must stop and return:

`TASK NOT READY`

The response must list the missing inputs.

---

## 8. Scope Rules

Agents must:

- modify only files explicitly allowed by the task;
- remain inside the owning module;
- use public module contracts for cross-module interaction;
- preserve task boundaries;
- propose follow-up tasks for discovered out-of-scope work.

Agents must not:

- silently expand scope;
- combine unrelated tasks;
- modify forbidden files;
- refactor unrelated code;
- change product behavior without approval;
- create undocumented architecture;
- bypass reviews.

If required work falls outside scope, stop and return:

`SCOPE EXPANSION REQUIRED`

Include:

- reason;
- exact additional files;
- affected modules;
- risk;
- proposed follow-up task.

---

## 9. Product Decision Rules

Agents must never invent Product Decisions.

A Product Decision includes changes to:

- business outcomes;
- customer eligibility;
- Reward rules;
- Status rules;
- Benefit behavior;
- Membership behavior;
- tenant ownership;
- Customer identity;
- redemption rules;
- consent behavior;
- lifecycle behavior;
- business-visible defaults.

When a required Product Decision is missing, stop and return:

`BLOCKED BY PRODUCT DECISION`

Include:

- exact question;
- affected documents;
- affected module;
- implementation impact;
- safe options;
- recommended option if requested.

Do not continue implementation using a guessed business rule.

---

## 10. Architecture Decision Rules

Material architecture changes require an ADR.

Examples:

- module boundaries;
- aggregate ownership;
- new infrastructure technology;
- database strategy;
- event transport;
- API versioning;
- authentication architecture;
- cross-platform mobile architecture;
- caching architecture;
- deployment architecture.

Agents may propose ADRs.

Agents may not self-approve ADRs.

When an ADR is required, return:

`ADR REQUIRED`

Include:

- proposed title;
- context;
- options;
- recommendation;
- consequences;
- affected modules;
- migration impact.

---

## 11. Module Ownership Rules

Every business capability has exactly one owning module.

Agents must preserve:

- single aggregate ownership;
- single source of truth;
- public contract boundaries;
- no direct cross-module writes;
- no private cross-module imports;
- no duplicated business rules.

Forbidden examples:

- Reward module evaluating Status;
- Automation calculating Reward Points;
- frontend calculating authoritative loyalty values;
- Analytics modifying transactional state;
- Business module owning Customer;
- service-role writing foreign tenant data without validation.

Cross-module collaboration must use:

- Commands;
- Queries;
- Events;
- approved public interfaces.

---

## 12. Backend Rules

Business logic belongs in backend domain or application layers.

Controllers may:

- parse;
- validate transport data;
- resolve authenticated context;
- call use cases;
- map results;
- map known errors.

Controllers must not:

- calculate Reward Points;
- evaluate Status;
- grant Benefits;
- open business transactions directly;
- publish Events outside the approved application flow;
- contain tenant authorization logic beyond invoking approved guards.

---

## 13. Frontend and Mobile Rules

Customer App, Employee App, Business Portal and Platform Admin must never own authoritative business calculations.

Frontend may:

- validate for UX;
- present server results;
- maintain local UI state;
- cache server state safely;
- guide user workflows.

Frontend must not:

- calculate Reward Points;
- calculate XP;
- determine Status;
- determine Benefit eligibility;
- select Instant Rewards;
- calculate maximum redemption;
- infer permission from visible UI;
- trust cached state as authoritative.

Critical outcomes require confirmed backend responses.

---

## 14. Database Rules

All database changes must use immutable migrations.

Agents must:

- create new migration files;
- preserve deployed migration history;
- add constraints;
- add indexes with justification;
- implement RLS where relevant;
- test clean migration;
- test upgrade migration;
- define recovery or forward-fix strategy.

Agents must not:

- edit deployed migrations;
- run undocumented production SQL;
- use application filtering as a substitute for RLS;
- weaken tenant constraints for convenience;
- directly modify immutable ledger or receipt history.

---

## 15. Security Rules

Security is deny by default.

Every task must consider:

- authentication;
- authorization;
- tenant scope;
- RLS;
- service-role behavior;
- support access;
- Platform Admin access;
- forged identifiers;
- replay;
- duplicate requests;
- rate limiting;
- secrets;
- personal data;
- logging.

Never trust client-provided:

- `business_id`;
- `brand_id`;
- `location_id`;
- role;
- ownership;
- permission;
- price result;
- Reward result;
- Status result.

Service-role access bypasses RLS technically, but never bypasses:

- application authorization;
- tenant validation;
- domain rules;
- audit.

---

## 16. Immutable Data Rules

The following histories are immutable unless an authoritative document explicitly says otherwise:

- Reward Ledger;
- XP Ledger;
- Receipts;
- Receipt cancellation records;
- Events;
- audit history;
- completed Membership Years;
- release evidence.

Corrections use:

- compensating transactions;
- reversal Events;
- approved corrective commands;
- projection rebuilds.

Agents must never directly edit immutable history.

---

## 17. Idempotency Rules

Critical commands must be idempotent.

The task or MIP must define:

- key source;
- scope;
- request hash;
- duplicate behavior;
- mismatch behavior;
- parallel behavior;
- failure classification;
- retry behavior.

Parallel requests must produce one business outcome.

Same key with a different payload must return conflict.

---

## 18. Concurrency Rules

Application-level check followed by separate unprotected write is insufficient for critical operations.

Use appropriate protection:

- unique constraint;
- row lock;
- advisory lock;
- conditional update;
- version column;
- atomic database function;
- `SKIP LOCKED`;
- idempotency record.

Concurrency-sensitive behavior requires race tests.

---

## 19. Event Rules

Business Events:

- represent facts that happened;
- use past-tense names;
- match `37-event-catalog.md`;
- are versioned;
- are published only after successful commit;
- use transactional outbox where consistency requires it;
- preserve correlation and causation IDs;
- carry tenant context;
- contain no unnecessary personal data.

Event handlers must:

- be idempotent;
- support retry;
- distinguish temporary and permanent failure;
- avoid duplicate side effects;
- record processing result;
- support replay where required.

---

## 20. API Rules

Public APIs use:

- `/api/v1`;
- business-action routes;
- runtime validation;
- stable response envelopes;
- stable error codes;
- pagination for lists;
- no unbounded endpoints;
- no internal implementation leakage.

Breaking changes require:

- new version;
- migration plan;
- consumer impact analysis;
- documentation update;
- deprecation plan.

---

## 21. Coding Standards

All code must follow:

- `docs/engineering/59-coding-standards.md`

Minimum requirements:

- TypeScript strict mode;
- no broad `any`;
- no floating-point Money;
- UTC timestamps;
- clock abstraction;
- typed errors;
- public module imports only;
- deterministic tests;
- structured logs;
- no secrets;
- no undocumented TODO;
- no dead code;
- no disabled tests to pass CI.

---

## 22. Testing Rules

Every task must run all tests required by its LP file and MIP.

Possible required tests:

- unit;
- integration;
- contract;
- database;
- migration;
- RLS;
- authorization;
- idempotency;
- concurrency;
- security;
- performance;
- resilience;
- regression;
- UAT preparation.

The agent must not claim tests passed unless they were executed.

If tests could not be executed, return:

- exact tests not run;
- reason;
- risk;
- command required to run them.

---

## 23. Documentation Synchronization

If implementation changes any of the following, documentation must be updated in the same task or a linked documentation task:

- API;
- Event;
- data model;
- permission;
- RLS;
- module ownership;
- configuration;
- environment variable;
- feature flag;
- operational procedure;
- failure mode;
- release behavior.

Documentation drift is a defect.

---

## 24. Git and Branch Rules

One branch corresponds to one task.

Recommended format:

`agent/<role>/<task-id>-<description>`

Examples:

- `agent/backend/LP-001009-request-phone-verification`
- `agent/database/LP-003005-business-schema`

Agents must not commit directly to:

- `main`;
- `uat`;
- `development`;
- production branches.

Agents must not force-push protected branches.

---

## 25. Required Agent Output

Every implementation agent must return:

1. Task ID
2. Task Title
3. Implementation Summary
4. Business Rules Implemented
5. Changed Files
6. Database Changes
7. API Changes
8. Events Produced
9. Events Consumed
10. Permissions and RLS Impact
11. Idempotency and Concurrency Handling
12. Tests Added
13. Tests Executed
14. Exact Test Results
15. Security Considerations
16. Risks
17. Known Limitations
18. Technical Debt Introduced
19. Deferred Decisions
20. Documentation Updated
21. Rollback or Recovery
22. Definition of Done Evidence
23. Readiness Level
24. Recommended Next Action

Do not return only a summary.

---

## 26. Review Agent Rules

Review agents are read-only unless the task explicitly authorizes fixes.

Review agents must:

- inspect exact scope;
- compare code with Blueprint;
- compare code with MIP;
- compare code with LP task;
- inspect tests;
- inspect migrations;
- inspect permissions;
- inspect concurrency;
- inspect documentation;
- identify exact required changes.

Allowed recommendations:

- APPROVED
- APPROVED WITH FOLLOW-UP
- CHANGES REQUIRED
- BLOCKED

Every finding must include:

- severity;
- file;
- section or line;
- impact;
- exact required correction.

---

## 27. QA Agent Rules

QA validates behavior, not implementation style.

QA must verify:

- acceptance criteria;
- mandatory tests;
- UAT scenarios;
- failure paths;
- security outcomes;
- tenant isolation;
- race behavior;
- regression.

QA does not approve its own test implementation when separation of duties is required.

---

## 28. Security Agent Rules

Security Agent is read-only unless explicitly assigned a security implementation task.

Security review must include:

- authentication;
- authorization;
- RLS;
- tenant ownership;
- service role;
- secrets;
- personal data;
- rate limiting;
- replay;
- idempotency;
- concurrency;
- audit;
- exports;
- support access;
- Platform Admin.

Critical security findings block merge and release.

---

## 29. Release Rules

Release follows:

- `docs/engineering/60-release-strategy.md`

No agent may independently deploy to Production.

Production requires:

- approved release scope;
- QA evidence;
- Security evidence where required;
- migration plan;
- rollback or recovery;
- monitoring;
- Product Owner approval;
- Release Manager coordination.

---

## 30. Stop Conditions

The agent must stop and return a blocking status when:

- task is not Ready;
- required document is missing;
- Product Decision is missing;
- architecture requires ADR;
- scope expansion is required;
- allowed files are insufficient;
- critical contradiction exists;
- security cannot be preserved;
- tenant isolation cannot be proven;
- migration recovery is undefined;
- required tests cannot be designed;
- production data would need direct manual correction.

Do not continue by guessing.

---

## 31. Codex Session Continuation Rules

Because work may span multiple Codex usage windows:

1. inspect current branch and task status;
2. read previous implementation notes;
3. inspect uncommitted changes;
4. run relevant tests before continuing;
5. continue the existing task;
6. do not restart or regenerate completed work;
7. preserve task ID and scope;
8. update progress evidence before the session ends.

Before usage limits stop the session, return:

- completed work;
- remaining work;
- changed files;
- tests executed;
- current blockers;
- exact next command or next implementation step.

---

## 32. Root Completion Rule

No task is complete merely because code was written.

A task is complete only when:

- scope is complete;
- acceptance criteria pass;
- mandatory tests pass;
- required reviews approve;
- documentation is synchronized;
- rollback or recovery exists;
- Definition of Done evidence exists;
- readiness level is assigned.
