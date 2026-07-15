42 - Data Model v1

Purpose

This document defines the logical data model of the Loyalty Platform.

It describes ownership, relationships, aggregate boundaries and lifecycle responsibilities.

This document is implementation independent.

It is the source for future ER diagrams, SQL schemas and ORM models.

⸻

Design Principles

The data model follows Domain-Driven Design (DDD).

Every Aggregate has:

* one Aggregate Root
* one ownership boundary
* one consistency boundary

Data ownership must never be ambiguous.

⸻

Aggregate Overview

Platform
│
├── Business
├── Customer
├── Loyalty Network
└── Platform Configuration

⸻

Business Aggregate

Aggregate Root

Business

⸻

Owns

* Brands
* Business Users
* Subscription
* Billing
* API Keys
* Business Settings

⸻

Does NOT Own

* Customers
* Memberships
* Reward Transactions

⸻

Brand Aggregate

Aggregate Root

Brand

⸻

Parent

Business

⸻

Owns

* Locations
* Loyalty Program
* Brand Configuration
* Employees
* Campaigns
* Instant Reward Campaigns

⸻

Relationship

One Business

↓

Many Brands

⸻

One Brand

↓

Exactly one Loyalty Program

⸻

Loyalty Program Aggregate

Aggregate Root

Loyalty Program

⸻

Parent

Brand

⸻

Owns

* Reward Rules
* XP Rules
* Status Levels
* Strategy
* Reward Experience
* Automation Rules
* Benefit Definitions
* Challenge Definitions
* Reward Goals
* Instant Reward Pools

⸻

Does NOT Own

Memberships

Memberships belong to Customers while referencing one Loyalty Program.

⸻

Customer Aggregate

Aggregate Root

Customer

⸻

Owns

* Profile
* Authentication
* Notification Preferences
* Memberships

⸻

Relationship

One Customer

↓

Many Memberships

⸻

Membership Aggregate

Aggregate Root

Membership

⸻

Parent

Customer

⸻

References

* Loyalty Program
* Brand
* Current Status

⸻

Owns

* Reward Account
* XP Account
* Visits
* Benefit Grants
* Reward Opportunities
* Reward Goal Progress
* Membership Year
* Status History

⸻

Reward Aggregate

Aggregate Root

Reward Account

⸻

Parent

Membership

⸻

Owns

* Reward Transactions
* Reward Reservations
* Reward Allocations

⸻

Projection

Reward Balance

Pending Balance

Available Balance

Reserved Balance

Expired Balance

⸻

Reward Transactions remain immutable.

Reward Balance is never stored as the primary source of truth.

It is always a projection derived from immutable Reward Transactions.

⸻

XP Aggregate

Aggregate Root

XP Account

⸻

Parent

Membership

⸻

Owns

* XP Transactions

⸻

Projection

Current XP

Lifetime XP

Membership Year XP

⸻

Benefit Aggregate

Aggregate Root

Benefit Grant

⸻

Parent

Membership

⸻

References

Benefit Definition

⸻

Owns

Benefit Lifecycle

⸻

Benefit Definition belongs to Loyalty Program.

Benefit Grant belongs to Membership.

⸻

Challenge Aggregate

Aggregate Root

Challenge Progress

⸻

Parent

Membership

⸻

References

Challenge Definition

⸻

Challenge Definition belongs to Loyalty Program.

Challenge Progress belongs to Membership.

⸻

Reward Goal Aggregate

Aggregate Root

Reward Goal Progress

⸻

Parent

Membership

⸻

References

Reward Goal Definition

⸻

Reward Goal Definitions belong to Loyalty Program.

⸻

Instant Reward Aggregate

Aggregate Root

Reward Opportunity

⸻

Parent

Membership

⸻

References

Reward Pool

Reward Definition

⸻

Owns

Reward Reveal

⸻

Reward Pools belong to Loyalty Program.

Reward Opportunities belong to Membership.

⸻

Visit Aggregate

Aggregate Root

Visit

⸻

Parent

Membership

⸻

References

Receipt

Location

⸻

Visit is created from business rules.

Receipt does not equal Visit.

⸻

Receipt Aggregate

Aggregate Root

Receipt

⸻

Parent

Business Activity

⸻

References

Membership

Employee

Location

⸻

Receipt is immutable.

Receipt is the source of truth for purchase processing.

⸻

Membership Year Aggregate

Aggregate Root

Membership Year

⸻

Parent

Membership

⸻

Owns

* yearly XP totals
* yearly Visit totals
* yearly Status result

Membership Years are immutable after completion.

⸻

Automation Aggregate

Aggregate Root

Automation Rule

⸻

Parent

Loyalty Program

⸻

Owns

* Trigger
* Conditions
* Actions
* Priority
* Activation Rules

Execution history belongs to Automation Logs.

⸻

Notification Aggregate

Aggregate Root

Notification Job

⸻

Parent

Notification Queue

⸻

References

Customer

Membership

Business Event

⸻

Delivery history is immutable.

⸻

Loyalty Network Aggregate

Aggregate Root

Loyalty Network

⸻

Owns

* Participants
* Settlement Rules
* Shared Redemption Rules

⸻

References:

Loyalty Programs

⸻

Relationships

Business

↓

1:N

Brands

⸻

Brand

↓

1:1

Loyalty Program

⸻

Customer

↓

1:N

Memberships

⸻

Membership

↓

1:1

Reward Account

⸻

Membership

↓

1:1

XP Account

⸻

Membership

↓

1:N

Visits

⸻

Membership

↓

1:N

Benefit Grants

⸻

Membership

↓

1:N

Reward Opportunities

⸻

Membership

↓

1:N

Membership Years

⸻

Reward Account

↓

1:N

Reward Transactions

⸻

XP Account

↓

1:N

XP Transactions

⸻

Receipt

↓

0..N

Business Events

⸻

Receipt

↓

0..1

Visit

⸻

Reward Opportunity

↓

0..1

Reward Reveal

⸻

Data Ownership Rules

A child entity cannot exist without its Aggregate Root.

Aggregate Roots control consistency.

Cross-Aggregate updates occur only through Business Events.

⸻

Immutability Rules

Immutable:

* Reward Transactions
* XP Transactions
* Receipts
* Receipt Cancellations
* Business Events
* Status History
* Membership Years
* Notification History
* Audit Records

Mutable:

* Customer Profile
* Brand Configuration
* Business Settings
* Strategy Configuration
* Automation Rules

⸻

Design Philosophy

The data model separates configuration, execution and history.

Configuration defines business behavior.

Execution creates immutable facts.

Projections provide fast read models.

Every business decision must be explainable from immutable history.

Status

Implementation Ready

This document is the authoritative logical data model for Blueprint v1.0.