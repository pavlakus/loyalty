# LP-011003 Implementation Evidence

## Implementation

- Task ID: LP-011003
- Phase: Implementation
- Role: Database Implementation Agent
- Branch: `agent/database/LP-011003-analytics-persistence`
- Scope: append-only tenant-scoped analytics observations and deterministic overview query; no source-domain mutation or PII storage.
- Deferred: event-consumer orchestration/replay infrastructure beyond the approved projection boundary and unrelated BI metrics.

### Files

- `database/migrations/20260809160000_create_analytics_projection.sql`
- `database/tests/analytics-persistence.sql`

### Controls

- Projection observations retain tenant/program/source/configuration context and integer metric values.
- Idempotency is tenant-scoped with fingerprint mismatch rejection.
- Forced RLS and explicit tenant/program validation prevent cross-business reads/writes.
- Projection rows are append-only; analytics queries use half-open UTC windows and preserve currency separation.
- Application table writes are withheld; only narrowly scoped recording/query functions are executable.

### Validation

- `git diff --check`: PASS.
- `psql -h 127.0.0.1 -p 55440 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE loyalty_lp11003_clean_v2"`: PASS.
- `NODE_ENV=test DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55440/loyalty_lp11003_clean_v2 pnpm run db:migrate`: PASS; all twelve migrations applied from zero.
- `psql -h 127.0.0.1 -p 55440 -U postgres -d loyalty_lp11003_clean_v2 -v ON_ERROR_STOP=1 -f database/tests/analytics-persistence.sql`: PASS; idempotent replay, integer/currency aggregation, empty half-open period, and cross-tenant isolation checks passed.
- Required repository build/lint/typecheck/test/FCR gates: to be recorded before review; no runtime package files changed.

### Recommendation

Proceed to independent Review, QA, and Security review. Production event-consumer orchestration remains outside this isolated persistence task and no production real-time claim is made.
