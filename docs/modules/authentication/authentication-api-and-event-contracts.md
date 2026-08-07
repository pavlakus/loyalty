# Authentication API and Event Contracts

## Scope

This contract defines the initial customer-facing authentication boundary. It does not implement OTP storage, delivery providers, hashing, rate limiting, sessions, tokens, or runtime authorization.

## API contracts

- `POST /auth/request-otp`: accepts the approved phone number, preferred SMS/Viber channel, and device identifier; returns the standard API response/error envelope.
- `POST /auth/verify-otp`: accepts phone number, OTP code, and device identifier; returns the approved access token, refresh token, Customer representation, and account-exists result.
- `POST /auth/refresh`: accepts a refresh token and returns rotated access/refresh credentials.
- `POST /auth/logout`: revokes the current session.

Transport validation, stable errors, rate limits, expiry, one-time use, hashing, and authorization are runtime responsibilities of later Authentication tasks.

## Events

The Authentication module may publish the approved facts:

- `PhoneVerificationRequested`
- `PhoneVerificationSucceeded`
- `PhoneVerificationFailed`
- `CustomerAuthenticated`
- `CustomerLoggedOut`

Events carry the standard envelope, correlation/causation context, and only the fields approved by the event catalog. They are emitted after the corresponding successful transaction and contain no OTP, token, or raw credential.

## Ownership and security

Authentication resolves the global Customer identity but does not own Customer profile data, Business ownership, permissions, or loyalty behavior. Clients cannot select a Customer identity, role, tenant, or authorization outcome. Credential and token values are never logged or included in Events.

## Deferred implementation

OTP generation/storage, provider adapters, rate limiting, session persistence, access-token issuance, refresh rotation, logout revocation, and security telemetry are separate implementation tasks.
