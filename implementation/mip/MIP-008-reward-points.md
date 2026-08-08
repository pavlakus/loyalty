# MIP-008 — Reward Points Earning and Ledger

## Purpose

Define the shortest domain/application path from qualifying Receipt activity to deterministic Reward Points decisions and immutable ledger/account projections.

## Boundaries

Reward Points are separate from XP. Receipt remains the authoritative activity source; Reward Rules and effective Program configuration provide evaluation inputs. Reward Account is derived from immutable Reward Ledger transactions. This package does not own Receipt, Membership, Program configuration, redemption, or XP/Status state.

## Approved semantics

- integer minor-unit money and explicit currency context;
- deterministic Reward Rule evaluation and floor rounding to whole points;
- below-threshold valid activity may produce zero points;
- every earning decision binds to the exact immutable Program configuration version;
- historical decisions and ledger entries are never rewritten;
- duplicate activity cannot create duplicate earning;
- pending and expiration behavior follows existing Program configuration.

Persistence, RLS, transactional outbox, and production concurrency enforcement remain deferred to the existing infrastructure foundations.
