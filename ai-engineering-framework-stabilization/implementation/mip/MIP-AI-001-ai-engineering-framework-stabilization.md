# MIP-AI-001. AI Engineering Framework Stabilization

## Status
`READY FOR TASK DECOMPOSITION`

## Purpose
Stabilize the AI-assisted development workflow so task preparation, implementation, review, QA, merge readiness, evidence, scope isolation and environment validation work consistently with minimal manual intervention.

## Locked Rules
- Developers execute only READY tasks.
- Correction passes may continue from IN_PROGRESS / CHANGES_REQUIRED when explicitly authorized.
- Git evidence is authoritative for MERGED.
- Review and QA approvals must be persisted.
- No agent may mark an unfinished dependency complete.
- Human maintainers perform merges.
- Product and Architecture decisions require escalation.
- Workflow files must not contaminate feature-task scope.

## Scope
- authoritative task lifecycle;
- review evidence;
- QA evidence;
- native Codex Skills;
- dispatcher;
- scope isolation;
- workflow commit strategy;
- repository hygiene;
- environment preflight;
- one-command workflow.

## Out of Scope
- Loyalty business logic;
- Product Decision changes;
- automatic Production deployment;
- automatic merge;
- bypassing review or QA.

## Evidence Paths
```text
implementation/evidence/<task-id>/
├── implementation.md
├── review.md
├── qa.md
├── security.md
├── release.md
└── summary.json
```

## Required Capabilities
1. Stabilize Task Lifecycle
2. Review Evidence Engine
3. QA Evidence Engine
4. Dispatcher Agent
5. Native Codex Skills
6. Scope Isolation Engine
7. Workflow Commit Strategy
8. Repository Hygiene
9. Environment Validation
10. One Command Workflow

## Definition of Done
- skills load without warnings;
- valid tasks can be prepared to READY;
- correction passes work from CHANGES_REQUIRED;
- review and QA evidence are persisted;
- scope isolation excludes unrelated files;
- pinned runtime is enforced;
- dispatcher routes prepare/execute/review/qa/close/status;
- mandatory tests pass.

## Final Status
`READY FOR TASK DECOMPOSITION`
