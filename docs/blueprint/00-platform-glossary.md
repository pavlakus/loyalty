00 - Platform Glossary

Purpose

This document defines the official terminology used across the platform.

All Blueprint documents, APIs, database objects, tests and AI agents must use these terms consistently.

⸻

Platform Terms

Platform

The complete SaaS system.

The Platform serves multiple Businesses, Brands, Customers and deployment models.

⸻

Business

The legal or commercial entity using the Platform.

One Business may own multiple Brands.

⸻

Brand

The customer-facing identity of a Business.

A Brand owns:

* Locations
* one Loyalty Program
* Brand Configuration

⸻

Location

A physical place operated under a Brand.

Customers may earn or redeem rewards at authorized Locations.

⸻

Customer

A globally registered person identified primarily by a verified phone number.

One Customer may have multiple Memberships.

⸻

Business User

A person authorized to manage or operate a Business.

Examples:

* Owner
* Manager
* Employee

⸻

Loyalty Terms

Loyalty Program

The loyalty configuration owned by one Brand.

One Brand has exactly one Loyalty Program.

It defines:

* Reward Rules
* XP Rules
* Status Levels
* Benefits
* Automations

⸻

Membership

The relationship between one Customer and one Loyalty Program.

One Customer may have one Membership in each Loyalty Program.

⸻

Membership Year

The annual evaluation period starting from the Membership join or renewal date.

It is used for XP, Visits and Status evaluation.

⸻

Membership Status

The current loyalty tier of a Membership.

Examples:

* Bronze
* Silver
* Gold
* Platinum

Status depends on XP and qualifying Visits.

⸻

Loyalty Network

An agreement connecting multiple Loyalty Programs.

It allows cross-program redemption without transferring Reward ownership.

⸻

Reward Terms

Reward Points

Points with configurable monetary or reward value.

Reward Points may be:

* Pending
* Available
* Reserved
* Redeemed
* Expired
* Reversed

⸻

Reward Account

The account belonging to one Membership that contains Reward Point projections.

Immutable Reward Transactions remain the source of truth.

⸻

Reward Transaction

An immutable change in Reward Points.

Examples:

* Earn
* Release
* Reserve
* Redeem
* Expire
* Reverse
* Adjustment

⸻

Reward Rule

A configurable rule that defines how Reward Points are earned or used.

Example:

Every 100 RSD spent = 1 Reward Point

⸻

Reward Experience

Defines how the Customer experiences receiving rewards.

Supported modes:

* Standard Experience
* Surprise Experience

⸻

Standard Experience

The Customer receives the configured Reward immediately.

Example:

Purchase completed
→ 10 Reward Points added

⸻

Surprise Experience

The Customer receives a Reward Opportunity that may later be opened in the Customer App.

⸻

Reward Opportunity

One unopened opportunity to reveal an Instant Reward.

Each qualifying Event may generate one independent Reward Opportunity.

⸻

Instant Reward

A reward selected from a configured Reward Pool.

Examples:

* Bonus Reward Points
* Free Product
* Fixed Discount
* Percentage Discount
* Benefit

⸻

Reward Pool

A collection of possible Instant Rewards and their configured probabilities.

⸻

Reward Definition

The configuration of one possible reward.

It defines:

* reward type
* value
* probability
* validity
* redemption rules

⸻

Reward Goal

A customer-facing objective based on Reward progress.

Example:

180 points remaining until a free lunch

⸻

Reward Reservation

A temporary lock on Reward Points during redemption.

Reservation prevents the same points from being spent twice.

⸻

Reward Allocation

A record connecting consumed Reward Points to the original earned transactions.

It supports FIFO redemption and traceability.

⸻

XP and Engagement Terms

XP

Experience Points measuring Customer engagement.

XP:

* has no monetary value
* cannot be redeemed
* contributes to Membership Status

⸻

XP Account

The account belonging to one Membership that tracks XP projections.

⸻

XP Transaction

An immutable XP movement.

Examples:

* Purchase
* Visit
* Challenge
* Bonus
* Adjustment
* Reverse

⸻

Visit

A qualifying customer interaction with a Brand or Location.

A Receipt may generate a Visit, but Receipt and Visit are separate concepts.

⸻

Challenge

A defined objective that the Customer may complete.

Example:

Visit 4 times during one week

⸻

Progress

The measurable advancement toward:

* Reward Goal
* Challenge
* next Membership Status

Progress is mainly a customer-facing concept.

⸻

Benefit Terms

Benefit Definition

The reusable configuration of a Customer privilege.

Examples:

* Free Coffee
* 10% Discount
* Priority Reservation
* Exclusive Promotion

⸻

Benefit Grant

The assignment of one Benefit to one Membership.

⸻

Benefit

An active privilege available to a Membership.

A Benefit may originate from:

* Membership Status
* Instant Reward
* Campaign
* Birthday
* Manual Grant
* Partner Program

⸻

Benefit Redemption

The successful use of an active Benefit.

⸻

Transaction Terms

Receipt

An immutable record of a completed business purchase.

Receipt recording is the primary input for purchase-related loyalty processing.

⸻

Receipt Cancellation

A separate immutable operation that compensates the effects of an original Receipt.

Original Receipt data is never deleted or rewritten.

⸻

Pending Points

Earned Reward Points that are not yet available for redemption.

⸻

Available Points

Reward Points currently eligible for redemption.

⸻

Reserved Points

Reward Points temporarily locked for an active redemption process.

⸻

Automation Terms

Business Event

An immutable fact describing something that happened.

Examples:

* ReceiptRecorded
* RewardPointsEarned
* StatusUpgraded

⸻

Command

A request to perform a business action.

Examples:

* RecordReceipt
* JoinLoyaltyProgram
* CancelReceipt

Commands may succeed or fail.

Events describe successful facts.

⸻

Automation Rule

A configurable rule reacting to one Business Event.

A Rule contains:

* Trigger Event
* Conditions
* Actions
* Priority
* Active Period

⸻

Automation Engine

The component coordinating Event processing and Automation Rules.

It:

* receives Events
* matches Rules
* dispatches Actions
* tracks execution
* prevents loops
* stops when no Events remain

⸻

Execution

One complete Automation processing flow started by one Root Event.

⸻

Root Event

The first Event that started an Execution.

⸻

Parent Event

The Event that directly caused another Event to be created.

⸻

Business Engine

A component responsible for one business domain.

Examples:

* Reward Engine
* XP Engine
* Status Engine
* Benefit Engine
* Notification Engine

⸻

Strategy Terms

Strategy Template

A predefined recommendation based on a business goal or industry.

⸻

Business Strategy

The configuration accepted or modified by the Business from a Strategy Template.

⸻

Reward Strategy

The overall approach used to motivate Customers through Rewards.

Examples:

* spend-based
* visit-based
* product-count-based
* surprise-based

⸻

Deployment Terms

Marketplace

A shared Customer App containing multiple Brands and Loyalty Programs.

⸻

Private Brand

A dedicated branded Customer App displaying only one Brand.

⸻

Enterprise White Label

A fully branded deployment using the shared Platform backend and configurable modules.

⸻

Brand Configuration

Customer-facing visual and feature configuration.

Examples:

* Logo
* Colors
* Navigation
* Enabled Modules

⸻

Deployment Configuration

Configuration defining whether the Customer experience uses Marketplace, Private Brand or White Label mode.

⸻

Communication Terms

Notification

A communication request generated by a Business Event.

⸻

Notification Job

A queued record waiting for delivery.

⸻

Notification Worker

A background process responsible for sending Notification Jobs.

⸻

In-App Notification

A Notification stored and displayed inside the Customer App.

⸻

Transactional Notification

A message required for platform operation or transaction information.

⸻

Marketing Notification

A promotional message requiring appropriate Customer consent.

⸻

Data Terms

Ledger

An append-only history of immutable transactions.

Examples:

* Reward Ledger
* XP Ledger

⸻

Projection

A calculated or cached current state derived from immutable history.

Examples:

* Current Reward Balance
* Current XP
* Current Status

⸻

Aggregate

A domain boundary responsible for its own consistency.

⸻

Aggregate Ownership

Definition:

The exclusive responsibility of one Aggregate for maintaining consistency of its business entities and rules.

_____

Aggregate Root

The primary entity controlling access and changes within an Aggregate.

⸻

Source of Truth

The authoritative data or document used to determine correct behavior.

Business Rules and immutable transaction history are primary sources of truth.

⸻

Idempotency

The guarantee that repeated identical requests produce one business result.

⸻

Compensating Transaction

A new immutable transaction used to correct or reverse a previous transaction.

⸻

Tenant

A Business operating inside the multi-tenant Platform.

⸻

Tenant Isolation

The guarantee that one Business cannot access another Business’s protected data.

⸻

AI Development Terms

Blueprint

The complete set of approved product and architecture documents.

⸻

Skill

A reusable procedure explaining how an AI agent performs a specific type of task.

⸻

Project Knowledge

Project-specific facts, conventions and implementation context.

⸻

AI Agent

An execution component that uses:

* Blueprint
* Skills
* Project Knowledge
* Tools

to complete approved tasks.

⸻

Terminology Rules

* Use Reward Points, not generic Points, when referring to spendable loyalty value.
* Use XP only for engagement progression.
* Use Customer for the global person.
* Use Membership for participation in one Loyalty Program.
* Use Business for the legal or commercial tenant.
* Use Brand for the customer-facing identity.
* Use Receipt for a completed purchase record.
* Use Event only for an immutable fact that already occurred.
* Use Command for a requested business action.
* Use Benefit Definition for configuration.
* Use Benefit Grant for assignment to a Membership.

New domain terms must be added to this Glossary before implementation.