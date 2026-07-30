# Customer Aggregate and Identity-Link Architecture

## Task Context

- **Task:** LP-002001
- **Module:** Customer
- **Source:** `implementation/mip/MIP-002-customer.md`
- **Status:** Logical architecture definition only

This document defines the Customer module boundary and logical identity-link model. It does not introduce a new Product Decision, physical database schema, authentication implementation, API runtime, or deployment behavior.

## Ownership Boundary

The Customer module owns the global `Customer` aggregate, approved profile data, Customer lifecycle state, anonymization state, privacy-safe read models, and Customer commands and queries.

The module does not own OTP delivery, authentication credentials, sessions, Memberships, Business or Brand data, Reward, XP, Status, Benefits, Receipts, Notifications, Analytics projections, or unrestricted Business customer search.

Authentication owns phone verification and session behavior. Membership owns the relationship between a Customer and a Loyalty Program. Other modules collaborate through public commands, queries, and events rather than direct private writes.

## Logical Aggregate

`Customer` is a global aggregate identified by a verified, canonically normalized phone identity. A Customer can participate in multiple Loyalty Programs through separate Membership aggregates.

The aggregate contains or references:

- stable internal `customer_id`;
- verified identity-link reference and verification state;
- approved profile fields;
- optional email and preferred language;
- lifecycle status;
- anonymization state and timestamp;
- optimistic version;
- creation and update timestamps.

Raw phone formatting is not identity. Full phone values are not public Membership identifiers and must not appear in logs. The physical separation of identity linkage and profile data remains a later database implementation concern; this logical boundary prevents profile ownership from moving to a Business.

## Lifecycle Invariants

The permitted Customer states are `active`, `suspended`, `anonymized`, and `closed`.

- A new Customer is created only after successful Authentication phone verification.
- `active` Customers may use approved profile operations.
- `suspended` Customers cannot perform operations prohibited by the suspension policy; recovery is an approved transition back to `active`.
- `anonymized` is terminal unless a future Product Decision explicitly defines re-identification.
- `closed` is retained as a lifecycle state and does not authorize deletion of immutable business history.
- Anonymization is idempotent, preserves referential integrity and immutable history, and removes or irreversibly replaces personal identifiers.

## Identity-Link Contract

Authentication supplies a verified identity result. The Customer module resolves that result using the canonical normalized identity key:

```text
verified authentication result
        ↓
Customer.ResolveCustomerByVerifiedIdentity
        ↓
existing Customer or one atomic Customer registration
```

The identity-link contract requires:

- one active global Customer for one verified normalized phone identity;
- no Customer creation from an unverified client field;
- duplicate prevention through an atomic, idempotent create-or-resolve operation;
- no automatic Customer merge based on email or other profile values;
- anonymized identity links cannot authenticate a new session;
- the Customer module never owns OTP verification or credential storage.

Physical uniqueness constraints, migration names, and transaction implementation belong to later database tasks and must implement this contract without changing it.

## Commands and Queries

Customer-owned commands are:

- `RegisterCustomer`;
- `UpdateCustomerProfile`;
- `UpdateCustomerPreferredLanguage`;
- `UpdateCustomerEmail`;
- `SuspendCustomer`;
- `ReactivateCustomer`;
- `AnonymizeCustomer`.

Customer-owned queries are:

- `GetCurrentCustomer`;
- `GetCustomerByIdForAuthorizedContext`;
- `ResolveCustomerByVerifiedIdentity`;
- `GetCustomerPrivacyState`;
- `GetCustomerProfileSummary`.

Every query applies purpose-specific output filtering. A Business or Employee context never receives unrestricted global Customer data merely because the Customer is globally identifiable.

## Events

The Customer module may publish:

- `CustomerRegistered`;
- `CustomerProfileUpdated`;
- `CustomerAnonymized`.

`CustomerAuthenticated` belongs to Authentication. Events are facts emitted only after the owning command succeeds, carry the approved tenant/correlation context where applicable, and contain no unnecessary personal data.

## Privacy and Access Boundary

The global Customer boundary is not global access. Access is purpose-scoped:

- the Customer may access their own approved profile;
- Authentication may resolve the verified Customer;
- Membership may reference the Customer;
- Business users receive only approved Membership-scoped views for their Business;
- Employees receive only minimum operational data;
- Support access is scoped, temporary, and audited;
- Platform Admin has no unrestricted personal-data access by default;
- service-role operations still validate actor, purpose, ownership, and domain rules.

No direct unrestricted Business read of the global Customer aggregate is permitted. RLS and application authorization must enforce this boundary when persistence is implemented.

## Concurrency and Idempotency Contract

The implementation must preserve these race outcomes:

- parallel verified registrations produce one Customer and one registration outcome;
- concurrent profile updates use the aggregate version and report a version conflict rather than silently overwriting;
- anonymization wins against later personal-data writes;
- repeated anonymization produces stable already-completed behavior;
- authentication resolution cannot recreate or re-identify an anonymized Customer.

The concrete database locks, constraints, and idempotency storage are intentionally deferred to the approved database and Customer implementation tasks.

## Deferred Implementation Boundaries

This task does not create:

- `customers` or identity-link migrations;
- database constraints or RLS policies;
- OTP, session, or credential code;
- HTTP controllers or API handlers;
- Customer event transport;
- profile persistence;
- anonymization execution;
- production configuration.

Those capabilities must consume this logical contract through separately scoped tasks and retain the ownership and privacy rules defined here.
