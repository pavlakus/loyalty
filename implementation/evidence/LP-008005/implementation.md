# LP-008005 Implementation Evidence

## Implementation

- Task ID: LP-008005
- Phase: Implementation
- Role: Database Implementation Agent
- Branch: `agent/database/LP-008005-reward-persistence`
- Scope: immutable Reward Ledger persistence, deterministic Reward Account projection, Business-scoped RLS, request idempotency, and row-locked atomic balance transitions.
- Deferred: XP, redemption fulfillment, distributed deployment infrastructure, and changes to domain/application semantics.

### Files

- `database/migrations/20260809130000_create_reward_ledger_persistence.sql`
- `database/tests/reward-ledger-persistence.sql`

### Implementation Notes

- Posted ledger transactions are append-only and preserve Membership, Account, Receipt/activity, earning decision, Program, and configuration-version references.
- Ledger idempotency is scoped by Business and key, with fingerprint mismatch rejection; earning decision/type uniqueness prevents duplicate logical earning.
- Account balances are updated in the same transaction as ledger insertion under a row lock and reject negative available/reserved states.
- Reward Account and ledger rows are Business-scoped with FORCE RLS and explicit `loyalty_app` grants.
