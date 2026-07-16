# LP-000002. Initialize Monorepo and Workspace

## 1. File Name

`LP-000002-initialize-monorepo-and-workspace.md`

## 2. Status

`READY_FOR_REVIEW`

## 3. Category

`DEVOPS`

## 4. Priority

`P0`

## 5. Complexity

`L`

## 6. Estimated Context Size

`Large`

## 7. Assigned Role

`DevOps Agent`

## 8. Owning Module

`Platform Foundation`

## 9. Module Implementation Package

`implementation/mip/MIP-000-platform-foundation.md`

## 10. Business Objective

Create a reproducible repository and workspace foundation that allows all Loyalty Platform applications, services, packages, database assets, tests and infrastructure code to be developed consistently from one monorepo.

## 11. Technical Objective

Initialize the approved pnpm workspace and Turborepo structure, create minimal application and service skeletons, pin tool versions and produce a deterministic installable repository without implementing Loyalty business behavior.

## 12. Exact Scope

This task includes:

- initialize root `package.json`;
- pin the approved package manager;
- create `pnpm-workspace.yaml`;
- create deterministic `pnpm-lock.yaml`;
- configure Turborepo;
- create root scripts for install, build, typecheck, lint and test placeholders;
- create Customer Mobile Expo application skeleton;
- create Employee Mobile Expo application skeleton;
- create Business Portal application skeleton;
- create Platform Admin application skeleton;
- create API service package skeleton;
- create approved shared package placeholders;
- create approved top-level directories;
- ensure all workspace projects are discoverable from the root;
- document workspace commands required for later tasks.

## 13. Out of Scope

This task must not implement:

- Authentication;
- OTP;
- Customer;
- Business;
- Brand;
- Location;
- Employee;
- Loyalty Program;
- Membership;
- Receipt;
- Reward;
- XP;
- Status;
- Benefit;
- Redemption;
- Automation;
- Notification;
- Analytics;
- real mobile screens;
- real web dashboards;
- production deployment;
- Supabase schema or business tables;
- CI pipeline beyond placeholder directories;
- LP-000003 or later task scope.

## 14. Dependencies

Required completed dependencies:

- `LP-000001-approve-platform-foundation-adr-set.md`
- accepted `ADR-001-monorepo-and-workspace-strategy.md`
- accepted `ADR-002-modular-monolith-backend.md`
- accepted `ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- accepted `ADR-008-cross-platform-mobile-architecture.md`

No other LP task dependency exists.

## 15. Required Documents

- `AGENTS.md`
- `README.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`
- `docs/adr/ADR-002-modular-monolith-backend.md`
- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `docs/adr/ADR-004-transactional-outbox.md`
- `docs/adr/ADR-005-idempotency-foundation.md`
- `docs/adr/ADR-006-observability-and-correlation-context.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-008-cross-platform-mobile-architecture.md`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/engineering/68-definition-of-task-ready.md`

## 16. Knowledge Package

### Primary

- `implementation/mip/MIP-000-platform-foundation.md`

### Architecture

- ADR-001
- ADR-002
- ADR-003
- ADR-008

### Engineering

- Repository Structure
- Coding Standards
- Module Definition of Done
- Release Strategy

### Excluded Context

Do not load unrelated business-domain documents unless a contradiction is discovered.

## 17. Allowed Files

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
.nvmrc
.node-version
apps/customer-mobile/**
apps/employee-mobile/**
apps/business-portal/**
apps/platform-admin/**
services/api/**
packages/api-contracts/**
packages/event-contracts/**
packages/shared-types/**
packages/validation/**
packages/design-system/**
packages/mobile-ui/**
packages/localization/**
packages/observability/**
packages/testing/**
packages/config/**
database/**
tests/**
infrastructure/**
scripts/**
.github/**
README.md
docs/engineering/**
```

Changes to `docs/engineering/**` are allowed only when required to document actual workspace commands or reconcile repository structure.

## 18. Forbidden Files

```text
docs/blueprint/**
implementation/mip/**
implementation/tasks/** except this task status after completion
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
```

## 19. Implementation Requirements

### Tooling

Use the accepted ADR decisions:

- pnpm;
- pnpm workspaces;
- Turborepo;
- TypeScript;
- React Native with Expo for mobile skeletons.

### Root Workspace

Create:

- root `package.json`;
- pinned `packageManager`;
- workspace scripts;
- `pnpm-workspace.yaml`;
- `turbo.json`;
- runtime version file;
- deterministic lockfile.

### Applications

Create minimal skeletons for:

- `apps/customer-mobile`;
- `apps/employee-mobile`;
- `apps/business-portal`;
- `apps/platform-admin`.

### Backend

Create:

- `services/api`;

Only package/bootstrap boundaries are allowed.

No domain module behavior.

### Shared Packages

Create minimal package placeholders for:

- API contracts;
- Event contracts;
- shared types;
- validation;
- design system;
- mobile UI;
- localization;
- observability;
- testing;
- configuration.

### Repository Safety

- preserve all existing documentation;
- do not remove existing files;
- do not overwrite Blueprint documents;
- do not add demo Loyalty behavior;
- do not start later LP tasks.

## 20. Acceptance Criteria

1. Root package manager is pinned to an explicit pnpm version.
2. Runtime version is pinned.
3. `pnpm-workspace.yaml` includes all approved workspace paths.
4. Turborepo is configured.
5. A clean `pnpm install` succeeds.
6. `pnpm-lock.yaml` is generated and deterministic.
7. All applications and packages are discoverable from the root workspace.
8. Customer Mobile and Employee Mobile are valid minimal Expo projects.
9. Business Portal and Platform Admin are separate minimal web projects.
10. API service exists as a minimal package without domain behavior.
11. Shared package placeholders exist.
12. Root build command runs for currently supported skeleton projects.
13. Root typecheck command runs for currently supported skeleton projects.
14. No Loyalty business functionality is introduced.
15. Existing documentation remains intact.
16. The task does not implement LP-000003 scope.

## 21. Mandatory Tests and Validation

Execute and report:

- `pnpm --version`
- runtime version command
- `pnpm install`
- workspace package discovery
- root build command
- root typecheck command
- project-level validation for both mobile skeletons
- project-level validation for both web skeletons
- API package validation
- `git status --short`
- search proving no business module implementation was introduced

If a validation cannot execute, report the exact reason and command required.

## 22. UAT References

This task supports, but does not complete:

- `UAT-REL-001`
- `UAT-REL-002`
- `UAT-REL-004`
- `UAT-REL-005`

No customer-facing UAT is required for this repository bootstrap task.

## 23. Security Considerations

- do not commit secrets;
- do not create real credentials;
- do not include production URLs;
- do not expose server-only configuration to client packages;
- mobile and web skeletons must use placeholder-safe configuration only;
- dependency installation output must be reviewed for vulnerabilities.

## 24. Database Impact

No business schema is created.

Allowed:

- empty database directories;
- migration framework placeholders;
- safe README or configuration placeholders.

Not allowed:

- Customer, Business, Membership, Receipt, Reward or other business tables.

## 25. API Impact

No public business API is created.

Allowed:

- minimal package/bootstrap boundary;
- placeholder health boundary only if already explicitly required by the task and without domain behavior.

## 26. Event Impact

No Business Events are implemented.

Allowed:

- empty Event contract package;
- package exports;
- no domain Event definitions.

## 27. Observability Impact

Only package placeholders and interfaces may be created.

Actual logging and correlation implementation belongs to later Foundation tasks.

## 28. Documentation Requirements

Update documentation only when necessary to reflect:

- actual package-manager version;
- actual runtime version;
- actual root commands;
- actual workspace paths;
- actual application skeleton choices.

Do not claim unimplemented capabilities.

## 29. Risk Assessment

### Implementation Risk

Moderate.

### Architectural Risk

High if workspace boundaries do not match ADR-001 and repository structure.

### Security Risk

Moderate due to configuration and dependency setup.

### Operational Risk

Moderate because all later work depends on this structure.

## 30. Required Reviewers

- Solution Architect Review;
- DevOps Review;
- QA Review;
- Documentation Review.

Security review is required for configuration exposure and dependency findings.

## 31. Rollback Expectations

Rollback is performed by reverting this task commit.

No business data migration exists.

The task must not create irreversible external infrastructure.

## 32. Expected Deliverables

1. Task Readiness result
2. Workspace structure created
3. Tool and version choices
4. Changed files
5. Root commands created
6. Commands executed
7. Exact validation results
8. Unexecuted validation
9. Dependency or vulnerability findings
10. Risks
11. Known limitations
12. Rollback instructions
13. Documentation changes
14. Definition of Done evidence
15. Readiness recommendation

## 33. Definition of Done Level

Target:

`Level 1 — Implementation Complete`

This task does not independently achieve full Platform Foundation Integration Ready status.

## 34. Definition of Done Evidence

Required:

- clean install evidence;
- workspace discovery evidence;
- build evidence;
- typecheck evidence;
- mobile skeleton validation;
- web skeleton validation;
- API skeleton validation;
- exact changed-file list;
- no-business-logic verification;
- rollback confirmation.

## 35. Completion Rule

This task is complete only when:

- all acceptance criteria pass;
- mandatory validations are executed or transparently documented;
- required reviews approve;
- no forbidden file is modified;
- no business functionality is introduced;
- recommendation is `READY FOR REVIEW`.
