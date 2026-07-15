38 - Event Storming - Reward Redemption

Purpose

This document defines the complete business flow for redeeming Reward Points.

Reward Redemption is a financial business operation and must guarantee consistency, idempotency and auditability.

Reward Points are never modified directly.

Every redemption creates immutable Reward Transactions.

⸻

Business Goal

Allow a Customer to redeem available Reward Points safely and consistently.

The platform validates eligibility, reserves points, confirms redemption and records the complete business history.

⸻

Design Principle

Reward Redemption is always based on immutable transactions.

Balances are projections.

Redemptions never modify previous Reward Transactions.

⸻

Participants

* Employee App
* POS Integration (optional)
* Redemption Engine
* Reward Engine
* Benefit Engine
* Event Bus
* Notification Engine
* Analytics Engine
* Audit Service

⸻

Preconditions

* Membership exists.
* Membership is active.
* Loyalty Program is active.
* Redemption is allowed at the selected Location.
* Customer has sufficient Available Reward Points.
* Required Benefit (if any) is active.
* Request is authenticated.
* Request is idempotent.

⸻

Business Flow

Employee scans Customer QR
        ↓
Membership identified
        ↓
Available Reward Points calculated
        ↓
Eligible Rewards determined
        ↓
Employee selects Reward
        ↓
Customer confirms redemption (optional)
        ↓
Reward Points Reserved
        ↓
POS applies discount / reward
        ↓
Redemption confirmed
        ↓
RewardPointsRedeemed
        ↓
Notification queued

⸻

Commands

Get Redemption Options

Returns available rewards and redemption possibilities for the Membership.

⸻

Reserve Reward Points

Temporarily reserves Reward Points during the checkout process.

⸻

Confirm Redemption

Finalizes the redemption.

⸻

Cancel Reservation

Releases reserved Reward Points if checkout is cancelled.

⸻

Validations

Before redemption:

* Membership is active.
* Reward exists.
* Reward is active.
* Reward is valid for the current Location.
* Customer owns enough Available Reward Points.
* Reserved points have not expired.
* Benefit prerequisites are satisfied.
* Duplicate redemption does not exist.

⸻

Business Rules

BR-RED-001

Only Available Reward Points may be redeemed.

Pending Reward Points are never redeemable.

⸻

BR-RED-002

The oldest Available Reward Points are consumed first (FIFO).

⸻

BR-RED-003

Reward Point balances may never become negative.

⸻

BR-RED-004

Reward Redemption creates immutable Reward Transactions.

⸻

BR-RED-005

Reservation expires automatically after the configured timeout.

⸻

BR-RED-006

If redemption is cancelled, reserved Reward Points become Available again.

⸻

BR-RED-007

Duplicate Confirm Redemption requests must not create duplicate redemptions.

⸻

BR-RED-008

POS determines the commercial discount.

The Loyalty Platform validates eligibility and records Reward Point consumption.

⸻

Domain Events

RewardRedemptionRequested
        ↓
RewardPointsReserved
        ↓
RewardPointsRedeemed
        ↓
RewardBalanceUpdated
        ↓
NotificationQueued

If cancelled:

RewardReservationReleased

⸻

Reward Engine Responsibilities

* validate balance
* determine FIFO consumption
* reserve points
* create redemption transactions
* update Reward projection

The Reward Engine is the only component allowed to consume Reward Points.

⸻

Benefit Engine

If the selected reward represents a Benefit:

* validate availability
* activate redemption
* mark Benefit as Redeemed

⸻

Notification Engine

Creates notifications such as:

“You successfully redeemed a free coffee.”

Delivery remains asynchronous.

⸻

Analytics Engine

Updates:

* redemption rate
* reward popularity
* average redemption value
* customer lifetime metrics

⸻

Audit

Record:

* membership_id
* redemption_id
* reward_definition_id
* consumed_transactions
* consumed_points
* location_id
* employee_id
* receipt_number (if applicable)
* timestamp

⸻

Failure Scenarios

Insufficient Reward Points

Reject redemption.

No reservation created.

⸻

Expired Reservation

Reservation released.

Customer must begin a new redemption.

⸻

Duplicate Confirmation

Return existing redemption.

No additional transactions created.

⸻

Reward Engine Failure

Reservation remains intact.

Retry supported.

⸻

Notification Failure

Redemption remains valid.

Notification retries independently.

⸻

API Mapping

Employee App

GET /api/v1/memberships/{id}/redemption-options

POST /api/v1/redemptions/reserve

POST /api/v1/redemptions/confirm

POST /api/v1/redemptions/cancel

⸻

Security

* Customers cannot redeem points belonging to another Membership.
* Internal IDs are never exposed.
* Every redemption is fully auditable.
* Reservation tokens are single-use.
* Idempotency is mandatory.

⸻

Performance

Reward balance calculation should be optimized through projections.

FIFO selection should use immutable transaction history.

Reservation and confirmation must execute atomically.

Reservation expiration and automatic release must also be idempotent.

Repeated timeout processing must never release the same reservation more than once.

⸻

Test Scenarios

* Successful redemption.
* FIFO validation.
* Pending points ignored.
* Insufficient balance.
* Reservation timeout.
* Reservation cancellation.
* Duplicate confirmation.
* Concurrent redemption requests.
* Cross-program redemption attempt.
* Notification failure.
* Reward Engine retry.

⸻

Expected Result

Reward Redemption is completed safely without risking duplicate consumption or inconsistent balances.

Every consumed Reward Point is traceable through immutable Reward Transactions.

Commercial discounts remain the responsibility of the POS or Employee workflow, while the Loyalty Platform remains the source of truth for Reward Point accounting.