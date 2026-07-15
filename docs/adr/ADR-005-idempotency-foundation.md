# ADR-005: Idempotency Foundation

## Status

Accepted

## Date

2026-07-15

## Context

Critical platform commands include receipt recording, receipt cancellation, reward earning, redemption, benefit redemption, instant reward opening, automation execution and notification enqueueing. The Blueprint requires duplicate and parallel requests to produce one business outcome.

## Problem

Network retries, client double-submission, worker retry and integration callbacks can repeat the same command. Without a reusable idempotency foundation, modules may implement inconsistent behavior and duplicate financial or loyalty effects.

## Decision

Create a reusable idempotency foundation backed by PostgreSQL. Each critical command must define an idempotency scope containing:

- tenant or Business;
- command type;
- actor or integration client;
- relevant resource where applicable;
- client-provided or derived idempotency key;
- request hash.

The idempotency record must store state, request hash, result reference or approved response snapshot, failure classification, creation time and completion time. Same key with same request returns the original result. Same key with a different request returns conflict. Parallel requests must be protected with a unique constraint and transactional claim or lock.

Retention is configurable by command category. Financial, ledger, Receipt, redemption and other irreversible operations require long-lived or permanent idempotency evidence according to retention policy. Short-lived nonfinancial requests may use bounded retention. Records must not expire while safe retry may still occur.

`PENDING` records must include owner or claim identity and heartbeat or update time. A configurable timeout identifies abandoned processing. Timeout alone does not automatically execute the command again without atomic recovery ownership.

Abandoned claim recovery must be atomic. Exactly one worker or request may take over an abandoned claim. The recovery action is audited. Completed results remain immutable.

Response snapshots store only the minimum safe response required for deterministic replay. They must never store secrets, raw OTP values, access tokens, refresh tokens or unnecessary personal data. Where a full response cannot be safely persisted, the record stores a result reference and reconstructs the approved response.

Permanent business failures may be stored as completed deterministic outcomes where repeat requests must return the same result. Temporary infrastructure failures remain retryable and must not be treated as successful completion.

## Alternatives Considered

- Per-module ad hoc idempotency: flexible but inconsistent and hard to audit.
- Client-only duplicate prevention: useful for UX but not a security or correctness control.
- Rely only on natural unique constraints: helps some resources, but does not classify retries or provide stable duplicate responses.
- In-memory request cache: fast but unsafe across process restarts and horizontal scaling.

## Rationale

A shared idempotency foundation standardizes critical command behavior while leaving business decisions in owning modules. PostgreSQL persistence keeps behavior durable across retries, crashes and worker restarts.

## Positive Consequences

- Duplicate and parallel critical commands produce one business result.
- Error behavior is consistent across modules.
- Audit and support can explain duplicate request outcomes.
- Integration clients can safely retry after timeout.

## Negative Consequences and Tradeoffs

- Every critical command must design its scope carefully.
- Response snapshot storage must avoid sensitive data.
- Long-running commands need explicit pending and recovery states.
- Incorrect request hashing can create false conflicts or false duplicates.

## Implementation Impact

- Add an idempotency table or tables in foundation migrations.
- Provide shared application interfaces for idempotency claim, complete, fail and replay.
- Require each LP task for critical commands to define scope and duplicate behavior.
- Integrate idempotency with transaction boundaries and outbox insertion.

## Security Impact

- Idempotency keys must be scoped by tenant and actor to prevent cross-actor replay.
- Response snapshots must not store secrets or unnecessary personal data.
- Attackers must not be able to probe resource existence through idempotency conflicts.
- Rate limiting remains required for abuse-prone endpoints.

## Testing Impact

- Test same key and same payload returns the original result.
- Test same key and different payload returns conflict.
- Test parallel duplicate requests produce exactly one business execution.
- Test retry after timeout resolves safely.
- Test failure classifications do not create duplicate work.

## Migration or Adoption Impact

Foundation provides the shared infrastructure. Business modules adopt it as critical commands are implemented. Existing commands without idempotency cannot be considered complete where the MIP or Blueprint requires it.

## Related Blueprint Documents

- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`
- `docs/blueprint/43-api-contract.md`
- `docs/blueprint/44-permission-matrix.md`

## Related Engineering Documents

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
