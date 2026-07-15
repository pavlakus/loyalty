# Task Lifecycle

## Authoritative States

### DRAFT

Task exists but has not passed preparation.

### TASK_PREPARATION

Task Preparation Agent is validating and repairing the task.

### READY

Task has passed Definition of Task Ready and may be assigned.

### ASSIGNED

Exactly one implementation agent owns the task.

### IN_PROGRESS

Implementation has started.

### IMPLEMENTATION_COMPLETE

Implementation agent reports scope complete and mandatory self-checks executed.

### READY_FOR_REVIEW

Evidence exists and independent review may start.

### REVIEW

Independent technical review is active.

### CHANGES_REQUIRED

Review found mandatory corrections.

### QA

Technical review approved and QA validation is active.

### READY_FOR_MERGE

All required reviews and QA approve.

### MERGED

Task branch is merged into the target development branch.

### DONE

Post-merge checks, documentation and status records are complete.

### BLOCKED

A real Product, Architecture, dependency or security blocker prevents progress.

### CANCELLED

Task will not be implemented.

### DEFERRED

Task is intentionally postponed.

## Transition Authority

| Transition | Authorized Role |
|---|---|
| DRAFT → TASK_PREPARATION | Task Preparation Agent |
| TASK_PREPARATION → READY | Task Preparation Agent |
| READY → ASSIGNED | Project Manager / Human |
| ASSIGNED → IN_PROGRESS | Implementation Agent |
| IN_PROGRESS → IMPLEMENTATION_COMPLETE | Implementation Agent |
| IMPLEMENTATION_COMPLETE → READY_FOR_REVIEW | Implementation Agent |
| READY_FOR_REVIEW → REVIEW | Review Agent |
| REVIEW → CHANGES_REQUIRED | Review Agent |
| REVIEW → QA | Review Agent |
| QA → READY_FOR_MERGE | QA + required reviewers |
| READY_FOR_MERGE → MERGED | Human maintainer |
| MERGED → DONE | Task Preparation or Documentation Agent |
| Any → BLOCKED | Any agent with evidence |

## Rules

- No Developer Agent may implement DRAFT or TASK_PREPARATION tasks.
- READY requires all dependencies complete.
- No agent may falsely complete a dependency.
- MERGED is based on Git state, not a documentation guess.
- DONE requires status records and documentation consistency.
