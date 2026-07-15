# 74. Task Quality Checklist

## 1. Purpose

This checklist is used before an LP task becomes `READY`, before Codex starts work, and before the task is closed.

## 2. Definition of Task Ready Checklist

- [ ] Task ID is valid.
- [ ] Task belongs to exactly one MIP.
- [ ] Owning module is explicit.
- [ ] Assigned role is explicit.
- [ ] Business objective is clear.
- [ ] Technical objective is clear.
- [ ] Exact scope is bounded.
- [ ] Out of scope is explicit.
- [ ] Dependencies are resolved or identified.
- [ ] Required documents are exact.
- [ ] Knowledge Package exists.
- [ ] Allowed files are exact.
- [ ] Forbidden files are exact.
- [ ] Acceptance criteria are measurable.
- [ ] Mandatory tests are specific.
- [ ] UAT references exist.
- [ ] Required reviewers are assigned.
- [ ] Rollback or recovery is defined.
- [ ] No Product Decision must be invented.

## 3. Architecture Checklist

- [ ] Correct owning module.
- [ ] Correct aggregate ownership.
- [ ] No private cross-module write.
- [ ] Public Commands, Queries and Events are used.
- [ ] Transaction boundary is explicit.
- [ ] Idempotency is explicit.
- [ ] Concurrency protection is explicit.
- [ ] Compensation is explicit.
- [ ] Projection rebuildability is preserved.
- [ ] Immutable history is preserved.

## 4. Database Checklist

- [ ] Migration is new and immutable.
- [ ] Table ownership is explicit.
- [ ] Primary and foreign keys exist.
- [ ] Unique constraints exist.
- [ ] Check constraints exist.
- [ ] Nullability is intentional.
- [ ] RLS exists.
- [ ] Service-role path validates tenant.
- [ ] Indexes are justified.
- [ ] Large-table impact is considered.
- [ ] Recovery path exists.

## 5. API and Event Checklist

- [ ] API follows business-action style.
- [ ] API version is correct.
- [ ] Runtime validation exists.
- [ ] Stable error codes exist.
- [ ] Event name matches Event Catalog.
- [ ] Event version exists.
- [ ] Event publishes after commit.
- [ ] Correlation and causation are preserved.
- [ ] Consumer replay is safe.
- [ ] Breaking changes have migration plan.

## 6. Security Checklist

- [ ] Authentication is enforced.
- [ ] Authorization is backend-enforced.
- [ ] Tenant ownership is validated.
- [ ] RLS is tested.
- [ ] Forged identifiers are tested.
- [ ] UI visibility is not treated as security.
- [ ] Service role does not bypass rules.
- [ ] Sensitive data is not logged.
- [ ] Rate limiting exists where required.
- [ ] Cross-tenant leakage test passes.

## 7. Testing Checklist

- [ ] Unit tests exist.
- [ ] Integration tests exist.
- [ ] Database tests exist where required.
- [ ] API contract tests exist.
- [ ] Idempotency tests exist.
- [ ] Concurrency tests exist.
- [ ] Security tests exist.
- [ ] Failure-path tests exist.
- [ ] Regression tests exist.
- [ ] Tests were actually executed.
- [ ] Results are recorded.

## 8. Documentation Checklist

- [ ] MIP remains correct.
- [ ] API documentation updated.
- [ ] Event Catalog updated if required.
- [ ] Data model updated if required.
- [ ] Module README updated.
- [ ] ADR created if architecture changed.
- [ ] UAT updated if behavior changed.
- [ ] No unfinished behavior is documented as complete.

## 9. Completion Checklist

- [ ] All acceptance criteria pass.
- [ ] All mandatory tests pass.
- [ ] Required reviews approve.
- [ ] Known limitations are documented.
- [ ] Technical debt is classified.
- [ ] Rollback is confirmed.
- [ ] Definition of Done evidence exists.
- [ ] Readiness level is assigned.
