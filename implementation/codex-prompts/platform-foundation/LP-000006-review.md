# Review Prompt: LP-000006

Act only as the independent Review Agent. Read the LP-000006 specification, MIP, ADR-007, accepted ADR-009, implementation evidence, committed diff, tests, lifecycle records and relevant engineering/security documents. Do not modify implementation files.

Verify exact scope, startup validation, defaults, production `NODE_ENV` requirement, strict `PORT`/`HOST` formats, safe diagnostics, absence of client/public and secret variables, no future credentials, tests, rollback and no Loyalty behavior. Record every finding with severity, file, impact and exact correction. Persist `implementation/evidence/LP-000006/review.md` and approve only if no P0/P1 findings remain.

Return the full review response contract.
