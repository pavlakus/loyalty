17 - Security

Purpose

This document defines the security architecture of the platform.

Security is considered a business requirement, not a technical feature.

Every component of the platform must follow the principles defined in this document.

⸻

Security Principles

The platform follows these principles:

* Zero Trust
* Least Privilege
* Defense in Depth
* Multi-Tenant Isolation
* Secure by Default
* Audit Everything

Security has priority over convenience.

⸻

Identity

Every actor inside the platform has an identity.

Supported identities:

* Customer
* Employee
* Manager
* Business Owner
* Platform Administrator
* API Client

Anonymous users have no business permissions.

⸻

Authentication

Customers

* Phone Number
* SMS OTP
* Viber OTP
* JWT Access Token
* Refresh Token

Business Users

* Phone or Email Login
* JWT Access Token
* Refresh Token

API Clients

* API Key
* Future OAuth2

Passwords are never required for Customers.

⸻

Authorization

Authorization is role-based.

Every request evaluates:

* identity
* tenant
* role
* assigned locations
* loyalty program permissions

Permission checks occur before entering Business Engines.

⸻

Tenant Isolation

Every Business is completely isolated.

No Business may access:

* Customers
* Transactions
* Memberships
* Reports
* Automations

belonging to another Business.

Tenant isolation is enforced at:

* API
* Business Engines
* Database

⸻

Row Level Security

Database Row Level Security (RLS) is mandatory.

Every tenant-owned table must enforce tenant isolation.

RLS is the final security layer.

Application logic must never replace database security.

Service-role operations must still validate tenant ownership and business authorization.

Database bypass permissions must never bypass business authorization.

⸻

Public Membership Token

Customers are identified using a Public Membership Token.

The token:

* contains no personal information
* is non-predictable
* is unique
* may be regenerated

Internal identifiers are never exposed publicly.

⸻

JWT

JWT contains only required claims.

Examples:

* User ID
* Business ID
* Role
* Session ID

Sensitive business data must never be embedded in tokens.

⸻

API Keys

Every Business Integration receives its own API Key.

API Keys:

* are unique
* are revocable
* are rotatable
* are scoped

Shared API Keys are not allowed.

⸻

Secrets

Secrets must never be stored in source code.

Secrets include:

* provider credentials
* JWT secrets
* API Keys
* encryption keys

Secrets are stored using secure platform configuration.

⸻

Encryption

Sensitive information must be encrypted.

Examples:

* provider credentials
* refresh tokens
* external integration tokens

Passwords (if ever introduced) must be hashed using strong adaptive algorithms.

⸻

Phone Verification

Phone numbers become trusted only after successful OTP verification.

Unverified numbers have limited capabilities.

OTP codes:

* expire automatically
* are single-use
* are never stored in plain text

⸻

Rate Limiting

Rate limiting protects:

* OTP endpoints
* Authentication
* Receipt Processing
* Reward Redemption
* Public APIs

Repeated abuse may temporarily block requests.

⸻

Idempotency

Financial operations must be idempotent.

Duplicate requests must never create duplicate business effects.

Examples:

* Reward earning
* Reward redemption
* Receipt cancellation

⸻

Audit Logging

Security-relevant actions are always audited.

Examples:

* Login
* Logout
* Permission Changes
* Manual Reward Adjustment
* Status Change
* API Key Creation
* Automation Changes

Audit records are immutable.

⸻

Device Registration

Customer devices are registered.

Each device stores:

* platform
* push token
* app version
* last active timestamp

Lost or inactive devices may be revoked.

⸻

Session Management

Sessions support:

* expiration
* refresh
* revocation
* device tracking

Compromised sessions can be invalidated immediately.

⸻

Data Privacy

Personal information is minimized.

Only required customer data is stored.

Public APIs never expose personal information unnecessarily.

The platform should support applicable privacy regulations.

⸻

Secure Event Processing

Business Events contain only required information.

Events must never expose:

* secrets
* authentication tokens
* provider credentials

Events remain immutable.

⸻

Notification Security

Notifications must never expose sensitive data.

Examples:

OTP:

Allowed.

Reward Balance:

Allowed.

Internal IDs:

Not allowed.

Access Tokens:

Never.

⸻

Integration Security

External integrations receive only the permissions they require.

Integrations are isolated by Business.

Every integration is auditable.

⸻

Logging

Application logs must never contain:

* OTP codes
* access tokens
* refresh tokens
* API keys
* secrets
* provider credentials

Sensitive values must be masked.

⸻

Disaster Recovery

The platform must support:

* automated backups
* recovery procedures
* audit preservation
* transaction recovery

Security events must survive disaster recovery.

⸻

Future Security Extensions

The architecture should support:

* MFA
* SSO
* OAuth2
* Device Trust
* Risk-based Authentication
* Enterprise Identity Providers

without architectural redesign.

⸻

Design Principles

Security is enforced at every layer.

No single component is trusted.

Business Rules are protected by authorization, tenant isolation, immutable transactions and comprehensive audit logging.

Security is a platform capability, not an optional feature.