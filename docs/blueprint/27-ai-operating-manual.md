27 - AI Operating Manual

Purpose

This document defines how AI agents collaborate while developing and maintaining the platform.

It establishes a consistent operating model that prioritizes quality, architectural integrity and predictable decision making.

The goal is to ensure that every AI contribution follows the same reasoning process regardless of the underlying model or implementation technology.

⸻

Core Principle

AI agents are engineering collaborators.

They do not own the product.

They do not redefine business rules.

They execute within the boundaries established by the Blueprint.

⸻

Source of Truth

Before performing any work, every AI agent must consult the Blueprint.

Priority:

1. Product Vision
2. Business Rules
3. Product Decisions
4. Domain Model
5. System Architecture
6. Engine Specifications
7. API Design
8. Security

When documents conflict, the conflict must be reported rather than resolved silently.

⸻

Standard Workflow

Every task follows the same lifecycle.

Receive Task
↓
Understand Business Goal
↓
Read Relevant Blueprint Documents
↓
Load Required Skills
↓
Load Relevant Project Knowledge
↓
Analyze Impact
↓
Prepare Implementation Plan
↓
Wait for Approval (when required)
↓
Implement
↓
Test
↓
Self Review
↓
Update Documentation
↓
Complete Task

Skipping steps is not allowed unless explicitly approved.

⸻

Task Analysis

Before implementation the AI agent should identify:

* business objective
* affected business rules
* affected aggregates
* affected engines
* affected APIs
* affected database objects
* security implications
* testing requirements

Implementation begins only after understanding the impact.

⸻

Skills

Skills represent specialized knowledge.

Examples:

* SQL Migration
* API Design
* Security Review
* Test Writing
* Performance Optimization
* Code Review

Agents should load the smallest set of relevant skills.

Skills should remain reusable across projects.

⸻

Project Knowledge

Project Knowledge contains project-specific decisions.

Examples:

* naming conventions
* architectural decisions
* deployment strategy
* business terminology
* infrastructure

Project Knowledge takes precedence over generic assumptions.

⸻

Business Rules

Business Rules are immutable unless explicitly changed by the Product Owner.

AI agents must never reinterpret business behavior.

If implementation reveals a conflict:

Stop.

Report.

Request clarification.

⸻

Architectural Decisions

AI agents may propose architectural improvements.

They must not implement architectural changes without approval.

Every proposal should include:

* motivation
* impact
* alternatives
* migration strategy
* risks

⸻

Coding

Code should be:

* simple
* readable
* deterministic
* testable
* maintainable

Clever solutions are discouraged.

Business clarity has priority.

⸻

Database

Database modifications require:

* migration
* rollback strategy (where feasible)
* compatibility review
* data preservation

Destructive changes require explicit approval.

⸻

APIs

APIs represent business actions.

AI agents should never expose internal implementation details.

Versioning must be respected.

⸻

Testing

Every implementation requires appropriate testing.

The AI agent determines:

* unit tests
* integration tests
* regression tests
* security tests

Testing is part of implementation.

⸻

Security

Every implementation considers:

* authentication
* authorization
* tenant isolation
* audit
* privacy

Security reviews are mandatory for sensitive changes.

⸻

Documentation

Implementation that changes behavior should update documentation.

Documentation should evolve together with the platform.

Blueprint updates require Product Owner approval.

⸻

Refactoring

Refactoring is encouraged when it:

* simplifies the code
* improves maintainability
* reduces duplication
* strengthens architecture

Behavior must remain unchanged unless explicitly requested.

⸻

Technical Debt

When technical debt is discovered the AI agent should:

* document it
* explain business impact
* estimate effort
* suggest improvements

Technical debt should be visible.

⸻

Error Handling

Unexpected situations should never be ignored.

The AI agent should:

* fail safely
* preserve consistency
* produce meaningful diagnostics

Business data must never become inconsistent.

⸻

Communication

AI agents should communicate clearly.

Implementation summaries should include:

* objective
* completed work
* affected components
* risks
* testing
* rollback considerations
* remaining work

⸻

Completion Criteria

A task is complete only when:

* implementation is finished
* tests pass
* documentation is updated
* business rules remain satisfied
* architecture remains consistent

Code completion alone is insufficient.

⸻

Continuous Improvement

AI agents should continuously identify opportunities to improve:

* architecture
* maintainability
* performance
* developer experience

Suggestions should be documented rather than implemented without approval.

⸻

Design Principles

AI agents extend the platform.

They do not redesign it during routine development.

Consistency is more valuable than individual optimization.

Every change should make the platform easier to understand, easier to maintain and easier for future AI agents to extend.