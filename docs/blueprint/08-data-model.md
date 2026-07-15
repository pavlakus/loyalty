08 - Data Model

Purpose

This document defines the logical data entities and their main attributes.

It does not define SQL types, indexes or migrations.

The physical PostgreSQL schema will be derived from this model.

⸻

Platform User

Represents one authenticated person.

Attributes:

* id
* phone_number
* phone_verified_at
* email
* first_name
* last_name
* status
* created_at
* updated_at
* deleted_at

Rules:

* Phone number must be unique.
* Email is optional.
* Internal ID never changes when phone number changes.

⸻

Business

Represents one SaaS tenant.

Attributes:

* id
* legal_name
* display_name
* registration_number
* tax_number
* currency
* timezone
* status
* created_at
* updated_at
* deleted_at

⸻

Business User

Connects a Platform User with a Business.

Attributes:

* id
* business_id
* user_id
* role
* status
* created_at
* deleted_at

Default roles:

* owner
* manager
* employee

⸻

Location

Represents one physical business location.

Attributes:

* id
* business_id
* name
* address
* city
* timezone
* status
* created_at
* updated_at
* deleted_at

⸻

Employee Location Assignment

Defines where an employee may work.

Attributes:

* id
* business_user_id
* location_id
* created_at
* deleted_at

⸻

Loyalty Program

Defines one loyalty configuration.

Attributes:

* id
* business_id
* name
* description
* currency
* status
* pending_period_days
* expiration_model
* expiration_period_days
* fixed_expiration_date
* created_at
* updated_at
* deleted_at

Expiration models:

* none
* rolling
* fixed_calendar_date

⸻

Loyalty Program Location

Connects a Loyalty Program with participating Locations.

Attributes:

* id
* loyalty_program_id
* location_id
* active_from
* active_until
* status

⸻

Membership

Connects a Customer with a Loyalty Program.

Attributes:

* id
* customer_user_id
* loyalty_program_id
* public_member_token
* joined_at
* current_status_level_id
* status
* created_at
* updated_at
* deleted_at

Rules:

* One active Membership per Customer and Loyalty Program.
* Public member token must be unique and non-predictable.

⸻

Reward Account

Represents the Reward Point account of one Membership.

Attributes:

* id
* membership_id
* available_balance
* pending_balance
* reserved_balance
* version
* created_at
* updated_at

Rules:

* Balances are projections.
* Ledger transactions remain the source of truth.
* Balances may never become negative.

⸻

Reward Transaction

Represents one immutable Reward Point movement.

Attributes:

* id
* reward_account_id
* transaction_type
* point_amount
* monetary_value
* status
* available_at
* expires_at
* source_receipt_id
* source_transaction_id
* origin_loyalty_program_id
* redeem_loyalty_program_id
* location_id
* employee_user_id
* automation_rule_id
* created_at

Transaction types:

* earn
* bonus
* pending_release
* reserve
* reservation_release
* redeem
* redemption_cancel
* expire
* reverse
* adjustment

Rules:

* Transactions are append-only.
* Negative movements are represented as new transactions.
* Existing transactions are never edited.

⸻

Reward Allocation

Tracks which earned points were consumed.

Attributes:

* id
* source_reward_transaction_id
* consuming_reward_transaction_id
* point_amount
* created_at

Purpose:

* FIFO redemption
* expiration tracking
* reversal tracking
* partner settlement

⸻

Point Reservation

Temporarily locks points during redemption.

Attributes:

* id
* reward_account_id
* point_amount
* monetary_value
* status
* expires_at
* created_by
* created_at
* confirmed_at
* cancelled_at

Statuses:

* active
* confirmed
* cancelled
* expired

⸻

XP Account

Represents progression for one Membership.

Attributes:

* id
* membership_id
* current_xp
* qualifying_visit_count
* membership_period_start
* membership_period_end
* version
* created_at
* updated_at

Current XP and visits are projections.

⸻

XP Transaction

Represents one immutable XP movement.

Attributes:

* id
* xp_account_id
* transaction_type
* xp_amount
* source_event_id
* source_receipt_id
* automation_rule_id
* created_at

Transaction types:

* purchase
* visit
* challenge
* welcome_bonus
* birthday_bonus
* promotion
* adjustment

⸻

Status Level

Defines one membership tier.

Attributes:

* id
* loyalty_program_id
* name
* rank
* minimum_xp
* minimum_visits
* visual_label
* status
* created_at
* updated_at
* deleted_at

Rules:

* Rank defines progression order.
* All configured conditions must be met.
* Spending Reward Points never lowers status.

⸻

Status Benefit

Defines a benefit attached to a Status Level.

Attributes:

* id
* status_level_id
* benefit_type
* configuration
* active_from
* active_until
* status

Benefit examples:

* reward_point_multiplier
* longer_point_expiration
* birthday_bonus
* exclusive_automation
* increased_redemption_limit

⸻

Membership Status History

Stores immutable status changes.

Attributes:

* id
* membership_id
* previous_status_level_id
* new_status_level_id
* reason
* effective_from
* effective_until
* created_at

⸻

Receipt

Represents a business transaction entered through the Employee App or API.

Attributes:

* id
* business_id
* location_id
* membership_id
* external_receipt_number
* receipt_amount
* discount_amount
* final_amount
* transaction_type
* status
* idempotency_key
* created_by
* created_at
* cancelled_at

Transaction types:

* purchase
* cancellation

Rules:

* Receipt identity must be unique within its business context.
* Repeated idempotent requests must not create duplicate transactions.

⸻

Loyalty Network

Defines shared redemption between Loyalty Programs.

Attributes:

* id
* name
* owner_business_id
* active_from
* active_until
* status
* created_at
* updated_at

⸻

Loyalty Network Member

Represents one participating Loyalty Program.

Attributes:

* id
* loyalty_network_id
* loyalty_program_id
* redemption_direction
* conversion_rate
* maximum_redemption_value
* active_from
* active_until
* status

Redemption direction:

* incoming
* outgoing
* bidirectional

⸻

Automation Rule

Defines one configurable automation.

Attributes:

* id
* business_id
* loyalty_program_id
* name
* template_type
* trigger_event_type
* priority
* conditions
* actions
* stop_processing
* active_from
* active_until
* status
* created_at
* updated_at
* deleted_at

Initial template types:

* welcome_bonus
* birthday_bonus
* happy_hour
* double_points
* spend_bonus
* visit_challenge

⸻

Business Event

Represents one immutable domain event.

Attributes:

* id
* execution_id
* parent_event_id
* event_type
* business_id
* loyalty_program_id
* membership_id
* payload
* created_at
* processed_at
* status

⸻

Automation Execution

Tracks one complete automation flow.

Attributes:

* id
* root_event_id
* business_id
* current_depth
* processed_event_count
* executed_action_count
* status
* started_at
* completed_at
* failed_at
* error_details

Statuses:

* pending
* running
* completed
* failed
* stopped

⸻

Executed Automation Rule

Prevents duplicate rule execution.

Attributes:

* id
* execution_id
* event_id
* automation_rule_id
* status
* executed_at
* error_details

The same rule may execute only once for the same event.

⸻

Notification Preference

Stores Customer communication preferences.

Attributes:

* id
* user_id
* sms_enabled
* viber_enabled
* push_enabled
* marketing_consent
* consent_updated_at

⸻

Notification

Represents one outbound message.

Attributes:

* id
* user_id
* business_id
* channel
* template_type
* payload
* status
* attempt_count
* scheduled_at
* sent_at
* failed_at
* provider_message_id
* created_at

Channels:

* sms
* viber
* push

⸻

Audit Log

Stores sensitive and administrative actions.

Attributes:

* id
* business_id
* actor_user_id
* action
* entity_type
* entity_id
* previous_data
* new_data
* ip_address
* created_at

Audit records are immutable.

⸻

Main Relationships

Platform User
    ├── Business User
    └── Membership
Business
    ├── Locations
    ├── Business Users
    └── Loyalty Programs
Loyalty Program
    ├── Memberships
    ├── Status Levels
    ├── Automation Rules
    └── Loyalty Network Memberships
Membership
    ├── Reward Account
    ├── XP Account
    └── Status History
Reward Account
    ├── Reward Transactions
    ├── Reward Allocations
    └── Point Reservations

⸻

Data Model Rules

* Tenant-owned records must be traceable to a Business.
* Immutable records must never be physically updated.
* Financially relevant actions must be idempotent.
* Balances and status are projections, not primary business truth.
* Personal data must be separated from public membership identifiers.
* Soft deletion is used for configurable and administrative entities.
* Ledger, event and audit records are never deleted.

## Final Aggregate Ownership

This document describes the original Aggregate decomposition.

The authoritative Aggregate ownership model for Blueprint v1.0 is defined in:

- 33-domain-model-v2.md

Implementation should follow the ownership defined there.