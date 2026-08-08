# LP-011002 — Add Analytics API and Projection Contracts and Privacy Tests

- Category: API/projection contract and security validation
- Priority: High
- Lifecycle state: READY
- Assigned role: API Contract Implementation Agent
- Owning module: Business Observation / Analytics
- Dependencies: LP-011001 DONE
- Knowledge Package: MIP-011, LP-011001, Blueprint 43, Analytics Product Decision
- Allowed files: `packages/api-contracts/src/analytics.ts`, exports, scoped contract tests, this task, status/index/evidence
- Forbidden files: event authority, persistence, materialized views, RLS, Customer PII, financial/forecast analytics, unrelated APIs
- Required reviewers: independent Review Agent, QA Agent, Security Agent
- Mandatory validation: package build/typecheck/tests, privacy tests, `git diff --check`
- Acceptance criteria: strict explicit-period overview query; grouped metric response; currency-separated money; no PII or internal persistence fields; zero-valued empty response.
- Rollback/recovery: revert isolated contract commit; no runtime data changes.
- Definition of Done: contract implementation, approvals, merge and post-merge evidence.
