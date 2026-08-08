# LP-009003 — Implement Status Evaluation and Progression Contract

## Metadata

- Category: DOMAIN; Priority: P0; Role: Backend Agent; Owner: XP and Status
- Dependencies: LP-009001, LP-009002, LP-005009, LP-006008, LP-005010
- Allowed files: Status evaluation/transition contracts/tests/evidence/status
- Forbidden: Reward Points, redemption, automation, persistence/RLS

## Scope and acceptance

Evaluate configured Status Levels using XP, qualifying visits, and Membership Year context. Upgrade immediately when a higher level qualifies; downgrade only at Membership Year completion. Emit auditable Status transition descriptors with Benefit Definition references.
