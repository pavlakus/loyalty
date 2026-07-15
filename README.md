# Loyalty Platform

## Overview

This repository currently contains the Loyalty Platform foundation:

- Blueprint documentation
- Engineering documentation
- initial monorepo/workspace foundation
- placeholder application skeletons
- no Loyalty business implementation yet

The project is developed using a documentation-first approach:

1. Business Blueprint
2. Engineering Playbook
3. AI Engineering Framework
4. Module Implementation Packages (MIP)
5. LP Implementation Tasks
6. Source Code
7. Testing
8. Release

---

## Repository Structure

```text
docs/
├── blueprint/
├── engineering/
├── ai-engineering-framework/
├── architecture/
├── adr/
├── api/
└── events/

implementation/
├── mip/
└── tasks/

apps/
services/
packages/
database/
tests/
infrastructure/
```

---

## Documentation Reading Order

### Business & Product

Start with:

- `docs/blueprint/`

### Engineering

Then read:

- `docs/engineering/`

### AI Development Rules

Then read:

- `docs/ai-engineering-framework/`

### Implementation

Then use:

- `implementation/mip/`
- `implementation/tasks/`

---

## Development Workflow

```text
Blueprint
        ↓
Engineering Playbook
        ↓
MIP
        ↓
LP Tasks
        ↓
Implementation
        ↓
Review
        ↓
UAT
        ↓
Release
```

---

## AI Agent Entry Point

Every AI agent must start by reading:

1. `AGENTS.md`
2. Assigned LP task
3. Referenced MIP
4. Required Blueprint documents
5. Required Engineering documents
6. Relevant implementation code

Agents must not invent Product Decisions or modify behavior outside their assigned scope.

---

## Local Development

Required runtime and tooling:

- Node.js: `22.18.0` as pinned in `.nvmrc`
- pnpm: `10.13.1` as pinned in `package.json`

Install dependencies:

```sh
pnpm install
```

List workspace projects:

```sh
pnpm run workspace:list
```

Run current repository validation:

```sh
pnpm run build
pnpm run test
pnpm run lint
pnpm run typecheck
```

Current validation commands validate skeleton projects only. No Loyalty business functionality exists yet.

## Workspace Applications

```text
apps/customer-mobile
apps/employee-mobile
apps/business-portal
apps/platform-admin
services/api
packages/api-contracts
packages/event-contracts
packages/shared-types
packages/validation
packages/design-system
packages/mobile-ui
packages/localization
packages/observability
packages/testing
packages/config
```

Start commands:

```sh
pnpm --filter @loyalty-platform/customer-mobile start
pnpm --filter @loyalty-platform/customer-mobile android
pnpm --filter @loyalty-platform/customer-mobile ios
pnpm --filter @loyalty-platform/customer-mobile web

pnpm --filter @loyalty-platform/employee-mobile start
pnpm --filter @loyalty-platform/employee-mobile android
pnpm --filter @loyalty-platform/employee-mobile ios
pnpm --filter @loyalty-platform/employee-mobile web

pnpm --filter @loyalty-platform/business-portal start
pnpm --filter @loyalty-platform/platform-admin start
```

The mobile apps are Expo skeletons with neutral placeholder screens. The web apps are separate TypeScript skeletons with neutral placeholder pages. Authentication, Membership, QR, Loyalty behavior, dashboards, API integration and business calculations are intentionally out of scope.

## Current Project Status

- Blueprint: Complete
- Engineering Playbook: Complete
- AI Engineering Framework: Complete
- Initial MIPs: In Progress
- Implementation: Starting with skeleton workspace foundation

---

## License

Private project.
