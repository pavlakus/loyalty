# Customer API and Event Contracts

## Scope

This document defines the public Customer contract surface for LP-002002. It does not implement HTTP handlers, persistence, authentication, event transport, RLS, or database migrations.

## API Surface

The Customer module owns these customer-facing endpoints:

| Method | Path | Contract |
|---|---|---|
| GET | `/api/v1/customers/me` | returns `CustomerProfile` in the standard API response envelope |
| PATCH | `/api/v1/customers/me` | accepts `CustomerProfileUpdateRequest` |
| POST | `/api/v1/customers/me/anonymize` | requests the approved anonymization command; no profile payload is accepted |
| GET | `/api/v1/customers/me/privacy` | returns `CustomerPrivacyState` |
| GET | `/api/v1/customers/me/export` | reserved until separate security and legal readiness; no implementation is authorized here |

`phone` is not an accepted update field. The `verified_phone` response is a privacy-safe representation owned and filtered by the Customer module; raw phone values must not be logged or exposed to unrestricted Business contexts.

The update contract permits only `first_name`, `last_name`, optional `email`, `birth_date`, and `preferred_language`. `birth_date` is the public API spelling from the authoritative API Blueprint; the domain model may retain its approved internal `date_of_birth` terminology.

## Stable Customer Errors

The contract exports the minimum stable Customer error shape defined by MIP-002. Error messages remain application-owned and must not expose personal data.

## Events

The Customer module publishes only these approved event types:

| Event | Payload |
|---|---|
| `CustomerRegistered` | `customer_id`, aggregate `version` |
| `CustomerProfileUpdated` | `customer_id`, aggregate `version`, non-sensitive `changed_fields` |
| `CustomerAnonymized` | `customer_id`, aggregate `version`, canonical `anonymized_at` |

Each payload is placed inside the existing versioned `EventEnvelope`. Payloads contain no phone number, email, birth date, raw profile, anonymization secret, or unnecessary tenant data. Events are emitted only after the owning command commits; transport and outbox behavior belong to later implementation tasks.

`CustomerAuthenticated` is intentionally not a Customer event; Authentication owns it.

## Validation and Compatibility

The shared packages export TypeScript contracts and narrow runtime validators. Validators reject unknown profile update fields, phone changes, malformed dates, invalid Customer event identity/version values, and malformed anonymization timestamps. They do not authorize callers, perform tenant checks, or persist data.
