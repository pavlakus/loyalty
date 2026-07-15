05 - System Architecture

Purpose

This document defines the high-level architecture of the platform.

The platform is designed around independent business engines coordinated by a single Automation Engine.

The architecture prioritizes simplicity, maintainability and scalability.

The initial target is approximately 500–1000 business customers, while keeping a clear upgrade path for future enterprise scaling.

⸻

Architectural Principles

The platform follows these principles:

* Event Driven
* Engine Based
* API First
* Mobile First
* Multi-Tenant by Design
* Configuration over Custom Development
* Immutable Business Data
* Single Responsibility

⸻

High Level Architecture

Customer Mobile App
Employee Mobile App
Business Portal
        │
        ▼
    REST API
        │
        ▼
Automation Engine
        │
 ├──────────────┬──────────────┬──────────────┬──────────────┐
 ▼              ▼              ▼              ▼              ▼
Reward      XP Engine     Status Engine   Benefit Engine   Notification
 Engine                                        Engine          Engine

⸻

REST API

Responsibilities:

* Authentication
* Authorization
* Request Validation
* Idempotency
* Event Creation

The API never contains business logic.

⸻

Automation Engine

The Automation Engine coordinates the entire business workflow.

Responsibilities:

* receive Events
* create Execution Context
* find matching Rules
* sort Rules by Priority
* execute Actions
* publish newly generated Events
* prevent execution loops
* prevent duplicate Rule execution
* complete workflow execution

The Automation Engine coordinates execution.

It never performs business calculations.

⸻

Internal Automation Components

The Automation Engine is implemented as one module consisting of several internal components.

Rule Matcher

* Finds Rules matching an Event.

Execution Runner

* Coordinates execution.

Loop Protection

* Prevents infinite execution.

Action Dispatcher

* Executes business actions.

Future versions may separate these components into independent services without changing the platform architecture.

⸻

Reward Engine

Responsible only for Reward Points.

Responsibilities:

* Earn Points
* Pending Points
* Release Pending Points
* Reserve Points
* Redeem Points
* Expire Points
* Reverse Transactions

Produces:

* Reward Transactions
* Reward Events

⸻

XP Engine

Responsible only for XP.

Responsibilities:

* Earn XP
* Bonus XP
* XP Transactions

Produces:

* XP Events
* XP Transactions

⸻

Progress Engine

Responsible only for customer progression.

Responsibilities:

* Calculate Membership Status
* Calculate Progress
* Unlock Benefits
* Generate Status Change Events

The Progress Engine never modifies Reward Points.

⸻

Notification Engine

Responsible only for communication.

Supported Channels:

* SMS
* Viber
* Push Notifications

Notifications are generated from Events.

Business Engines never send notifications directly.

⸻

Analytics

Analytics consumes Events and Transactions.

Produces:

* Dashboards
* Reports
* KPIs
* Business Statistics

Analytics never modifies business data.

⸻

Business Engine Communication

Business Engines never communicate directly.

Example:

Receipt Created

↓

Reward Engine

↓

Points Earned Event

↓

Progress Engine

↓

Status Changed Event

↓

Notification Engine

↓

Notification Queued

Each Engine knows only its own responsibility.

⸻

Execution Context

Every execution contains:

* Execution ID
* Root Event
* Current Events
* Executed Rules
* Current Depth
* Execution Status

Execution finishes automatically when no Events remain.

⸻

Event Processing

Every business action starts with an Event.

Examples:

* Customer Registered
* Receipt Created
* Receipt Cancelled
* Points Earned
* XP Earned
* Status Changed
* Challenge Completed

Events are immutable.

⸻

Rule Processing

Rules are executed according to Priority.

For every Event:

1. Find matching Rules.
2. Sort by Priority.
3. Execute Actions.
4. Publish generated Events.
5. Repeat until no Events remain.

The same Rule may never execute twice for the same Event.

⸻

Persistence

Business truth is stored as immutable transactions and immutable events.

Current balances, customer status and dashboards are calculated projections.

Every projection must be rebuildable from stored business history.

⸻

Technology

Initial implementation:

* React Native (Customer App)
* React Native (Employee App)
* React (Business Portal)
* Supabase
* PostgreSQL
* REST API

The business architecture must remain independent from implementation technology.

⸻

Scalability Strategy

Version 1

Single Automation Engine.

Internal modular design.

Version 2

Automation components may become independent services.

Version 3

Distributed Event Bus and independently scalable Business Engines.

This evolution must not require changes to Business Rules or Domain Model.

⸻

Architectural Rule

Business logic exists only inside Business Engines.

Business logic must never be implemented inside:

* Mobile Applications
* Business Portal
* REST API
* Database Triggers
* Notification Providers

User interfaces request actions.

Business Engines make decisions.

Business Engines may expose Commands and publish Events, but they never invoke another Business Engine directly.
Cross-domain collaboration is performed exclusively through Events coordinated by the Automation Engine.