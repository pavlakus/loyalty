# Customer Anonymization Strategy

## Purpose and boundary

This document defines the Customer module's privacy-preserving anonymization strategy. It is an architecture artifact for LP-002012; it does not implement a command, database migration, API route, event transport, deletion job, or production operation.

The strategy follows MIP-002: Customer is global, anonymization is irreversible, the stable internal surrogate remains available for referential integrity, and immutable business history is preserved.

## Result of anonymization

An authorized anonymization operation changes a Customer from `active` or `suspended` to `anonymized` and records `anonymized_at`. `anonymized` is terminal. Re-identification, identity merging, and restoration of direct identifiers are not supported without a future Product Decision.

The stable `customer_id` is retained so Memberships, ledger entries, receipts, events, audit records, and other historical references remain valid. It is an internal surrogate and is not a substitute for a public personal identifier.

Direct and optional personal data is removed or irreversibly replaced according to its retention purpose:

- verified phone identity linkage is severed and replaced by a non-identifying anonymization marker;
- email, display name, names, date of birth, profile image references, and other optional profile values are cleared or replaced with non-identifying values;
- raw phone numbers, email addresses, profile values, and replacement secrets are never written to logs, events, audit messages, projections, or error responses;
- the anonymization marker is deterministic for the Customer record but cannot be used to recover the original value.

No raw personal data is copied into an anonymized record, and no implementation may retain a reversible lookup table in the Customer module.

## Authorization and tenant boundary

Anonymization is a protected Customer operation. The application must establish the authenticated Customer context and invoke the Customer module's authorization guard; client-supplied tenant, ownership, role, or Customer identifiers are not trusted. A self-service flow requires the approved fresh authentication/OTP context. Any support or administrative route requires a separately approved support authorization and audit policy; this strategy does not create that route.

Business users retain only approved membership-scoped views and never receive unrestricted global Customer profile data. UI visibility is not authorization.

## Atomicity, idempotency, and concurrency

Anonymization is one serialized state transition. The implementation must coordinate it with profile updates using the aggregate version or equivalent database protection so a successful anonymization cannot be followed by a personal-data write. An anonymization request that loses the version race must fail safely and be retried through the approved application flow.

Repeated requests for the same already-anonymized Customer return the stable terminal result without restoring data, changing the anonymization marker, or emitting duplicate business effects. A request that targets a different Customer or lacks the required authorization is rejected; no client retry may bypass that check.

## Immutable history and projections

Reward Ledger, XP Ledger, receipts, receipt cancellation records, business events, audit history, and completed Membership Years are immutable. Anonymization never edits, deletes, or rewrites those records and does not change their amounts, dates, program ownership, or historical Customer surrogate references.

Customer profile projections and caches are rebuilt or invalidated so they contain no raw personal data. Rebuilds are privacy-safe and must not recreate direct identity linkage from historical data. Analytics and other projections consume only the approved privacy-safe contract owned by their module.

## Event and audit contract

After the anonymization state and personal-data changes commit successfully, the Customer module may publish the catalogued `CustomerAnonymized` fact through the approved transactional event flow. It contains the stable internal `customer_id`, event identity, tenant/program context where required, occurred time, correlation/causation context, and the new lifecycle state; it contains no phone, email, name, date of birth, raw profile values, or credentials.

The event is not published before commit. Delivery and handler idempotency, retry, replay, and outbox persistence belong to the later runtime implementation task. The operation records a privacy-safe audit entry containing actor/context, reason classification, result, and timestamps, never raw before/after values.

## Recovery and operational behavior

The operation is forward-recoverable. A failed request must not leave a partially anonymized profile that can be read as active. Recovery retries the same idempotent operation or applies an approved forward fix; it never restores personal data and never rolls back by re-identifying the Customer. Existing immutable history is preserved throughout recovery.

Production anonymization requires the separately required legal/privacy, security, QA, migration, monitoring, and release approvals. API export, credential changes, support workflows, and retention schedules remain separate contracts and are not introduced here.

## Explicit non-goals

This strategy does not define OTP delivery, authentication/session behavior, a public API shape, persistence schema or migration, RLS policy SQL, event transport, background jobs, deletion semantics, support tooling, legal retention policy, or production rollout commands. Those require their owning task and approvals.

## Command boundary (LP-002013)

The Customer anonymization command accepts only an authenticated actor/Customer context, a reason classification, and an expected aggregate version. It delegates the serialized state transition and direct-data removal to an atomic repository contract, records privacy-safe audit metadata, and publishes the existing `CustomerAnonymized` fact only after commit. Repeated terminal requests return the existing anonymized result without duplicate effects. This boundary does not provide persistence, session invalidation, outbox delivery, retention policy, or production release approval.
