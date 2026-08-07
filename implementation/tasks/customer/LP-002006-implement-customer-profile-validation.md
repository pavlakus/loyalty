# LP-002006. Implement Customer profile validation

## 1. File Name

`LP-002006-implement-customer-profile-validation.md`

## 2. Status

`READY`

## 3. Category

`FEATURE`

## 4. Assigned Role

`Backend Developer Agent`

## 4a. Priority

`P1`

## 5. Owning Module

`customer`

## 6. Module Implementation Package

`MIP-002-customer.md`

## 7. Business Objective

Maintain one secure global Customer identity while preventing cross-Business personal-data exposure and preserving immutable business history.

## 7a. Technical Objective

Provide reusable Customer profile input validation for the approved API contract, including optional email, preferred-language and date-of-birth validation, without persistence, authentication, tenant authorization or benefit evaluation.

## 8. Exact Scope

Implement only the capability described by this task title and the applicable section of `MIP-002-customer.md`.

## Dependencies

- LP-002001 — `DONE`; Customer ownership, lifecycle, privacy and identity-link architecture.
- LP-002002 — `DONE`; Customer API and Event contract foundation.
- LP-000006, LP-000007 and LP-000008 — `DONE`; environment, API response/error and event envelope foundations.
- LP-000009 and LP-000016 are not required for pure in-memory profile validation; no database or CI behavior is in scope.

## Knowledge Package

Customer Knowledge Package from `implementation/mip/MIP-002-customer.md` and the required Blueprint, security, API, event, UAT and engineering references below.

## 9. Out of Scope

- Authentication credential behavior unless this is an explicitly approved integration task;
- Membership;
- Reward, XP, Status or Benefit;
- unrestricted Business customer search;
- phone-number self-service change;
- unrelated modules;
- UAT or production changes unless explicitly authorized.

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

For this validation-only scope, implementation should use `packages/api-contracts/src/customers.ts`, its focused tests, and `docs/modules/customer/**`; service, database and event runtime paths remain unchanged unless a documented acceptance criterion requires them.

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
