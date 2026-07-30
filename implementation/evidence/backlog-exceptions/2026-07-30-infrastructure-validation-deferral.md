# Temporary Backlog Exception — Deferred Infrastructure Validation

- **Authorized by:** Human Product Owner / Maintainer
- **Date:** 2026-07-30
- **Scope:** LP-000009 and LP-000016 only
- **Expiry:** First deployment-readiness milestone

## Decision

LP-000009 (Database Migration Framework) and LP-000016 (CI Pull Request Pipeline) are explicitly deferred infrastructure-validation tasks. Their completed implementation work and evidence remain preserved, but neither task may be marked `DONE` without its required PostgreSQL-backed or live GitHub Actions validation.

Their validation blockers must not block unrelated Loyalty Platform product development. This exception does not waive, falsify, mock, or weaken either task’s required validation and does not authorize merging or closing either task.

## Preserved State

- LP-000009 implementation branch and evidence remain preserved; PostgreSQL-backed final validation is outstanding.
- LP-000016 implementation and review branches/evidence remain preserved; live GitHub Actions validation is outstanding.
- No database integration result, CI result, approval, merge, or `DONE` state is inferred by this exception.

## Boundary

Product tasks may proceed only when their own declared dependencies and available repository tooling permit it. Tasks requiring LP-000009’s database integration remain blocked unless they explicitly provide an approved non-production contract/domain-only scope that does not claim database validation. This exception expires at the first deployment-readiness milestone, when both infrastructure validation tasks must be resolved before release progression.
