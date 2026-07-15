# MIP-000. Platform Foundation

## 1. File Name

`MIP-000-platform-foundation.md`

## 2. Purpose

This Module Implementation Package defines the technical foundation required before any Loyalty Platform business module is implemented.

The Platform Foundation is not a customer-facing business module.

It provides the repository, runtime, database migration framework, shared contracts, environment configuration, observability, security foundations, testing infrastructure and CI/CD controls required by all later modules.

No business feature may be implemented before this package reaches **Integration Ready**.

## 3. Business Objective

Create a secure, repeatable and testable engineering foundation that allows the Loyalty Platform to be developed incrementally without compromising:

- tenant isolation;
- immutable business history;
- domain ownership;
- idempotency;
- auditability;
- release safety;
- mobile and web integration;
- AI-assisted development controls.

## 4. Scope

This package includes:

- monorepo initialization;
- workspace management;
- backend service foundation;
- Customer App and Employee App placeholders;
- Business Portal and Platform Admin placeholders;
- shared package foundations;
- TypeScript strict configuration;
- linting and formatting;
- test runners;
- environment validation;
- local PostgreSQL or Supabase-compatible development environment;
- migration framework;
- transactional outbox foundation;
- idempotency infrastructure foundation;
- authentication context interfaces;
- tenant context interfaces;
- stable error contract;
- structured logging;
- correlation and causation identifiers;
- metrics and health-check foundations;
- CI workflows;
- secret scanning;
- dependency boundary enforcement;
- root and directory-level `AGENTS.md`;
- local setup documentation;
- initial release and rollback foundations.

## 5. Out of Scope

This package does not implement:

- Customer OTP authentication;
- Business authentication;
- Customer profile behavior;
- Business, Brand or Location business logic;
- Membership creation;
- Receipt processing;
- Reward, XP, Status or Benefit logic;
- Redemption;
- Automation rules;
- Notification delivery;
- Analytics KPIs;
- AI Recommendations;
- Loyalty Network;
- production store publication for mobile applications;
- customer-facing UI beyond project placeholders.

## 6. Authoritative References

### Blueprint

- `00-platform-glossary.md`
- `05-system-architecture.md`
- `17-security.md`
- `22-non-functional-requirements.md`
- `23-ai-development-guidelines.md`
- `24-testing-strategy.md`
- `27-ai-operating-manual.md`
- `33-domain-model-v2.md`
- `37-event-catalog.md`
- `42-data-model-v1.md`
- `43-api-contract.md`
- `44-permission-matrix.md`
- `50-blueprint-index.md`

### Engineering

- `51-engineering-implementation-guide.md`
- `52-repository-structure.md`
- `53-development-roadmap.md`
- `54-agent-development-plan.md`
- `55-module-definition-of-done.md`
- `56-uat-scenarios.md`
- `57-agent-prompts.md`
- `58-project-knowledge-map.md`
- `59-coding-standards.md`
- `60-release-strategy.md`
- `61-global-consistency-review.md`
- `62-product-backlog.md`
- `63-architecture-decision-records.md`
- `64-module-implementation-packages.md`
- `65-project-task-catalog.md`
- `66-implementation-order.md`
- `67-development-workflow.md`
- `68-definition-of-task-ready.md`
- `69-project-governance.md`
- `70-v1-implementation-roadmap.md`

## 7. Required ADRs

The following ADRs must exist or be created before Foundation is considered complete:

- `ADR-001-monorepo-and-workspace-strategy.md`
- `ADR-002-modular-monolith-backend.md`
- `ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `ADR-004-transactional-outbox.md`
- `ADR-005-idempotency-foundation.md`
- `ADR-006-observability-and-correlation-context.md`
- `ADR-007-environment-and-secret-management.md`
- `ADR-008-mobile-cross-platform-architecture.md`

ADRs may begin as `Proposed`, but blocking decisions must be `Accepted` before affected implementation starts.

## 8. Repository Structure

The initial repository must follow:

```text
loyalty-platform/
├── apps/
│   ├── customer-mobile/
│   ├── employee-mobile/
│   ├── business-portal/
│   └── platform-admin/
├── services/
│   └── api/
├── packages/
│   ├── api-contracts/
│   ├── event-contracts/
│   ├── shared-types/
│   ├── validation/
│   ├── design-system/
│   ├── mobile-ui/
│   ├── localization/
│   ├── observability/
│   ├── testing/
│   └── config/
├── database/
│   ├── migrations/
│   ├── functions/
│   ├── policies/
│   ├── indexes/
│   ├── seeds/
│   ├── fixtures/
│   └── tests/
├── tests/
│   ├── contract/
│   ├── integration/
│   ├── end-to-end/
│   ├── security/
│   ├── performance/
│   ├── resilience/
│   ├── migration/
│   └── uat/
├── infrastructure/
├── scripts/
├── docs/
├── .github/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.base.json
├── eslint.config.js
└── prettier.config.js
```

## 9. Runtime and Language

Required baseline:

- TypeScript;
- strict mode;
- Node.js runtime selected and pinned;
- package manager selected and pinned;
- workspace support;
- deterministic lockfile;
- reproducible local installation.

The exact framework may be selected through ADR, but it must support:

- modular architecture;
- runtime schema validation;
- dependency injection or explicit composition;
- testability;
- structured error handling;
- background workers;
- transactional database operations.

## 10. Shared Contracts

Foundation must create empty but working packages for:

### API Contracts

Contains:

- request schemas;
- response schemas;
- standard success envelope;
- standard error envelope;
- API version metadata;
- authentication scheme definitions;
- correlation identifiers.

### Event Contracts

Contains:

- versioned event envelope;
- event ID;
- event name;
- event version;
- aggregate type and ID;
- Business or tenant context;
- occurred timestamp;
- correlation ID;
- causation ID;
- idempotency identifier;
- payload schema.

No domain-specific event may be invented during Foundation.

## 11. Standard API Response

Foundation must provide one canonical response format aligned with `43-api-contract.md`.

Example success:

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "request_id": "string",
    "timestamp": "2026-01-01T00:00:00.000Z"
  },
  "errors": []
}
```

Example failure:

```json
{
  "success": false,
  "data": null,
  "metadata": {
    "request_id": "string",
    "timestamp": "2026-01-01T00:00:00.000Z"
  },
  "errors": [
    {
      "code": "BUSINESS_ERROR_CODE",
      "message": "Safe message",
      "field": null
    }
  ]
}
```

All later modules must use this contract unless a newer approved API version supersedes it.

## 12. Error Foundation

Foundation must define typed categories:

- `ValidationError`
- `AuthenticationError`
- `AuthorizationError`
- `NotFoundError`
- `BusinessRuleError`
- `ConflictError`
- `ConcurrencyError`
- `RateLimitError`
- `TemporaryInfrastructureError`
- `PermanentProviderError`
- `UnexpectedError`

Every error must support:

- stable error code;
- safe client message;
- HTTP mapping where applicable;
- correlation ID;
- retry classification;
- log severity;
- optional safe details.

Raw database or framework errors must never be exposed.

## 13. Environment Strategy

Minimum environments:

- local;
- development;
- UAT;
- production.

Configuration rules:

- environment values validated at startup;
- missing required values fail fast;
- secrets never committed;
- `.env.example` contains names and safe examples only;
- client applications receive only explicitly public values;
- production and UAT credentials remain isolated;
- agents may not modify UAT or production without explicit authorization.

## 14. Database Foundation

Foundation must provide:

- migration runner;
- migration naming rules;
- clean database setup;
- upgrade testing;
- transaction helpers;
- connection management;
- database health check;
- test database reset;
- seed framework;
- fixture framework;
- RLS policy test harness;
- query plan inspection utilities.

The first migrations may create only cross-cutting infrastructure, such as:

- migration metadata;
- idempotency records;
- event outbox;
- event-consumer processing records;
- audit foundation where architecture approves;
- support tables required by tenancy or authorization foundations.

Business tables belong to later packages.

## 15. Transactional Outbox Foundation

The outbox must support:

- immutable event record;
- insertion in the same transaction as business state;
- versioned payload;
- tenant context;
- processing status;
- attempt count;
- next attempt time;
- claimed time;
- completed time;
- permanent failure state;
- dead-letter visibility.

The dispatcher must:

- claim atomically;
- be idempotent;
- retry temporary failures;
- preserve event order where required;
- expose queue metrics;
- avoid duplicate side effects.

Foundation does not implement domain consumers.

## 16. Idempotency Foundation

Foundation must provide a reusable, module-neutral idempotency service.

The idempotency scope must include:

- tenant or Business;
- command type;
- actor or integration client;
- relevant resource;
- client idempotency key.

Records must contain:

- scope;
- key;
- request hash;
- state;
- result reference;
- response snapshot where approved;
- created time;
- completed time;
- failure classification.

Required behavior:

- same key and same request returns the original result;
- same key and different request returns conflict;
- parallel duplicates produce one business execution;
- timed-out clients may retry safely;
- permanent business failures are not retried as new work.

## 17. Tenant and Actor Context

Foundation must define interfaces for:

- authenticated Customer;
- Business User;
- Employee;
- Manager;
- Business Owner;
- Platform Support;
- Platform Admin;
- Integration Client;
- anonymous request.

The context must carry only verified information.

Client-provided `business_id`, `brand_id`, `location_id` or role may never be trusted without backend validation.

Actual authentication and authorization logic belongs to later packages.

## 18. Observability

Foundation must implement:

- structured logging;
- request ID generation;
- correlation ID propagation;
- causation ID propagation;
- service and module fields;
- environment field;
- latency measurement;
- error rate metrics;
- health endpoints;
- readiness endpoints;
- worker health;
- queue lag metrics;
- trace integration point.

Logs must not contain:

- OTP codes;
- access or refresh tokens;
- API keys;
- service-role credentials;
- complete personal data;
- reward selection secrets.

## 19. Testing Foundation

Required test layers:

- unit;
- integration;
- contract;
- database;
- migration;
- security;
- concurrency;
- resilience;
- performance;
- end-to-end;
- UAT support.

Foundation must provide:

- deterministic test runner;
- test database utilities;
- time or clock abstraction;
- API test client;
- event test utilities;
- concurrency helpers;
- fixture builders;
- tenant isolation fixture support;
- provider mocks;
- CI test groups.

## 20. CI Requirements

Every pull request must run:

- install with lockfile validation;
- formatting check;
- lint;
- type check;
- unit tests;
- contract validation;
- migration validation;
- integration tests where feasible;
- secret scan;
- dependency vulnerability scan;
- build;
- module boundary validation.

Protected branches must reject failed required checks.

## 21. Mobile Foundation Boundaries

Foundation creates project placeholders and shared tooling for:

- Customer Mobile App;
- Employee Mobile App;
- shared mobile UI;
- localization;
- secure storage abstraction;
- API client abstraction;
- build configuration placeholders.

Foundation does not yet implement real authentication or loyalty screens.

Android preview APK generation is defined separately in:

- `MOB-001-android-build-and-apk-distribution.md`

## 22. Security Requirements

Foundation must enforce:

- deny by default;
- no production secrets in repository;
- least-privilege credentials;
- backend authorization hooks;
- RLS test support;
- dependency scanning;
- secure headers where applicable;
- rate-limit integration point;
- safe error responses;
- opaque public token utilities;
- secure random identifier generation.

RLS is mandatory for tenant-scoped data once business tables are introduced.

## 23. Module Boundary Enforcement

Automated tooling should prevent:

- cross-module private imports;
- circular dependencies;
- frontend imports from backend domain code;
- domain dependency on framework code;
- shared package ownership of feature business logic;
- analytics writes to transactional modules.

Each backend module exposes only its public `index.ts`.

## 24. Documentation Requirements

Foundation must create:

- root `README.md`;
- root `AGENTS.md`;
- environment setup instructions;
- local development instructions;
- migration instructions;
- test instructions;
- architecture overview;
- troubleshooting guide;
- initial runbook;
- ADR index.

Documentation must reflect the actual repository.

## 25. Allowed Files

Primary scope:

```text
/
apps/* project placeholders
services/api/src/bootstrap/**
services/api/src/config/**
services/api/src/shared/**
services/api/src/infrastructure/**
services/api/src/middleware/**
services/api/src/observability/**
services/api/src/workers/event-dispatcher/**
packages/**
database/migrations/**
database/functions/**
database/policies/**
database/tests/**
tests/**
infrastructure/**
scripts/**
.github/**
docs/engineering/**
docs/decisions/**
AGENTS.md
README.md
package.json
tsconfig.base.json
eslint.config.js
prettier.config.js
```

## 26. Forbidden Files

Until separately authorized:

```text
services/api/src/modules/authentication/**
services/api/src/modules/customer/**
services/api/src/modules/business/**
services/api/src/modules/brand/**
services/api/src/modules/membership/**
services/api/src/modules/receipt/**
services/api/src/modules/reward/**
services/api/src/modules/xp/**
services/api/src/modules/status/**
services/api/src/modules/benefit/**
services/api/src/modules/redemption/**
services/api/src/modules/automation/**
services/api/src/modules/notification/**
services/api/src/modules/analytics/**
```

The Foundation task must not prematurely implement business behavior.

## 27. Mandatory Tests

At minimum:

- clean repository installation;
- deterministic lockfile;
- all applications build;
- strict TypeScript failure test;
- environment validation failure;
- clean database migration;
- previous-version database upgrade;
- migration repeat safety where applicable;
- idempotency parallel claim test;
- outbox atomic claim test;
- worker retry test;
- dead-letter visibility test;
- request and correlation ID propagation;
- safe error envelope test;
- module boundary violation test;
- secret scan;
- unauthorized configuration exposure test;
- health and readiness endpoint tests.

## 28. UAT and Readiness References

Relevant UAT:

- `UAT-REL-001`
- `UAT-REL-002`
- `UAT-REL-004`
- `UAT-REL-005`
- security and performance foundations from `56-uat-scenarios.md`

Foundation is not customer UAT complete, but must provide the infrastructure required to execute later UAT.

## 29. Required Reviews

Mandatory:

- Solution Architect Review;
- DevOps Review;
- Database Review;
- QA Review;
- Security Review;
- Documentation Review.

## 30. Completion Evidence

Required evidence:

- repository tree;
- pinned runtime and package manager versions;
- CI execution;
- clean migration log;
- integration test result;
- security scan result;
- module-boundary validation;
- local setup verification;
- environment validation output;
- outbox and idempotency concurrency evidence;
- rollback or recovery notes;
- documentation links;
- readiness level.

## 31. Definition of Done

Foundation reaches **Integration Ready** when:

- repository matches approved structure;
- local setup is reproducible;
- CI is green;
- database can be created from zero;
- migrations can upgrade an existing baseline;
- API and Event contract packages compile;
- standard error and response contracts exist;
- transactional outbox foundation works;
- idempotency foundation passes parallel tests;
- structured logging and correlation work;
- module boundaries are enforceable;
- secret scanning works;
- test infrastructure works;
- documentation is complete;
- no business feature has been implemented prematurely.

Foundation reaches **Production Ready** only after later production infrastructure, monitoring, backup and release evidence are completed.

## 32. Implementation Order

1. Approve Foundation ADRs.
2. Initialize repository and workspace.
3. Configure strict TypeScript, lint and formatting.
4. Create application and package placeholders.
5. Create backend bootstrap and configuration.
6. Implement environment validation.
7. Add standard API and error contracts.
8. Add database migration framework.
9. Add outbox schema and dispatcher foundation.
10. Add idempotency infrastructure.
11. Add tenant and actor context interfaces.
12. Add logging, metrics and health checks.
13. Add test infrastructure.
14. Add CI workflows.
15. Add dependency boundary enforcement.
16. Add documentation and runbooks.
17. Execute Architect, QA and Security reviews.
18. Mark Foundation Integration Ready.

## 33. AI Implementation Instructions

The assigned agent must:

- treat this MIP as the primary implementation context;
- read all mandatory references;
- avoid business-module implementation;
- work only inside the task file scope;
- return exact changed files;
- return tests added and executed;
- report skipped work;
- report all assumptions;
- propose ADRs instead of silently choosing material architecture;
- preserve rollback and recovery paths;
- stop if the chosen framework or infrastructure conflicts with Blueprint decisions.

## 34. Final Status

Initial status:

`READY FOR TASK DECOMPOSITION`
