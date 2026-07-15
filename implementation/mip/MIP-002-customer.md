# MIP-002. Customer

## 1. File Name

`MIP-002-customer.md`

## 2. Purpose

This Module Implementation Package defines the complete implementation context for the global Customer domain within the Loyalty Platform.

Customer is a global platform entity identified by a verified phone number.

The Customer module owns Customer profile data, identity linkage, profile lifecycle and anonymization behavior.

It does not own Authentication credentials, Memberships, Reward balances, Status, Benefits or Business-specific loyalty data.

## 3. Business Objective

Provide one secure, global and reusable Customer identity across all Loyalty Programs while preserving:

- privacy;
- data minimization;
- tenant isolation;
- immutable financial history;
- auditability;
- consistent profile behavior;
- support for multiple Memberships.

## 4. Locked Product Decisions

- Customer is a global entity.
- Customer identity is based on verified phone number.
- Authentication uses SMS or Viber OTP.
- Email is optional.
- Phone-number change is not self-service.
- One Customer may have multiple Memberships.
- Customer profile is not owned by any Business.
- Businesses cannot freely access global Customer personal data.
- Anonymization removes or irreversibly replaces personal data while preserving immutable financial and audit history.
- Customer deletion must not break referential integrity.
- Customer history remains separated by Loyalty Program through Memberships.
- UI visibility is not authorization.
- Customer profile data must not leak across Businesses.

## 5. Scope

This package includes:

- global Customer aggregate;
- Customer creation after verified authentication;
- duplicate prevention by normalized verified phone;
- Customer profile read;
- Customer profile update;
- optional email management;
- preferred language;
- optional date of birth where supported;
- marketing and communication preference references where appropriate;
- profile versioning and audit;
- Customer anonymization;
- Customer lifecycle status;
- Customer-level privacy and access rules;
- Customer API contracts;
- Customer events;
- Customer database schema;
- Customer integration with Authentication;
- Customer queries needed by Membership and mobile applications;
- privacy-safe logging and observability;
- unit, integration, RLS, privacy and concurrency tests.

## 6. Out of Scope

This package does not implement:

- OTP delivery or session management;
- phone-number self-service change;
- Membership creation;
- Loyalty Program joining;
- Business-specific customer notes unless explicitly modeled later;
- Reward, XP, Status or Benefit state;
- campaign audience calculations;
- Business customer search beyond approved membership-scoped views;
- full consent management where owned by another approved domain;
- identity merging;
- family accounts;
- corporate accounts;
- referral programs.

## 7. Authoritative References

### Blueprint

- `00-platform-glossary.md`
- `03-business-rules.md`
- `17-security.md`
- `18-customer-mobile-app.md`
- `21-analytics.md`
- `22-non-functional-requirements.md`
- `26-product-decisions.md`
- `33-domain-model-v2.md`
- `34-event-storming-customer-registration.md`
- `35-event-storming-join-loyalty-program.md`
- `37-event-catalog.md`
- `42-data-model-v1.md`
- `43-api-contract.md`
- `44-permission-matrix.md`
- `49-open-questions-final.md`

### Engineering

- `51-engineering-implementation-guide.md`
- `52-repository-structure.md`
- `53-development-roadmap.md`
- `54-agent-development-plan.md`
- `55-module-definition-of-done.md`
- `56-uat-scenarios.md`
- `57-agent-prompts.md`
- `58-project-knowledge-map.md`
- `59-coding-standards.md`
- `60-release-strategy.md`
- `61-global-consistency-review.md`
- `64-module-implementation-packages.md`
- `68-definition-of-task-ready.md`
- `69-project-governance.md`

## 8. Owning Module

```text
services/api/src/modules/customer/
```

The Customer module owns:

- Customer aggregate;
- Customer profile;
- Customer lifecycle state;
- Customer anonymization state;
- Customer profile audit references;
- Customer privacy-safe read models;
- public Customer commands and queries.

## 9. Non-Responsibilities

Customer does not own:

- OTP;
- sessions;
- refresh tokens;
- Business;
- Brand;
- Loyalty Program;
- Membership;
- Reward Ledger;
- XP Ledger;
- Status;
- Benefit;
- Receipt;
- Notification delivery;
- Analytics projections.

Customer may expose public contracts to those modules without allowing direct database access.

## 10. Aggregate Model

### Aggregate Root

`Customer`

### Core Fields

- `customer_id`
- `normalized_phone_reference`
- `phone_verification_state`
- `email`
- `preferred_language`
- `date_of_birth` where allowed
- `status`
- `created_at`
- `updated_at`
- `anonymized_at`
- `version`

The exact persistence model may store identity linkage separately for privacy and security reasons.

## 11. Customer Lifecycle

Allowed states:

```text
active
suspended
anonymized
closed
```

Recommended lifecycle:

```text
CustomerRegistered
→ Active
→ Suspended where required
→ Active after approved recovery
→ Anonymized
```

Anonymized is terminal unless a future Product Decision explicitly defines re-identification.

## 12. Registration Rules

Customer registration occurs only after successful phone verification.

Required flow:

```text
Authentication verifies phone
→ Customer module resolves normalized verified identity
→ Existing Customer returned
or
→ New Customer created exactly once
→ CustomerRegistered published
```

Authentication must not create Customer records directly.

Duplicate prevention must be enforced transactionally.

## 13. Duplicate Prevention

The system must prevent duplicate global Customers for the same verified normalized phone.

Protection should include:

- normalized identity key;
- unique constraint;
- atomic create-or-resolve flow;
- concurrency test;
- idempotent registration behavior.

Parallel valid OTP verifications must not create duplicate Customers.

## 14. Customer Profile

Allowed profile fields may include:

- display name;
- first name;
- last name;
- optional email;
- preferred language;
- optional date of birth;
- optional profile image reference;
- approved communication preferences reference.

The platform should collect only data needed for approved product behavior.

Every field must have:

- owner;
- purpose;
- validation;
- retention behavior;
- visibility rule;
- anonymization rule.

## 15. Phone Number Handling

Phone number is the verified identity anchor.

Rules:

- canonical normalization is required;
- raw user formatting is not identity;
- phone is never a public Membership identifier;
- full phone should not appear in logs;
- UI should mask phone where appropriate;
- phone change is not self-service;
- support-assisted change requires a separate approved process and strong audit;
- Customer module may reference verified identity data but Authentication owns verification.

## 16. Email Handling

Email is optional.

Rules:

- email must be normalized;
- email must be validated;
- email is not the primary Customer identity;
- duplicate email does not automatically merge Customers;
- email visibility is permission-controlled;
- email is anonymized when required;
- email must not be exposed to unrelated Businesses.

## 17. Preferred Language

Customer may have a preferred language.

Resolution order should support:

1. explicit Customer preference;
2. application or device locale;
3. Brand fallback where appropriate;
4. platform fallback.

Preferred language must use a stable locale identifier.

Changing preferred language must not change historical business records.

## 18. Date of Birth

Date of birth is optional.

It may support Birthday Benefits and personalization.

Rules:

- collect only with clear product purpose;
- validate realistic values;
- minimize visibility;
- prevent unnecessary employee access;
- anonymize appropriately;
- changes may require audit due to benefit abuse risk;
- birthday eligibility remains owned by the appropriate Benefit or Automation flow.

Customer module stores approved profile data but does not grant Birthday Benefits.

## 19. Commands

Customer owns at least:

- `RegisterCustomer`
- `UpdateCustomerProfile`
- `UpdateCustomerPreferredLanguage`
- `UpdateCustomerEmail`
- `SuspendCustomer`
- `ReactivateCustomer`
- `AnonymizeCustomer`

Potential support-assisted phone change requires a separate future command and Product approval.

## 20. Queries

Customer exposes:

- `GetCurrentCustomer`
- `GetCustomerByIdForAuthorizedContext`
- `ResolveCustomerByVerifiedIdentity`
- `GetCustomerPrivacyState`
- `GetCustomerProfileSummary`

Queries must enforce purpose-specific output filtering.

No query should expose unrestricted global profile data to a Business user.

## 21. Events Published

Expected events:

- `CustomerRegistered`
- `CustomerProfileUpdated`
- `CustomerAnonymized`
- `CustomerAuthenticated` is published by Authentication, not Customer.

Additional lifecycle events may be added only through Event Catalog review.

## 22. Events Consumed

Customer may consume:

- verified identity result through command/query integration;
- approved privacy or support commands;
- future account status events.

Customer should not consume loyalty events merely to duplicate Membership or Reward state.

## 23. API Ownership

Expected customer-facing APIs:

```text
GET   /api/v1/customers/me
PATCH /api/v1/customers/me
POST  /api/v1/customers/me/anonymize
```

Potential privacy APIs:

```text
GET /api/v1/customers/me/privacy
GET /api/v1/customers/me/export
```

Data export requires separate security and legal readiness before production.

Business-scoped customer views should be exposed through Membership or approved read-model APIs, not unrestricted Customer endpoints.

## 24. API Error Codes

Minimum stable error codes:

- `CUSTOMER_NOT_FOUND`
- `CUSTOMER_ALREADY_EXISTS`
- `CUSTOMER_PROFILE_INVALID`
- `CUSTOMER_EMAIL_INVALID`
- `CUSTOMER_LANGUAGE_UNSUPPORTED`
- `CUSTOMER_SUSPENDED`
- `CUSTOMER_ANONYMIZED`
- `CUSTOMER_ALREADY_ANONYMIZED`
- `CUSTOMER_ANONYMIZATION_BLOCKED`
- `CUSTOMER_ACCESS_DENIED`
- `CUSTOMER_VERSION_CONFLICT`
- `PHONE_CHANGE_NOT_SELF_SERVICE`
- `PERMISSION_DENIED`
- `TENANT_SCOPE_MISMATCH`

## 25. Database Objects

Likely owned tables:

- `customers`
- `customer_profiles`
- `customer_identity_links` where approved
- `customer_profile_history`
- `customer_privacy_actions`

Exact names require Database review.

Required properties:

- UUID primary keys;
- unique verified identity linkage;
- explicit lifecycle status;
- UTC timestamps;
- optimistic concurrency version;
- audit references;
- anonymization metadata;
- privacy-safe indexes;
- no business tenant ownership on the global Customer root itself;
- controlled access paths.

## 26. Global Entity and Tenant Boundary

Customer is global.

This does not mean every Business may access the Customer.

Access rules:

- Customer may access their own profile.
- Authentication may resolve the verified Customer.
- Membership may reference Customer.
- Business users access Customer-related data only through their Business's Membership and approved read model.
- Employee access is limited to operational need.
- Platform Support access is scoped, temporary and audited.
- Platform Admin does not receive unrestricted personal-data access by default.

## 27. RLS and Authorization

Because Customer is global, RLS must be designed carefully.

Required paths:

### Customer Self Access

Customer may read and update approved fields of their own active profile.

### Business Access

No direct unrestricted `customers` read.

Business access must be mediated through Membership ownership and purpose-specific views or functions.

### Employee Access

Only minimum data required for a permitted transaction.

### Support Access

Time-limited, scoped and audited.

### Service Role

Must validate purpose, actor and ownership.

## 28. Anonymization

Anonymization must:

- remove or irreversibly replace personal identifiers;
- prevent future authentication with anonymized identity;
- preserve immutable Reward, XP, Receipt, Status and audit history;
- preserve referential integrity;
- preserve allowed aggregated Analytics;
- prevent accidental re-identification;
- record actor, reason, time and correlation ID;
- be idempotent.

Anonymization must not:

- delete financial history;
- mutate immutable ledgers;
- delete receipts;
- break Membership transaction history;
- remove audit evidence;
- silently merge records.

## 29. Anonymization Strategy

Recommended approach:

- replace direct identifiers with irreversible placeholders;
- remove optional profile fields;
- sever or anonymize identity linkage;
- retain stable internal surrogate ID;
- mark Customer as anonymized;
- preserve references from immutable history;
- rebuild privacy-safe projections where needed.

Exact legal retention periods require legal review.

## 30. Idempotency

Required idempotent actions:

- registration;
- profile update where request key is supplied;
- anonymization;
- suspension;
- reactivation.

Repeated anonymization must return stable already-completed behavior without duplicate side effects.

## 31. Concurrency

Mandatory protections:

- parallel Customer registration;
- concurrent profile update;
- anonymization during profile update;
- authentication resolution during anonymization;
- support action during Customer self-action.

Use unique constraints and optimistic concurrency where appropriate.

## 32. Audit

Audit at least:

- Customer registration;
- profile update;
- email update;
- preferred language update;
- date-of-birth update;
- suspension;
- reactivation;
- anonymization request;
- anonymization completion;
- denied sensitive access;
- support access.

Audit must not duplicate unnecessary personal data.

## 33. Privacy and Logging

Never log:

- full phone number;
- full email unless specifically justified and protected;
- date of birth;
- raw profile payload;
- exported personal data;
- anonymization secrets.

Use Customer ID and correlation ID for operational tracing.

## 34. Observability

Required metrics:

- Customer registrations total;
- duplicate registration prevented total;
- profile update success and failure;
- anonymization requests;
- anonymization success and failure;
- access-denied total;
- profile version conflict total;
- registration latency;
- anonymization duration.

No personal identifiers in metric labels.

## 35. Analytics Impact

Analytics may use:

- anonymized Customer ID;
- aggregated counts;
- Membership activity;
- approved segmentation.

Analytics must not restore removed personal data.

Customer anonymization should preserve valid aggregate metrics while removing prohibited drill-down identifiers.

## 36. Mobile Integration Requirements

Customer App needs:

- current Customer profile;
- update profile;
- update language;
- display masked phone;
- optional email management;
- anonymization request or account privacy entry point;
- safe session-expired handling;
- loading, error, empty and retry states.

Actual screens belong to `MIP-023-customer-mobile-app.md`.

## 37. Allowed Files

```text
services/api/src/modules/customer/**
packages/api-contracts/src/customers/**
packages/event-contracts/src/customer/**
database/migrations/*customer*
database/functions/*customer*
database/policies/customer/**
database/tests/customer/**
tests/integration/customer/**
tests/security/customer/**
tests/contract/customer/**
docs/modules/customer/**
```

Cross-module contract changes require explicit scope approval.

## 38. Forbidden Files

Unless explicitly authorized:

```text
services/api/src/modules/authentication/** except public contract adaptation
services/api/src/modules/membership/**
services/api/src/modules/reward/**
services/api/src/modules/xp/**
services/api/src/modules/status/**
services/api/src/modules/benefit/**
services/api/src/modules/receipt/**
services/api/src/modules/redemption/**
services/api/src/modules/automation/**
apps/customer-mobile/** except dedicated mobile task
```

## 39. Mandatory Tests

### Unit

- profile validation;
- email normalization;
- language validation;
- lifecycle transitions;
- anonymization policy;
- masking;
- error mapping.

### Integration

- create Customer after verified identity;
- existing Customer resolution;
- profile read;
- profile update;
- suspend;
- reactivate;
- anonymize;
- read after anonymization;
- Authentication integration contract.

### Concurrency

- parallel registration;
- concurrent profile update;
- anonymization race;
- duplicate anonymization.

### Security and RLS

- Customer self access;
- Customer A denied Customer B;
- Business A denied unrelated Customer;
- employee minimum view;
- support scope;
- service-role purpose validation;
- no existence leakage;
- sensitive logging.

### Privacy

- personal fields removed;
- immutable references retained;
- Analytics aggregate preserved;
- authentication blocked after anonymization.

## 40. UAT References

- `UAT-CUST-001`
- `UAT-CUST-002`
- `UAT-CUST-003`
- `UAT-CUST-004`
- `UAT-AUTH-005`
- `UAT-MEM-003`
- `UAT-AN-004`
- `UAT-SEC-001`
- `UAT-SEC-005`
- `UAT-SEC-007`

## 41. Required Reviews

Mandatory:

- Solution Architect;
- Database;
- QA;
- Security;
- Documentation.

Anonymization also requires legal/privacy review before production.

## 42. Implementation Order

1. Confirm Customer aggregate and identity-link model.
2. Define API and Event contracts.
3. Create Customer schema and constraints.
4. Implement verified identity resolution.
5. Implement atomic Customer registration.
6. Implement profile validation and update.
7. Implement optional email.
8. Implement preferred language.
9. Implement lifecycle suspension/reactivation.
10. Implement anonymization.
11. Implement RLS and purpose-specific access.
12. Add audit and observability.
13. Add Authentication integration.
14. Add unit, integration, concurrency and privacy tests.
15. Complete Architecture, QA, Security and Documentation reviews.
16. Mark Customer UAT Ready.

## 43. Definition of Done

Customer is UAT Ready when:

- one verified phone resolves one global Customer;
- parallel registration cannot create duplicates;
- Customer can access only their own profile;
- Business users cannot freely access global profiles;
- profile updates are validated and audited;
- phone change is blocked from self-service;
- optional email and preferred language work;
- lifecycle behavior is deterministic;
- anonymization is idempotent;
- anonymization removes personal data;
- immutable business history remains intact;
- authentication is blocked after anonymization;
- tenant and privacy tests pass;
- no sensitive data appears in logs;
- documentation is complete;
- QA and Security approve.

## 44. AI Implementation Instructions

The assigned agent must:

- use this MIP as primary context;
- preserve global Customer semantics;
- not assign Customer ownership to a Business;
- not expose unrestricted Customer search;
- not implement Membership or loyalty state;
- not permit phone self-service change;
- preserve immutable history during anonymization;
- report all schema, API, Event and privacy changes;
- provide test evidence;
- stop on unresolved privacy or legal requirement.

## 45. Final Status

Initial status:

`READY FOR TASK DECOMPOSITION`
