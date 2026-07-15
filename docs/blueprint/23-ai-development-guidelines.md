23 - AI Development Guidelines

Purpose

This document defines the engineering standards that every AI agent must follow when contributing to the project.

The objective is consistency, safety, maintainability and long-term architectural stability.

These rules apply regardless of the implementation technology.

⸻

Primary Principle

The AI agent is not expected to write code.

The AI agent is expected to build and maintain the platform.

Every implementation decision must prioritize the long-term health of the system over short-term convenience.

⸻

Source of Truth

Before implementing any feature, the AI agent must consult the Blueprint.

Priority order:

1. Business Rules
2. Domain Model
3. System Architecture
4. Engine Specifications
5. API Design
6. Database Design

Implementation must never contradict the Blueprint.

If multiple Blueprint documents describe the same concept, the document explicitly marked as authoritative or implementation-ready takes precedence.

Deprecated or superseded documents are consulted only for historical context.

⸻

Business Rules First

Business Rules always take priority over implementation.

If implementation conflicts with Business Rules:

Business Rules win.

The AI agent must never silently change business behavior.

⸻

Think Before Coding

Before writing code, the AI agent should:

* understand the requirement
* identify affected components
* identify impacted Business Rules
* identify impacted Aggregates
* identify required tests

Implementation begins only after analysis.

⸻

Single Responsibility

Every class, module and service should have one clear responsibility.

Large components should be decomposed into smaller units.

⸻

Prefer Simplicity

Choose the simplest architecture that satisfies the requirements.

Avoid unnecessary abstractions.

Avoid speculative development.

⸻

Configuration over Hardcoding

Business behavior should be configurable whenever practical.

Avoid embedding business values directly into source code.

Examples:

* Reward Rules
* Status thresholds
* Point expiration
* Notification templates

⸻

Backward Compatibility

Changes should preserve existing behavior unless explicitly approved.

Breaking changes require documented justification.

⸻

Database Changes

Database migrations must:

* be deterministic
* be idempotent where appropriate
* support rollback whenever feasible
* preserve existing data

Destructive migrations require explicit approval.

⸻

Immutable Data

Never update immutable records.

Examples:

* Reward Transactions
* XP Transactions
* Business Events
* Audit Records

Corrections are implemented through compensating transactions.

⸻

Business Logic

Business logic belongs only inside Business Engines.

Never implement business logic in:

* UI
* Controllers
* Database Triggers
* Notification Workers

⸻

API Design

APIs should represent business actions rather than CRUD operations.

Prefer:

Create Receipt

Redeem Reward Points

Cancel Receipt

instead of direct table manipulation.

⸻

Error Handling

Errors must:

* be predictable
* be meaningful
* never expose internal implementation
* preserve system consistency

Business validation errors are expected behavior.

⸻

Testing

Every meaningful change requires appropriate automated tests.

The AI agent should determine:

* unit tests
* integration tests
* regression tests

Tests are part of the implementation.

⸻

Security

Every implementation must consider:

* authentication
* authorization
* tenant isolation
* audit
* least privilege

Security is never optional.

⸻

Performance

Optimize only after correctness.

Never sacrifice correctness for performance.

Use projections and caching only when justified.

⸻

Observability

Every important business action should be observable.

Support:

* logging
* tracing
* audit
* metrics

Production debugging should not depend on guesswork.

⸻

Documentation

The AI agent should update documentation whenever behavior changes.

Blueprint updates require explicit approval.

Implementation documentation should remain synchronized with code.

⸻

Refactoring

Refactoring is encouraged when it:

* improves readability
* reduces duplication
* strengthens architecture

Refactoring must not change business behavior unless explicitly requested.

⸻

Technical Debt

When technical debt is discovered:

* document it
* explain impact
* propose improvement

Do not silently ignore structural problems.

⸻

Skills

The AI agent should use the most specific Skill available.

Examples:

SQL Migration

API Design

Testing

Security Review

Code Review

Business Rules

Skills should remain focused and reusable.

⸻

Knowledge

The AI agent should consult available project Knowledge before making architectural decisions.

Project conventions take priority over general assumptions.

⸻

Pull Requests

Every implementation should include:

* summary
* affected components
* migration notes
* testing summary
* risks
* rollback strategy

⸻

Code Quality

Code should be:

* readable
* maintainable
* deterministic
* testable

Readability is preferred over cleverness.

⸻

Design Principles

The AI agent should continuously ask:

Is this consistent with the Blueprint?

Does this preserve Business Rules?

Will this still be understandable in five years?

Can another AI agent extend this safely?

The objective is not only to generate code.

The objective is to build a platform that remains maintainable for many years.