06 - Database Design

Purpose

This document defines the database architecture of the platform.

The database model follows the business domain.

Tables are derived from business aggregates.

Business Rules always have priority over database optimization.

⸻

Design Principles

The database follows these principles:

* Domain Driven Design
* Aggregate Roots
* Immutable Transactions
* Event Driven
* Multi-Tenant
* Audit Friendly
* API Friendly

⸻

Aggregate Overview

The platform consists of the following Aggregates.

Business

Customer

Membership

Loyalty Program

Automation

Reward Ledger

XP Ledger

Notification

Analytics

Settlement (Future)

Each Aggregate owns its internal data.

Aggregates communicate through Events.

Brand

⸻

Aggregate: Business

Purpose:

Represents one customer of the SaaS platform.

Owns:

* Company
* Locations
* Employees
* Loyalty Programs
* Settings

Business is the Tenant boundary.

⸻

Aggregate: Customer

Purpose:

Represents one physical person.

Owns:

* Profile
* Phone Number
* Devices
* Notification Preferences

Customer never stores balances.

Balances belong to Membership.

⸻

Aggregate: Membership

Purpose:

Represents participation in one Loyalty Program.

Owns:

* Reward Balance (projection)
* Pending Balance (projection)
* XP (projection)
* Membership Status
* Join Date

Membership references:

Customer

Loyalty Program

Membership is the heart of the platform.

⸻

Aggregate: Loyalty Program

Purpose:

Defines loyalty behaviour.

Owns:

* Reward Rules
* XP Rules
* Status Rules
* Benefits
* Point Expiration
* Pending Period

Never stores customer data.

⸻

Aggregate: Automation

Purpose:

Stores business Rules.

Owns:

Automation Rules

Templates

Priorities

Execution Configuration

Automation never stores transactions.

⸻

Aggregate: Reward Ledger

Purpose:

Stores Reward Point history.

Contains only immutable transactions.

Examples:

Earn

Redeem

Bonus

Expire

Reverse

Current balance is calculated from this ledger.

⸻

Aggregate: XP Ledger

Purpose:

Stores XP history.

Contains immutable XP transactions.

Current XP is calculated from this ledger.

⸻

Aggregate: Notification

Purpose:

Stores notification requests.

Contains:

Recipient

Channel

Template

Status

Delivery Attempts

⸻

Aggregate: Analytics

Purpose:

Stores reporting projections.

Analytics data is disposable.

Analytics may always be rebuilt.

⸻

Aggregate: Settlement

Future module.

Stores financial settlement between partner Businesses.

Never modifies Reward Transactions.

⸻

Aggregate Communication

Business

↓

creates

↓

Loyalty Program

↓

Customer joins

↓

Membership

↓

Receipt Created Event

↓

Reward Ledger

↓

Reward Event

↓

XP Ledger

↓

Progress Engine

↓

Notification

Every Aggregate communicates only through Events.

⸻

Multi-Tenant Strategy

Every Aggregate contains:

Business ID

or

belongs to an Aggregate that owns Business ID.

Cross-Tenant access is never allowed.

⸻

Immutable Data

The following data is immutable:

Reward Transactions

XP Transactions

Business Events

Audit Records

Notifications (after delivery)

Immutable records are never updated.

⸻

Mutable Data

Examples:

Customer Name

Phone Number

Membership Status (projection)

Reward Balance (projection)

XP Balance (projection)

Settings

Mutable data is always reproducible from immutable history.

⸻

Projections

The platform stores projections for performance.

Examples:

Current Reward Balance

Current XP

Current Status

Dashboard Statistics

Projections are caches.

Business truth always comes from immutable history.

⸻

Soft Delete

The platform uses Soft Delete.

Deleted records remain available for:

Audit

Reporting

History

Settlement

⸻

Audit

Every Aggregate stores:

Created By

Created At

Updated By

Updated At

Deleted At

Version

Audit is mandatory.

⸻

Versioning

Aggregates support optimistic locking.

Concurrent business operations must never corrupt business state.

⸻

Future Scalability

The Aggregate structure must support:

* PostgreSQL
* Read Replicas
* CQRS
* Event Sourcing
* Microservices

without changing Business Rules.

## Status

This document is superseded for implementation purposes.

The implementation-ready logical data model is defined in:

- 42-data-model-v1.md

This document remains part of the architectural evolution and historical design rationale.