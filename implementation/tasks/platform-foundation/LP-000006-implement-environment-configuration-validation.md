# LP-000006 — Implement Environment Configuration Validation

## Task Metadata

- Task ID: `LP-000006`
- Category: `SECURITY`
- Priority: `P1`
- Owning module: Platform Foundation / Environment Configuration
- Assigned role: Backend Developer Agent
- MIP: `implementation/mip/MIP-000-platform-foundation.md`
- Knowledge Package: Platform Foundation Knowledge Package from the MIP

## Module Implementation Package

`implementation/mip/MIP-000-platform-foundation.md`

## Status

`READY_FOR_MERGE`

## Objective

Provide the reusable environment-validation foundation required by the Platform Foundation without introducing business behavior or real credentials.

## Business Objective

Create a reliable implementation foundation for later Loyalty Platform modules without introducing premature business behavior.

## Technical Objective

Validate the explicitly approved runtime configuration at API startup, keep public configuration separate from server-only values, and fail safely without exposing secret values.

## Exact Scope

- `packages/config/src/**`
- `packages/config/test/**`
- `services/api/src/config/**`
- `services/api/src/bootstrap/start-server.ts` (startup integration only)
- `services/api/test/**` (focused startup-validation tests only)
- `.env.example`

## Out of Scope

- real secret values;
- production, UAT or shared-environment configuration;
- database, Supabase, authentication, authorization, tenant, API, event or Loyalty behavior;
- arbitrary new environment variables not defined by an accepted contract;
- CI or deployment changes;
- root package exports outside the existing package boundary.

## Dependencies

- LP-000005 — Create Backend Service Bootstrap (`DONE`)
- Accepted ADR-007 — Environment and Secret Management
- Required prerequisite module: existing API startup path from LP-000005

## Required Documents

- `AGENTS.md`
- `implementation/TASK-LIFECYCLE.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-009-initial-environment-variable-contract.md`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/53-development-roadmap.md`
- `docs/engineering/54-agent-development-plan.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/57-agent-prompts.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/engineering/68-definition-of-task-ready.md`
- `docs/ai-engineering-framework/90-agent-response-contract.md`

## UAT and Required Tests

- UAT reference: Platform Foundation environment-validation and secret-isolation requirements in `implementation/mip/MIP-000-platform-foundation.md` and `docs/adr/ADR-007-environment-and-secret-management.md`.
- missing required configuration fails before server startup;
- invalid configuration fails before server startup;
- public configuration cannot expose server-only values;
- repository secret scan passes;
- package and API typecheck, lint, build and focused tests pass.

## Allowed Files

- `packages/config/src/**`
- `packages/config/test/**`
- `services/api/src/config/**`
- `services/api/src/bootstrap/start-server.ts`
- `services/api/test/**`
- `.env.example`
- `implementation/evidence/LP-000006/**`
- LP-000006 task/status/index records required by lifecycle transitions

## Forbidden Files

- all business-domain modules;
- database migrations and schemas;
- authentication, authorization and tenant modules;
- LP-000003, LP-000004 and later task specifications;
- production or UAT environment files;
- root package exports unless an existing package convention requires a local export only;
- canonical product, Blueprint or accepted ADR decisions;
- real secrets, tokens, credentials and private keys.

## Acceptance Criteria

1. Every required environment value from the approved configuration contract is validated at API startup.
2. Missing values produce safe actionable errors without printing values.
3. Invalid values produce safe actionable errors without printing values.
4. Public configuration is explicitly allowlisted and cannot contain server-only values.
5. `.env.example` contains names and safe examples only.
6. No secret values are committed.
7. No business behavior or architecture outside this task is introduced.

## Approved Initial Environment Contract

- `NODE_ENV`: server-only; required in production and optional elsewhere; default `development` outside production; exact enum `development | test | production`.
- `PORT`: server-only; optional; default `3000`; base-10 integer from `0` through `65535`.
- `HOST`: server-only; optional; default `127.0.0.1`; non-empty hostname or IP-literal without control characters or whitespace.
- No client/public or secret variables are approved in this task.
- Future database, Supabase, authentication, provider and deployment credentials require separate repository-authorized contracts.

## Required Reviewers and Approvals

- Independent Review Agent
- QA Agent
- Security Agent (required: secrets and public/server configuration boundary)
- Solution Architect only if the implementation requires an architecture change
- Documentation reviewer only if task-scoped documentation changes beyond `.env.example`

## Expected Deliverables

- implementation, review, QA and security evidence under `implementation/evidence/LP-000006/`;
- source branch and isolated commit;
- environment validation implementation and focused tests;
- safe `.env.example`;
- exact validation results and rollback instructions.

## Rollback and Recovery

- Revert the isolated LP-000006 implementation commit.
- No migrations or persistent data are introduced.
- Never revert or edit unrelated task work.

## Definition of Done

- implementation is committed on a dedicated LP-000006 branch;
- required tests and repository validation pass;
- independent Review, QA and Security evidence approve the change;
- merge and post-merge evidence are recorded;
- no P0/P1 findings remain;
- status and task index are synchronized.

## Preparation Gate

ADR-009 is accepted and defines the initial environment contract. Task Preparation must verify that implementation remains within this contract before transitioning to `READY`.
