36 - Event Storming - Purchase Processing

Purpose

This document defines the complete business flow for processing a purchase.

A Purchase Receipt is the primary business event of the Loyalty Platform.

Reward Points, XP, Status updates, Benefits, Instant Rewards and Notifications are consequences of processing a Receipt.

Receipts are the single source of truth.

⸻

Business Goal

Record a completed purchase and automatically execute all configured Loyalty business logic.

The platform should process purchases consistently regardless of whether they originate from:

* Employee App
* POS API
* Future Integrations

⸻

Design Principle

The platform never directly grants Reward Points or XP.

The platform records a Receipt.

Business Engines react to Receipt events.

⸻

Participants

* Employee App
* POS Integration
* Receipt Engine
* Event Bus
* Reward Engine
* XP Engine
* Status Engine
* Benefit Engine
* Challenge Engine
* Instant Reward Engine
* Automation Engine
* Notification Engine
* Analytics Engine
* Audit Service

⸻

Preconditions

* Membership exists.
* Loyalty Program is active.
* Brand is active.
* Employee or POS is authorized.
* Receipt has not already been processed.
* Fiscal Receipt Number is valid.

⸻

Business Flow

Employee/POS
        │
        ▼
Record Receipt
        │
        ▼
Receipt Created
        │
        ▼
Publish ReceiptRecorded Event
        │
        ├────────────► Reward Engine
        │
        ├────────────► XP Engine
        │
        ├────────────► Status Engine
        │
        ├────────────► Benefit Engine
        │
        ├────────────► Challenge Engine
        │
        ├────────────► Instant Reward Engine
        │
        ├────────────► Automation Engine
        │
        ├────────────► Notification Engine
        │
        └────────────► Analytics Engine

⸻

Command

Command:

RecordReceipt

Input:

* loyalty_program_id
* membership_public_token
* location_id
* employee_id (optional)
* receipt_number
* fiscal_device_id
* receipt_total
* currency
* receipt_timestamp
* source
* idempotency_key

⸻

Validations

Before creating a Receipt:

* Membership exists.
* Membership is active.
* Loyalty Program is active.
* Location belongs to Brand.
* Employee has permission.
* Receipt Number is unique.
* Receipt Timestamp is valid.
* Receipt Amount is positive.
* Currency is supported.
* Duplicate Request does not exist.

⸻

Business Rules

BR-REC-001

Receipts are immutable.

⸻

BR-REC-002

Receipts represent completed business transactions.

⸻

BR-REC-003

Every Receipt may generate multiple business events.

⸻

BR-REC-004

Business Engines execute independently.

⸻

BR-REC-005

Failure in one Business Engine must not invalidate Receipt recording.

⸻

BR-REC-006

Receipt processing is idempotent.

Repeated submission of the same Receipt returns the existing Receipt.

⸻

BR-REC-007

Receipt recording completes before asynchronous business processing begins.

⸻

Domain Events

ReceiptRecorded

Subsequent events may include:

RewardGranted
XPGranted
StatusEvaluated
BenefitGranted
ChallengeProgressUpdated
InstantRewardCreated
NotificationQueued
AnalyticsUpdated

The Receipt remains the root event.

⸻

Receipt Engine Responsibilities

The Receipt Engine:

* validates the Receipt
* creates the Receipt
* guarantees idempotency
* publishes ReceiptRecorded
* stores audit information

ReceiptRecorded is published only after the Receipt transaction has been committed successfully.

Business Engines never observe uncommitted Receipt data.

The Receipt Engine performs no Reward calculations.

⸻

Reward Engine

Listens to:

ReceiptRecorded

Responsibilities:

* evaluate Reward Rules
* create Reward Transactions
* update Reward Projection

⸻

XP Engine

Listens to:

ReceiptRecorded

Responsibilities:

* calculate XP
* create XP Transactions
* update XP Projection

⸻

Status Engine

Listens to:

XPGranted

Responsibilities:

* evaluate Status
* assign new Status
* publish StatusChanged

⸻

Benefit Engine

Listens to:

StatusChanged

CampaignCompleted

InstantRewardOpened

Responsibilities:

* grant Benefits
* activate Benefits
* expire Benefits

⸻

Challenge Engine

Listens to:

ReceiptRecorded

Responsibilities:

* update Challenge Progress
* publish ChallengeCompleted

⸻

Instant Reward Engine

Listens to:

ReceiptRecorded

Responsibilities:

* determine eligibility
* create Reward Opportunity
* publish InstantRewardCreated

Instant Rewards are optional.

⸻

Automation Engine

Listens to every Business Event.

Responsibilities:

* evaluate configured Automations
* execute Actions
* schedule future Actions

Automation never recalculates Rewards.

⸻

Notification Engine

Listens to Business Events.

Creates Notification Jobs.

Delivery is asynchronous.

⸻

Analytics Engine

Updates:

* customer metrics
* business metrics
* loyalty KPIs
* campaign statistics

Analytics never modifies business data.

⸻

Audit

Record:

* receipt_id
* membership_id
* loyalty_program_id
* location_id
* employee_id
* receipt_number
* fiscal_device_id
* source
* processing_duration
* processing_result

⸻

Failure Scenarios

Duplicate Receipt

Return existing Receipt.

Do not execute Business Engines again.

⸻

Reward Engine Failure

Receipt remains valid.

Reward Engine retries independently.

⸻

Notification Failure

Receipt processing succeeds.

Notification retries later.

⸻

Analytics Failure

Receipt processing succeeds.

Analytics retries later.

⸻

Challenge Failure

Receipt processing succeeds.

Challenge processing retries independently.

⸻

API Mapping

Employee App

POST /api/v1/receipts

POS

POST /api/v1/integrations/receipts

Both produce identical business events.

⸻

Security

* Receipt creation requires authorization.
* Membership token must belong to the selected Loyalty Program.
* Receipt Numbers must be unique within Business rules.
* Duplicate processing is prevented by idempotency.
* Internal Membership IDs are never exposed.
* All business processing occurs on the backend.

⸻

Performance

Receipt creation should complete within milliseconds.

Business processing occurs asynchronously.

Customer-facing applications should never wait for all Business Engines to finish.

⸻

Test Scenarios

* Successful Employee Receipt.
* Successful POS Receipt.
* Duplicate Receipt.
* Invalid Membership.
* Suspended Membership.
* Inactive Loyalty Program.
* Negative Amount.
* Duplicate Idempotency Key.
* Reward Engine unavailable.
* XP Engine unavailable.
* Notification unavailable.
* Instant Reward enabled.
* Instant Reward disabled.
* Multiple engines executing simultaneously.

⸻

Expected Result

A Receipt becomes the immutable source of truth for the purchase.

Every downstream business process reacts to ReceiptRecorded events independently.

The architecture remains event-driven, scalable, fault-tolerant and extensible.