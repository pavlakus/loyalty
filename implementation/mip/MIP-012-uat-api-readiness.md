# MIP-012 — UAT API Readiness

## Objective

Expose the completed PostgreSQL-backed Loyalty vertical through authenticated, tenant-aware UAT API commands and queries without duplicating domain rules.

## Boundaries

- HTTP routes validate and delegate; application services orchestrate.
- PostgreSQL adapters own SQL and transaction context.
- Customer remains global; Membership is the participation boundary.
- The existing local-MVP route remains non-production-only and is not a UAT acceptance path.
- UAT OTP delivery is an explicitly non-production test adapter; production delivery remains separately authorized.

## Required evidence

Real PostgreSQL migration, API integration, authentication/session, tenant isolation, idempotency, privacy, and UAT scenario evidence.
