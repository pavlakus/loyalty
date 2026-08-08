# Membership Backlog Reconciliation

- Date: 2026-08-08
- Role: Architecture / Product Backlog Agent

## Reviewed Sources

`33-domain-model-v2.md`, `35-event-storming-join-loyalty-program.md`, `37-event-catalog.md`, `40-event-storming-status-and-membership-year.md`, `42-data-model-v1.md`, `43-api-contract.md`, `03-business-rules.md`, `17-security.md`, `53-development-roadmap.md`, `56-uat-scenarios.md`, `MIP-002`, `MIP-005`, accepted Product Decisions, completed Customer/Authentication/Business/Brand/Program evidence, and lifecycle rules.

## Confirmed Model

Membership represents Customer participation in a Loyalty Program; Customer is global; Business is the tenant boundary; one active Membership is allowed per Customer/Program; Membership owns the Reward Account and XP Account boundaries; enrollment requires authentication, active Brand/Program, terms, eligibility, and idempotency; Reward Points and XP remain separate; history is auditable and immutable; persistence/RLS and authenticated session integration remain separate dependencies.

## Product Decision Blocker

The Blueprint names states `Created`, `Active`, `Inactive`, `Suspended`, and `Closed`, and shows a sequence, but does not define the complete allowed transition matrix. It also does not define whether Inactive or Suspended Memberships can reactivate, whether a closed/inactive Membership can be replaced by a new join, or how one-active-membership enforcement interacts with those states.

This affects LP-006001, LP-006003, LP-006004, LP-006007, API commands, events, and concurrency tests. Safe alternatives are: (A) terminal closure with no rejoin; (B) reactivation of an existing Membership; or (C) a new Membership after non-active termination while preserving historical state. A Product Owner decision is required before lifecycle/rejoin implementation. No behavior is inferred here.
