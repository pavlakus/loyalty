# Codex Prompt — LP-000001

Paste the text below into Codex from the repository root.

---

You are executing the Solution Architect task `LP-000001`.

Read `AGENTS.md` first and follow it as the root instruction.

Then read:

- `implementation/tasks/platform-foundation/LP-000001-approve-platform-foundation-adr-set.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
- `docs/blueprint/05-system-architecture.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`
- `docs/blueprint/33-domain-model-v2.md`
- `docs/blueprint/42-data-model-v1.md`
- `docs/blueprint/43-api-contract.md`
- `docs/blueprint/44-permission-matrix.md`

ROLE

Act only as the Solution Architect Agent.

TASK

Complete `LP-000001` by creating and finalizing the Platform Foundation ADR set.

Create these exact files:

- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`
- `docs/adr/ADR-002-modular-monolith-backend.md`
- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `docs/adr/ADR-004-transactional-outbox.md`
- `docs/adr/ADR-005-idempotency-foundation.md`
- `docs/adr/ADR-006-observability-and-correlation-context.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-008-cross-platform-mobile-architecture.md`

Update:

- `docs/adr/ADR-INDEX.md`

Each ADR must include:

1. ADR number
2. Title
3. Status
4. Date
5. Context
6. Problem
7. Decision
8. Alternatives considered
9. Rationale
10. Positive consequences
11. Negative consequences and tradeoffs
12. Implementation impact
13. Security impact
14. Testing impact
15. Migration or adoption impact
16. Related Blueprint documents
17. Related Engineering documents

LOCKED CONSTRAINTS

- Use a monorepo.
- Start with a modular monolith backend.
- Use PostgreSQL with a Supabase-compatible approach.
- Use transactional outbox for reliable Business Events.
- Critical commands must be idempotent.
- Observability must propagate request, correlation and causation identifiers.
- Secrets must never be committed.
- Customer and Employee mobile applications target Android and iOS from a shared cross-platform codebase.
- The immediate Android testing requirement is an installable preview APK.
- Do not define store publication as a Sprint 0 requirement.
- Do not implement source code.
- Do not create business module behavior.
- Do not modify Blueprint decisions.

MATERIAL TECHNOLOGY CHOICES

Where the existing documentation does not lock an exact tool, make a reasoned architecture decision and document alternatives.

For the workspace ADR, evaluate and select:

- package manager;
- workspace mechanism;
- task runner/build orchestrator.

For mobile architecture, evaluate React Native with Expo as the preferred option and document why it supports:

- one codebase;
- Android APK preview builds;
- later iOS builds;
- camera and QR;
- secure storage;
- push notifications.

TASK READINESS

First perform a Task Readiness Check.

If a mandatory source document is missing, do not invent its content. Return `TASK NOT READY` with exact missing paths.

If the task is ready, complete the ADR files directly. Do not stop after producing only a plan.

VALIDATION

Before finishing:

- confirm all eight ADR files exist;
- confirm ADR-INDEX references all eight;
- search for placeholder text such as `TBD`, `TODO`, or `[fill]`;
- confirm no source code was created;
- confirm no Blueprint file was modified.

RETURN

1. Task Readiness result
2. ADR files created
3. Decisions selected
4. Alternatives rejected
5. Changed files
6. Validation performed
7. Open blockers
8. Definition of Done evidence
9. Recommendation: `READY FOR ARCHITECTURE REVIEW` or `BLOCKED`

Do not commit or merge unless explicitly instructed.
