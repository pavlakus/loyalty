# LP-002001 — Define Customer Aggregate and Identity-Link Architecture

## 1. File Name

`LP-002001-define-customer-aggregate-and-identity-link-architecture.md`

## 2. Status

`QA`

## 3. Category

`ARCHITECTURE`

## 4. Priority

`P1`

## 4. Assigned Role

`Solution Architect Agent`

## 5. Owning Module

`customer`

## 6. Module Implementation Package

`implementation/mip/MIP-002-customer.md`

## MIP

`implementation/mip/MIP-002-customer.md`

## 7. Business Objective

Maintain one secure global Customer identity while preventing cross-Business personal-data exposure and preserving immutable business history.

## Technical Objective

Document the Customer aggregate boundary and verified-identity linkage model using the already locked Customer product decisions, including ownership, lifecycle, privacy boundary, and integration contracts. This task does not implement persistence, authentication, API endpoints, or database integration.

## 8. Exact Scope

Implement only the capability described by this task title and the applicable section of `MIP-002-customer.md`.

## 9. Out of Scope

- Authentication credential behavior unless this is an explicitly approved integration task;
- Membership;
- Reward, XP, Status or Benefit;
- unrestricted Business customer search;
- phone-number self-service change;
- unrelated modules;
- UAT or production changes unless explicitly authorized.

## Dependencies

- LP-000005, LP-000006, LP-000007, and LP-000008 — `DONE`;
- accepted ADR-002, ADR-003, and ADR-007;
- no dependency on LP-000009 or LP-000016 for this architecture-only scope.

## Knowledge Package

Customer Knowledge Package from `implementation/mip/MIP-002-customer.md` and the required Blueprint, security, API, event, UAT, and engineering references below.

## 10. Required Documents

- `MIP-002-customer.md`
- `17-security.md`
- `33-domain-model-v2.md`
- `34-event-storming-customer-registration.md`
- `37-event-catalog.md`
- `42-data-model-v1.md`
- `43-api-contract.md`
- `44-permission-matrix.md`
- `51-engineering-implementation-guide.md`
- `55-module-definition-of-done.md`
- `56-uat-scenarios.md`
- `57-agent-prompts.md`
- `58-project-knowledge-map.md`
- `59-coding-standards.md`

## 11. Allowed Files

Task-specific files under:

```text
services/api/src/modules/customer/**
packages/api-contracts/src/customers/**
packages/event-contracts/src/customer/**
database/*customer*
tests/*/customer/**
docs/modules/customer/**
```

Any additional file requires explicit scope approval.

For this architecture-only task, the expected implementation artifact is under `docs/modules/customer/**`; runtime and database paths remain unchanged unless a later implementation task explicitly authorizes them.

## 12. Forbidden Files

```text
services/api/src/modules/reward/**
services/api/src/modules/xp/**
services/api/src/modules/status/**
services/api/src/modules/benefit/**
services/api/src/modules/receipt/**
services/api/src/modules/redemption/**
services/api/src/modules/automation/**
```

## 13. Acceptance Criteria

- The capability follows `MIP-002-customer.md`.
- Global Customer ownership is preserved.
- No new Product Decision is invented.
- Personal data is minimized and protected.
- Cross-Business unrestricted profile access is impossible.
- Immutable business history is preserved.
- Required audit and observability behavior exists.
- Documentation matches implementation.

## 14. Mandatory Tests

- unit tests;
- integration tests where database or API behavior changes;
- concurrency tests for duplicate creation or update races;
- RLS and authorization tests;
- privacy and anonymization tests where personal data changes;
- contract tests where API or Event schema changes.

## 15. UAT References

Use applicable scenarios from:

- `UAT-CUST-001` to `UAT-CUST-004`;
- `UAT-AUTH-005`;
- `UAT-AN-004`;
- relevant `UAT-SEC` scenarios.

## 16. Required Reviewers

- Solution Architect;
- QA;
- Security;
- Database where schema or RLS changes;
- Documentation;
- legal/privacy reviewer before production anonymization release.

## 17. Expected Output

1. Implementation or review summary
2. Changed or reviewed files
3. Database changes
4. API changes
5. Events produced or consumed
6. Permissions and RLS impact
7. Privacy impact
8. Tests added
9. Tests executed
10. Results
11. Risks
12. Known limitations
13. Rollback or recovery
14. Documentation updates
15. Definition of Done evidence
16. Readiness recommendation

## 18. Completion Rule

This task is complete only when acceptance criteria, mandatory tests and required reviews pass.
