34 - Event Storming - Customer Registration

Purpose

This document defines the complete business flow for customer registration and initial membership creation.

Registration is the first interaction between a Customer and the Platform.

The process must remain simple, secure and idempotent.

⸻

Business Goal

Allow a customer to create a platform account using a verified mobile phone number.

The customer should be able to immediately participate in one or more Loyalty Programs.

⸻

Participants

* Customer
* Authentication Service
* Membership Engine
* Notification Engine
* Audit Service

⸻

Preconditions

* Customer has a valid mobile phone number.
* Customer is not authenticated.
* Customer has installed the mobile application.

⸻

Business Flow

Customer starts registration
        ↓
Phone number entered
        ↓
OTP requested
        ↓
OTP verified
        ↓
Customer Account created
        ↓
Customer authenticated
        ↓
Registration completed

⸻

Commands

Request OTP

Command

RequestPhoneVerification

⸻

Verify OTP

Command

VerifyPhoneOTP

⸻

Create Customer

Command

CreateCustomer

⸻

Validations

Before creating a Customer:

* Phone number format is valid.
* OTP has not expired.
* OTP matches.
* OTP has not already been consumed.
* Phone number is not blocked.
* Rate limits are respected.

⸻

Business Rules

BR-001

A phone number uniquely identifies a Customer.

⸻

BR-002

A Customer Account exists independently from Loyalty Programs.

⸻

BR-003

Registration does not automatically create Memberships.

Memberships are created when the customer joins a Loyalty Program.

⸻

BR-004

Customer registration must be idempotent.

Submitting the same verified registration twice must never create duplicate Customers.

⸻

Domain Events

PhoneVerificationRequested

↓

PhoneVerificationSucceeded

↓

CustomerCreated

↓

CustomerAuthenticated

Business Events are published only after the corresponding Command has completed successfully.

Failed Commands never publish business events.

⸻

Engine Responsibilities

Authentication Service

* OTP
* Verification
* Session

Membership Engine

No action.

Memberships are not created during registration.

Notification Engine

Optional Welcome Message.

Audit Service

Record registration.

⸻

Notifications

Optional

Push

Welcome to the platform.

No Loyalty Program communication is sent at this stage.

⸻

Audit

Record:

* customer id
* phone number hash
* registration time
* device information
* IP address
* authentication method

⸻

Failure Scenarios

OTP expired

↓

Registration aborted

⸻

Invalid OTP

↓

Retry allowed according to rate limits

⸻

Blocked phone number

↓

Registration rejected

⸻

Duplicate request

↓

Existing Customer returned

⸻

API Mapping

POST /auth/request-otp

↓

PhoneVerificationRequested

POST /auth/verify-otp

↓

PhoneVerificationSucceeded

POST /customers

↓

CustomerCreated

⸻

Security

OTP expires after configurable duration.

OTP is single-use.

Rate limiting is mandatory.

Phone numbers must be normalized.

Sensitive information must never be logged in plaintext.

⸻

Test Scenarios

* Successful registration.
* Invalid phone number.
* Invalid OTP.
* Expired OTP.
* Duplicate registration.
* OTP reuse.
* Rate limit exceeded.
* Existing Customer login.

⸻

Expected Result

A verified Customer Account exists.

No Membership exists yet.

The customer is authenticated and ready to join one or more Loyalty Programs.