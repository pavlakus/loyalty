44 - Permission Matrix

Purpose

This document defines which roles may perform each platform action.

Permissions must be enforced consistently in:

* API authorization
* Business Engines
* Database Row Level Security
* Business Portal
* Mobile Applications
* Audit Logs

UI visibility is not a security control.

⸻

Core Principles

* Deny by default.
* Grant only required permissions.
* Tenant isolation is mandatory.
* Location restrictions apply to Employees.
* Customers access only their own data.
* Sensitive actions require audit logging.
* Platform Support access must be temporary and traceable.
* No role may directly modify immutable ledgers or Events.

⸻

Roles

Customer

A platform user participating in Loyalty Programs.

⸻

Employee

A Business User performing daily loyalty transactions at assigned Locations.

⸻

Manager

A Business User managing operations, customers and limited Loyalty configuration.

⸻

Business Owner

The primary administrator of one Business and its Brands.

⸻

Platform Support

A Platform User providing controlled customer support.

Access must be temporary, justified and audited.

⸻

Platform Admin

A Platform User managing the entire SaaS platform.

⸻

Integration Client

An external POS or approved system using a scoped API Key.

⸻

Scope Levels

Permissions may be limited to:

* Own Account
* Own Membership
* Assigned Location
* Assigned Brand
* Own Business
* Platform

⸻

Customer Permissions

Action	Customer
View own profile	Allow
Update own profile	Allow
Change phone number directly	Deny
Request account anonymization	Allow
View own Memberships	Allow
Join active Loyalty Program	Allow
Leave or close Membership	Future
View own Reward balance	Allow
View own XP and Status	Allow
View own transaction history	Allow
View own Benefits	Allow
Open own Instant Reward	Allow
Select own Reward Goal	Allow
View own Challenges	Allow
Redeem Reward Points directly	Conditional
Redeem own Benefit	Conditional
View another Customer	Deny
Modify Reward Points	Deny
Modify XP	Deny
Modify Status	Deny
Access Business Portal	Deny

Conditional redemption requires the approved Customer or Employee workflow and backend validation.

⸻

Employee Permissions

Action	Employee
Access Employee App	Allow
Resolve Membership QR	Assigned Locations only
View limited Customer loyalty data	Assigned Locations only
View Customer phone or private data	Deny
Preview Receipt outcome	Assigned Locations only
Record Receipt	Assigned Locations only
Process Reward redemption	Assigned Locations only
Redeem Benefit	Assigned Locations only
Cancel own recent Receipt	Configurable
Cancel any Location Receipt	Deny by default
View recent Location transactions	Allow
View full Customer history	Deny
Create manual Reward adjustment	Deny
Create manual XP adjustment	Deny
Change Membership Status	Deny
Configure Loyalty Program	Deny
Manage Automations	Deny
View Business analytics	Deny by default
Manage Employees	Deny
Manage API Keys	Deny

⸻

Manager Permissions

Action	Manager
All Employee operational actions	Allow
Access assigned Brand operations	Allow
View Customer loyalty history	Own Business
Cancel Receipt	Own Brand or assigned Locations
Create manual Reward adjustment	Configurable
Create manual XP adjustment	Configurable
Request manual Status adjustment	Configurable
Approve own adjustment request	Deny
Manage Locations	Configurable
Invite Employees	Configurable
Assign Employee Locations	Configurable
Configure Reward Rules	Configurable
Configure XP Rules	Configurable
Configure Status Levels	Configurable
Configure Benefits	Configurable
Manage Automation Templates	Allow if granted
View Business analytics	Allow
Export reports	Allow if granted
Manage Loyalty Network	Deny by default
Manage API Keys	Deny by default
Manage Billing	Deny
Delete Business	Deny

Sensitive permissions may be disabled by the Business Owner.

⸻

Business Owner Permissions

Action	Business Owner
Manage Business profile	Allow
Create and manage Brands	Allow
Manage Locations	Allow
Manage Employees and Managers	Allow
Assign roles and permissions	Allow
Configure Loyalty Program	Allow
Configure Reward Experience	Allow
Configure Reward and XP Rules	Allow
Configure Status Levels	Allow
Configure Benefits	Allow
Configure Automations	Allow
Configure Instant Rewards	Allow
Manage Strategy Templates	Allow
View all Business analytics	Allow
View Business audit records	Allow
Create manual adjustments	Allow
Approve sensitive adjustments	Allow
Manage Loyalty Networks	Allow
Manage Integration API Keys	Allow
Manage notification configuration	Allow
Manage Brand Configuration	Allow
Manage Deployment Configuration	Allow
Manage Billing and Subscription	Allow
Access another Business	Deny
Modify immutable ledger records	Deny
Delete immutable history	Deny

⸻

Platform Support Permissions

Action	Platform Support
Search Business account	Allow
View platform account status	Allow
Access Business data automatically	Deny
Request temporary support access	Allow
View data during approved support session	Scoped
Change Business configuration	Deny by default
Transfer Customer phone identity	Special workflow
Perform financial adjustment	Deny
View secrets or API Keys	Deny
Impersonate Business User silently	Deny
View Audit Log	Support scope only
Close support session	Allow

Support access requires:

* Business justification
* approved scope
* expiration time
* complete audit trail

⸻

Platform Admin Permissions

Action	Platform Admin
Manage Platform configuration	Allow
Manage Businesses	Allow
Manage subscriptions and plans	Allow
Suspend Business	Allow
Access tenant data	Controlled and audited
Manage Platform roles	Allow
Review security incidents	Allow
Review global operational metrics	Allow
Manage provider integrations	Allow
Modify immutable business history	Deny
Directly edit Reward balances	Deny
Bypass audit logging	Deny
View plaintext secrets	Deny

Platform Admin privileges do not bypass immutable ledger rules.

⸻

Integration Client Permissions

Every Integration Client uses explicit scopes.

Possible scopes:

receipts:write
receipts:read
receipts:cancel
memberships:resolve
redemptions:preview
redemptions:reserve
redemptions:confirm
webhooks:manage

Default:

No scopes

An Integration Client may:

* operate only within its Business;
* operate only for assigned Brands or Locations;
* access only endpoints covered by its scopes;
* never access Business Portal administration;
* never directly modify Reward or XP ledgers.

⸻

Sensitive Actions

The following actions require enhanced controls:

* Manual Reward adjustment
* Manual XP adjustment
* Manual Status change
* Receipt cancellation
* API Key creation
* API Key rotation
* Role change
* Loyalty Network agreement
* Customer identity transfer
* Business suspension
* Account anonymization

Enhanced controls may include:

* fresh authentication;
* OTP confirmation;
* reason;
* second-person approval;
* immutable audit record.

⸻

Adjustment Approval

Recommended separation:

Requester
≠
Approver

For MVP, Business Owner may approve Manager requests.

A user must not approve their own sensitive adjustment where approval is enabled.

⸻

Location Restrictions

Employees and restricted Managers may act only within assigned Locations.

Location validation applies to:

* Membership lookup
* Receipt recording
* Receipt cancellation
* Redemption
* Benefit use
* Transaction history

Location permissions must be checked on the backend and in RLS.

⸻

Brand Restrictions

A Business User may be assigned to:

* one Brand;
* multiple Brands;
* all Brands inside the Business.

Access to one Brand does not automatically grant access to another Brand.

⸻

Loyalty Network Permissions

Only Business Owners or explicitly authorized Managers may:

* create Network invitations;
* accept partnerships;
* configure redemption direction;
* configure conversion rules;
* deactivate participation;
* leave a Network.

Partner Businesses never receive access to each other’s internal Customer or operational data.

⸻

Data Visibility

Customer Data Visible to Employee

Allowed:

* display name;
* Membership Status;
* Reward balance;
* Pending balance;
* active Benefits;
* transaction outcome.

Not allowed by default:

* full phone number;
* email;
* birth date;
* notification preferences;
* activity in unrelated Loyalty Programs.

⸻

Immutable Data Permissions

No role may update or delete:

* Reward Transactions;
* XP Transactions;
* Receipts;
* Receipt Cancellations;
* Business Events;
* Status History;
* Audit Records;
* completed Membership Years.

Corrections use compensating transactions or new Events.

⸻

RLS Requirements

Every tenant-owned table must validate Business access.

Every Membership-owned table must validate either:

* authenticated Customer ownership; or
* authorized Business relationship.

Service-role operations must still validate Business Rules before execution.

Using service credentials bypasses database Row Level Security but never bypasses application-level authorization, tenant ownership validation or domain business rules.

Service credentials must never be exposed to clients.

⸻

Audit Requirements

Audit records are mandatory for:

* permissions changes;
* employee invitations;
* manual adjustments;
* Receipt cancellation;
* Loyalty configuration changes;
* API Key operations;
* Network changes;
* support access;
* Customer anonymization;
* identity transfer.

Audit records store:

* actor;
* role;
* Business;
* action;
* target entity;
* reason;
* timestamp;
* request identifier;
* previous and new configuration where applicable.

⸻

Permission Error Codes

Standard authorization errors:

UNAUTHORIZED
FORBIDDEN
TENANT_ACCESS_DENIED
LOCATION_ACCESS_DENIED
BRAND_ACCESS_DENIED
INSUFFICIENT_ROLE
MISSING_API_SCOPE
SUPPORT_ACCESS_EXPIRED
FRESH_AUTHENTICATION_REQUIRED
APPROVAL_REQUIRED

Authorization failures must not reveal whether inaccessible resources exist.

⸻

Permission Testing Requirements

Mandatory tests include:

* Customer accessing another Customer Membership.
* Employee accessing an unassigned Location.
* Employee reading private Customer data.
* Manager using an ungranted configuration permission.
* Business Owner accessing another Business.
* Integration Client using a missing scope.
* Partner accessing another partner’s internal data.
* Support accessing data without an active support session.
* Platform Admin attempting direct ledger mutation.
* RLS denial for direct unauthorized database access.

⸻

Design Principle

Permissions describe what an actor may do.

Business Rules determine whether the action is valid.

Both authorization and business validation must succeed before any business effect is created.