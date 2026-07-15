39 - Event Storming - Receipt Cancellation

Purpose

This document defines the complete business flow for cancelling a previously recorded Receipt.

Receipt cancellation must reverse all business effects created by the original Receipt.

Original records remain immutable.

Corrections are performed through compensating transactions and events.

⸻

Business Goal

Allow an authorized Employee, Manager or POS integration to cancel a previously recorded Receipt safely and idempotently.

⸻

Preconditions

* Original Receipt exists.
* Receipt is not already cancelled.
* Requesting actor is authorized.
* Cancellation request contains a valid reason.
* Idempotency requirements are satisfied.

⸻

Command

CancelReceipt

Input:

* original_receipt_id or receipt business identifier
* cancellation_reason
* location_id
* employee_id or integration_id
* cancellation_timestamp
* idempotency_key

⸻

Business Flow

Cancellation requested
        ↓
Original Receipt located
        ↓
Authorization validated
        ↓
Receipt marked as cancelled
        ↓
ReceiptCancelled event published
        ↓
Original Reward effects reversed
        ↓
Original XP effects reversed when configured
        ↓
Challenge progress recalculated
        ↓
Status reevaluated when required
        ↓
Instant Reward handled
        ↓
Benefits handled
        ↓
Notifications queued

⸻

Business Rules

BR-CAN-001

Original Receipts are never deleted or edited.

⸻

BR-CAN-002

A cancellation creates a separate immutable cancellation record.

⸻

BR-CAN-003

The same Receipt may be cancelled only once.

⸻

BR-CAN-004

Cancellation is idempotent.

Repeated identical requests return the existing cancellation result.

⸻

BR-CAN-005

Reward Points earned from the original Receipt must be reversed.

⸻

BR-CAN-006

Pending Reward Points are cancelled before becoming Available.

⸻

BR-CAN-007

XP reversal follows the Loyalty Program configuration.

⸻

BR-CAN-008

Cancelled Receipts do not count as qualifying Visits.

⸻

BR-CAN-009

Business effects are reversed through compensating transactions.

Existing Reward, XP, Event and Audit records are never modified.

⸻

Domain Events

ReceiptCancellationRequested
        ↓
ReceiptCancelled
        ↓
RewardPointsReversed
        ↓
XPReversed (when configured)
        ↓
ChallengeProgressUpdated
        ↓
StatusEvaluated
        ↓
NotificationQueued

⸻

Reward Handling

If earned points are still Pending:

* create a reversal transaction;
* remove them from the Pending projection.

If earned points are Available:

* create a reversal transaction;
* reduce the Available projection.

If some earned points were already redeemed:

* do not allow the visible balance to become negative;
* record an internal Reward liability;
* future earned points first settle that liability.
The liability is an internal accounting concept.

Customers continue to see a non-negative Reward Point balance.

This liability model must be confirmed during the final open-question review.

⸻

Redemption Handling

If the original Receipt also contained Reward redemption:

* restore the consumed Reward Points;
* restore FIFO allocations;
* cancel related redemption effects;
* update partner settlement records when cross-program redemption occurred.

⸻

Instant Reward Handling

If the original Receipt created an unopened Instant Reward:

* expire or revoke the opportunity.

If the Instant Reward was already opened but not redeemed:

* revoke the granted Benefit.

If the Benefit was already redeemed:

* create an exception requiring authorized review.

The platform must not silently remove an already consumed physical reward.

⸻

Challenge Handling

The cancelled Receipt no longer contributes to:

* purchase count;
* spend amount;
* Visit count;
* challenge completion.

Challenge progress must be recalculated.

If a completed Challenge becomes invalid, the configured compensation policy applies.

⸻

Status Handling

Status is reevaluated only if the cancellation affects:

* XP;
* qualifying Visits;
* active membership-period requirements.

Immediate downgrade is not allowed.

Any downgrade occurs according to Membership renewal rules unless fraud or manual suspension applies.

⸻

Notifications

Customer may receive:

* Receipt cancellation confirmation;
* Reward reversal notice;
* XP reversal notice;
* Benefit revocation notice.

Notifications are asynchronous.

⸻

Failure Scenarios

Receipt Not Found

Return:

RECEIPT_NOT_FOUND

⸻

Already Cancelled

Return the existing cancellation result.

⸻

Unauthorized Actor

Return:

FORBIDDEN

⸻

Dependent Reward Already Consumed

Create a review-required exception.

Do not corrupt balances.

⸻

Partial Engine Failure

Receipt cancellation remains recorded.

Failed compensating actions retry independently and remain visible in operational monitoring.

⸻

API Mapping

POST /api/v1/receipts/{receipt_id}/cancel

POS integrations may alternatively use the original business receipt identifier.

⸻

Audit

Store:

* original_receipt_id
* cancellation_id
* actor
* reason
* location
* source
* affected Reward Transactions
* affected XP Transactions
* affected Benefits
* timestamp

⸻

Security

* Customers cannot cancel Receipts.
* Employees may cancel only Receipts from authorized Locations.
* Managers may have broader cancellation permissions.
* POS clients may cancel only their own submitted Receipts.
* Every cancellation requires audit logging.

⸻

Test Scenarios

* Successful cancellation.
* Duplicate cancellation.
* Pending points cancellation.
* Available points reversal.
* Already redeemed points.
* XP reversal enabled.
* XP reversal disabled.
* Challenge progress recalculation.
* Instant Reward unopened.
* Instant Reward opened.
* Benefit already redeemed.
* Cross-program redemption reversal.
* Unauthorized Location.
* Partial processing failure.

⸻

Expected Result

The original Receipt remains preserved.

A separate cancellation record exists.

All reversible business effects are compensated through immutable transactions and events.

The system remains fully auditable and internally consistent.