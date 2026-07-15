# 73. LP Generation Standard

## 1. Purpose

This document defines how implementation task files identified as LP tasks are generated from an approved MIP.

One MIP produces multiple LP task files.

Each LP task must represent one bounded, assignable and verifiable unit of work.

## 2. File Naming

Format:

`LP-<module-number><task-number>-<short-title>.md`

Examples:

- `LP-001001-define-authentication-api-contracts.md`
- `LP-008014-implement-reward-expiration-worker.md`

The first three digits identify the MIP/module.

## 3. Task Granularity

One LP task should normally cover one of:

- one architecture decision;
- one aggregate capability;
- one migration group;
- one command;
- one query group;
- one API flow;
- one event handler;
- one worker;
- one frontend journey;
- one test package;
- one security review;
- one documentation update;
- one release gate.

Tasks must not combine unrelated modules.

## 4. Required Sections

Every LP file must contain:

1. File Name
2. Task ID
3. Title
4. Status
5. Category
6. Priority
7. Complexity
8. Assigned Role
9. Owning Module
10. MIP Reference
11. Business Objective
12. Technical Objective
13. Exact Scope
14. Out of Scope
15. Dependencies
16. Required Documents
17. Knowledge Package
18. Allowed Files
19. Forbidden Files
20. Implementation Requirements
21. Acceptance Criteria
22. Mandatory Tests
23. UAT References
24. Security Considerations
25. Database Impact
26. API Impact
27. Event Impact
28. Observability Impact
29. Documentation Impact
30. Required Reviewers
31. Rollback or Recovery
32. Expected Output
33. Definition of Done Evidence
34. Completion Rule

## 5. Task Status

Allowed statuses:

- DRAFT
- READY
- ASSIGNED
- IN_PROGRESS
- IMPLEMENTATION_COMPLETE
- REVIEW
- QA
- READY_FOR_MERGE
- MERGED
- DONE
- BLOCKED
- CANCELLED

Generated tasks start as `DRAFT`.

## 6. Acceptance Criteria Standard

Acceptance criteria must be:

- measurable;
- testable;
- implementation-neutral;
- scoped to the task;
- traceable to MIP rules;
- free of vague wording.

Forbidden examples:

- improve performance;
- handle errors;
- make secure;
- support retries.

Required replacement:

- define exact threshold;
- define exact error code;
- define exact retry policy;
- define exact security outcome.

## 7. Mandatory Test Standard

Tests must be task-specific.

Examples:

- “parallel requests create exactly one Receipt”;
- “same idempotency key with different payload returns 409”;
- “Business A cannot access Business B object”;
- “expired OTP returns `OTP_CODE_EXPIRED`”;
- “replaying Event does not duplicate Benefit grant”.

## 8. Allowed and Forbidden Files

Every LP task must list exact paths or bounded directories.

The task must not use broad scope such as:

- entire repository;
- all backend;
- all database.

Cross-module changes require separate tasks unless explicitly approved.

## 9. Dependency Standard

Every dependency must reference:

- LP task ID;
- MIP;
- required contract;
- required migration;
- required environment capability.

Hidden dependencies are forbidden.

## 10. Role Assignment

Every LP task has exactly one implementation owner.

Possible roles:

- Product Analysis Agent
- Solution Architect Agent
- Database Agent
- Backend Developer Agent
- Customer App Agent
- Employee App Agent
- Business Portal Agent
- QA Agent
- Security Agent
- DevOps Agent
- Documentation Agent
- Release Manager Agent
- Refactoring Agent

## 11. Review Standard

Required reviewers must be defined before task status becomes `READY`.

Typical review combinations:

- architecture + QA;
- database + QA;
- security + QA;
- frontend + QA;
- DevOps + Security;
- Documentation.

## 12. Evidence Standard

Every completed task must return:

- implementation summary;
- changed files;
- database changes;
- API changes;
- Event changes;
- permission and RLS impact;
- tests added;
- tests executed;
- exact results;
- known limitations;
- risks;
- rollback;
- documentation changes;
- readiness level.

## 13. Task Splitting Rules

A task must be split when:

- it affects multiple unrelated modules;
- it is estimated XXL;
- it changes database, backend and multiple apps without a bounded vertical flow;
- it cannot be reviewed independently;
- it cannot be rolled back independently;
- it has more than one implementation owner.

## 14. Final Task Index

Every MIP task folder must contain:

`TASK-INDEX.md`

The index must list:

- MIP reference;
- task ID;
- title;
- role;
- dependencies;
- status.

## 15. Definition of LP Set Ready

An LP task set is Ready when:

- all module capabilities are covered;
- dependency order is valid;
- no duplicate tasks exist;
- no capability is left without tests;
- review and documentation tasks exist;
- the final QA and Security gate exists;
- all tasks comply with this standard.
