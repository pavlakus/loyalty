14 - Loyalty Network

Purpose

The Loyalty Network enables multiple Loyalty Programs to cooperate while preserving ownership and traceability of Reward Points.

It allows customers to redeem Reward Points across participating businesses without transferring ownership of those points.

The Loyalty Network never changes how Reward Points are earned.

It only defines where they may be redeemed.

⸻

Core Principles

Reward Points always belong to the Loyalty Program where they were earned.

The Loyalty Network grants redemption rights.

It never transfers ownership.

Every cross-program redemption must remain fully traceable.

⸻

Network Structure

A Loyalty Network contains:

* one or more Businesses
* one or more Loyalty Programs
* participating Locations
* redemption rules
* conversion rules
* active period

Businesses may join or leave a Network.

⸻

Supported Scenarios

Same Business

One owner operates:

* Coffee Shop
* Restaurant
* Children’s Playground

All locations participate in one Loyalty Network.

Customers may redeem Reward Points at any participating location.

⸻

Partner Businesses

Two or more independent businesses agree to cooperate.

Example:

Restaurant

Beauty Salon

Customers may redeem Reward Points between participating businesses.

Ownership remains unchanged.

⸻

Temporary Partnership

Businesses may create temporary Loyalty Networks.

Example:

Summer Promotion

01 June

↓

31 August

After expiration, cross-redemption automatically stops.

⸻

Redemption Model

Reward Points continue to belong to the Origin Loyalty Program.

The Loyalty Network only authorizes redemption.

Every redemption stores:

Origin Loyalty Program

Redeem Loyalty Program

Business

Location

Conversion Rule

Settlement Value

⸻

Conversion Rules

Networks may define conversion policies.

Examples:

1 Point = 1 Point

100 Coffee Points = 80 Restaurant Points

100 Reward Points = 100 RSD Discount

The conversion rule is configured by the Network.

⸻

Redemption Permissions

The Network defines:

* allowed redemption locations
* allowed businesses
* allowed Loyalty Programs
* maximum redemption amount
* redemption direction

⸻

Redemption Direction

Supported modes:

Incoming

Outgoing

Bidirectional

Examples:

Coffee Shop

↓

Restaurant

Restaurant

↓

Coffee Shop

or

Both directions

⸻

Network Membership

Every participating Loyalty Program stores:

* activation date
* expiration date
* status
* conversion rule
* redemption permissions

Network Membership may be enabled or disabled without deleting history.

⸻

Traceability

Every redemption stores:

* where Reward Points were earned
* where Reward Points were redeemed
* originating Business
* redeeming Business
* originating Loyalty Program
* redeeming Loyalty Program
* conversion rule
* settlement value

Nothing is hidden.

Everything is auditable.

⸻

Settlement Support

The Loyalty Network prepares data for future financial settlement.

The MVP stores:

* settlement value
* originating Business
* redeeming Business

Automatic settlement is not performed in MVP.

Settlement readiness data must remain immutable so that future Settlement implementations can reproduce financial calculations without modifying historical Reward Transactions.

⸻

Network Events

Examples:

Network Created

Business Joined

Business Left

Network Activated

Network Deactivated

Cross Redemption Completed

These Events may trigger Automations.

⸻

Customer Experience

Customers do not need to understand the Network.

The Customer App simply shows:

* where Reward Points can be redeemed
* participating businesses
* available benefits

Cross-redemption should feel seamless.

⸻

Business Dashboard

Businesses can view:

* Reward Points earned
* Reward Points redeemed
* Cross-business redemptions
* Incoming partner customers
* Outgoing partner customers
* Estimated settlement value

⸻

Security

Businesses may never access internal data belonging to partner Businesses.

Only redemption data relevant to the transaction is shared.

Customer privacy must always be preserved.

⸻

Future Extensions

The Loyalty Network should support:

* Franchise Networks
* Shopping Centers
* City-wide Loyalty Programs
* Tourism Programs
* Regional Partnerships
* National Loyalty Networks

These extensions must not require redesign of Reward Accounts or Reward Transactions.

⸻

Design Principles

Businesses cooperate.

Reward Points do not change ownership.

Cross-redemption remains fully auditable.

The Loyalty Network extends loyalty without compromising financial traceability.