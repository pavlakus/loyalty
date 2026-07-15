# 72. MIP Generation Standard

## 1. Purpose

This document defines the mandatory generation standard for every Module Implementation Package (MIP) created for the Loyalty Platform.

A MIP is the authoritative implementation context for exactly one module.

It must be detailed enough for Codex or a human engineer to implement the module without inventing business rules, redefining ownership, or reading the entire project documentation set.

## 2. Scope

This standard applies to:

- all new MIPs;
- all regenerated MIPs;
- all major MIP revisions;
- all MIPs used to generate LP tasks.

## 3. Core Rules

Every MIP must:

- describe exactly one owning module;
- preserve Blueprint decisions;
- reference authoritative documents;
- define responsibilities and non-responsibilities;
- define aggregate ownership;
- define commands, queries and events;
- define APIs and database ownership;
- define authorization, RLS and tenant rules;
- define idempotency and concurrency;
- define failure handling;
- define tests and UAT references;
- define allowed and forbidden files;
- define review and readiness criteria;
- avoid speculative business rules;
- avoid generic filler text.

## 4. File Naming

Format:

`MIP-<module-number>-<module-name>.md`

Examples:

- `MIP-001-authentication.md`
- `MIP-008-reward.md`
- `MIP-023-customer-mobile-app.md`

For large documents, temporary parts may be generated:

- `MIP-008-reward-part-01.md`
- `MIP-008-reward-part-02.md`

The final package must also contain one combined file:

`MIP-008-reward.md`

## 5. Required Sections

Every MIP must contain at least:

1. File Name
2. Status
3. Purpose
4. Business Objective
5. Locked Product Decisions
6. Scope
7. Out of Scope
8. Authoritative References
9. Owning Module
10. Responsibilities
11. Non-Responsibilities
12. Business Capabilities
13. Aggregate Model
14. Entities
15. Value Objects
16. Aggregate Invariants
17. Lifecycle
18. State Machine
19. Commands
20. Queries
21. Events Published
22. Events Consumed
23. API Ownership
24. API Error Codes
25. Database Objects
26. RLS and Authorization
27. Idempotency
28. Concurrency
29. Audit
30. Observability
31. Configuration
32. Feature Flags
33. Performance Expectations
34. Scaling Notes
35. Caching Rules
36. Failure Scenarios
37. Migration Strategy
38. Cross-Module Contracts
39. Allowed Files
40. Forbidden Files
41. Mandatory Tests
42. UAT References
43. Required Reviews
44. Implementation Order
45. Readiness Matrix
46. Definition of Done
47. AI Implementation Instructions
48. Final Status

## 6. Required Diagrams

Where applicable, every MIP must include text or Mermaid diagrams for:

- module context;
- aggregate ownership;
- lifecycle or state machine;
- command flow;
- event flow;
- critical sequence flow;
- failure and compensation flow.

Diagrams must clarify implementation, not decorate the document.

## 7. Authoritative Source Rules

The generator must:

1. identify the authoritative Blueprint and Engineering documents;
2. exclude deprecated documents as primary sources;
3. use historical documents only for rationale;
4. resolve conflicts using `58-project-knowledge-map.md`;
5. stop and mark `BLOCKED BY PRODUCT DECISION` when a material business contradiction remains.

## 8. Ownership Rules

Every MIP must explicitly define:

- what the module owns;
- what the module references;
- what the module must never own;
- what modules it may call through public contracts;
- what tables it may never write directly.

No MIP may create overlapping ownership.

## 9. Domain Detail Standard

For every aggregate, the MIP must define:

- aggregate root;
- child entities;
- value objects;
- invariants;
- allowed methods;
- forbidden state mutation;
- transaction boundary;
- lifecycle transitions;
- concurrency-sensitive operations.

## 10. API Detail Standard

For every API, define:

- method;
- route;
- actor;
- request;
- response;
- stable error codes;
- idempotency requirement;
- permission requirement;
- tenant scope;
- relevant command or query;
- relevant event result.

## 11. Event Detail Standard

For every Event, define:

- name;
- producer;
- triggering command;
- aggregate;
- version;
- payload intent;
- tenant context;
- consumers;
- idempotency expectation;
- replay behavior;
- compensation behavior where relevant.

Event names must match `37-event-catalog.md`.

## 12. Database Detail Standard

For every owned table, define:

- purpose;
- primary key;
- foreign keys;
- unique constraints;
- check constraints;
- nullability;
- lifecycle fields;
- audit fields;
- indexes;
- RLS;
- immutability rules;
- migration notes.

## 13. Security Detail Standard

Every MIP must explicitly cover:

- authentication;
- authorization;
- tenant ownership;
- RLS;
- service-role behavior;
- support access;
- Platform Admin behavior;
- forged identifiers;
- data minimization;
- logging restrictions;
- abuse scenarios;
- rate limiting where relevant.

## 14. Idempotency and Concurrency Standard

Every critical command must define:

- idempotency key source;
- idempotency scope;
- duplicate response behavior;
- payload mismatch behavior;
- parallel request behavior;
- locking or uniqueness strategy;
- retry behavior;
- recovery behavior.

## 15. Failure Scenario Standard

Every MIP must describe at least:

- validation failure;
- authorization failure;
- cross-tenant attempt;
- duplicate request;
- parallel request;
- database failure before commit;
- worker failure after commit;
- provider failure;
- timeout and retry;
- partial downstream failure;
- recovery or compensation.

## 16. Testing Standard

Every MIP must identify:

- unit tests;
- integration tests;
- API contract tests;
- database tests;
- migration tests;
- RLS tests;
- authorization tests;
- concurrency tests;
- idempotency tests;
- security tests;
- performance tests;
- resilience tests;
- regression tests;
- UAT references.

## 17. AI Context Standard

Every MIP must be usable as the primary context for Codex.

The MIP must include:

- exact required documents;
- exact allowed files;
- exact forbidden files;
- exact expected outputs;
- exact stop conditions;
- exact review requirements.

Codex must not need to infer module ownership.

## 18. Quality Requirements

A generated MIP is rejected if it contains:

- placeholder sections;
- vague language;
- invented Product Decisions;
- unverified API or Event names;
- missing RLS rules;
- missing concurrency rules;
- missing failure behavior;
- generic tests such as “add tests”;
- inconsistent terminology;
- responsibility overlap;
- undocumented assumptions.

## 19. Review Requirements

Every generated MIP requires:

- Architecture Review;
- Domain Ownership Review;
- API and Event Review;
- Database Review where relevant;
- Security Review;
- QA Review;
- Documentation Consistency Review.

## 20. Definition of MIP Ready

A MIP is Ready when:

- all required sections exist;
- no placeholder remains;
- references are exact;
- ownership is unambiguous;
- contracts are explicit;
- tests and UAT are mapped;
- allowed and forbidden files are defined;
- review findings are resolved;
- the final status is `READY FOR TASK DECOMPOSITION`.
