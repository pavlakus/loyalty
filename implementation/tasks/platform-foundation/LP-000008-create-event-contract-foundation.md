# LP-000008 — Create Event Contract Foundation

## Task Metadata

- Task ID: `LP-000008`
- Category: `FOUNDATION`
- Priority: `P1`
- Owning module: Platform Foundation / Event Contracts
- Assigned role: Backend Developer Agent
- MIP: `implementation/mip/MIP-000-platform-foundation.md`
- Knowledge Package: Platform Foundation Knowledge Package from the MIP

## Module Implementation Package

`implementation/mip/MIP-000-platform-foundation.md`

## Status

`READY_FOR_MERGE`

## Objective

Provide the versioned, validated event-envelope foundation required by later platform and Loyalty modules without introducing domain-specific business events.

## Business Objective

Ensure later modules can exchange durable, traceable facts through one compatible event contract.

## Technical Objective

Define and test a generic event envelope carrying version, correlation, causation and tenant context while preserving the event-catalog and transactional-outbox boundaries.

## Exact Scope

- `packages/event-contracts/src/**`
- `packages/event-contracts/test/**`
- `packages/event-contracts/package.json`
- `packages/event-contracts/tsconfig.json`
- `services/api/src/shared/events/**`
- `services/api/test/**` (focused event-contract tests only)
- `services/api/package.json` (workspace dependency wiring only)
- `pnpm-lock.yaml` (API workspace importer only)

## Out of Scope

- domain-specific business events;
- event transport or workers;
- transactional outbox schema or persistence;
- database migrations;
- authentication, authorization or tenant enforcement;
- event handlers and projections;
- production deployment or external integrations;
- changes to the canonical event catalog.

## Dependencies

- LP-000002 — Initialize Monorepo and Workspace (`DONE`)
- `implementation/mip/MIP-000-platform-foundation.md`
- accepted `docs/adr/ADR-004-transactional-outbox.md`
- `docs/blueprint/37-event-catalog.md`

## Required Documents

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/blueprint/37-event-catalog.md`
- `docs/adr/ADR-004-transactional-outbox.md`
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

## Acceptance Criteria

1. A versioned generic event envelope exists with event type, event version, event ID, occurred-at timestamp and payload.
2. Correlation ID, causation ID and tenant context are represented according to the MIP and event-catalog conventions.
3. Runtime validation rejects malformed envelopes and unsupported versions without mutating input.
4. The contract package is consumed only through its public entry point.
5. No undocumented domain event or business behavior is introduced.

## Mandatory Tests

- event envelope contract tests;
- version validation tests;
- malformed payload and required-context tests;
- package/API build, lint, typecheck and repository regression tests.

## Allowed Files

- `packages/event-contracts/src/**`
- `packages/event-contracts/test/**`
- `packages/event-contracts/package.json`
- `packages/event-contracts/tsconfig.json`
- `services/api/src/shared/events/**`
- `services/api/test/**` (focused event-contract tests only)
- `services/api/package.json` (workspace dependency wiring only)
- `pnpm-lock.yaml` (API workspace importer only)
- `implementation/evidence/LP-000008/**`
- LP-000008 task, status and index records and generated lifecycle prompts

## Forbidden Files

- business domain modules and event implementations;
- controllers and routes;
- authentication, authorization and tenant enforcement;
- database migrations, outbox schema and workers;
- Blueprint, MIP and accepted ADR content;
- secrets, credentials and personal data;
- unrelated package exports or configuration.

## Required Reviewers and Approvals

- Independent Review Agent
- QA Agent
- Solution Architect only if the implementation changes accepted architecture
- Security Agent only if the implementation adds security-sensitive behavior, credentials, personal data or authorization behavior

## Expected Deliverables

- public event contract types and runtime validation;
- focused tests and exact validation evidence;
- implementation, review, QA and release/post-merge evidence;
- rollback/recovery instructions and synchronized lifecycle records.

## Rollback and Recovery

Revert the isolated LP-000008 implementation/merge commit. No database or persistent data recovery is required because this task creates no migrations or stored event data.

## Definition of Done

Implementation is committed on a dedicated branch, contract and validation tests pass, independent Review and QA approve, required release/post-merge evidence is present, no P0/P1 findings remain, and status/index/specification records are synchronized.
