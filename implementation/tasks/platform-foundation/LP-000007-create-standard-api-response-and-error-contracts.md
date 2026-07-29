# LP-000007 — Create Standard API Response and Error Contracts

## Task Metadata

- Task ID: `LP-000007`
- Category: `FOUNDATION`
- Priority: `P1`
- Owning module: Platform Foundation / API Contracts
- Assigned role: Backend Developer Agent
- MIP: `implementation/mip/MIP-000-platform-foundation.md`
- Knowledge Package: Platform Foundation Knowledge Package from the MIP

## Module Implementation Package

`implementation/mip/MIP-000-platform-foundation.md`

## Status

`READY`

## Objective

Provide the canonical transport response and typed framework error contract required by later modules, without introducing module-specific business behavior.

## Business Objective

Create stable, safe API communication foundations for later Loyalty Platform modules.

## Technical Objective

Define generic success/error envelopes, framework error categories and centralized HTTP mapping while preserving the public API contract and hiding infrastructure details.

## Exact Scope

- `packages/api-contracts/src/**`
- `packages/api-contracts/test/**`
- `packages/api-contracts/package.json`
- `packages/api-contracts/tsconfig.json`
- `services/api/src/shared/errors/**`
- `services/api/test/**` (contract and error-mapping tests only)

## Out of Scope

- module-specific business errors;
- controllers, routes, authentication, authorization, tenant behavior or database behavior;
- domain response payloads;
- event contracts;
- error catalog changes outside the API contract package;
- production deployment or external integrations;
- Loyalty business behavior.

## Dependencies

- LP-000005 — Create Backend Service Bootstrap (`DONE`)
- `implementation/mip/MIP-000-platform-foundation.md`
- accepted ADR-002 — Modular Monolith Backend
- approved `docs/blueprint/43-api-contract.md`

## Required Documents

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/blueprint/43-api-contract.md`
- `docs/adr/ADR-002-modular-monolith-backend.md`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/54-agent-development-plan.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/57-agent-prompts.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/engineering/68-definition-of-task-ready.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`

## Contract and UAT References

- API success and error examples in MIP sections 11 and 12 and `docs/blueprint/43-api-contract.md`.
- UAT references: safe error mapping and stable success/error envelopes.

## Allowed Files

- `packages/api-contracts/src/**`
- `packages/api-contracts/test/**`
- `packages/api-contracts/package.json`
- `packages/api-contracts/tsconfig.json`
- `services/api/src/shared/errors/**`
- `services/api/test/**` (focused contract/error tests only)
- `implementation/evidence/LP-000007/**`
- LP-000007 task/status/index records and generated prompts required by lifecycle

## Forbidden Files

- domain modules, controllers and routes;
- authentication, authorization, tenant, database and event implementations;
- Blueprint, MIP and accepted ADR content;
- root package exports unrelated to this contract;
- module-specific error codes or business rules;
- secrets, credentials and personal data.

## Acceptance Criteria

1. Success and error envelopes match MIP-000 and the approved API contract exactly.
2. Typed categories exist for Validation, Authentication, Authorization, NotFound, BusinessRule, Conflict, Concurrency, RateLimit, TemporaryInfrastructure, PermanentProvider and Unexpected errors.
3. Each framework error carries stable code, safe client message, HTTP status mapping, correlation/request ID, retry classification, log severity and safe optional details.
4. HTTP mapping is centralized in `services/api/src/shared/errors/**`.
5. Raw infrastructure errors and causes are never exposed in public responses.
6. API contract package builds and is consumed only through its public entry point.
7. No module-specific business behavior is introduced.

## Mandatory Tests

- success envelope contract tests;
- error envelope contract tests;
- every typed category and HTTP mapping test;
- safe mapping test proving raw infrastructure messages/details are excluded;
- package/API build, lint, typecheck and repository regression tests.

## Required Reviewers and Approvals

- Independent Review Agent
- QA Agent
- Solution Architect only if implementation changes the accepted architecture
- Security Agent only if the implementation adds security-sensitive behavior, credentials, personal data or authorization behavior

## Expected Deliverables

- public API contract types and runtime-safe mapping;
- focused tests and exact validation evidence;
- implementation, review, QA and release/post-merge evidence;
- rollback/recovery instructions and synchronized lifecycle records.

## Rollback and Recovery

Revert the isolated LP-000007 implementation/merge commit. No database or persistent data recovery is required.

## Definition of Done

Implementation is committed on a dedicated branch, contract and error tests pass, independent Review and QA approve, required release/post-merge evidence is present, no P0/P1 findings remain, and status/index/specification records are synchronized.
