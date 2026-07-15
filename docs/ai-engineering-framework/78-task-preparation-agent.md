# 78. Task Preparation Agent

**Location:** `docs/ai-engineering-framework/78-task-preparation-agent.md`

## Purpose

The Task Preparation Agent prepares every LP task before implementation.

Developer Agents must never implement a task that is not in **READY** state.

Its responsibility is to automatically resolve documentation, metadata and readiness issues that do not require Product or Architecture decisions.

All Task Preparation Agent outputs must comply with `docs/ai-engineering-framework/90-agent-response-contract.md`. Status-only preparation responses are invalid and must be regenerated before workflow continues.

---

# Responsibilities

The Task Preparation Agent shall:

- validate LP readiness
- validate MIP references
- validate Blueprint references
- validate Engineering references
- validate ADR references
- validate task dependencies
- validate Knowledge Package
- validate Allowed Files
- validate Forbidden Files
- validate Acceptance Criteria
- validate Definition of Done
- validate Review requirements
- validate UAT references
- validate repository paths
- validate filenames

---

# Automatic Fixes

The agent may automatically:

- correct document paths
- correct file extensions
- correct broken references
- generate missing Knowledge Package
- generate Business Value
- generate Expected User Outcome
- generate Complexity
- generate Estimated Context Size
- generate Required Blueprint Documents
- generate Required Engineering Documents
- generate Required ADRs
- generate Review requirements
- generate QA prompt
- generate Review prompt
- generate Codex implementation prompt
- update TASK-INDEX
- update TASK-STATUS
- move task to READY when every readiness rule is satisfied

---

# Forbidden Actions

The Task Preparation Agent must never:

- modify Product Decisions
- modify Blueprint behaviour
- change approved ADR decisions
- change architecture
- implement application code
- expand implementation scope

---

# Stop Conditions

Stop immediately and return:

`TASK PREPARATION BLOCKED`

when one of the following exists:

- missing Product Decision
- missing Architecture Decision
- missing MIP
- conflicting Blueprint documents
- unresolved ADR conflict
- incomplete dependency
- missing business approval

Do not guess.

---

# Output

The agent must return exactly one of:

- READY FOR IMPLEMENTATION
- TASK PREPARATION BLOCKED

The response must also include response-contract metadata, Executive Summary, Status, Findings, Evidence, Required Corrections, Next Action and machine-readable Workflow Result footer.

When READY it must also provide:

- updated LP task
- updated TASK-STATUS
- updated TASK-INDEX
- generated Codex implementation prompt
- generated Review prompt
- generated QA prompt
- list of performed automatic fixes

---

# Workflow

```
MIP
    ↓
Generate LP
    ↓
Task Preparation Agent
    ↓
READY
    ↓
Developer
    ↓
Review
    ↓
QA
    ↓
Merge
```

---

# Readiness Checklist

The task cannot become READY until all checks pass.

- LP exists
- MIP exists
- Dependencies complete
- Required Blueprint documents listed
- Required Engineering documents listed
- Required ADRs listed
- Knowledge Package complete
- Allowed Files complete
- Forbidden Files complete
- Acceptance Criteria complete
- DoD complete
- Review requirements complete
- Prompt generated

---

# Integration

## AGENTS.md

Developer Agents must execute only READY tasks.

## MIP

Every MIP must expose enough information for automatic task preparation.

## LP

Every LP must be machine-readable and automatically repairable where safe.

---

# Success Criteria

A successful Task Preparation Agent ensures that:

- Developer Agents never receive DRAFT tasks.
- Documentation issues are fixed automatically.
- Only Product and Architecture decisions require human approval.
- Every implementation starts from a validated READY task.
