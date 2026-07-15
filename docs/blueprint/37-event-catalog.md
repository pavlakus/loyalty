37 - Event Catalog

Purpose

This document defines the official Business Events used by the platform.

All engines, APIs, automations, tests and AI agents must use these event names consistently.

Events are immutable facts describing something that already happened.

⸻

Naming Convention

Event names use past tense.

Examples:

* CustomerRegistered
* ReceiptRecorded
* RewardPointsEarned

Do not use commands as event names.

Incorrect:

* CreateCustomer
* AddPoints
* ProcessReceipt

⸻

Event Metadata

Every Event contains:

* event_id
* event_type
* event_version
* execution_id
* parent_event_id
* root_event_id
* business_id
* brand_id
* loyalty_program_id
* membership_id
* occurred_at
* idempotency_key
* payload

Only relevant fields are populated.

⸻

Authentication Events

PhoneVerificationRequested

A phone verification code was requested.

PhoneVerificationSucceeded

The phone number was successfully verified.

PhoneVerificationFailed

Phone verification failed.

CustomerAuthenticated

The Customer successfully authenticated.

CustomerLoggedOut

The Customer session ended.

⸻

Customer Events

CustomerRegistered

A new platform Customer was created.

CustomerAnonymized

The Customer’s personal data was anonymized.

CustomerProfileUpdated

The Customer updated profile information.

CustomerPhoneChangeRequested

A phone number transfer was requested through support.

⸻

Membership Events

LoyaltyProgramJoinRequested

The Customer requested enrollment.

MembershipCreated

A Membership was created.

MembershipActivated

The Membership became active.

MembershipBecameInactive

The Membership became inactive after the configured inactivity period.

MembershipSuspended

The Membership was blocked.

MembershipClosed

The Membership was permanently closed.

CustomerJoinedLoyaltyProgram

The complete enrollment process finished successfully.

MembershipYearStarted

A new Membership Year began.

MembershipYearCompleted

A Membership Year ended.

⸻

Receipt Events

ReceiptRecorded

A completed purchase was recorded.

ReceiptCancellationRequested

A Receipt cancellation was requested.

ReceiptCancelled

A Receipt was successfully cancelled.

ReceiptProcessingFailed

Receipt processing failed before the Receipt was accepted.

Duplicate submissions do not create new Events.

⸻

Reward Point Events

RewardPointsEarned

Reward Points were awarded.

RewardPointsPending

Earned Reward Points entered the Pending state.

RewardPointsReleased

Pending Reward Points became Available.

RewardPointsReserved

Reward Points were temporarily reserved.

RewardReservationReleased

A reservation was cancelled or expired.

RewardPointsRedeemed

Reward Points were successfully spent.

RewardRedemptionCancelled

A completed redemption was reversed.

RewardPointsExpired

Reward Points expired.

RewardPointsReversed

Previously earned Reward Points were reversed.

RewardPointsAdjusted

An authorized manual adjustment was created.

⸻

XP Events

XPEarned

XP was awarded.

XPReversed

Previously awarded XP was reversed.

XPAdjusted

An authorized manual XP adjustment was created.

VisitQualified

A Visit satisfied the configured qualification rules.

⸻

Status Events

StatusEvaluated

Membership progression was evaluated.

StatusUpgraded

The Membership reached a higher Status.

StatusDowngraded

The Membership moved to a lower Status during renewal.

StatusMaintained

The current Status remained unchanged.

MembershipBenefitsReevaluated

Benefits were recalculated after a Status or configuration change.

⸻

Benefit Events

BenefitGranted

A Benefit was granted to a Membership.

BenefitActivated

A Benefit became usable.

BenefitRedemptionRequested

A Customer requested Benefit usage.

BenefitRedeemed

A Benefit was successfully used.

BenefitExpired

A Benefit expired.

BenefitRevoked

A Benefit was removed through a compensating action.

⸻

Challenge Events

ChallengeAssigned

A Challenge was assigned to a Membership.

ChallengeProgressUpdated

Challenge progress changed.

ChallengeCompleted

The Customer completed a Challenge.

ChallengeExpired

The Challenge ended before completion.

ChallengeRewardGranted

The configured Challenge reward was granted.

⸻

Instant Reward Events

InstantRewardOpportunityCreated

A Customer received one unopened Instant Reward opportunity.

InstantRewardOpened

The Customer revealed an Instant Reward.

InstantRewardSelected

The backend selected the reward result.

InstantRewardGranted

The selected reward was granted.

InstantRewardOpportunityExpired

An unopened opportunity expired.

⸻

Reward Goal Events

RewardGoalAssigned

A Reward Goal was assigned or selected.

RewardGoalProgressUpdated

Progress toward a Reward Goal changed.

RewardGoalCompleted

The Customer reached the required goal.

RewardGoalChanged

The Customer selected another goal.

⸻

Automation Events

AutomationExecutionStarted

An Automation execution began.

AutomationRuleMatched

A Rule matched an Event.

AutomationActionExecuted

An Action completed successfully.

AutomationActionFailed

An Action failed.

AutomationExecutionCompleted

No unprocessed Events remained.

AutomationExecutionFailed

Execution stopped because of an unrecoverable failure or safety limit.

AutomationExecutionStopped

Execution was intentionally stopped.

⸻

Notification Events

NotificationQueued

A Notification Job was created.

NotificationProcessingStarted

A delivery Worker started processing.

NotificationSent

The provider accepted the message.

NotificationDelivered

Delivery was confirmed.

NotificationFailed

Notification delivery failed.

NotificationRead

An In-App Notification was opened.

⸻

Loyalty Network Events

LoyaltyNetworkCreated

A Loyalty Network was created.

LoyaltyProgramJoinedNetwork

A Loyalty Program joined a Network.

LoyaltyProgramLeftNetwork

A Loyalty Program left a Network.

LoyaltyNetworkActivated

Cross-program redemption became active.

LoyaltyNetworkDeactivated

Cross-program redemption stopped.

CrossProgramRedemptionCompleted

Points originating from one Program were redeemed in another.

⸻

Brand and Business Events

BusinessCreated

A SaaS Business account was created.

BrandCreated

A customer-facing Brand was created.

LocationCreated

A Location was created.

EmployeeInvited

A Business User invitation was created.

EmployeeActivated

The Employee account became active.

LoyaltyProgramCreated

A Brand Loyalty Program was created.

LoyaltyProgramActivated

The Loyalty Program became available to Customers.

LoyaltyProgramDeactivated

The Loyalty Program stopped accepting new activity.

⸻

Strategy Events

StrategySelected

The Business selected a Strategy Template.

StrategyRecommendationGenerated

The platform generated recommended configuration.

StrategyAccepted

The Business accepted the recommendation.

StrategyConfigurationChanged

The Business modified the generated configuration.

⸻

Audit Events

ManualAdjustmentRequested

A manual financial or progression adjustment was requested.

ManualAdjustmentApproved

An authorized user approved the adjustment.

PermissionChanged

A Business User permission changed.

APIKeyCreated

An Integration API Key was created.

APIKeyRevoked

An Integration API Key was revoked.

⸻

Event Rules

* Events are immutable.
* Events describe completed facts.
* Existing Events are never edited.
* Corrections create new compensating Events.
* Every Event has a version.
* Breaking payload changes require a new Event version.
* Duplicate business operations must not create duplicate Events.
* Events must not contain secrets or unnecessary personal information.
* Events should contain identifiers and facts, not complete database objects.

⸻

Event Versioning

Initial version:

event_version: 1

Compatible payload additions may keep the same version.

Breaking semantic or structural changes require a new version.

Consumers must explicitly support Event versions they process.

⸻

Source of Truth

This catalog is the authoritative source for Event names.

New Events must be added here before implementation.

AI agents must not invent alternative Event names for existing business concepts.