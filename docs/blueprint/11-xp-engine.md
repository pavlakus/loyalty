11 - XP Engine

Purpose

The XP Engine is responsible for measuring customer engagement and long-term loyalty.

Unlike Reward Points, XP has no monetary value.

XP exists only to determine customer progression, unlock Membership Status levels and motivate customer engagement.

⸻

Responsibilities

The XP Engine is responsible for:

* Award XP
* Reverse XP (when required)
* Calculate qualifying visits
* Create XP Transactions
* Publish XP Events

The XP Engine never:

* calculates Reward Points
* calculates Membership Status
* sends Notifications
* executes Automations

⸻

Business Principles

XP is not a currency.

XP:

* cannot be redeemed
* cannot be transferred
* cannot be exchanged
* has no monetary value

XP exists only as a measurement of loyalty.

⸻

XP Sources

XP may be earned from:

Purchase

Visit

Challenge

Promotion

Welcome Bonus

Birthday Bonus

Manual Bonus

Future automation

Businesses configure which sources are enabled.

⸻

Purchase XP

Businesses define how XP is awarded.

Examples:

One Purchase

↓

20 XP

or

Receipt Amount > 1000

↓

50 XP

Reward Points and XP are completely independent.

⸻

Visit XP

A Visit is a separate business concept.

A Visit may award XP independently of the receipt amount.

Examples:

One Visit

↓

10 XP

Businesses define:

* minimum time between visits
* minimum receipt amount
* qualifying conditions

⸻

Challenge XP

Challenges may award XP.

Examples:

5 Visits

↓

300 XP

10 Purchases

↓

500 XP

Weekend Challenge

↓

150 XP

Challenge completion creates XP Transactions.

⸻

Welcome XP

Customer registration may award XP.

Configured per Loyalty Program.

⸻

Birthday XP

Birthday bonuses may award XP.

Configured per Loyalty Program.

⸻

Promotional XP

Automations may create promotional XP.

Examples:

Double XP Week

Gold Weekend

VIP Campaign

⸻

Manual XP

Managers may award XP manually.

Every manual adjustment requires:

Reason

Operator

Audit Record

Manual adjustments create immutable transactions.

⸻

XP Transactions

Supported transaction types:

Purchase

Visit

Challenge

Promotion

Welcome Bonus

Birthday Bonus

Manual Adjustment

Reverse

Every transaction is immutable.

Transactions are append-only.

⸻

XP Ledger

XP Ledger stores complete XP history.

Current XP is calculated from XP Transactions.

Current XP is a projection.

Corrections are performed exclusively through compensating XP Transactions.

Existing XP Transactions are never modified or deleted.

⸻

Membership Period

Every Membership has its own Membership Year.

Example:

Joined

15 March 2026

Membership Year

15 March 2026

↓

14 March 2027

Membership evaluation uses Membership Year.

The platform never uses calendar years for Membership progression.

⸻

Membership Renewal

At the end of each Membership Year:

The platform evaluates:

* earned XP
* qualifying visits
* progression rules

Then:

* renews Membership
* upgrades Membership
* downgrades Membership
* keeps current Membership

according to configured business rules.

⸻

Qualifying Visits

Businesses define what counts as a Visit.

Possible rules:

Minimum receipt amount

Minimum time between visits

Allowed locations

Allowed transaction types

Only qualifying visits count toward Membership progression.

⸻

XP Events

The XP Engine publishes:

XP Earned

XP Reversed

Visit Qualified

Membership Year Completed

These events are consumed by other Engines.

⸻

Reversals

Businesses may configure XP reversal.

Examples:

Restaurant

No reversal

Retail

Reverse XP when receipt is cancelled

Configuration is defined per Loyalty Program.

⸻

Idempotency

Repeated identical business requests must never create duplicate XP Transactions.

XP processing must be deterministic.

⸻

Performance

Frequently accessed projections:

Current XP

Current Membership Year XP

Current Visit Count

Last Visit Date

Current Progress

These projections improve performance only.

⸻

Security

Only the XP Engine may create XP Transactions.

External components may never modify XP directly.

All XP operations are audited.

⸻

Future Extensions

The XP Engine should support future features without redesign.

Examples:

Seasonal XP

Experience Multipliers

Achievement XP

Referral XP

Mission XP

Partner XP

The XP Engine should remain generic enough to support future engagement mechanisms.

⸻

Design Principles

XP measures engagement.

Reward Points measure monetary value.

These concepts must remain completely independent.

The XP Engine must never become a second Reward Engine.