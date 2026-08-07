# Customer Module and Privacy Runbook

## Purpose

The Customer module owns the global Customer identity and its privacy-sensitive profile lifecycle. Business-specific access is scoped by the authenticated application context; clients do not calculate or authorize Customer outcomes.

## Current capabilities

- Customer registration and verified-identity resolution use the approved Customer identity boundary.
- Profile values are validated through the API contract and profile-validation rules.
- Profile updates, preferred language, optional email management, suspension/reactivation, and anonymization use expected-version boundaries where applicable.
- Anonymization reaches the terminal `anonymized` state, records a classified audit fact, publishes the approved event after the operation, and prevents identity re-resolution.
- Audit records contain actor/context, action, target, reason, timestamp, and request identifiers—not before/after personal values.
- Customer observability uses fixed structured fields and rejects personal or secret identifiers in metric labels.

## Privacy rules

1. Treat Customer profile fields as personal data unless an approved contract classifies them otherwise.
2. Use authenticated actor and Customer context supplied by the application authorization boundary; never trust caller-supplied Business ownership or role claims.
3. Do not log raw phone numbers, email addresses, names, tokens, credentials, or arbitrary payloads.
4. Record anonymization as an immutable audit fact. Do not edit or delete prior audit history.
5. After anonymization, do not re-identify or recreate the Customer through the verified identity resolver.
6. Publish Customer events only after the underlying operation has committed.

## Operational handling

### Profile and lifecycle changes

Use the current Customer command boundary with the expected aggregate version. A stale version is a conflict and must be retried by the caller using a fresh read; it must not be silently overwritten.

### Anonymization

Validate the authenticated actor, Customer identity, reason classification, and expected version. On success, verify the terminal anonymized state, append the privacy-safe audit fact, and publish the anonymization event. Repeated terminal requests must not create duplicate side effects when the repository reports `changed: false`.

### Observability

Use the fixed Customer log shape: event, outcome, correlation ID, Customer ID where allowed, duration, and stable error code. Metrics may use approved aggregate labels only. Investigations must use correlation/request identifiers and audit classifications, never raw profile values.

## Deferred boundaries

- Authentication integration remains pending the Authentication module foundation.
- Database schema, RLS, and purpose-scoped database access remain pending the approved database/RLS foundation and PostgreSQL-backed validation.
- The runbook does not claim production deployment, live database validation, or legal/privacy release approval.

## Evidence and validation

See the LP-002020 evidence package for privacy/anonymization test coverage and the preceding Customer task evidence for implementation-specific behavior. Scoped API-contract and FCR artifact validation can be run with the repository’s available tooling; the known API workspace Node-type/package-link baseline must be reported when it prevents compiled API tests.

## Recovery principles

Use compensating records for corrections to immutable audit/event history. Do not manually rewrite Customer history or bypass the owning module. Escalate any request to restore raw personal data after anonymization as a product/privacy decision.
