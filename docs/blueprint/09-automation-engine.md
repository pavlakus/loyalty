09 - Automation Engine

Purpose

The Automation Engine coordinates all business workflows.

It is responsible for finding applicable business rules, executing them in a deterministic order, publishing new business events and terminating execution safely.

The Automation Engine never performs business calculations.

Business calculations are delegated to Business Engines.

⸻

Responsibilities

The Automation Engine is responsible for:

* Receiving Events
* Creating Execution Context
* Finding matching Rules
* Sorting Rules by Priority
* Executing Actions
* Publishing generated Events
* Tracking execution progress
* Preventing infinite execution
* Completing execution

⸻

Core Concepts

Event

Something that happened.

Examples:

* Customer Registered
* Receipt Created
* Receipt Cancelled
* Reward Points Earned
* Reward Points Redeemed
* XP Earned
* Status Changed
* Challenge Completed

Events are immutable.

⸻

Rule

Defines business behaviour.

Every Rule contains:

* Trigger Event
* Conditions
* Actions
* Priority
* Active Period

⸻

Execution

Represents one complete business workflow.

One execution begins with one Root Event.

Execution ends when no additional Events remain.

⸻

Execution Lifecycle

Receive Event
↓
Create Execution
↓
Find Matching Rules
↓
Sort by Priority
↓
Execute Rule Actions
↓
Generate New Events
↓
Repeat
↓
No More Events
↓
Execution Completed

⸻

Rule Matching

Only Rules matching the current Event are evaluated.

Rules must also satisfy:

* Active
* Date Range
* Conditions

Non-matching Rules are ignored.

⸻

Rule Priority

Rules are executed according to Priority.

Lower number = Higher Priority.

Example:

Priority 10

↓

Priority 20

↓

Priority 30

Execution order must always be deterministic.

⸻

Rule Conditions

Examples:

Receipt Amount > 1000

Customer Status = Gold

Location = Downtown

Current Day = Monday

Current Time = 08:00–10:00

Membership Age > 30 Days

Visit Count >= 5

Reward Points >= 1000

Conditions are evaluated before execution.

⸻

Rule Actions

Actions never contain business logic.

Actions delegate work.

Examples:

Add Reward Points

Add XP

Reserve Reward Points

Release Pending Points

Unlock Benefit

Queue Notification

Create Challenge

Publish Event

⸻

Event Publishing

Every Action may produce zero or more Events.

Examples:

Receipt Created

↓

Reward Points Earned

↓

XP Earned

↓

Status Changed

↓

Notification Queued

Every generated Event is added to the current Execution.

⸻

Execution Context

Execution contains:

* Execution ID
* Root Event
* Current Event Queue
* Processed Events
* Executed Rules
* Current Depth
* Execution Status

Execution Context exists only during processing.

⸻

Duplicate Protection

The same Rule may never execute twice for the same Event.

The same Event may never be processed twice within the same Execution.

⸻

Loop Protection

The Automation Engine prevents infinite execution.

Protection includes:

* Maximum execution depth
* Maximum processed events
* Maximum executed actions
* Duplicate Rule detection
* Duplicate Event detection

If protection limits are exceeded:

Execution stops.

Execution is marked as Failed.

⸻

Error Handling

Rule execution failures are isolated.

One failing Rule must not corrupt the entire Execution.

Rules define failure behaviour.

Possible behaviours:

* Retry
* Skip
* Stop Execution

⸻

Retry Policy

Retry is intended only for infrastructure failures.

Examples:

SMS Provider unavailable

Viber timeout

Temporary API failure

Business validation failures are never retried.

⸻

Asynchronous Actions

Long-running Actions are queued.

Examples:

Send SMS

Send Viber

Push Notification

Settlement Processing

Analytics Update

The business workflow continues immediately.

⸻

Idempotency

The Automation Engine must produce identical results for repeated identical Events.

Duplicate API requests must never create duplicate Reward Transactions.

⸻

Business Engines

The Automation Engine coordinates the following Engines:

Reward Engine

XP Engine

Progress Engine

Notification Engine

Settlement Engine (future)

Analytics Engine

Business Engines never communicate directly.

⸻

Event Flow Example

Receipt Created
↓
Automation Engine
↓
Reward Rule
↓
Reward Engine
↓
Reward Points Earned
↓
Automation Engine
↓
XP Rule
↓
XP Engine
↓
XP Earned
↓
Automation Engine
↓
Status Rule
↓
Progress Engine
↓
Status Changed
↓
Automation Engine
↓
Notification Rule
↓
Notification Engine
↓
Notification Queued
↓
Execution Completed

⸻

Template Based Automation

Business users do not create Rules manually in the MVP.

They configure predefined templates.

Supported templates:

* Welcome Bonus
* Birthday Bonus
* Double Points
* Happy Hour
* Spend Bonus
* Visit Challenge

Each template creates one or more internal Rules.

⸻

Future Rule Builder

Future versions will introduce a Visual Rule Builder.

The Rule Builder will generate Automation Rules compatible with the existing Automation Engine.

No architectural changes should be required.

⸻

Monitoring

Every Execution stores:

* Duration
* Executed Rules
* Generated Events
* Failed Actions
* Retry Count

This data supports debugging and analytics.

⸻

Design Principles

The Automation Engine:

* Coordinates workflows.
* Never performs business calculations.
* Never contains Reward logic.
* Never contains XP logic.
* Never contains Notification logic.
* Terminates deterministically.
* Produces fully auditable execution history.

The Automation Engine is responsible for orchestration only.

Business decisions always remain inside the owning Business Engine.