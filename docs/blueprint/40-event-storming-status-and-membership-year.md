40 - Event Storming - Status and Membership Year

Purpose

This document defines how Membership Status is evaluated during an active Membership Year and at annual renewal.

Status reflects long-term engagement.

Reward Point spending never affects Status.

⸻

Business Goal

Evaluate customer loyalty using:

* XP
* qualifying Visits
* configured Status rules
* Membership Year

Customers should receive upgrades immediately after meeting all requirements.

Downgrades occur only during Membership Year renewal.

⸻

Preconditions

* Membership exists.
* Membership is active.
* Loyalty Program is active.
* Status Levels are configured.
* Current Membership Year exists.

⸻

Status Inputs

The Status Engine evaluates:

* XP earned during the current Membership Year
* qualifying Visit count
* current Status
* Status thresholds
* manual Status overrides
* Membership Year dates

Reward Point balance is never an input.

⸻

Membership Year

Every Membership has its own annual period.

Example:

Membership joined:
15 March 2026
Membership Year:
15 March 2026 – 14 March 2027

A new period begins immediately after renewal.

⸻

Flow A - Immediate Status Evaluation

XPEarned or VisitQualified
        ↓
Status evaluation requested
        ↓
Current Membership Year totals loaded
        ↓
Status requirements evaluated
        ↓
All requirements met?
        ├── No → StatusMaintained
        └── Yes → StatusUpgraded
                       ↓
                Benefits reevaluated
                       ↓
                Customer notified

⸻

Flow B - Membership Year Renewal

Membership Year reaches end date
        ↓
MembershipYearCompleted
        ↓
Final XP and Visits calculated
        ↓
Renewal rules evaluated
        ↓
New Status determined
        ↓
Status upgraded, maintained or downgraded
        ↓
Previous Membership Year closed
        ↓
New Membership Year created
        ↓
Benefits reevaluated
        ↓
MembershipYearStarted

⸻

Commands

Evaluate Status

EvaluateMembershipStatus

Triggered by:

* XPEarned
* XPReversed
* VisitQualified
* manual adjustment
* Status configuration change

⸻

Renew Membership Year

RenewMembershipYear

Triggered when the current Membership Year ends.

⸻

Business Rules

BR-STA-001

Status depends on XP and qualifying Visits.

⸻

BR-STA-002

All configured requirements must be satisfied.

Example:

XP >= 3000
AND
Visits >= 20

⸻

BR-STA-003

Reward Point balance never affects Status.

⸻

BR-STA-004

Reward Point redemption never causes Status downgrade.

⸻

BR-STA-005

Status upgrades occur immediately after requirements are met.

⸻

BR-STA-006

Downgrades occur only during Membership Year renewal.

⸻

BR-STA-007

Status may skip levels when all higher-level requirements are satisfied.

In practice, Visit requirements make large jumps less common.

⸻

BR-STA-008

New Status Benefits become active immediately.

⸻

BR-STA-009

Status history is immutable.

Every change creates a new history record.

⸻

BR-STA-010

Membership Year renewal must be idempotent.

The same period may never be renewed twice.

⸻

Domain Events

Immediate evaluation:

StatusEvaluated
        ↓
StatusUpgraded
or
StatusMaintained
        ↓
MembershipBenefitsReevaluated

Annual renewal:

MembershipYearCompleted
        ↓
StatusEvaluated
        ↓
StatusUpgraded
or
StatusMaintained
or
StatusDowngraded
        ↓
MembershipBenefitsReevaluated
        ↓
MembershipYearStarted

⸻

Status Engine Responsibilities

The Status Engine:

* loads progression totals
* evaluates configured conditions
* determines qualifying Status
* creates Status History
* updates Status projection
* publishes Status Events

It never:

* awards XP
* awards Reward Points
* sends Notifications directly
* creates Benefits directly

⸻

Benefit Handling

After Status change:

MembershipBenefitsReevaluated

The Benefit Engine determines:

* which Benefits should be granted
* which Benefits remain active
* which temporary Benefits expire
* which Status Benefits apply in the new period

Previously redeemed Benefits remain in history.

⸻

Progress Calculation

The Customer App receives:

* current Status
* next Status
* current XP
* required XP
* current qualifying Visits
* required Visits
* progress percentage
* remaining requirements
* current Benefits
* next-level Benefits

Example:

Gold
82% to Platinum
420 XP remaining
3 Visits remaining

⸻

Progress Percentage

When multiple requirements exist, progress must not hide an unmet condition.

The UI should display each requirement separately.

A combined percentage may be shown as a supporting indicator only.

⸻

Membership Year Completion

Before closing a Membership Year, the platform must finalize:

* XP total
* qualifying Visit total
* Status result
* Status History
* active Benefits
* renewal audit record

The completed period becomes immutable.

Historical Membership Years remain available for Analytics, Audit and Customer history.

They are never recalculated after completion.

⸻

Downgrade Rules

Businesses may configure:

* normal downgrade to the qualified level
* maximum one-level downgrade per Membership Year
* grace period before downgrade

Default recommendation:

Maximum one-level downgrade per Membership Year.

⸻

Manual Status Changes

Authorized Managers may change Status manually.

Required:

* reason
* operator
* effective period
* audit record

Manual changes do not rewrite previous Status History.

⸻

Notifications

Possible notifications:

* Status upgraded
* Status maintained
* Status downgraded
* New Benefits activated
* Membership Year renewed
* Progress near completion

Delivery remains asynchronous.

⸻

Failure Scenarios

Missing Status Configuration

Keep current Status.

Create operational alert.

⸻

Duplicate Renewal

Return the existing renewal result.

Do not create another Membership Year.

⸻

Benefit Engine Failure

Status change remains valid.

Benefit processing retries independently.

⸻

Notification Failure

Status processing remains valid.

Notification retries independently.

⸻

Invalid Manual Override

Reject the request.

Do not modify Status.

⸻

API Mapping

Customer:

GET /api/v1/memberships/{membership_id}/progress
GET /api/v1/memberships/{membership_id}/status-history

Business management:

POST /api/v1/memberships/{membership_id}/status-adjustments

Annual renewal is an internal scheduled process.

⸻

Audit

Store:

* membership_id
* Membership Year
* previous Status
* evaluated Status
* final Status
* XP total
* qualifying Visit total
* evaluation reason
* rule version
* timestamp

⸻

Security

* Customers may view only their own Status and progress.
* Employees may view limited Status information needed for service.
* Only authorized Managers may perform manual Status changes.
* Status Rules may be changed only by authorized Business users.

⸻

Test Scenarios

* Immediate Status upgrade.
* Requirements not fully satisfied.
* Multiple levels technically satisfied.
* Reward Point redemption does not affect Status.
* Membership Year renewal.
* Status maintained at renewal.
* One-level downgrade.
* Grace period.
* Duplicate renewal.
* Manual Status adjustment.
* Benefit processing failure.
* Notification failure.
* Concurrent XP and Visit events near threshold.

⸻

Expected Result

Membership Status accurately reflects customer engagement during the current Membership Year.

Upgrades occur immediately.

Downgrades occur only during renewal.

Reward Point spending never reduces Status.

All Status decisions remain explainable and auditable.