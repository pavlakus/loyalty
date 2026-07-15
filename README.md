# Loyalty Platform

## Overview

This repository contains the complete implementation of the Loyalty Platform.

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

## Current Project Status

- Blueprint: Complete
- Engineering Playbook: Complete
- AI Engineering Framework: Complete
- Initial MIPs: In Progress
- Implementation: Starting

---

## License

Private project.
