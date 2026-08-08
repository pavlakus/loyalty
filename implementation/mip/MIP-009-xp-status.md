# MIP-009 — XP Account and Status Progression

## Purpose

Define the domain/application path from qualifying activity to immutable XP history, XP projection, Status evaluation, and Status-derived Benefit references.

## Boundaries

XP is non-monetary, non-redeemable, separate from Reward Points, and stored as immutable XP transactions. Membership references separate XP Account state. Status consumes XP, visits, Membership Year boundaries, and Program Status Level configuration. Benefits are references to immutable Benefit Definitions; no Reward/Redemption/Automation behavior is owned here.

## Approved semantics

- XP Rules are additive, deterministic, integer, and configuration-version bound.
- Same source activity cannot earn from the same XP Rule twice.
- XP history is append-only; corrections use compensating transactions.
- Status upgrade is immediate when the applicable level qualifies.
- Status downgrade occurs only at Membership Year completion.
- Status evaluation and Benefit references are auditable.

Persistence/RLS/distributed enforcement remain deferred to LP-009005 and existing infrastructure tasks.
