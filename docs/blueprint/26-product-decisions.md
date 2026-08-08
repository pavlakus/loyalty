26 - Product Decisions

Purpose

This document captures the major architectural and product decisions made during the design of the platform.

Its purpose is to preserve design intent.

Future contributors should understand not only what was built, but why specific decisions were made.

Whenever possible, new features should follow these decisions rather than introducing conflicting approaches.

⸻

PD-001

Event Driven Architecture

Decision

The platform is built around Business Events.

Reason

Business components remain independent while allowing future expansion without redesign.

Alternative Considered

Direct communication between services.

Reason for Rejection

Tight coupling and poor scalability.

⸻

PD-002

Reward Points and XP are Separate

Decision

Reward Points and XP represent different business concepts.

Reward Points have monetary value.

XP measures customer engagement.

Reason

Separating financial value from customer progression keeps the business model simple and flexible.

Alternative Considered

Single point system.

Reason for Rejection

Financial logic and gamification become tightly coupled.

⸻

PD-003

Immutable Ledgers

Decision

Reward and XP transactions are append-only.

Reason

Provides complete audit history and enables deterministic reconstruction of business state.

Alternative Considered

Updating balances directly.

Reason for Rejection

Loss of auditability and increased risk of data inconsistency.

⸻

PD-004

Balances are Projections

Decision

Current balances are projections built from immutable transactions.

Reason

Business truth remains reconstructable.

Alternative Considered

Using balance as the primary source of truth.

Reason for Rejection

Higher risk of corruption and inconsistent recovery.

⸻

PD-005

Phone Number as Primary Identity

Decision

Customers register using a verified phone number.

Email is optional.

Reason

Lower registration friction and broader accessibility.

Alternative Considered

Email-first authentication.

Reason for Rejection

Slower onboarding and lower conversion.

⸻

PD-006

Automation Templates

Decision

Businesses configure predefined automation templates in the MVP.

Reason

Most businesses do not require a full rule engine during initial adoption.

Alternative Considered

Visual rule builder from day one.

Reason for Rejection

Higher complexity and longer development time.

⸻

PD-007

Business Action API

Decision

The API represents business actions instead of CRUD operations.

Examples:

Create Receipt

Redeem Reward Points

Cancel Receipt

Reason

Business APIs are easier to understand and harder to misuse.

Alternative Considered

CRUD endpoints.

Reason for Rejection

Business logic becomes fragmented across API consumers.

⸻

PD-008

Loyalty Network

Decision

Reward Points remain owned by the originating Loyalty Program.

Networks only grant redemption rights.

Reason

Ownership, settlement and auditing remain straightforward.

Alternative Considered

Transfer Reward Point ownership.

Reason for Rejection

Complex financial reconciliation and loss of traceability.

⸻

PD-009

Membership Year

Decision

Each Membership has its own annual evaluation period.

Reason

Provides a fair and predictable customer experience.

Alternative Considered

Calendar-year evaluation.

Reason for Rejection

Customers joining late in the year are disadvantaged.

⸻

PD-010

Status Based on Engagement

Decision

Membership Status depends on XP and qualifying visits.

Reward Point balance does not influence Status.

Reason

Status reflects loyalty, not spending alone.

Alternative Considered

Status based on available Reward Points.

Reason for Rejection

Customers could lose Status by redeeming points.

⸻

PD-011

Employee Application

Decision

The Employee App complements the POS system.

Reason

Avoids expensive POS custom development during MVP.

Alternative Considered

Deep POS integration from the beginning.

Reason for Rejection

Longer implementation time and higher adoption barriers.

⸻

PD-012

Notification Queue

Decision

Notifications are always asynchronous.

Reason

Customer transactions must never wait for message delivery.

Alternative Considered

Direct notification sending.

Reason for Rejection

Provider delays would negatively affect user experience.

⸻

PD-013

AI as an Assistant

Decision

AI assists business users.

AI does not make business decisions automatically.

Reason

Business owners remain in control of promotions, rewards and customer engagement.

⸻

PD-014

Configuration over Custom Development

Decision

Business behavior should be configurable whenever practical.

Reason

Configuration scales better than project-specific development.

⸻

PD-015

Platform before Features

Decision

The platform architecture takes priority over individual features.

Reason

A stable foundation enables long-term product evolution without repeated redesign.

⸻

Future Decisions

This document evolves together with the platform.

Every significant architectural decision should be documented before implementation.

Implementation should explain deviations from existing decisions.

The Product Decisions document represents the architectural memory of the platform.

## Loyalty Program Lifecycle Decision — 2026-08-07

The canonical Loyalty Program lifecycle is `DRAFT`, `ACTIVE`, `SUSPENDED`, and `CLOSED`.

- A new Program starts in `DRAFT`.
- Allowed transitions are `DRAFT → ACTIVE`, `DRAFT → CLOSED`, `ACTIVE → SUSPENDED`, `ACTIVE → CLOSED`, `SUSPENDED → ACTIVE`, and `SUSPENDED → CLOSED`.
- `CLOSED` is terminal.
- `DRAFT` permits configuration but is not operational or available for Customer participation.
- `ACTIVE` is the only normal operational state.
- `SUSPENDED` is reversible and preserves configuration, Memberships, balances, ledgers, rewards, audit records, and historical transactions.
- `CLOSED` preserves historical state and does not decide financial settlement or redemption behavior for outstanding value.
- Lifecycle changes are explicit domain operations and produce the existing lifecycle events according to event-contract conventions.
- LP-005001 does not implement Membership, earning, ledger, balance, reward, redemption, persistence, RLS, or settlement behavior.

This decision resolves the LP-005001 preparation finding and does not define behavior owned by Membership, Reward, Redemption, Database, or RLS tasks.

## Loyalty Program API Contract Decision — 2026-08-08

LP-005002 exposes only the approved LP-005001 aggregate through the base Program contract.

- Create requests contain only `brandId`; the server creates the Program in `DRAFT` and supplies `id`, `createdAt`, and `updatedAt`.
- Program responses contain `id`, `brandId`, `status`, `createdAt`, and `updatedAt`.
- These aggregate fields are not mutable through generic update payloads; LP-005001 defines no additional mutable metadata, so no generic update operation is introduced.
- Lifecycle changes use explicit operations: activate, suspend, reactivate, and close. Arbitrary status mutation is rejected.
- Base Program contracts do not contain configuration, Membership, Customer, account, ledger, balance, reward, or infrastructure fields.
- Program lifecycle events use the existing event envelope and approved event names. `LoyaltyProgramDeactivated` carries the resulting `SUSPENDED` or `CLOSED` status so consumers can distinguish transitions without inventing a competing event name.

This decision defines transport contracts only and does not change aggregate ownership or configuration responsibilities.

## Membership Lifecycle and Rejoin Decision — 2026-08-08

Membership is the durable relationship identified by the `customerId + loyaltyProgramId` pair. A Customer may have at most one Membership record for a Program; a closed Membership cannot be replaced by a new join in the initial product model.

- A newly created Membership starts `ACTIVE`.
- Canonical states are `ACTIVE`, `SUSPENDED`, and `CLOSED`; generic Blueprint `INACTIVE` wording is reconciled to the applicable non-active semantics and is not a fourth initial state.
- Allowed transitions are `ACTIVE → SUSPENDED`, `ACTIVE → CLOSED`, `SUSPENDED → ACTIVE`, and `SUSPENDED → CLOSED`. `CLOSED` is terminal.
- Suspension and reactivation preserve Membership ID, join date, Reward/XP/Status/history references, and historical records. They do not reset balances or progression.
- Closed Memberships preserve history and cannot rejoin or be replaced in the initial MVP. Future rejoin requires a separate Product Decision covering balances, XP, Status, Benefits, join date, account reuse, and history.
- Creation requires valid Customer, active Loyalty Program, operational/active Brand where applicable, and no existing Customer/Program Membership. Authentication session enforcement belongs to the application/API integration layer.
- Membership lifecycle events use approved repository names: `MembershipCreated`, `MembershipActivated` for activation/reactivation, `MembershipSuspended`, and `MembershipClosed`; events carry stable identifiers and no unnecessary Customer PII.

LP-006001 implements only these aggregate and identity/lifecycle rules. Account balances, Status progression, earning, redemption, persistence, RLS, Authentication sessions, and transaction processing remain separate capabilities.

## Reward Rule Configuration Decision — 2026-08-08

LP-005005 uses integer minor-unit monetary amounts and integer Reward Points. Reward Rules use the effective Business-derived currency context of the Loyalty Program; individual rules do not carry independent currencies and no FX conversion is introduced.

- Range lower bounds are inclusive and upper bounds are exclusive; overlapping or contradictory ranges are rejected.
- Earning uses deterministic integer-safe arithmetic and floors fractional points.
- A valid amount below an applicable minimum awards zero points without a business error.
- Every earning decision references the immutable effective Program configuration version used for evaluation; historical decisions are never recalculated or rewritten.
- Identical input, currency context, rule set, and configuration version produce the same result.

LP-005005 does not implement receipt ingestion, ledger persistence, balance mutation, redemption, Membership behavior, or FX conversion.

## XP Rule Configuration Decision — 2026-08-08

LP-005008 treats XP as separate non-monetary progression experience. XP amounts are non-negative whole integers and are never redeemable, transferred, converted to Reward Points, or mixed with Reward Point balances.

- Initial rule types are `VISIT`, `PURCHASE`, `PURCHASE_AMOUNT_THRESHOLD`, and `VISIT_FREQUENCY`.
- Visit-frequency windows use rolling calendar-day durations with inclusive start and end boundaries.
- Enabled rules are evaluated independently and all qualifying awards are additive; there is no precedence or first-match behavior.
- Purchase thresholds use integer minor-unit amounts and the effective Program currency context without FX conversion.
- Every result carries the source-activity identity, rule identity, and immutable Program configuration-version identity so later XP ledger processing can enforce idempotency and history binding.
- Disabled rules affect only evaluations using effective versions where they are disabled; historical decisions are not recalculated.

LP-005008 does not implement activity ingestion, XP Account/Ledger persistence, Status promotion, Receipt processing, database queries, or RLS.

## MVP Benefit Definition Decision — 2026-08-08

LP-005010 defines a constrained typed Status Benefit catalog, not a universal Benefit Engine. Benefit Definitions are immutable Program configuration owned by a configuration version; Customer-specific assignment belongs to Membership/Status capabilities.

The initial Benefit types are `REWARD_POINT_MULTIPLIER`, `POINT_EXPIRATION_EXTENSION`, `REDEMPTION_LIMIT_OVERRIDE`, and `PROMOTION_ACCESS`, each with type-specific validated configuration. Multipliers and percentages use deterministic decimal-safe representations; expiration extensions use positive calendar days; promotion access uses stable non-empty keys.

LP-005010 does not define stacking/conflict behavior, arbitrary expressions, scripts, reward grants, notification, automation, assignment, persistence, or RLS behavior. Those remain owned by their respective domains or future Product Decisions.

When a Product Decision supersedes an earlier architectural assumption, the corresponding Blueprint documents should be updated to preserve a single authoritative interpretation.

PD-017

Instant Rewards

Decision

The platform supports configurable Instant Rewards as an optional engagement mechanism.

Instant Rewards are independent from the Reward Point economy and are triggered by business events.

Each qualifying event generates one independent reward opportunity.

Customers may accumulate multiple unopened reward opportunities, each capable of revealing a different reward.

Each Reward Opportunity remains independently auditable and follows its own lifecycle from creation to redemption or expiration.

Reason

Unexpected rewards create stronger customer engagement than predictable point accumulation alone.

The mechanism increases application usage while preserving the integrity of the Reward Point system.

Alternative Considered

Always awarding fixed Reward Points after every purchase.

Reason for Rejection

Predictable rewards become routine and generate less excitement.

Separating Instant Rewards from Reward Points allows businesses to create richer customer experiences without changing the core loyalty economy.

# PD-018

## Reward Experience

### Decision

The platform supports multiple Reward Experiences.

Supported experiences:

- Standard Experience
- Surprise Experience

### Standard Experience

Customers immediately receive configured rewards after qualifying events.

### Surprise Experience

Customers receive Reward Opportunities that may later be opened within the Customer App.

Reward Opportunities use configurable Reward Pools and probabilities.

### Business Rules

Reward Experience changes only the customer interaction model.

It never changes:

- Reward calculations
- Memberships
- Reward balances
- XP
- Status
- Benefits

Businesses may switch between Reward Experiences at any time without affecting historical data.

### Reason

Different businesses require different customer engagement models.

The platform should support both predictable and surprise-based loyalty experiences while preserving the same underlying Reward Engine.
## MVP Reward Definition, Eligibility, and Redemption Decision — 2026-08-08

Reward Definitions are immutable configuration owned by a Loyalty Program configuration version. They use positive integer `pointsCost`, an enabled flag, descriptive types, optional Status Level references, and optional ALL-required Benefit Definition references. Redemption uses fixed pointsCost only; no inventory, fulfillment, monetary discount calculation, partial redemption, or multi-reward baskets are included.

The initial flow is eligibility → reservation → confirmation or cancellation/expiration. Only ACTIVE Membership, operational Program, enabled Reward, satisfied Status/Benefit restrictions, and AVAILABLE points qualify. Reservations default to 15 minutes, preserve their original configuration version and price, and transition points through immutable ledger descriptors. Duplicate logical requests are idempotent and concurrent attempts must not overspend in the domain contract; distributed enforcement remains deferred.
