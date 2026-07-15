10 - Reward Engine

Purpose

The Reward Engine is responsible for the complete lifecycle of Reward Points.

Reward Points represent monetary value within a Loyalty Program.

The Reward Engine is the only component allowed to create, reserve, release, redeem, expire or reverse Reward Points.

⸻

Responsibilities

The Reward Engine is responsible for:

* Calculate earned Reward Points
* Create Pending Reward Points
* Release Pending Reward Points
* Reserve Reward Points
* Redeem Reward Points
* Reverse Reward Points
* Expire Reward Points
* Publish Reward Events

The Reward Engine never:

* calculates XP
* calculates Membership Status
* sends Notifications
* executes Automations

⸻

Business Principles

Reward Points represent value.

Every Reward Point movement must be:

* traceable
* auditable
* deterministic
* idempotent

Reward Points are immutable.

Balances are projections.

⸻

Reward Point Lifecycle

Receipt Created
        │
        ▼
Calculate Earned Points
        │
        ▼
Pending?
   │           │
 Yes          No
   │           │
Pending      Available
   │           │
Release       Redeem
   │           │
Expire      Reverse

⸻

Reward States

Pending

Reward Points exist but cannot be redeemed.

⸻

Available

Reward Points may be redeemed.

⸻

Reserved

Reward Points are temporarily locked during redemption.

⸻

Redeemed

Reward Points were successfully spent.

⸻

Expired

Reward Points reached expiration.

⸻

Reversed

Reward Points were cancelled because the originating business transaction was cancelled.

⸻

Point Calculation

Reward calculation is performed using Reward Rules.

Examples:

100 RSD = 5 Points

or

1 EUR = 1 Point

Businesses configure the calculation.

The Reward Engine performs it.

⸻

Pending Period

Each Loyalty Program defines:

Pending Days

Examples:

Restaurant

0 Days

Retail

15 Days

Electronics

30 Days

Pending Points automatically become Available after the Pending Period.

⸻

Expiration

Supported models:

No Expiration

Rolling Expiration

Fixed Calendar Expiration

Expiration is configured per Loyalty Program.

⸻

FIFO Redemption

Reward Points are always redeemed using FIFO.

Oldest Available Reward Points are consumed first.

FIFO is mandatory.

⸻

Reservation

Before redemption:

Reward Points are Reserved.

Reservation contains:

* Reward Account
* Reserved Points
* Monetary Value
* Expiration Time

Reservation prevents concurrent redemption.

Reservation expires automatically.

⸻

Redemption

Successful redemption:

Consumes Reserved Points.

Creates immutable Redemption Transaction.

Publishes:

Reward Points Redeemed Event.

⸻

Receipt Cancellation

Receipt cancellation creates a Reverse Transaction.

Reward Transactions are never modified.

Original transactions remain unchanged.

⸻

Partner Redemption

Reward Points always remain owned by their Origin Loyalty Program.

Cross-program redemption records:

Origin Program

Redeem Program

Conversion Rule

Settlement Value

Reward ownership never changes.

⸻

Manual Adjustments

Managers may create manual Reward adjustments.

Every adjustment requires:

Reason

Operator

Audit Record

Manual adjustments create immutable transactions.

⸻

Reward Events

The Reward Engine publishes:

Reward Points Earned

Reward Points Released

Reward Points Reserved

Reward Points Redeemed

Reward Points Expired

Reward Points Reversed

Manual Reward Adjustment

⸻

Idempotency

Repeated requests must never create duplicate Reward Transactions.

Idempotency must be enforced using:

Business

Receipt Number

POS Identifier

Transaction Type

Idempotency Key

⸻

Concurrency

The Reward Engine must support concurrent requests.

Protection mechanisms:

Optimistic Locking

Row Locking (when required)

Atomic Database Transactions

The same Reward Points must never be redeemed twice.

⸻

Reward Rules

Reward calculation uses configurable Reward Rules.

Examples:

Receipt Amount

↓

5%

↓

Reward Points

Future versions may support:

Product Categories

Brands

Campaign Multipliers

Customer Segments

⸻

Reward Ledger

Reward Ledger is append-only.

Supported transaction types:

Earn

Pending

Release

Reserve

Redeem

Expire

Reverse

Adjustment

Transactions are never edited.

Transactions are never deleted.

Corrections are performed exclusively through compensating transactions.

Existing Reward Transactions are never modified in place.

⸻

Reward Balance

Current Balance is calculated from the Reward Ledger.

The stored balance is a projection.

If required, the balance can always be rebuilt from transaction history.

⸻

Performance

Frequently accessed projections:

Available Balance

Pending Balance

Reserved Balance

Total Earned

Total Redeemed

Total Expired

Projections improve performance only.

They never replace the ledger.

⸻

Security

Only the Reward Engine may create Reward Transactions.

No external component may modify Reward balances directly.

All Reward operations are fully audited.

⸻

Error Handling

Reward operations are atomic.

Partial Reward updates are not allowed.

If one Reward operation fails:

The complete Reward transaction must be rolled back.

⸻

Future Extensions

The Reward Engine must support future features without redesign.

Examples:

* Multiple Reward Currencies
* Cashback
* Coupons
* Gift Cards
* Promotional Wallets
* Referral Rewards
* Partner Rewards

These features should reuse the existing Reward Account and Reward Ledger architecture.