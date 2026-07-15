35 - Event Storming - Join Loyalty Program

Purpose

This document defines how an existing Customer joins one Loyalty Program and receives a Membership.

Customer registration and Loyalty Program enrollment are separate processes.

⸻

Business Goal

Allow an authenticated Customer to join a Loyalty Program quickly and safely.

After successful enrollment, the Customer may:

* collect Reward Points
* earn XP
* receive Benefits
* participate in Challenges
* view Loyalty Program content

⸻

Participants

* Customer
* Loyalty Program
* Membership Engine
* Automation Engine
* Reward Engine
* XP Engine
* Benefit Engine
* Notification Engine
* Audit Service

⸻

Preconditions

* Customer exists.
* Customer is authenticated.
* Loyalty Program exists.
* Loyalty Program is active.
* Brand is active.
* Customer does not already have an active Membership in this Loyalty Program.

⸻

Enrollment Sources

A Customer may join through:

* Brand QR Code
* Invitation Link
* Customer App Marketplace
* Private Brand App
* Employee-assisted Registration
* Future API Integration

All sources create the same Membership.

⸻

Business Flow

Customer selects Loyalty Program
        ↓
Program information displayed
        ↓
Customer accepts Program Terms
        ↓
Join request submitted
        ↓
Eligibility validated
        ↓
Membership created
        ↓
Reward Account created
        ↓
XP Account created
        ↓
Default Status assigned
        ↓
Membership Created event published
        ↓
Welcome Automations evaluated
        ↓
Enrollment completed

⸻

Command

Join Loyalty Program

Command:

JoinLoyaltyProgram

Input:

* customer_id
* loyalty_program_id
* enrollment_source
* accepted_terms_version
* marketing_consent
* idempotency_key

⸻

Validations

Before creating Membership:

* Customer is authenticated.
* Loyalty Program is active.
* Brand is active.
* Customer is eligible to join.
* Program Terms are accepted.
* The Customer does not already have an active Membership.
* Idempotency key has not produced another Membership.

⸻

Business Rules

BR-JOIN-001

One Customer may have only one active Membership per Loyalty Program.

⸻

BR-JOIN-002

Joining one Loyalty Program does not automatically enroll the Customer in partner Loyalty Programs.

⸻

BR-JOIN-003

Loyalty Network participation affects redemption rights only.

It does not create additional Memberships.

⸻

BR-JOIN-004

A new Membership receives the lowest active Status Level.

⸻

BR-JOIN-005

Every Membership owns exactly one Reward Account and one XP Account.

⸻

BR-JOIN-006

Reward and XP balances begin at zero unless Welcome Automations grant an initial value.

⸻

BR-JOIN-007

Enrollment must be idempotent.

Repeated identical requests return the existing Membership.

⸻

BR-JOIN-008

Welcome Bonus, Welcome XP, Welcome Benefit and Welcome Challenge are optional Automations.

They are not hardcoded parts of Membership creation.

⸻

Domain Events

LoyaltyProgramJoinRequested
        ↓
MembershipCreated
        ↓
RewardAccountCreated
        ↓
XPAccountCreated
        ↓
InitialStatusAssigned
        ↓
CustomerJoinedLoyaltyProgram

CustomerJoinedLoyaltyProgram is the event used by Welcome Automations.

⸻

Automation Examples

Welcome Reward

WHEN CustomerJoinedLoyaltyProgram
THEN Add 50 Reward Points

Welcome Benefit

WHEN CustomerJoinedLoyaltyProgram
THEN Grant Free Coffee Benefit

Welcome Challenge

WHEN CustomerJoinedLoyaltyProgram
THEN Create First Visit Challenge

Welcome Notification

WHEN CustomerJoinedLoyaltyProgram
THEN Queue Welcome Notification

⸻

Engine Responsibilities

Membership Engine

* validates enrollment
* creates Membership
* creates Reward Account
* creates XP Account
* assigns initial Status
* publishes Membership events

Automation Engine

* processes CustomerJoinedLoyaltyProgram
* finds Welcome Automations
* dispatches configured actions

Reward Engine

* grants Welcome Reward Points when requested

XP Engine

* grants Welcome XP when requested

Benefit Engine

* grants configured Welcome Benefits

Notification Engine

* creates Welcome Notification Jobs

⸻

Membership Data

The new Membership stores:

* customer
* loyalty_program
* public_member_token
* enrollment_source
* joined_at
* membership_period_start
* membership_period_end
* initial_status
* status
* accepted_terms_version

Initial lifecycle status:

created

The Membership becomes:

active

after successful completion of enrollment.

⸻

Public Membership Token

A unique and non-predictable Public Membership Token is generated during Membership creation.

The token:

* identifies this Membership
* is used in the Customer QR Code
* contains no personal information
* does not expose internal database identifiers

⸻

Notifications

Recommended channels:

* Push
* In-App
* Optional Viber

Example:

Welcome to Aroma Loyalty.
Your membership is active and your first goal is ready.

Marketing messages require consent.

⸻

Audit

Record:

* customer_id
* loyalty_program_id
* brand_id
* enrollment_source
* accepted_terms_version
* consent state
* membership_id
* timestamp

⸻

Failure Scenarios

Existing Membership

Return the existing active Membership.

Do not create a duplicate.

⸻

Inactive Loyalty Program

Reject enrollment with:

LOYALTY_PROGRAM_INACTIVE

⸻

Missing Terms Acceptance

Reject enrollment with:

TERMS_NOT_ACCEPTED

⸻

Ineligible Customer

Reject enrollment with:

MEMBERSHIP_NOT_ALLOWED

⸻

Partial Creation Failure

Membership, Reward Account, XP Account and initial Status must be created atomically.

If any mandatory step fails, the complete enrollment is rolled back.

Welcome Automations may execute asynchronously after Membership creation.

MembershipCreated is published only after the Membership transaction has been committed successfully.

No downstream Business Engine may observe a partially created Membership.

⸻

API Mapping

POST /api/v1/loyalty-programs/{program_id}/join

Response:

* membership_id
* public_member_token
* status
* reward_balance
* pending_balance
* current_xp
* welcome_actions_pending

⸻

Security

* Customer may create Membership only for themselves.
* Internal IDs are never embedded in QR Codes.
* Membership creation is protected by rate limiting.
* Cross-customer enrollment is forbidden.
* Loyalty Program and Brand status must be validated on the backend.

⸻

Test Scenarios

* Successful Membership creation.
* Join through Marketplace.
* Join through Brand QR.
* Join through Private Brand App.
* Duplicate join request.
* Existing inactive Membership.
* Inactive Loyalty Program.
* Missing Terms acceptance.
* Welcome Bonus enabled.
* Welcome Bonus disabled.
* Welcome Benefit enabled.
* Failure during Reward Account creation.
* Failure during Welcome Automation.
* Cross-customer enrollment attempt.

⸻

Expected Result

The Customer has one active Membership in the selected Loyalty Program.

The Membership contains:

* Reward Account
* XP Account
* initial Status
* Public Membership Token

Configured Welcome Automations are queued or completed without blocking the core enrollment process.