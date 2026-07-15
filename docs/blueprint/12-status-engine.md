12 - Status Engine

Purpose

The Status Engine is responsible for evaluating customer progression and determining Membership Status.

It consumes customer engagement data (XP, Visits and configured rules) and decides whether the customer qualifies for a new Membership Status.

The Status Engine is the only component allowed to change Membership Status.

⸻

Responsibilities

The Status Engine is responsible for:

* Evaluate Membership Status
* Upgrade Membership
* Downgrade Membership
* Keep Current Status
* Unlock Benefits
* Publish Status Events

The Status Engine never:

* awards Reward Points
* awards XP
* sends Notifications
* executes Automations

⸻

Core Principles

Membership Status is earned.

Membership Status is never purchased.

Reward Point balance never affects Membership Status.

Spending Reward Points never lowers Membership Status.

⸻

Membership Status

Each Loyalty Program defines its own Status Levels.

Default example:

Bronze

Silver

Gold

Platinum

Businesses may rename Status Levels.

⸻

Qualification Rules

A customer qualifies for a Status only if all configured conditions are satisfied.

Example:

Gold

Minimum XP

3000

AND

Minimum Visits

20

Additional conditions may be introduced in future versions.

⸻

Status Evaluation

The Status Engine evaluates progression after:

XP Earned

Visit Qualified

Membership Renewal

Manual Adjustment

Business Configuration Change

Status evaluation is event-driven.

⸻

Membership Year

Every Membership has its own Membership Year.

Example:

Customer joins:

15 March 2026

Membership Year:

15 March 2026

↓

14 March 2027

Status evaluation is based on Membership Year.

Calendar years are never used.

⸻

Membership Renewal

At the end of each Membership Year:

The Status Engine evaluates:

Current XP

Current Visits

Configured Rules

Then determines:

Upgrade

Downgrade

Maintain Status

A new Membership Year begins immediately after evaluation.

⸻

Immediate Upgrade

Customers receive upgraded Status immediately after satisfying all required conditions.

Benefits become available immediately.

No manual approval is required.

⸻

Downgrade

Downgrade occurs only during Membership Renewal.

Reward Point redemption never causes downgrade.

Businesses may configure:

Maximum downgrade per year.

Example:

Platinum

↓

Gold

but never directly to Bronze.

⸻

Status Benefits

Status Levels define which Benefit Definitions are granted when the Status becomes active.

Benefit lifecycle and management belong to the Benefit domain.

The Status Engine only grants and revokes Benefits according to Status changes.

Examples:

Reward Point Multiplier

Extended Point Expiration

Exclusive Promotions

Exclusive Challenges

Priority Rewards

Higher Redemption Limits

Benefits are activated automatically.

⸻

Progress Calculation

The Status Engine calculates:

Current Status

Next Status

Remaining XP

Remaining Visits

Progress Percentage

Estimated Completion

This information is used by the Customer App.

⸻

Customer Experience

Customers should always understand:

Current Status

Current Benefits

Next Status

Progress

Remaining Requirements

Example:

Gold Member

82% Complete

420 XP Remaining

3 Visits Remaining

Expected in approximately 2 weeks

⸻

Status History

Every Status change is immutable.

Status History stores:

Previous Status

New Status

Reason

Effective Date

Membership Year

Status History is never modified.

⸻

Status Events

The Status Engine publishes:

Status Upgraded

Status Downgraded

Status Maintained

Benefits Activated

Membership Renewed

These Events may trigger Automations.

Benefit lifecycle Events are published by the Benefit Engine.

The Status Engine publishes only Status-related Events.

⸻

Manual Changes

Managers may manually change Membership Status.

Every manual change requires:

Reason

Operator

Audit Record

Manual changes are stored in Status History.

⸻

Performance

Frequently used projections:

Current Status

Current Benefits

Progress

Remaining XP

Remaining Visits

Membership Year End

Projections improve performance only.

⸻

Security

Only the Status Engine may modify Membership Status.

External components must never update Membership Status directly.

All changes are fully audited.

⸻

Future Extensions

The Status Engine should support future features such as:

* Seasonal Status
* Invitation-only Status
* Temporary VIP Status
* Corporate Membership
* Premium Membership
* Subscription-based Membership

These features should not require architectural redesign.

⸻

Design Principles

Membership Status rewards long-term engagement.

Reward Points reward spending.

XP measures customer loyalty.

These three concepts must remain independent.