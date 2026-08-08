# Membership Backlog Reconciliation

- Date: 2026-08-08
- Role: Architecture / Product Backlog Agent

## Reviewed Sources

`33-domain-model-v2.md`, `35-event-storming-join-loyalty-program.md`, `37-event-catalog.md`, `40-event-storming-status-and-membership-year.md`, `42-data-model-v1.md`, `43-api-contract.md`, `03-business-rules.md`, `17-security.md`, `53-development-roadmap.md`, `56-uat-scenarios.md`, `MIP-002`, `MIP-005`, accepted Product Decisions, completed Customer/Authentication/Business/Brand/Program evidence, and lifecycle rules.

## Confirmed Model

Membership represents Customer participation in a Loyalty Program; Customer is global; Business is the tenant boundary; one active Membership is allowed per Customer/Program; Membership owns the Reward Account and XP Account boundaries; enrollment requires authentication, active Brand/Program, terms, eligibility, and idempotency; Reward Points and XP remain separate; history is auditable and immutable; persistence/RLS and authenticated session integration remain separate dependencies.

## Product Decision Resolution

The Product Owner approved the Membership Lifecycle and Rejoin Decision on 2026-08-08. The canonical states are ACTIVE, SUSPENDED, and CLOSED; ACTIVE/SUSPENDED are reversible; CLOSED is terminal; and one durable Customer/Program Membership identity is allowed. LP-006001 is now eligible for preparation and implementation. Authentication, accounts, persistence, and RLS remain separately deferred.
