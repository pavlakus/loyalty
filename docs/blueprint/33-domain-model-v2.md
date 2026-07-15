33 - Domain Model v2

Purpose

This document defines the core business domain of the platform.

It identifies the primary business aggregates, their responsibilities and their relationships.

The Domain Model is independent of database design and implementation details.

Business Rules always take precedence over technical implementation.

⸻

Core Design Principles

The platform follows Domain-Driven Design (DDD).

Each Aggregate owns its own consistency boundaries.

Business behavior belongs to Aggregates rather than infrastructure.

⸻

Platform Structure

Platform
│
├── Businesses
├── Customers
├── Loyalty Networks
├── Brands
└── Platform Configuration

⸻

Business Aggregate

Represents the legal owner of one or more Brands.

Responsibilities:

* Ownership
* Billing
* Subscription
* User Management
* Permissions

Business owns one or more Brands.

⸻

Brand Aggregate

Represents the customer-facing identity.

Examples:

* Coffee Shop
* Restaurant
* Bakery
* Fitness Club

A Brand owns:

* Locations
* One Loyalty Program
* Brand Configuration
* Employees

Brand is independent from Business identity.

⸻

Loyalty Program Aggregate

Every Brand owns exactly one Loyalty Program.

The Loyalty Program defines:

* Reward Rules
* XP Rules
* Membership Statuses
* Benefits
* Strategy
* Automations
* Instant Reward Campaigns

Business logic belongs here.

⸻

Customer Aggregate

Represents a person using the platform.

Customer identity is global.

Customer contains:

* Phone Number
* Authentication
* Profile
* Preferences
* Notification Settings

A Customer may participate in many Loyalty Programs.

⸻

Membership Aggregate

Represents the relationship between one Customer and one Loyalty Program.

Every Membership owns:

* Reward Account
* XP Account
* Status
* Benefits
* Visits
* Reward Goals
* Reward Opportunities

Membership is the central aggregate of customer participation.

⸻

Membership Lifecycle

Membership states:

Created

↓

Active

↓

Inactive

↓

Suspended

↓

Closed

Inactive Memberships remain valid.

Closed Memberships are immutable.

⸻

Reward Account

Tracks Reward Point balances.

Reward Points never exist outside a Membership.

Reward Account is calculated from Reward Transactions.

Balances are projections.

Reward Transactions remain immutable.

Reward Account exists only as a projection.

It may always be reconstructed from the immutable Reward Ledger.

⸻

XP Account

Tracks customer progression.

XP has no monetary value.

XP contributes only to Membership progression.

XP is immutable through XP Transactions.

⸻

Membership Status

Represents long-term customer progression.

Examples:

* Bronze
* Silver
* Gold
* Platinum

Status grants Benefits.

Status does not directly modify Reward Point calculations.

⸻

Benefit Aggregate

Benefits represent privileges granted to a Membership.

Benefit sources include:

* Membership Status
* Instant Rewards
* Campaigns
* Manual Grants
* Birthday Rewards
* Future Referral Programs

Benefit lifecycle:

Definition

↓

Granted

↓

Active

↓

Redeemed

↓

Expired

Benefits are independent business entities.

⸻

Reward Goal

Represents a customer-visible objective.

Examples:

* Free Coffee
* Free Lunch
* Birthday Reward

Reward Goals translate Reward Points into meaningful customer progress.

Goals belong to the presentation domain while remaining connected to Reward Accounts.

⸻

Instant Reward

Represents surprise-based engagement.

Core entities include:

* Reward Campaign
* Reward Pool
* Reward Definition
* Reward Opportunity
* Reward Reveal

One qualifying event generates one Reward Opportunity.

Customers may hold multiple unopened opportunities.

⸻

Visit

Represents a qualifying customer visit.

Visits contribute to:

* XP
* Challenges
* Campaigns
* Analytics

Visits are independent from Reward Point calculations.

⸻

Strategy

Represents the business growth strategy selected by the Business.

Examples:

* Customer Retention
* Increase Visit Frequency
* Increase Average Basket Value
* Reactivate Customers

Strategies generate recommended platform configuration.

⸻

Automation

Represents event-driven business behavior.

Automation reacts to Events.

Automation delegates calculations to specialized Business Engines.

Automation never contains Reward calculations directly.

⸻

Loyalty Network

Represents cooperation between multiple Loyalty Programs.

Networks define:

* Shared Redemption
* Settlement Rules
* Participation
* Validity Period

Reward ownership always remains with the originating Loyalty Program.

⸻

Brand Configuration

Represents presentation customization.

Includes:

* Theme
* Logo
* Colors
* Navigation
* Enabled Modules

Brand Configuration never changes Business Rules.

⸻

Deployment Configuration

Determines how the platform is presented.

Supported models:

* Marketplace
* Private Brand
* Enterprise White Label

Deployment affects presentation only.

Business logic remains identical.

⸻

Aggregate Ownership

Platform
│
├── Business
│     └── Brand
│            ├── Locations
│            ├── Loyalty Program
│            ├── Employees
│            └── Brand Configuration
│
├── Customer
│     └── Memberships
│             ├── Reward Account
│             ├── XP Account
│             ├── Status
│             ├── Benefits
│             ├── Reward Goals
│             ├── Visits
│             └── Instant Rewards
│
└── Loyalty Network

Every Aggregate is the exclusive owner of its business invariants.

Cross-Aggregate collaboration occurs only through Commands and Business Events.

Aggregates never modify another Aggregate's internal state directly.
⸻

Design Rules

* One Business may own multiple Brands.
* One Brand owns exactly one Loyalty Program.
* One Customer may have many Memberships.
* One Membership belongs to exactly one Loyalty Program.
* Reward Points never leave their Membership.
* Shared redemption is coordinated through Loyalty Networks.
* Status grants Benefits.
* Reward Points do not grant Benefits directly.
* Business Rules remain independent from presentation.

⸻

Future Evolution

The Domain Model is designed to support future modules including:

* Reservations
* Gift Cards
* Wallet
* Marketplace
* Referral Programs
* AI Business Advisor
* Subscription Programs

Future functionality should extend existing Aggregates whenever possible rather than introducing parallel business models.

⸻

Design Philosophy

The Domain Model represents the business.

Databases, APIs, mobile applications and AI agents must adapt to the Domain Model.

The Domain Model is the primary architectural source of truth for the platform.