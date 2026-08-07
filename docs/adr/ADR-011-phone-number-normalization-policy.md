# ADR-011: Phone-Number Normalization Policy

## Status

Accepted

## Decision

Phone identities are persisted and compared only as valid E.164 values. International input must carry an explicit country calling code. National input is accepted only with an explicit ISO region context; there is no application-global default region or hardcoded country allowlist. Formatting characters may be removed by a mature standards-compliant parser. Extensions and vanity/alphanumeric values are rejected.

LP-001002 uses a provider-neutral phone-number value object and does not implement SMS, Viber, OTP, credentials, or sessions. Future tenant/business country restrictions require separate configuration and business rules.

## Security and privacy

Validation errors contain stable codes/messages only and never raw phone input. Phone numbers must not be logged or used as telemetry labels.

## Consequences

The platform depends on a standards-compliant parsing library and callers must provide region context for national formats. This avoids an unsafe global default and preserves country-code meaning.
