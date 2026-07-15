# ADR-001: Monorepo and Workspace Strategy

## Status

Accepted

## Date

2026-07-15

## Context

The Loyalty Platform must support a modular backend, Customer Mobile App, Employee Mobile App, Business Portal, Platform Admin, shared contracts, database migrations, test infrastructure and operational tooling. The Engineering Playbook requires a monorepo while preserving strict module ownership and preventing shared packages from becoming a place for business logic.

## Problem

The repository needs one repeatable workspace strategy that supports TypeScript strict mode, deterministic installs, package boundaries, CI orchestration and future application growth without allowing uncontrolled cross-module coupling.

## Decision

Use a monorepo with `pnpm` as the package manager, `pnpm workspaces` as the workspace mechanism and Turborepo as the task runner/build orchestrator.

The workspace will contain:

- `apps/*` for user-facing applications.
- `services/api` for the modular monolith backend.
- `packages/*` for contracts, validation, observability, testing, UI and configuration packages.
- `database/*`, `tests/*`, `infrastructure/*` and `scripts/*` for platform support.

The package manager version must be pinned through `packageManager` in root `package.json`. Dependency boundaries must be enforced with lint or workspace tooling so modules import other modules only through public entry points.

## Alternatives Considered

- npm workspaces: simple and built in, but weaker install determinism and workspace ergonomics for a multi-package TypeScript platform.
- Yarn Berry workspaces: powerful, but Plug'n'Play can add compatibility friction with React Native, Expo, Supabase tooling and common developer tools.
- Nx: strong graph and generator capabilities, but heavier than needed for Sprint 0 and can impose more framework convention than the current foundation requires.
- Separate repositories: clearer isolation, but premature operational overhead and harder atomic contract changes across backend, mobile, web and shared packages.

## Rationale

`pnpm` gives deterministic lockfiles, fast installs and strict dependency isolation. `pnpm workspaces` are sufficient for package linkage. Turborepo provides cacheable task orchestration without forcing module architecture. This combination fits the initial modular monolith and keeps future service extraction possible.

## Positive Consequences

- One pull request can update contracts and consumers atomically.
- CI can run targeted builds, linting and tests.
- Shared packages can be versioned with the repository while staying business-logic free.
- The repository remains simple enough for AI and human agents to inspect.
- Future service extraction remains possible because logical boundaries are explicit.

## Negative Consequences and Tradeoffs

- Monorepos require strong boundary enforcement to avoid hidden coupling.
- CI configuration must prevent unrelated changes from becoming one oversized task.
- Workspace tooling adds initial setup work before feature development.
- Package graph mistakes can affect multiple applications if not caught by CI.

## Implementation Impact

- Add root workspace configuration, pinned package manager, lockfile and task scripts.
- Configure TypeScript base settings, linting, formatting and module-boundary checks at the root.
- Establish package-level scripts for build, lint, typecheck and test.
- Keep business modules out of shared packages.

## Security Impact

- Centralized dependency scanning and secret scanning are required.
- Workspace packages must not expose server-only code or secrets to mobile or web bundles.
- CI must validate that client packages depend only on approved public packages.

## Testing Impact

- CI must run install with frozen lockfile, lint, formatting, typecheck, unit tests, contract validation and build tasks.
- Boundary violation tests or lint rules must reject private imports.
- Dependency graph checks should be part of pull request validation.

## Migration or Adoption Impact

Foundation work starts with repository and workspace setup before business modules. Existing documentation remains authoritative. No business data migration is involved.

## Related Blueprint Documents

- `docs/blueprint/05-system-architecture.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`

## Related Engineering Documents

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`

