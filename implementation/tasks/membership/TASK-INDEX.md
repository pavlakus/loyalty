# Membership Task Index

## Package

`implementation/mip/MIP-006-membership.md`

## Tasks

- LP-006001 — Define Membership aggregate, identity, and lifecycle
- LP-006002 — Define Membership API and event contracts
- LP-006003 — Implement Join Loyalty Program command contract
- LP-006004 — Implement enrollment idempotency and duplicate prevention contract
- LP-006005 — Define Reward Account and XP Account relationship contracts
- LP-006006 — Define initial Status assignment contract
- LP-006007 — Implement Membership suspension and closure operations
- LP-006008 — Define Membership Year boundary contracts
- LP-006009 — Define public Membership token and QR contracts
- LP-006010 — Define Membership read and list contracts
- LP-006011 — Add Membership domain, API, privacy, and security tests
- LP-006012 — Perform Membership architecture review
- LP-006013 — Perform Membership QA, privacy, and security gate
- LP-006014 — Implement Membership persistence and RLS (READY)

## Dependency Order

LP-006001 is the first domain task, but cannot become READY until the lifecycle transition matrix and rejoin semantics are resolved by Product Decision. LP-006002 follows the aggregate contract. LP-006003–LP-006006 establish provider-neutral enrollment boundaries and depend on the aggregate/API decisions. LP-006007 and LP-006008 depend on approved lifecycle and Status/Membership Year semantics. LP-006009 and LP-006010 are contract tasks. LP-006011–LP-006013 close the executable baseline. LP-006014 is READY because Database/Migration and CI foundations are DONE and all executable Membership contract dependencies are complete.

## Explicit Deferrals

Authentication integration, persistence/RLS, atomic database uniqueness, Reward/XP ledger mutation, receipt/activity ingestion, earning, redemption, automation, and notifications are not implemented by this package.
