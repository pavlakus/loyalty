# MIP-001. Authentication

## 1. File Name

`MIP-001-authentication.md`

## 2. Purpose

This Module Implementation Package defines the complete implementation context for Authentication within the Loyalty Platform.

Authentication establishes verified identity and session context.

It does not own Customer profile data, Business ownership, Membership, permissions or loyalty behavior.

## 3. Business Objective

Enable secure authentication for:

- Customers using phone number and OTP;
- Business users;
- Employees and Managers;
- Platform Support;
- Platform Admin;
- Integration Clients.

The initial customer-facing authentication method is phone verification through SMS or Viber OTP.

## 4. Locked Product Decisions

- Customer identity is the phone number.
- Customer login uses SMS or Viber OTP.
- Email is optional.
- Customer is global across the platform.
- Phone number change is not self-service.
- Authentication must not create duplicate Customers.
- OTP must be one-time, time-limited and rate-limited.
- Authentication failure must not expose whether an unrelated Customer or tenant exists.
- Sessions and credentials must remain scoped to the verified actor.
- UI visibility is not authorization.
- Service-role execution does not bypass tenant or business validation.

## 5. Scope

This package includes:

- customer OTP request;
- customer OTP verification;
- OTP provider abstraction;
- OTP hashing and secure storage;
- OTP expiry;
- OTP attempt limits;
- OTP request rate limiting;
- OTP reuse prevention;
- customer authentication resolution by normalized phone;
- session creation;
- access-token issuance;
- refresh-token rotation;
- logout;
- session revocation;
- device/session metadata;
- business-user authentication foundation;
- employee and manager session foundation;
- platform role session foundation;
- integration-client credential authentication foundation;
- authentication audit events;
- security telemetry;
- authentication API contracts;
- authentication tests;
- mobile API integration contracts.

## 6. Out of Scope

This package does not implement:

- Customer profile management;
- phone-number self-service change;
- Business ownership rules;
- employee Location permissions;
- Membership creation;
- loyalty program joining;
- reward behavior;
- notification marketing consent;
- full provider production onboarding;
- mobile screens;
- password-based Customer authentication;
- social login;
- biometric login;
- passkeys.

## 7. Authoritative References

### Blueprint

- `00-platform-glossary.md`
- `03-business-rules.md`
- `16-api-design.md`
- `17-security.md`
- `18-customer-mobile-app.md`
- `19-employee-mobile-app.md`
- `22-non-functional-requirements.md`
- `26-product-decisions.md`
- `33-domain-model-v2.md`
- `34-event-storming-customer-registration.md`
- `37-event-catalog.md`
- `42-data-model-v1.md`
- `43-api-contract.md`
- `44-permission-matrix.md`
- `45-notification-matrix.md`
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
services/api/src/modules/authentication/
```

The Authentication module owns:

- verification challenges;
- OTP attempts;
- authentication sessions;
- refresh-token records;
- credential verification;
- authentication security events;
- provider request orchestration;
- authentication audit references.

## 9. Non-Responsibilities

Authentication does not own:

- Customer profile attributes;
- Membership;
- Business;
- Brand;
- Location;
- Employee assignments;
- permission evaluation;
- Reward;
- XP;
- Status;
- Benefit;
- Notification delivery business rules.

Authentication may call Customer through an approved public command or query to resolve or create the global Customer after successful verification.

## 10. Actors

Supported actor types:

- `Customer`
- `BusinessUser`
- `Employee`
- `Manager`
- `BusinessOwner`
- `PlatformSupport`
- `PlatformAdmin`
- `IntegrationClient`

Each actor type must have explicit authentication and session rules.

The initial implementation priority is:

1. Customer OTP
2. Business-user session foundation
3. Employee and Manager authentication foundation
4. Integration Client credentials
5. Platform roles

## 11. Customer Phone Normalization

Phone numbers must be normalized before any identity lookup.

Required rules:

- accept supported human-entered formats;
- normalize to a canonical international format;
- reject malformed or unsupported values;
- preserve country-code meaning;
- never compare raw user input;
- never use display formatting as identity;
- never expose full phone numbers in logs.

Recommended canonical form:

```text
E.164
```

Normalization behavior must be tested separately from provider delivery.

## 12. OTP Lifecycle

Allowed OTP states:

```text
created
sent
verified
expired
locked
consumed
failed
```

Required lifecycle:

```text
Request OTP
→ Create verification challenge
→ Generate cryptographically secure code
→ Store only protected representation
→ Queue/send through approved provider
→ Accept bounded verification attempts
→ Verify code and expiry
→ Mark challenge consumed
→ Resolve Customer
→ Create session
```

A consumed, expired or locked OTP may never be reused.

## 13. OTP Security Rules

- OTP values must use cryptographically secure randomness.
- Raw OTP must not be persisted.
- Raw OTP must not be logged.
- OTP lifetime must be configurable.
- Verification attempts must be limited.
- Request frequency must be rate-limited.
- Provider requests must not reveal internal identity state.
- Responses should avoid account-enumeration leakage.
- Repeated requests may invalidate prior active codes according to documented policy.
- OTP verification must be idempotent for the same successful request where appropriate.
- Provider failure must not create an authenticated session.

## 14. Recommended Configurable Defaults

Defaults remain configuration, not hardcoded business rules.

Suggested starting values:

- OTP length: 6 digits;
- OTP validity: 5 minutes;
- immediate resend cooldown: 60 seconds;
- maximum requests per phone per hour: 5;
- maximum verification attempts per challenge: 5;
- challenge lock after limit;
- refresh-token lifetime: configurable;
- access-token lifetime: short-lived;
- session inactivity policy: configurable.

Exact values require approved configuration and security review before production.

## 15. Rate Limiting

Rate limits must consider:

- normalized phone number;
- IP address;
- device or client identifier where available;
- Business or deployment context where relevant;
- provider cost protection;
- attack patterns.

Required rate-limit outcomes:

- stable `429` response;
- no excessive provider call;
- telemetry recorded;
- safe retry information;
- no identity leakage.

Rate limiting must be enforced server-side.

## 16. Provider Abstraction

Define an authentication delivery port.

Example responsibilities:

```text
sendOtp(destination, code, locale, metadata)
```

Providers may include:

- SMS;
- Viber.

The domain and application layers must not depend on provider SDKs.

Provider adapters belong to Infrastructure.

Authentication decides that verification is required.

Notification delivery policy remains owned by the appropriate delivery infrastructure and notification rules where applicable.

## 17. Commands

Authentication owns at least:

- `RequestPhoneVerification`
- `VerifyPhoneCode`
- `AuthenticateCustomer`
- `RefreshSession`
- `LogoutSession`
- `RevokeSession`
- `AuthenticateBusinessUser`
- `AuthenticateIntegrationClient`

Command handlers must enforce:

- validation;
- idempotency where applicable;
- rate limits;
- challenge lifecycle;
- audit;
- safe errors;
- transaction boundaries.

## 18. Queries

Authentication exposes read-only queries such as:

- `GetCurrentSession`
- `ListActiveSessions`
- `GetAuthenticationSecurityState`
- `GetIntegrationClientCredentialState`

Queries must not return secrets, raw tokens or raw OTP data.

## 19. Events Published

Events must match the Event Catalog.

Expected events include:

- `PhoneVerificationRequested`
- `PhoneVerificationSucceeded`
- `CustomerAuthenticated`

Additional authentication-specific events may be proposed only through Event Catalog update and approval.

Possible technical or audit signals must not be confused with Business Events.

## 20. Events Consumed

The initial Authentication module should minimize consumed Business Events.

Possible future consumption:

- role revoked;
- account suspended;
- support access expired;
- integration credential revoked.

These integrations require explicit public contracts.

## 21. API Ownership

Expected customer APIs:

```text
POST /api/v1/auth/request-otp
POST /api/v1/auth/verify-otp
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/session
```

Possible business and employee APIs:

```text
POST /api/v1/business-auth/login
POST /api/v1/employee-auth/login
POST /api/v1/auth/revoke-session
```

Integration authentication may use scoped credentials rather than interactive login.

All APIs must follow `43-api-contract.md`.

## 22. API Error Codes

Minimum stable error codes:

- `PHONE_NUMBER_INVALID`
- `OTP_REQUEST_RATE_LIMITED`
- `OTP_CHALLENGE_NOT_FOUND`
- `OTP_CODE_INVALID`
- `OTP_CODE_EXPIRED`
- `OTP_CODE_ALREADY_USED`
- `OTP_ATTEMPT_LIMIT_EXCEEDED`
- `OTP_DELIVERY_FAILED`
- `AUTHENTICATION_FAILED`
- `SESSION_EXPIRED`
- `SESSION_REVOKED`
- `REFRESH_TOKEN_INVALID`
- `REFRESH_TOKEN_REUSED`
- `INTEGRATION_CREDENTIAL_INVALID`
- `ACCOUNT_SUSPENDED`
- `PERMISSION_DENIED`

Errors must remain safe and non-enumerating.

## 23. Database Objects

Likely owned tables:

- `phone_verification_challenges`
- `authentication_sessions`
- `refresh_tokens`
- `authentication_attempts`
- `integration_credentials`
- `authentication_security_events`

Exact final names require Database review.

Required properties:

- UUID primary keys;
- normalized identity references where appropriate;
- protected OTP representation;
- timestamps in UTC;
- status constraints;
- attempt counters;
- consumed and revoked timestamps;
- tenant scope where applicable;
- audit references;
- unique constraints supporting idempotency;
- indexes for active challenge and session lookup.

## 24. Data Retention

Authentication retention must distinguish:

- active sessions;
- expired sessions;
- security events;
- provider delivery metadata;
- OTP challenge records;
- integration credentials.

Raw OTP values are never retained.

Expired verification records may be retained only for security and audit duration allowed by policy.

Personal data minimization applies.

## 25. Session Model

Session behavior must support:

- short-lived access token;
- revocable refresh token;
- token rotation;
- reuse detection;
- logout;
- server-side revocation;
- role revocation;
- multiple devices where allowed;
- device/session listing where later exposed;
- secure storage on mobile clients.

Client storage is not authoritative.

## 26. Token Rules

- Tokens must be signed using approved secure configuration.
- Secrets or private keys must not be committed.
- Claims must be minimal.
- Client-provided role or tenant claims are never trusted without validation.
- Access tokens should be short-lived.
- Refresh tokens must rotate.
- Reused revoked refresh tokens must trigger security handling.
- Tokens must not contain unnecessary personal data.
- Mobile clients store tokens only in secure storage.

## 27. Customer Resolution

After successful phone verification:

1. normalize phone;
2. search global Customer through approved Customer module query;
3. if Customer exists, authenticate that Customer;
4. if Customer does not exist, invoke approved Customer registration command;
5. create exactly one global Customer;
6. create session;
7. publish events only after successful commit.

Authentication must not directly own the Customer aggregate.

## 28. Idempotency

Required idempotency scopes:

### Request OTP

May be rate-limited rather than replayed blindly.

Must avoid duplicate provider sends caused by client retry where design allows.

### Verify OTP

Repeated successful verification of the same challenge must not:

- create duplicate Customer;
- create uncontrolled duplicate sessions;
- emit duplicate business effects.

### Refresh Session

Parallel refresh requests must not produce uncontrolled token families.

### Logout

Logout and revocation must be idempotent.

## 29. Concurrency

Mandatory race protections:

- parallel OTP requests;
- parallel OTP verification;
- duplicate Customer resolution;
- parallel refresh-token rotation;
- concurrent logout and refresh;
- integration credential revocation during request.

Application-level check followed by unprotected write is insufficient.

Use constraints, locks or atomic functions where necessary.

## 30. Audit and Security Telemetry

Record at least:

- OTP requested;
- OTP delivery attempted;
- verification succeeded;
- verification failed;
- attempt limit reached;
- rate limit triggered;
- session created;
- session refreshed;
- session revoked;
- refresh reuse detected;
- integration authentication failed;
- suspicious pattern detected.

Do not store raw secrets or full personal data in audit.

## 31. Permissions and RLS

Authentication tables require a deliberate access model.

General rules:

- Customers may not directly query OTP or token tables.
- Business users may not access another Business's sessions.
- Employees may not inspect unrelated users.
- Support access is scoped and audited.
- Platform Admin cannot retrieve raw credentials.
- Service-role paths validate actor and tenant ownership.
- Integration credentials are scoped to Business and allowed endpoints.

## 32. Observability

Required metrics:

- OTP requests total;
- OTP request rate-limited total;
- OTP delivery failure total;
- OTP verification success total;
- OTP verification failure total;
- verification latency;
- authentication success total;
- refresh failure total;
- refresh reuse detection total;
- active sessions;
- provider latency;
- authentication error rate.

Metrics labels must not include phone numbers or personal identifiers.

## 33. Mobile Integration Requirements

Customer App requires:

- phone-entry contract;
- OTP-entry contract;
- resend timing metadata;
- safe error mapping;
- access and refresh token handling;
- secure storage;
- logout;
- session-expired handling;
- offline state behavior;
- loading and retry states.

Employee App authentication may use a separate contract and role context.

UI implementation belongs to application MIPs.

## 34. Localization

Authentication system text must use translation keys.

Provider message templates must support:

1. Customer preferred language where known;
2. device or request locale where allowed;
3. Brand fallback where relevant;
4. platform fallback.

OTP text must never include unnecessary personal or business data.

## 35. Allowed Files

```text
services/api/src/modules/authentication/**
services/api/src/shared/permissions/**
services/api/src/shared/tenancy/**
services/api/src/shared/idempotency/**
services/api/src/infrastructure/providers/authentication/**
packages/api-contracts/src/auth/**
packages/event-contracts/src/authentication/**
database/migrations/*authentication*
database/functions/*authentication*
database/policies/authentication/**
database/tests/authentication/**
tests/integration/authentication/**
tests/security/authentication/**
tests/contract/authentication/**
docs/modules/authentication/**
```

Cross-cutting files may be changed only when explicitly listed in a task.

## 36. Forbidden Files

Unless a task explicitly authorizes a reviewed contract change:

```text
services/api/src/modules/reward/**
services/api/src/modules/xp/**
services/api/src/modules/status/**
services/api/src/modules/benefit/**
services/api/src/modules/receipt/**
services/api/src/modules/redemption/**
services/api/src/modules/automation/**
services/api/src/modules/analytics/**
apps/customer-mobile/** except dedicated mobile task
apps/employee-mobile/** except dedicated mobile task
```

Authentication must not implement Customer domain behavior directly.

## 37. Mandatory Tests

### Unit

- phone normalization;
- OTP generation constraints;
- OTP expiry;
- attempt counting;
- state transitions;
- token validation;
- refresh rotation;
- safe error mapping.

### Integration

- request OTP;
- valid verification;
- invalid verification;
- expired verification;
- consumed verification;
- Customer resolution;
- session creation;
- refresh;
- logout;
- revocation.

### Concurrency

- parallel OTP verification;
- duplicate Customer prevention;
- parallel refresh;
- logout versus refresh;
- duplicate provider request suppression where defined.

### Security

- brute-force resistance;
- account enumeration resistance;
- rate limiting;
- forged token;
- revoked token;
- cross-tenant session access;
- service-role validation;
- secret leakage;
- log redaction.

### Contract

- request and response schema;
- stable error codes;
- API version;
- event schema.

## 38. UAT References

- `UAT-AUTH-001`
- `UAT-AUTH-002`
- `UAT-AUTH-003`
- `UAT-AUTH-004`
- `UAT-AUTH-005`
- `UAT-CUST-001`
- `UAT-CUST-002`
- `UAT-EMP-004`
- `UAT-SEC-001`
- `UAT-SEC-005`
- `UAT-SEC-006`
- `UAT-REL-001`

## 39. Required Reviews

Mandatory:

- Solution Architect;
- Database;
- QA;
- Security;
- Documentation.

Provider or infrastructure tasks also require DevOps review.

## 40. Implementation Order

1. Approve Authentication architecture details.
2. Define API and Event contracts.
3. Implement phone normalization.
4. Implement OTP challenge schema.
5. Implement OTP generation and protected storage.
6. Implement provider port and sandbox adapter.
7. Implement request rate limiting.
8. Implement OTP verification and lockout.
9. Integrate Customer resolution contract.
10. Implement session and token model.
11. Implement refresh rotation and reuse detection.
12. Implement logout and revocation.
13. Add audit and telemetry.
14. Add API endpoints.
15. Add integration, race and security tests.
16. Complete architecture, QA and security reviews.
17. Mark Authentication UAT Ready.

## 41. Definition of Done

Authentication is UAT Ready when:

- phone normalization is deterministic;
- OTP requests are rate-limited;
- OTP values are never stored or logged raw;
- valid OTP authenticates the correct global Customer;
- invalid, expired, locked and reused OTPs are rejected;
- duplicate Customer creation is prevented;
- session creation and refresh are secure;
- refresh-token rotation and reuse detection work;
- logout and revocation are idempotent;
- cross-tenant access is denied;
- service-role paths validate ownership and rules;
- audit and metrics exist;
- all mandatory tests pass;
- Customer App contracts are stable;
- documentation is complete;
- QA and Security approve.

## 42. AI Implementation Instructions

The assigned agent must:

- use this MIP as the primary module context;
- read all listed authoritative references;
- not invent authentication policy;
- not embed provider SDK logic into Domain;
- not store raw OTP values;
- not implement Customer profile logic;
- not weaken rate limits or token security for convenience;
- report exact migrations, APIs and Events;
- provide test evidence;
- stop on unresolved security or Product contradiction.

## 43. Final Status

Initial status:

`READY FOR TASK DECOMPOSITION`
