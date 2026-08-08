# MIP-006 — Membership Module

## Status

READY FOR TASK DECOMPOSITION; implementation is blocked only where the Blueprint lacks a material Membership lifecycle decision.

## Source of Truth

Derived from `docs/blueprint/33-domain-model-v2.md`, `docs/blueprint/35-event-storming-join-loyalty-program.md`, `docs/blueprint/37-event-catalog.md`, `docs/blueprint/40-event-storming-status-and-membership-year.md`, `docs/blueprint/42-data-model-v1.md`, `docs/blueprint/43-api-contract.md`, `docs/blueprint/03-business-rules.md`, `docs/blueprint/17-security.md`, `docs/engineering/53-development-roadmap.md`, `docs/engineering/56-uat-scenarios.md`, and accepted ADRs/Product Decisions.

## Purpose

Represent a Customer’s participation in a Loyalty Program while preserving tenant, aggregate, privacy, idempotency, and immutable-history boundaries.

## Locked Boundaries

- Customer is global and may have multiple Memberships.
- Business is the tenant boundary; Business owns Brand; Brand owns one Loyalty Program.
- Membership references Customer, Loyalty Program, Brand, and current Status; it does not embed those aggregates.
- Membership owns participation state and the boundaries for Reward Account, XP Account, Status, Benefits, Visits, Opportunities, Goals, Membership Years, and Status History.
- Reward Points and XP remain separate. Reward and XP ledgers/history are not mutable Membership fields.
- At most one active Membership exists for a Customer and Loyalty Program.
- Enrollment requires an authenticated Customer, active Brand and Program, accepted terms, eligibility, and idempotency.
- Enrollment creates Membership, Reward Account, XP Account, and initial Status atomically when persistence is available; welcome automation is optional and asynchronous.
- Events use approved names: `LoyaltyProgramJoinRequested`, `MembershipCreated`, `MembershipActivated`, `MembershipBecameInactive`, `MembershipSuspended`, `MembershipClosed`, `CustomerJoinedLoyaltyProgram`, `MembershipYearStarted`, and `MembershipYearCompleted`.
- Public Membership tokens/QR representations must not contain phone numbers or internal database identifiers.

## Reconciled Lifecycle Decision

The approved Membership Product Decision resolves the Blueprint wording: initial states are `ACTIVE`, `SUSPENDED`, and `CLOSED`; `ACTIVE ↔ SUSPENDED` is reversible, `CLOSED` is terminal, and the Customer/Program identity may occur only once. No replacement Membership is allowed after closure. Authentication, accounts, persistence, and RLS remain separate.

## Deferred Capability Areas

- Authentication-integrated commands remain dependent on the approved session/runtime foundation.
- Persistence, unique active-membership constraints, atomic enrollment, RLS, and production repositories remain dependent on the deferred Database/RLS foundation.
- Receipt/activity, earning, Reward Ledger, XP Ledger, Status evaluation, Benefits, redemption, and automation execution remain separate downstream domains.

## Implementation Strategy

Implement provider-neutral domain contracts, value objects, deterministic commands, and in-memory/test adapters where they make no production persistence claim. Keep authentication and persistence tasks separate from the executable domain baseline.

## Definition of Done

Each task reaches `READY` only with complete dependencies and no missing Product Decision. Runtime changes require independent Review, QA, Security/Privacy review where applicable, merge, post-merge validation, and evidence. Deferred foundations must be reported explicitly rather than treated as passed.
