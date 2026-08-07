# MIP-005 — Loyalty Program Module

## Status

READY FOR TASK DECOMPOSITION

## Source of Truth

This package derives from the approved Blueprint, especially `33-domain-model-v2.md`, `03-business-rules.md`, `10-reward-engine.md`, `12-status-engine.md`, `32-strategy-templates.md`, `37-event-catalog.md`, `42-data-model-v1.md`, `43-api-contract.md`, and `53-development-roadmap.md`.

## Purpose

Define the configuration and lifecycle of loyalty behavior for the single Loyalty Program owned by each Brand. The Program defines rules and configuration; it does not contain Customer-specific participation, balances, transactions, or Membership state.

## Locked Boundaries

- Business is the tenant boundary.
- Business owns Brands.
- Each Brand owns exactly one Loyalty Program.
- Loyalty Program owns loyalty configuration and definitions.
- Membership owns Customer participation, Reward Account, XP Account, Status, Benefits, Visits, Goals, and Opportunities.
- Reward Points and XP are separate concepts.
- Reward ledgers, XP ledgers, balances, redemption reservations, and immutable transaction history belong to their respective domains.
- Configuration is separate from execution and immutable history.
- Configuration changes must be versionable where historical decisions depend on the applicable configuration.
- Business rules must remain independent from presentation and deployment concerns.

## In-Scope Capability Areas

- Program identity and lifecycle.
- Reward rule configuration and reward experience configuration.
- Pending and expiration policy configuration.
- XP rules, Status Levels, and Benefit definitions.
- Strategy selection and explainable recommendation contracts.
- Validation, invariants, audit requirements, and approved Program events.
- Domain, contract, security, and API tests for the executable non-persistence baseline.

## Deferred Capability Areas

- Database schema, migrations, persistence, RLS, and production integration remain deferred to LP-000009, LP-000016, and the relevant database/RLS tasks.
- Membership, Customer participation, Reward Engine execution, XP Engine execution, Status Engine execution, redemption, automation execution, notifications, and analytics are separate modules.
- UI, provider integrations, deployment configuration, and speculative business categories are out of scope.

## Approved Blueprint Semantics

- Reward Points represent value and are calculated by the Reward Engine from configurable rules.
- Pending periods and expiration models are Program configuration: no expiration, rolling expiration, or fixed calendar expiration.
- FIFO redemption and immutable ledger behavior belong to the Reward Engine, not this module.
- XP is evaluated separately from Reward Points.
- Status Levels use configured XP and visit conditions; downgrade occurs only during Membership Renewal.
- Benefits are defined by the Program and granted/managed by the Benefit/Status domains.
- Strategy templates recommend configuration and remain explainable, optional, and business-controlled.
- API and event names must match the approved Blueprint catalog; no new public contract is invented by this package.

## Security and Data Rules

- Every operation must carry approved Business/Brand tenant context.
- No Customer personal data, Membership state, credentials, or secrets belong in Program configuration.
- Events carry tenant context, correlation/causation identifiers, and only necessary data.
- Audit history is append-only and must not expose secrets or unnecessary personal data.

## Definition of Done

- Each task is implemented only after it reaches `READY`.
- Domain and contract behavior is covered by deterministic tests.
- Persistence-dependent tasks remain honestly deferred until their declared foundations are DONE.
- Independent Review, QA, Security where required, merge, post-merge validation, and evidence are complete.
- No task claims database, RLS, Membership, Reward Engine, or production integration that it did not execute.
