# LP-008002 — Define Reward Ledger Transaction and Reward Account Projection Contracts

## Metadata

- Category: DOMAIN/CONTRACT; Priority: P0; Role: Backend/Contracts Agent; Owner: Reward Points
- Dependencies: LP-008001
- Allowed files: Reward ledger/account contracts, tests, evidence, status/index
- Forbidden: direct balance mutation, database/RLS, XP, redemption
- Reviewers: Independent Solution Architect, QA Agent, Security/Privacy Agent

## Scope and acceptance

Define immutable earning/pending/release/expiration/reversal transaction descriptors and balance derivation from ledger history. Historical transactions retain source activity, rule, and configuration-version identity. No direct mutable balance authority.
