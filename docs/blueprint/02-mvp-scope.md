02 - MVP Scope

Purpose

This document defines exactly what belongs to the first production release (MVP).

Anything not explicitly listed here is considered out of scope and belongs to a future release.

The primary objective of the MVP is validation of the business model, not feature completeness.

⸻

MVP Goals

The MVP must allow a business to:

* Create a loyalty program.
* Register employees.
* Register customers.
* Award Reward Points.
* Redeem Reward Points.
* Configure status levels.
* View customer progress.
* Launch basic automations.
* View business analytics.

⸻

Customer Mobile App

Authentication

Included:

* Phone number login
* SMS OTP
* Viber OTP (when available)
* Passwordless authentication

Not included:

* Email login
* Password login
* Social login

⸻

Customer Profile

Included:

* Name
* Phone Number
* Membership Status
* Reward Points
* Pending Points
* XP
* Progress to Next Status

⸻

Digital Membership Card

Included:

* QR Code
* Public Membership Token

Not included:

* NFC
* Apple Wallet
* Google Wallet

⸻

Loyalty

Included:

* Current Reward Points
* Pending Reward Points
* Transaction History
* Point Expiration
* Redeem History

⸻

Gamification

Included:

* XP
* Status
* Progress Bar
* Current Benefits

Not included:

* Badges
* Collections
* Achievements
* Leaderboards

⸻

Employee Application

Included:

* Employee Login
* QR Scanner
* Customer Identification
* Receipt Amount Entry
* Earn Points
* Redeem Points
* Transaction Confirmation

Not included:

* POS Integration
* Offline Mode

⸻

Business Portal

Included:

Business

* Company Profile
* Locations
* Employees

⸻

Loyalty Configuration

* Reward Point Rules
* Point Expiration
* Pending Period
* Status Levels
* Benefits

⸻

Automation Templates

Included:

* Welcome Bonus
* Birthday Bonus
* Happy Hour
* Double Points
* Spend Bonus
* Visit Challenge

Not included:

* Visual Rule Builder
* Advanced Automation Editor

⸻

Dashboard

Included:

* Customers
* Transactions
* Earned Points
* Redeemed Points
* Pending Points
* Active Members
* Status Distribution

⸻

Platform

Included:

* Multi-Tenant
* API
* Notifications
* Audit Log
* Event Bus
* Automation Engine

⸻

Shared Loyalty Network

Included:

* Shared redemption
* Partner businesses
* Temporary partnerships
* Cross-business redemption tracking

Not included:

* Financial settlement
* Automatic invoicing between partners

⸻

Notification Channels

Included:

* SMS
* Viber
* Push Notifications

Not included:

* Email Marketing
* WhatsApp
* Messenger

⸻

Security

Included:

* Phone OTP
* JWT Authentication
* Audit Log
* Role Based Permissions

⸻

Analytics

Included:

Business Dashboard

Customer Statistics

Transaction Reports

Status Reports

Automation Statistics

⸻

API

Included:

Public REST API

Authentication

Receipt Processing

Customer Lookup

Reward Transactions

⸻

Explicitly Out of Scope

The following features are intentionally postponed.

POS Integration

Supported through API only.

No direct integrations in MVP.

⸻

AI Features

No AI recommendations.

No AI personalization.

No AI segmentation.

⸻

Marketing Automation

Campaign Builder

Customer Segmentation

Marketing Journeys

⸻

Advanced Gamification

Badges

Achievements

Leaderboards

Daily Missions

Season Pass

⸻

Rule Builder

Visual Rule Builder

Blockly Editor

Drag & Drop Automation

⸻

White Label

Custom Branding

Separate Mobile Applications

Custom Domains

⸻

Settlement

Automatic settlement between partner businesses.

Financial reconciliation.

Invoices.

⸻

Enterprise Features

SSO

LDAP

Advanced Audit

Organization Hierarchy

Custom Integrations

⸻

MVP Success Criteria

The MVP is considered successful when:

* A business can configure a loyalty program in less than one hour.
* Customers can register in less than one minute.
* Employees can process a loyalty transaction in less than 15 seconds.
* Businesses can launch at least one automation without technical assistance.
* Customers return to the application regularly because of progress tracking and rewards.

Feature completeness is not the goal.

Fast validation, stability and simplicity are the priorities.
