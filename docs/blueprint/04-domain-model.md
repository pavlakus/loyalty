04 - Domain Model

Purpose

This document defines the business entities of the platform and the relationships between them.

The Domain Model represents the language of the business.

It is independent of database technology and implementation details.

Database tables, APIs and UI components should be derived from this model.

⸻

Platform

Represents the SaaS platform.

Responsibilities:

* Platform administration
* Billing
* Global configuration
* Support
* System monitoring

Platform owns Businesses.

⸻

Business

Represents one legal entity using the platform.

Examples:

* Coffee Shop
* Restaurant
* Retail Store
* Beauty Salon

Business owns:

* Locations
* Loyalty Programs
* Employees
* Automations
* Dashboards

The ownership model in this document has been superseded by Brand-centric ownership defined in 33-domain-model-v2.md.
⸻

Location

Represents a physical location.

Examples:

* Belgrade Center
* Novi Sad
* Airport Branch

Location belongs to one Business.

Location participates in one or more Loyalty Networks.

⸻

Customer

Represents one person using the platform.

Customer owns:

* Memberships
* Devices
* Notification Preferences

Customer never belongs directly to a Business.

⸻

Membership

Membership connects:

Customer

↓

Loyalty Program

Membership stores:

* Reward Point Balance
* Pending Balance
* XP
* Status
* Join Date
* Current Benefits

Customer has one Membership per Loyalty Program.

⸻

Loyalty Program

Defines the business rules for rewarding customers.

Contains:

* Point Rules
* XP Rules
* Status Levels
* Benefits
* Automations
* Expiration Rules

Loyalty Program belongs to one Business.

⸻

Loyalty Network

Defines where Reward Points may be redeemed.

Network may connect:

* Locations
* Businesses
* Loyalty Programs

Network never owns Reward Points.

⸻

Employee

Represents a business user.

Employee belongs to one Business.

Employee may work at multiple Locations.

Employee has one or more Roles.

⸻

Role

Defines permissions.

Default roles:

* Owner
* Manager
* Employee

Future:

Custom Roles.

⸻

Reward Transaction

Represents movement of Reward Points.

Examples:

Earn

Redeem

Bonus

Expire

Reverse

Adjustment

Reward Transactions are immutable.

⸻

XP Transaction

Represents movement of XP.

XP Transactions are immutable.

⸻

Automation

Represents one business rule.

Automation contains:

* Trigger Event
* Conditions
* Actions
* Priority
* Active Period

Automation never performs calculations itself.

Automation delegates execution to Business Engines.

⸻

Event

Represents something that happened inside the platform.

Examples:

Customer Registered

Receipt Created

Points Earned

Status Changed

Event is immutable.

Every Event belongs to one execution flow.

⸻

Execution

Represents one Automation execution.

Execution stores:

* Root Event
* Generated Events
* Executed Rules
* Current State
* Completion Status

Execution exists only while processing events.

⸻

Notification

Represents one notification request.

Notification contains:

* Recipient
* Channel
* Template
* Payload
* Status

Notification delivery is asynchronous.

⸻

Benefit

Represents one customer privilege.

Examples:

* Bonus Point Multiplier
* Longer Point Expiration
* Birthday Gift
* VIP Reward
* Exclusive Promotion

Benefit Definitions are independent business entities.

Membership Status is one possible source of Benefit Grants.

⸻

Status Level

Represents customer tier.

Examples:

Bronze

Silver

Gold

Platinum

Business may define custom names.

Status Levels define:

* XP Requirement
* Visit Requirement
* Benefits

⸻

Challenge

Represents a gamification objective.

Examples:

Visit 5 Times

Spend 500 EUR

Weekend Visitor

Birthday Visit

Challenge completion produces Events.

⸻

Dashboard

Represents aggregated business statistics.

Dashboard data is always derived from Events and Transactions.

Dashboard never stores business truth.

⸻

Settlement (Future)

Represents financial reconciliation between partner Businesses.

Settlement is calculated from Reward Transactions.

Settlement never changes Reward Point ownership.

⸻

Relationships

Platform

↓

Business

↓

Location

↓

Employee

Business

↓

Loyalty Program

↓

Membership

↓

Customer

Loyalty Program

↓

Automation

↓

Event

↓

Execution

↓

Business Engines

↓

Reward Transactions

↓

XP Transactions

↓

Notifications

↓

Analytics

⸻

Domain Principles

* Every entity has a single responsibility.
* Business entities never depend on UI.
* Business entities never depend on database technology.
* Business entities communicate through Events.
* Business truth is represented by immutable transactions and immutable events.
* Configuration is preferred over custom implementation.
