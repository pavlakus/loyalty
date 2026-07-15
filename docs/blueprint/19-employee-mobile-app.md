19 - Employee Mobile App

Purpose

The Employee Mobile App enables employees to process loyalty transactions quickly, accurately and with minimal training.

The application is designed as a companion to the existing POS system, not as its replacement.

Its primary goal is to complete customer identification and loyalty processing in less than 15 seconds.

⸻

Design Principles

The Employee App follows these principles:

* Speed First
* Minimal Interaction
* Error Prevention
* Simplicity
* Reliability

Every unnecessary screen should be eliminated.

⸻

Primary Workflow

The employee workflow consists of:

Customer Identification

↓

Receipt Entry

↓

Reward Preview

↓

Confirmation

↓

Completed

This workflow should require only a few interactions.

⸻

Authentication

Employees authenticate using:

* Phone or Email
* Password or OTP (configurable)
* JWT Session

Sessions remain active until revoked or expired.

⸻

Home Screen

The Home Screen provides immediate access to:

* Scan Customer QR
* Search Customer
* Enter Receipt
* Recent Transactions
* Offline Status (future)

No business statistics are shown.

⸻

Customer Identification

Supported methods:

* QR Code Scan
* Manual Membership Number
* Phone Number Search (optional)

QR scanning is the preferred method.

The Public Membership Token is used for identification.

⸻

Customer Lookup

After identification the employee immediately sees:

* Customer Name
* Current Membership Status
* Available Reward Points
* Pending Reward Points
* Active Benefits

The employee never sees unnecessary personal information.

⸻

Receipt Entry

The employee enters:

* Receipt Amount

Optionally:

* Receipt Number (manual mode)
* Notes

The application calculates nothing.

All calculations are performed by the platform.

⸻

Reward Preview

Before confirmation the application displays:

* Earned Reward Points
* Earned XP
* Status Changes (if any)
* Active Benefits
* Pending Period (if applicable)

The employee can explain the outcome to the customer before confirming.

The preview is informational only.

Business calculations remain provisional until the transaction is confirmed.

⸻

Reward Redemption

When the customer chooses to redeem Reward Points:

The employee selects:

Redeem Reward Points

↓

The platform calculates:

* maximum redeemable value
* Reward Points consumed
* remaining Reward Points
* final discount

The employee never calculates discounts manually.

The final decision remains with the employee before confirmation.

⸻

Receipt Cancellation

Employees may reverse a previously processed receipt.

The application requires:

* Receipt Number
* Reason

The platform performs the reversal.

Employees never edit Reward Transactions manually.

⸻

Transaction Confirmation

After successful processing the application displays:

* Success
* Earned Reward Points
* Earned XP
* Updated Balance
* Updated Status (if changed)

The result should be easy to explain to the customer.

⸻

Error Handling

Examples:

Customer Not Found

↓

Offer Registration

Insufficient Reward Points

↓

Explain Reason

Receipt Already Processed

↓

Display Existing Transaction

Errors should be understandable without technical knowledge.

⸻

Transaction History

Employees may view recent transactions for verification purposes.

Displayed information includes:

* Date
* Customer
* Receipt Amount
* Reward Points
* Status

Editing history is not allowed.

⸻

Manual Adjustments

Manual Reward or XP adjustments require elevated permissions.

Only authorized users may perform:

* Reward Adjustments
* XP Adjustments
* Status Changes

Every manual action is audited.

⸻

Security

Employees may access only:

* assigned Businesses
* assigned Locations
* authorized Loyalty Programs

Customer personal information is minimized.

⸻

Performance

Target response time:

Customer Lookup

< 300 ms

Receipt Processing

< 500 ms

The application must feel instantaneous during customer interaction.

⸻

Future POS Integration

The application is designed to work independently.

Future versions may support:

* POS initiated transactions
* automatic receipt import
* automatic redemption
* receipt synchronization

These integrations must not change the employee workflow.

⸻

Future Offline Support

Future versions may support:

* offline customer lookup cache
* queued transactions
* automatic synchronization

Offline mode is not part of the MVP.

⸻

Success Metrics

The Employee App is successful when:

* new employees learn it within minutes
* loyalty processing takes less than 15 seconds
* transaction errors are rare
* employees trust the system
* customers do not experience delays during payment

The Employee App should reduce operational effort rather than introduce additional complexity.