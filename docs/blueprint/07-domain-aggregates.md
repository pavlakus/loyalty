07 - Domain Aggregates

Purpose

This document defines the Aggregate Roots of the platform.

Aggregates are the core business boundaries.

Every Aggregate owns its own consistency.

Aggregates communicate only through Events.

⸻

Aggregate Overview

Platform

Business

Customer

Membership

Reward Account

XP Account

Automation

Notification

Settlement (Future)

Analytics (Projection)

⸻

Business Aggregate

Represents one SaaS customer.

Owns:

* Locations
* Employees
* Loyalty Programs
* Settings

Business is the Tenant boundary.

Nothing exists outside a Business.

⸻

Customer Aggregate

Represents one physical person.

Owns:

* Profile
* Authentication
* Devices
* Notification Preferences

Customer never stores balances.

⸻

Membership Aggregate

Represents participation in one Loyalty Program.

Owns:

* Join Date
* Status
* Current Benefits
* Membership Settings

Membership references:

Customer

Loyalty Program

Membership never owns Reward Points.

Membership never owns XP.

⸻

Reward Account Aggregate

Purpose:

Represents customer’s Reward Point account.

Every Membership owns exactly one Reward Account.

Reward Account owns:

Reward Ledger

Pending Points

Reservations

Expiration

Current Balance (Projection)

Reward Account is the only Aggregate allowed to modify Reward Point balances.

⸻

Reward Ledger

Stores immutable Reward Transactions.

Examples:

Earn

Redeem

Bonus

Expire

Reverse

Adjustment

The ledger is append-only.

Transactions are never updated.

⸻

XP Account Aggregate

Purpose:

Represents customer progression.

Every Membership owns one XP Account.

XP Account owns:

XP Ledger

Current XP

Progress

XP Account never stores Membership Status.

⸻

XP Ledger

Stores immutable XP Transactions.

Examples:

Purchase

Visit

Challenge

Bonus

Manual

The ledger is append-only.

⸻

Progress Aggregate

Purpose:

Calculates progression.

Input:

XP Account

Visits

Rules

Output:

Membership Status

Benefits

Progress

Progress Aggregate produces:

Status Changed Events

⸻

Automation Aggregate

Stores:

Automation Rules

Templates

Conditions

Actions

Priorities

Schedules

Automation never performs calculations.

⸻

Notification Aggregate

Stores:

Notification Queue

Templates

Recipients

Delivery Attempts

Status

Notification delivery is asynchronous.

⸻

Settlement Aggregate

Future.

Stores:

Partner Settlement

Business Balances

Invoices

Settlement Reports

Never modifies Reward Accounts.

⸻

Analytics Aggregate

Projection only.

Stores:

Dashboards

Reports

KPIs

Statistics

Analytics may always be rebuilt.

⸻

Aggregate Ownership

Business

↓

Loyalty Program

↓

Membership

↓

Reward Account

↓

Reward Ledger

Business

↓

Loyalty Program

↓

Membership

↓

XP Account

↓

XP Ledger

Automation

↓

Events

↓

Business Engines

↓

Reward Account

↓

XP Account

↓

Progress

↓

Notifications

⸻

Aggregate Rules

Every Aggregate:

* has one responsibility
* owns its own consistency
* publishes Events
* never updates another Aggregate directly

⸻

Future Extensions

This Aggregate model supports:

* Wallets
* Gift Cards
* Coupons
* Cashback
* Multiple Reward Currencies
* Digital Assets

without redesigning the architecture.

## Final Aggregate Ownership

This document describes the original Aggregate decomposition.

The authoritative Aggregate ownership model for Blueprint v1.0 is defined in:

- 33-domain-model-v2.md

Implementation should follow the ownership defined there.