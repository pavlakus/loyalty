# LP-001002. Implement phone number normalization value object

## 1. File Name

`LP-001002-implement-phone-number-normalization-value-object.md`

## 2. Status

`READY_FOR_MERGE`

## 3. Category

`FEATURE`

## 4. Assigned Role

`Backend Developer Agent`

## 5. Owning Module

`authentication`

## 6. Module Implementation Package

`MIP-001-authentication.md`

## Dependencies

- LP-001001 — `DONE`; Authentication API/Event contract foundation.
- LP-000006 and LP-000007 — `DONE`; environment and standard API error foundations.
- No database, provider, credential, session, token, or Customer runtime dependency is required for this pure value-object scope.

## 7. Business Objective

Provide secure, auditable and testable authentication without duplicating Customer identity or weakening tenant boundaries.

## 8. Exact Scope

Implement only the capability described by this task title and the applicable section of `MIP-001-authentication.md`.

## 9. Out of Scope

- unrelated authentication capabilities;
- Customer profile business logic;
- Membership;
- loyalty calculations;
- unrelated modules;
- UAT or production environment changes unless explicitly authorized.

## 10. Required Documents

- `MIP-001-authentication.md`
- `17-security.md`
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
services/api/src/modules/authentication/**
packages/api-contracts/src/auth/**
packages/event-contracts/src/authentication/**
database/*authentication*
tests/*/authentication/**
docs/modules/authentication/**
```

Any additional file requires explicit scope approval.

## 12. Forbidden Files

```text
services/api/src/modules/reward/**
services/api/src/modules/xp/**
services/api/src/modules/status/**
services/api/src/modules/benefit/**
services/api/src/modules/receipt/**
services/api/src/modules/redemption/**
```

## 13. Acceptance Criteria

- The assigned capability matches `MIP-001-authentication.md`.
- No new Product Decision is invented.
- Security-sensitive behavior has deterministic tests.
- Stable errors and safe responses are used.
- Required audit and observability behavior exists.
- Documentation reflects the actual implementation.

## 14. Mandatory Tests

- unit tests;
- integration tests where data or API behavior changes;
- security tests where credentials, tokens, OTP or rate limits are affected;
- concurrency tests where duplicate or parallel execution is possible;
- contract tests where API or Event schema changes.

## 15. UAT References

Use the applicable scenarios from:

- `UAT-AUTH-001` to `UAT-AUTH-005`;
- `UAT-CUST-001` and `UAT-CUST-002`;
- relevant `UAT-SEC` and `UAT-REL` scenarios.

## 16. Required Reviewers

- Solution Architect;
- QA;
- Security;
- Database where schema changes;
- Documentation where public behavior changes.

## 17. Expected Output

1. Implementation or review summary
2. Changed or reviewed files
3. Database changes
4. API changes
5. Events produced or consumed
6. Permissions and RLS impact
7. Tests added
8. Tests executed
9. Results
10. Risks
11. Known limitations
12. Rollback or recovery
13. Documentation updates
14. Definition of Done evidence
15. Readiness recommendation

## 18. Completion Rule

This task is complete only when acceptance criteria, mandatory tests and required reviews pass.
