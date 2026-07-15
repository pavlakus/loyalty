# Codex Prompt — LP-000001 Correction

Paste the text below into Codex from the repository root, on the existing branch:

`agent/architect/LP-000001-foundation-adrs`

---

Read `AGENTS.md` first.

You are continuing task `LP-000001` as the Solution Architect Agent.

The independent architecture review returned `CHANGES REQUIRED`.

Read:

- `implementation/tasks/platform-foundation/LP-000001-approve-platform-foundation-adr-set.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/engineering/52-repository-structure.md`
- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`
- `docs/adr/ADR-002-modular-monolith-backend.md`
- `docs/adr/ADR-003-postgresql-and-supabase-compatible-data-platform.md`
- `docs/adr/ADR-004-transactional-outbox.md`
- `docs/adr/ADR-005-idempotency-foundation.md`
- `docs/adr/ADR-006-observability-and-correlation-context.md`
- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-008-cross-platform-mobile-architecture.md`
- `docs/adr/ADR-INDEX.md`

Apply only the exact corrections below.

## 1. Standardize ADR Directory

The canonical ADR directory is:

`docs/adr/**`

Update all affected references in:

- `implementation/tasks/platform-foundation/LP-000001-approve-platform-foundation-adr-set.md`
- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/engineering/52-repository-structure.md`

Replace references to:

`docs/decisions/**`

with:

`docs/adr/**`

Do not move the existing ADR files.

## 2. Standardize ADR-008 Filename

The canonical file name is:

`ADR-008-cross-platform-mobile-architecture.md`

Update every affected reference, including:

- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/adr/ADR-INDEX.md`
- any other exact project reference found by repository search.

Do not rename the existing ADR-008 file.

## 3. Correct LP-000001 Task Metadata

Update:

`implementation/tasks/platform-foundation/LP-000001-approve-platform-foundation-adr-set.md`

Required changes:

- change Status from `DRAFT` to `IN_PROGRESS`;
- make `docs/adr/**` the allowed documentation scope;
- replace generic “relevant accepted ADRs” wording with the exact ADR-001 through ADR-008 file list;
- set Dependencies to:
  - `MIP-000-platform-foundation.md`
  - relevant Blueprint and Engineering documents listed by the task
  - no previous LP task dependency;
- do not mark the task `DONE`;
- do not mark it `READY_FOR_MERGE` yet.

## 4. Complete ADR-004 Transactional Outbox Decision

Update:

`docs/adr/ADR-004-transactional-outbox.md`

Add explicit decisions for:

### Ordering Scope

- preserve ordering only within the same aggregate stream when business correctness requires it;
- do not guarantee global ordering across unrelated aggregates or Businesses;
- every outbox record must contain aggregate type, aggregate ID and aggregate version or equivalent ordering metadata.

### Atomic Claim

- workers must claim rows atomically;
- use a PostgreSQL-safe claim pattern such as `FOR UPDATE SKIP LOCKED` or an equivalent atomic database function;
- claimed rows must record worker/claim identity and claim time;
- the same row must not be processed concurrently by multiple workers.

### Replay

- replay must be explicit and auditable;
- replayed events retain original Event ID and business occurrence time;
- consumers remain idempotent;
- replay must not create duplicate customer-visible or financial side effects.

### Dead-Letter Recovery

- permanent failures move into a visible failed/dead-letter state;
- ownership of recovery belongs to Platform Operations or Release/Support tooling;
- recovery requires reason, actor, timestamp and retry evidence;
- recovery never rewrites the original Event payload.

### Retry

- temporary failures use bounded exponential backoff with jitter;
- retry count and next attempt time are persisted;
- poison messages cannot block unrelated Event processing.

## 5. Complete ADR-005 Idempotency Decision

Update:

`docs/adr/ADR-005-idempotency-foundation.md`

Add explicit decisions for:

### Retention

- retention is configurable by command category;
- financial, ledger, Receipt, redemption and other irreversible operations require long-lived or permanent idempotency evidence according to retention policy;
- short-lived nonfinancial requests may use bounded retention;
- records must not expire while safe retry may still occur.

### Pending Timeout

- `PENDING` records must include owner/claim identity and heartbeat or update time;
- a configurable timeout identifies abandoned processing;
- timeout alone does not automatically execute the command again without atomic recovery ownership.

### Abandoned Claim Recovery

- recovery must be atomic;
- exactly one worker/request may take over an abandoned claim;
- the recovery action is audited;
- completed results remain immutable.

### Response Snapshot

- store only the minimum safe response required for deterministic replay;
- never store secrets, raw OTP values, access tokens, refresh tokens or unnecessary personal data;
- where a full response cannot be safely persisted, store a result reference and reconstruct the approved response.

### Failure Classification

- permanent business failures may be stored as completed deterministic outcomes where repeat requests must return the same result;
- temporary infrastructure failures must remain retryable and must not be treated as successful completion.

## 6. Complete ADR-008 Android Preview Build Decision

Update:

`docs/adr/ADR-008-cross-platform-mobile-architecture.md`

Make the default decision explicit:

- React Native with Expo is the selected cross-platform framework;
- Expo Application Services (EAS Build) is the default build mechanism;
- the Android preview profile produces an installable APK using internal distribution;
- the production Android profile later produces an Android App Bundle;
- iOS build and store submission are deferred but supported by the same codebase;
- local native builds remain an approved fallback when EAS is unavailable;
- detailed commands, credentials and distribution procedures belong to the future `MOB-001-android-build-and-apk-distribution.md`.

Do not require Google Play publication for preview testing.

## 7. Validation

Before finishing:

1. Search the repository for:
   - `docs/decisions`
   - `ADR-008-mobile-cross-platform-architecture`
2. Confirm no stale affected references remain.
3. Confirm all eight ADR files still exist.
4. Confirm `ADR-INDEX.md` matches actual filenames.
5. Confirm no source code was created.
6. Confirm no unrelated Blueprint rule was changed.
7. Search modified files for placeholders:
   - `TBD`
   - `TODO`
   - `[fill]`

## 8. Return

Return:

1. Task Readiness result
2. Review findings addressed
3. Exact files changed
4. Exact decisions added
5. Repository search results
6. Validation results
7. Remaining blockers
8. Recommendation: `READY FOR RE-REVIEW` or `BLOCKED`

Do not commit.
Do not merge.
Do not start `LP-000002`.
