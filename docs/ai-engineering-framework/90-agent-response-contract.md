# 90. Agent Response Contract Standard

Version: 1.0

Status: ACTIVE

Owner: AI Engineering Framework

---

# Purpose

This document defines the mandatory response contract for every AI agent participating in the engineering workflow.

No agent is allowed to return only a status such as:

- APPROVED
- CHANGES REQUIRED
- BLOCKED
- READY
- QA CHANGES REQUIRED

Every response must contain the mandatory sections defined in this document.

This standard exists to guarantee:

- deterministic workflows;
- machine-readable outputs;
- auditability;
- automatic workflow continuation;
- reliable handoff between agents.

---

# General Rules

Every agent response MUST include:

- Executive Summary
- Status
- Evidence
- Next Action

No exception.

If any mandatory section is missing, the response is considered INVALID.

---

# Mandatory Metadata

Every response must begin with:

Task ID

Task Title

Agent Role

Branch

Timestamp

Current Lifecycle State

Commit (or Working Tree)

---

# Status Values

Only the following statuses are allowed.

## Task Preparation

TASK PREPARATION BLOCKED

READY FOR IMPLEMENTATION

---

## Implementation

IMPLEMENTATION BLOCKED

READY FOR REVIEW

---

## Review

APPROVED

APPROVED WITH FOLLOW-UP

CHANGES REQUIRED

BLOCKED

---

## QA

QA APPROVED

QA APPROVED WITH FOLLOW-UP

QA CHANGES REQUIRED

QA BLOCKED

---

## Merge

READY FOR MERGE

MERGED

DONE

---

# Executive Summary

Mandatory.

Maximum:

10 bullet points

Must describe:

- what was reviewed;
- what changed;
- overall conclusion.

---

# Findings

Every finding MUST include:

Severity

File

Impact

Required Correction

Allowed severities:

P0

P1

P2

P3

If no findings exist:

```text
None
```

must be written.

---

# Evidence

Mandatory.

Must include:

Commands executed

Validation results

Evidence files generated

Git evidence

Lifecycle evidence

Review evidence

QA evidence

---

# Required Corrections

Mandatory.

If none:

```text
None
```

must be returned.

---

# Next Action

Mandatory.

Must contain exactly one workflow action.

Allowed values:

Run Review

Run QA

Prepare Merge

Merge

Close Task

Create Follow-up Task

Reopen Task

Stop

---

# APPROVED WITH FOLLOW-UP

If this status is returned, the following section is mandatory.

## Follow-up

Type

Blocking

or

Non-blocking

Owner

Suggested Task ID

Reason

Merge Allowed

YES

or

NO

Without this section the response is INVALID.

---

# CHANGES REQUIRED

Must include at least one finding.

Each finding MUST include:

File

Severity

Impact

Exact Required Correction

Otherwise the response is INVALID.

---

# BLOCKED

BLOCKED responses MUST contain:

Blocking Reason

Blocking Category

Allowed categories:

Dependency

Architecture

Security

Repository State

Environment

Missing Evidence

Missing Approval

Missing Documents

Unknown

Blocking Owner

Required Action

Resume Condition

Without these sections BLOCKED is INVALID.

---

# QA Rules

QA is NOT allowed to request implementation changes unless a failed acceptance criterion exists.

QA may never return only:

```text
QA CHANGES REQUIRED
```

QA must identify failed acceptance criteria, evidence and required correction.

---

# Review Rules

Review may never return only:

```text
APPROVED
```

or

```text
APPROVED WITH FOLLOW-UP
```

Review must include scope reviewed, findings, evidence, merge recommendation and follow-up when applicable.

---

# Implementation Rules

Implementation responses must include:

- Changed Files
- Commands
- Tests
- Known Limitations
- Definition of Done Evidence
- Readiness Recommendation

---

# Task Preparation Rules

Task Preparation responses must include:

- Readiness Result
- Missing Requirements
- Files Updated
- Prompts Generated
- Dependencies
- Next Valid Lifecycle State

---

# Machine Readable Footer

Every response must end with:

Workflow Result

Task ID

Current State

Next State

Next Responsible Agent

Can Continue

YES

or

NO

---

# Invalid Responses

The following responses are forbidden without the mandatory sections defined above:

- APPROVED
- READY
- DONE
- QA CHANGES REQUIRED
- BLOCKED

Such responses must be rejected by the Dispatcher Agent.

---

# Dispatcher Validation

Before accepting any agent response, Dispatcher must validate:

- mandatory metadata;
- mandatory sections;
- status legality;
- required evidence;
- workflow transition.

If validation fails, the response is rejected, the agent must regenerate the response and the workflow does not continue.

---

# Definition of Done

This standard is complete when:

- every AI agent follows this contract;
- Dispatcher validates every response;
- invalid responses are automatically rejected;
- workflow continuation becomes deterministic;
- manual interpretation of agent outputs is no longer required.
