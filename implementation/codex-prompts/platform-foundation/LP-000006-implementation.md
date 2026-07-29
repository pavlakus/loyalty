# Implementation Prompt: LP-000006

Act only as the Backend Developer Agent after LP-000006 is `READY`.

Read `AGENTS.md`, the LP-000006 specification, the MIP, ADR-007, accepted ADR-009, lifecycle/status/index records, preparation evidence and directory instructions. Work only on the approved files. Implement typed startup validation for exactly `NODE_ENV`, `PORT` and `HOST`; preserve the documented defaults and production rule; expose no client/public or secret configuration; do not add future provider credentials or Loyalty behavior.

Use a dedicated branch `agent/backend/LP-000006-environment-config`. Add focused tests for missing/invalid values, production behavior, defaults, public/server separation and safe diagnostics. Run the task-required package/API and repository validations, secret scanning and `git diff --check`. Persist `implementation/evidence/LP-000006/implementation.md`, synchronize status/index records, and hand off only after an isolated commit and passing validation.

Return the full implementation response contract.
