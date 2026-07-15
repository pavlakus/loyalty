59. Coding Standards

1. Purpose

Ovaj dokument definiše obavezne coding standarde za Loyalty Platform projekat.

Ciljevi su:

* konzistentan kod između različitih timova i AI agenata;
* jasna domenska terminologija;
* stabilni API i Event contracts;
* bezbedne database migracije;
* predvidivo error ponašanje;
* lako testiranje;
* lakši code review;
* smanjenje tehničkog duga;
* očuvanje module boundaries.

Ovaj dokument ne uvodi nova poslovna pravila.

⸻

2. General Principles

Kod mora biti:

* jasan;
* eksplicitan;
* testabilan;
* deterministički;
* bezbedan;
* modularan;
* observabilan;
* dokumentovan gde ponašanje nije očigledno.

Prednost ima razumljiv kod u odnosu na preterano apstraktan kod.

Ne koristiti apstrakciju dok ne postoji stvarna potreba ili dokazano ponavljanje.

Business terminology mora pratiti:

00-platform-glossary.md

⸻

3. Language and Runtime

Preporučeni jezik za backend i frontend:

TypeScript

TypeScript pravila:

* strict mode je obavezan;
* implicit any nije dozvoljen;
* any se koristi samo uz dokumentovano opravdanje;
* nullable vrednosti moraju biti eksplicitne;
* API i Event payload-i moraju imati runtime validation;
* type assertions moraju biti minimalne;
* unsafe casting nije dozvoljen radi prolaska build-a.

⸻

4. Naming Conventions

Directories

kebab-case

Primeri:

instant-reward
reward-goal
business-portal
event-dispatcher

TypeScript files

kebab-case.ts

Primeri:

record-receipt.handler.ts
reward-points-earned.event.ts
membership.repository.ts

Classes, Types and Interfaces

PascalCase

Primeri:

RecordReceiptCommand
RewardAccount
MembershipRepository
ReceiptRecordedEvent

Functions and variables

camelCase

Primeri:

recordReceipt
membershipId
availableBalance

Constants

UPPER_SNAKE_CASE

Primeri:

MAX_RETRY_ATTEMPTS
DEFAULT_QUIET_HOURS_START

Database objects

snake_case

Primeri:

reward_transactions
membership_years
benefit_grants

⸻

5. Domain Naming

Domain terminology must be consistent.

Use:

Reward Points
XP
Status
Benefit
Membership
Membership Year
Receipt
Reward Opportunity
Reward Goal
Loyalty Program
Loyalty Network

Do not use ambiguous synonyms in code.

Forbidden examples:

coins
credits
score
tier_points
progress_points
customer_card
user_program
gift_record

unless explicitly defined as a different domain concept.

Progress Engine must not be used as synonym for Status Engine.

⸻

6. Command Naming

Commands represent requested business actions.

Format:

ImperativePascalCase

Examples:

RecordReceipt
CancelReceipt
EarnRewardPoints
ReleasePendingRewardPoints
ReserveRewardPoints
ConfirmRedemption
OpenInstantReward
GrantBenefit
EvaluateStatus
JoinLoyaltyProgram

Command classes:

RecordReceiptCommand

Command handlers:

RecordReceiptHandler

File names:

record-receipt.command.ts
record-receipt.handler.ts

Commands must not use vague names such as:

ProcessData
HandleCustomer
UpdateState
ExecuteAction

⸻

7. Event Naming

Events represent facts that already happened.

Format:

PastTensePascalCase

Examples:

ReceiptRecorded
RewardPointsEarned
StatusUpgraded
BenefitGranted
InstantRewardOpened

Event class:

ReceiptRecordedEvent

Event file:

receipt-recorded.event.ts

Event names must match:

37-event-catalog.md

Do not invent aliases without updating the Event Catalog.

⸻

8. Query Naming

Queries represent read operations.

Examples:

GetMembership
GetMembershipProgress
ListCustomerMemberships
GetRedemptionOptions
GetActiveBenefits
ListInstantRewardOpportunities

Query classes:

GetMembershipQuery

Handlers:

GetMembershipHandler

Queries must not mutate state.

⸻

9. Aggregate Naming

Aggregate root names use singular domain terminology.

Examples:

Membership
RewardAccount
Receipt
RewardReservation
BenefitGrant
RewardOpportunity
LoyaltyNetwork

Aggregate methods should express business intent.

Good:

receipt.cancel(reason)
rewardAccount.reserve(amount)
benefitGrant.redeem(context)
membership.suspend(reason)

Bad:

receipt.updateStatus("cancelled")
rewardAccount.setBalance(newBalance)
benefitGrant.setUsed(true)

⸻

10. Module Boundaries

Each module exposes a public API through:

index.ts

Other modules may import only from this public entry point.

Allowed:

import { ReserveRewardPoints } from "@/modules/reward";

Forbidden:

import { RewardRepository } from "@/modules/reward/infrastructure/repositories/reward.repository";

Private implementation details must remain private.

Circular dependencies are forbidden.

⸻

11. Dependency Direction

Preferred dependency direction:

API
→ Application
→ Domain

Infrastructure implements ports defined by Application or Domain.

Domain layer must not depend on:

* framework;
* HTTP;
* database driver;
* Supabase SDK;
* React;
* logging provider;
* external provider SDK.

Application layer coordinates use cases.

Infrastructure layer handles technical integrations.

⸻

12. Controller Standards

Controllers must:

* parse request;
* validate input;
* resolve authenticated context;
* call application use case;
* map result to response;
* map known errors to API contract.

Controllers must not:

* calculate Reward Points;
* evaluate Status;
* open database transactions directly;
* contain business conditions;
* write audit logic manually;
* publish Events outside approved application flow.

Controller methods should remain small and predictable.

⸻

13. Service Standards

Avoid generic Service classes with many unrelated responsibilities.

Good:

RewardExpirationPolicy
StatusEvaluationService
MembershipYearFactory
RewardSelectionPolicy

Bad:

LoyaltyService
CommonService
HelperService
UtilsService
PlatformService

Service names must communicate exact responsibility.

⸻

14. Function Standards

Functions should:

* have one clear responsibility;
* use explicit parameter names;
* avoid hidden global state;
* avoid side effects unless their purpose is a side effect;
* return predictable results;
* avoid excessive nesting;
* fail with typed errors.

Prefer early return for invalid or terminal states.

Do not use boolean parameters when they hide meaning.

Bad:

processReward(true, false);

Good:

processReward({
  releaseImmediately: true,
  notifyCustomer: false,
});

⸻

15. DTO Standards

DTOs represent transport contracts.

DTOs must not contain domain behavior.

Naming:

RecordReceiptRequest
RecordReceiptResponse
MembershipSummaryResponse

API DTOs and internal domain objects must not be treated as the same structure by default.

Mapping should be explicit.

⸻

16. Validation Standards

Validation exists at multiple levels.

API validation

Checks:

* structure;
* types;
* format;
* required fields;
* allowed lengths;
* enum values.

Domain validation

Checks:

* business eligibility;
* lifecycle state;
* ownership;
* limits;
* invariants.

Database validation

Checks:

* referential integrity;
* uniqueness;
* valid ranges;
* tenant ownership where enforceable;
* immutable constraints.

Frontend validation is for UX only.

It does not replace backend validation.

⸻

17. Error Standards

Every expected error must use a stable code.

Format:

DOMAIN_REASON

Examples:

MEMBERSHIP_NOT_ACTIVE
REWARD_BALANCE_INSUFFICIENT
REDEMPTION_RESERVATION_EXPIRED
RECEIPT_ALREADY_CANCELLED
INSTANT_REWARD_ALREADY_OPENED
PERMISSION_DENIED
TENANT_SCOPE_MISMATCH

Error object should contain:

code
message
correlation_id
details

details must contain only safe information.

⸻

18. HTTP Status Mapping

Recommended mapping:

400 — validation or invalid request
401 — unauthenticated
403 — unauthorized or scope violation
404 — resource not found without leakage
409 — conflict or concurrency issue
422 — business rule violation where appropriate
429 — rate limit
500 — unexpected internal error
503 — temporary unavailable dependency

The same business error must map consistently across endpoints.

⸻

19. Error Message Rules

Client-facing messages must be:

* safe;
* understandable;
* non-technical;
* stable enough for UI mapping.

Do not expose:

* SQL;
* stack trace;
* table names;
* internal IDs;
* provider secrets;
* file system paths;
* service-role details.

Logs may contain technical context, but must not contain secrets or unnecessary personal data.

⸻

20. Idempotency Standards

Critical commands must accept or derive an idempotency key.

Idempotency key must be scoped by:

* tenant;
* command type;
* actor or integration;
* relevant resource.

Idempotency records should store:

* key;
* request hash;
* status;
* result reference;
* created time;
* completed time;
* failure classification.

Same key with different request payload must return conflict.

Parallel requests must produce one business outcome.

⸻

21. Transaction Standards

Database transaction boundaries must align with business atomicity.

One transaction may include:

* aggregate write;
* ledger entry;
* outbox Event;
* idempotency result;
* required audit record.

Do not perform external provider calls inside long-running database transactions.

External side effects should occur after commit through async processing where possible.

⸻

22. Event Outbox Standards

Business Events must use a transactional outbox where consistency requires it.

Outbox record should contain:

event_id
event_name
event_version
aggregate_type
aggregate_id
business_id
payload
occurred_at
correlation_id
causation_id
processing_status
attempt_count

Outbox insertion occurs in the same transaction as the business state change.

⸻

23. Event Handler Standards

Every Event handler must:

* validate Event version;
* validate tenant context;
* be idempotent;
* record processing result;
* support retry;
* distinguish temporary and permanent failure;
* avoid duplicate side effects;
* preserve correlation and causation IDs.

Handler must not assume Events arrive exactly once.

⸻

24. Event Versioning

Initial version:

v1

Breaking schema change requires a new Event version.

Existing consumers must remain supported during migration.

Do not silently change Event payload while retaining the same version.

⸻

25. API Versioning

Public API base:

/api/v1

Breaking change requires:

* new endpoint version;
* migration plan;
* deprecation notice;
* consumer impact assessment;
* documentation update.

Non-breaking additive fields may remain in the same version if clients can safely ignore them.

⸻

26. API Route Standards

Routes use plural resources and business actions.

Good:

POST /receipts
POST /receipts/{receipt_id}/cancel
POST /redemptions/reserve
POST /instant-rewards/{opportunity_id}/open

Avoid generic CRUD when it hides business meaning.

Bad:

PATCH /reward-transactions/{id}
PUT /receipt/{id}
POST /execute
POST /process

⸻

27. API Response Standards

Successful responses should use stable structures.

Example:

{
  "data": {},
  "meta": {
    "correlation_id": "..."
  }
}

List responses may include:

items
pagination
filters
meta

Errors should use:

{
  "error": {
    "code": "MEMBERSHIP_NOT_ACTIVE",
    "message": "Membership is not active.",
    "correlation_id": "..."
  }
}

Do not mix multiple response styles across modules.

⸻

28. Pagination Standards

Use cursor-based pagination where large or frequently changing datasets are expected.

Offset pagination may be used for small administrative lists.

Pagination contract must define:

* page size;
* maximum page size;
* cursor semantics;
* sort order;
* stable tie-breaker.

Unbounded list endpoints are forbidden.

⸻

29. Date and Time Standards

Store timestamps in UTC.

Use ISO 8601 in APIs.

Business or Location timezone is applied only at presentation and rule-evaluation boundaries.

Never rely on server local timezone.

Use clock abstraction in domain code.

Do not call current system time directly throughout business logic.

Good:

clock.now();

This enables deterministic tests.

⸻

30. Money Standards

Money must not use floating-point arithmetic.

Represent monetary value using:

* integer minor units; or
* decimal database type with controlled precision.

Money value must include currency.

Example:

type Money = {
  amountMinor: bigint;
  currency: CurrencyCode;
};

Do not mix currencies in one calculation without explicit conversion rule.

Reward Points are not Money, even when they have redemption value.

⸻

31. Percentage Standards

Percentages must define scale.

Example:

500 basis points = 5%

Do not store ambiguous values such as:

5
0.05

without documented interpretation.

Use value object or explicit field naming:

percentage_basis_points

⸻

32. Identifier Standards

Internal primary keys:

UUID

Public tokens must be:

* non-sequential;
* non-guessable;
* revocable where needed;
* different from internal database IDs.

Never expose sensitive internal IDs without business need.

Customer phone number must never be used as public Membership identifier.

⸻

33. Database Table Naming

Tables use plural snake_case.

Examples:

businesses
brands
loyalty_programs
memberships
reward_transactions
xp_transactions
benefit_grants

Join tables should express both sides clearly.

Example:

employee_location_assignments

Avoid abbreviations unless globally accepted.

⸻

34. Database Column Naming

Use snake_case.

Common columns:

id
business_id
brand_id
loyalty_program_id
membership_id
created_at
updated_at
created_by
correlation_id
version
status

Boolean columns should express true-state clearly.

Good:

is_active
is_revoked
marketing_consent_granted

Bad:

active_flag
status_bool
value

⸻

35. Status Column Standards

Status values must use explicit enums or constrained strings.

Example:

created
active
suspended
closed

Do not use magic numeric codes.

Status transitions must be implemented through business methods or commands, not arbitrary database updates.

⸻

36. Migration Naming

Migration format:

<sequence>_<module>_<description>.sql

Examples:

0006_membership_create_memberships.sql
0007_receipt_create_receipts.sql
0008_reward_create_reward_ledger.sql

Migration name must describe the actual change.

Avoid:

fix.sql
changes.sql
update2.sql
final.sql

⸻

37. Migration Standards

Every migration must:

* be immutable after deployment;
* run on an empty database;
* run on a database with previous migrations;
* include constraints;
* include required indexes;
* include RLS where relevant;
* avoid long uncontrolled locks;
* document destructive behavior;
* include recovery plan.

Large backfills must be separated from schema changes where appropriate.

⸻

38. RLS Policy Naming

Recommended format:

<role>_<action>_<resource>_<scope>

Examples:

customer_select_own_memberships
employee_select_location_receipts
owner_manage_business_configuration

RLS policies must be readable and testable.

Avoid one massive policy containing unrelated role logic.

⸻

39. Database Function Naming

Use business-oriented names.

Examples:

record_receipt
reserve_reward_points
claim_due_notifications
open_instant_reward

Do not use vague names:

process_data
do_update
handle_action

Functions that bypass normal RLS require explicit authorization and tenant validation.

⸻

40. Repository Standards

Repository interfaces live in Application or Domain ports.

Implementations live in Infrastructure.

Repository methods must express intent.

Good:

findActiveMembership
saveRewardTransaction
lockRewardAccount
findDueRewardAllocations

Bad:

query
execute
getData
saveObject

Repositories should not expose raw database client to Domain code.

⸻

41. Logging Standards

Use structured logs.

Every relevant log should include:

timestamp
level
message
service
module
environment
correlation_id
causation_id
business_id
actor_type
actor_id where safe
operation
result
duration_ms

Do not log full request or response bodies by default.

⸻

42. Sensitive Logging Rules

Never log:

* OTP;
* access tokens;
* refresh tokens;
* API keys;
* service-role keys;
* passwords;
* full payment data;
* full phone numbers where not needed;
* full email addresses where not needed;
* reward selection secrets;
* provider credentials.

Use masking or hashing where operationally necessary.

⸻

43. Metrics Naming

Recommended pattern:

loyalty_<module>_<metric>

Examples:

loyalty_receipt_recorded_total
loyalty_redemption_failed_total
loyalty_automation_execution_duration_ms
loyalty_notification_queue_lag_seconds

Metrics labels must not include high-cardinality personal identifiers.

⸻

44. Audit Standards

Audit code should use a centralized public contract.

Do not manually construct inconsistent audit objects in every controller.

Audit action names should be stable.

Examples:

business.configuration.updated
receipt.cancelled
reward.adjusted
support.access.started
automation.activated

Audit is different from operational logging.

⸻

45. Configuration Standards

Configuration values must come from:

* environment;
* versioned Business configuration;
* feature flags;
* provider configuration.

Do not hardcode:

* reward thresholds;
* point values;
* quiet hours;
* retry count;
* provider routes;
* campaign dates;
* status thresholds.

Safe platform defaults may be defined centrally and documented.

⸻

46. Environment Variable Naming

Use uppercase SNAKE_CASE.

Examples:

DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NOTIFICATION_QUEUE_BATCH_SIZE

Every environment variable must be:

* documented;
* validated at startup;
* marked required or optional;
* assigned safe default only where appropriate.

⸻

47. Feature Flag Standards

Feature flags should have explicit names.

Examples:

instant_rewards_enabled
loyalty_network_enabled
ai_recommendations_enabled

Feature flags must not be used permanently as substitute for clean architecture.

Flag evaluation must include tenant or deployment scope where applicable.

⸻

48. Frontend Component Standards

Components should be:

* focused;
* reusable only where reuse is real;
* accessible;
* testable;
* free of business calculations.

Separate:

container or screen logic
presentation component
API hook
form schema

Avoid large screens containing API, state, business calculations and UI in one file.

⸻

49. Frontend State Standards

Server state should use dedicated query/cache mechanism.

Local UI state should remain local where possible.

Do not duplicate authoritative backend state into long-lived local stores without need.

After critical mutation:

* wait for confirmed response;
* invalidate or update relevant queries;
* show confirmed outcome;
* handle reconciliation failure.

⸻

50. Form Standards

Forms must have:

* client-side UX validation;
* backend validation;
* disabled duplicate submit;
* loading state;
* safe error mapping;
* unsaved-changes protection where important;
* accessible labels;
* predictable keyboard behavior.

Business validation messages returned from backend must be shown appropriately.

⸻

51. Mobile Storage Standards

Sensitive values must use secure storage.

Do not store:

* OTP codes;
* service credentials;
* excessive Customer profile data;
* reward selection internals.

Cached QR must follow approved Membership token strategy.

Cache must not be treated as authoritative business state.

⸻

52. Test Naming

Test names should describe behavior.

Good:

rejects redemption when available balance is insufficient
creates one receipt for parallel duplicate requests
does not downgrade status before membership year completion

Bad:

test1
works
handles error
should return 200

⸻

53. Test Structure

Recommended structure:

Given
When
Then

or:

Arrange
Act
Assert

Test must make business intent clear.

Avoid excessive mocking of core domain behavior.

Integration tests should use real database behavior where data integrity matters.

⸻

54. Test Data Standards

Fixtures must:

* be deterministic;
* use clear names;
* preserve tenant separation;
* avoid real personal data;
* be reusable where appropriate;
* state relevant timezone and currency.

Do not rely on hidden test execution order.

⸻

55. Snapshot Testing

Snapshot tests may be used for stable presentational output.

Do not use snapshots as primary validation for:

* business rules;
* Reward calculations;
* API contracts;
* permission behavior;
* database results.

Large unreadable snapshots are discouraged.

⸻

56. Mocking Standards

Mock external providers:

* SMS;
* Viber;
* Push;
* email;
* external POS;
* payment providers where future use applies.

Do not mock:

* critical domain rules in the test of that domain;
* database constraints in integration tests;
* RLS when testing permissions;
* concurrency when race behavior must be proven.

⸻

57. Code Comment Standards

Comments should explain:

* why;
* non-obvious constraint;
* regulatory or business reason;
* concurrency behavior;
* compatibility requirement;
* intentional trade-off.

Do not comment obvious syntax.

Bad:

// increment count
count++;

Good:

// A membership may receive this anniversary reward only once per Membership Year.

⸻

58. TODO Standards

TODO must include:

owner or role
reason
backlog reference
risk

Example:

TODO(LP-482, Backend): replace temporary polling with event subscription before pilot.

Untracked TODO comments are forbidden in production code.

⸻

59. Dead Code

Dead code must be removed.

Do not keep:

* commented-out implementation;
* unused feature branches inside code;
* obsolete compatibility layers;
* unused exports;
* inactive migration alternatives.

Version control preserves history.

⸻

60. Dependency Standards

New dependency requires:

* clear purpose;
* maintenance status;
* license review;
* security review;
* bundle or runtime impact;
* alternative assessment.

Do not add a library for functionality that can be implemented safely and simply in a few lines.

Avoid duplicate libraries solving the same problem.

⸻

61. Security Coding Standards

Always:

* validate input;
* use parameterized queries;
* enforce authorization server-side;
* enforce tenant scope;
* minimize data returned;
* use least privilege;
* protect secrets;
* rate-limit sensitive operations;
* avoid predictable public tokens;
* handle replay and duplicates;
* audit sensitive actions.

Never trust client-provided tenant ownership.

⸻

62. Personal Data Standards

Collect only required data.

Use Customer ID or Membership ID internally instead of phone number where possible.

Phone and email should be:

* normalized;
* access-controlled;
* masked in UI where appropriate;
* excluded from logs;
* handled according to retention policy.

Anonymization must not break immutable accounting history.

⸻

63. Performance Coding Standards

Avoid:

* N+1 queries;
* loading unbounded collections;
* synchronous provider calls in core transactions;
* rebuilding ledger balance on every request;
* full analytics scan in transactional endpoints;
* unnecessary Event payload size;
* high-cardinality metrics.

Performance optimization must be supported by measurement.

⸻

64. Concurrency Coding Standards

Concurrency-sensitive code must use explicit protection such as:

* row lock;
* advisory lock;
* conditional update;
* unique constraint;
* atomic database function;
* queue claim with SKIP LOCKED;
* version column.

Application-level check followed by separate write is insufficient for critical resources.

⸻

65. Retry Standards

Retry only temporary failures.

Use:

* bounded retry count;
* exponential backoff;
* jitter where appropriate;
* dead-letter handling;
* retry metrics.

Do not retry:

* validation errors;
* permission errors;
* permanent business-rule violations;
* duplicate-successful idempotent operations as new work.

⸻

66. Code Review Standards

Reviewer must verify:

* scope;
* naming;
* module ownership;
* dependency direction;
* business rule placement;
* validation;
* permissions;
* RLS;
* idempotency;
* concurrency;
* audit;
* error handling;
* tests;
* documentation;
* rollback.

Code style alone is not sufficient review.

⸻

67. Pull Request Standards

Every pull request must include:

Task ID
Business objective
Scope
Out of scope
Changed modules
Changed files
Database changes
API changes
Event changes
Permission and RLS impact
Tests added
Tests executed
Results
Known limitations
Risks
Rollback
Documentation
Definition of Done level

Large unrelated pull requests are forbidden.

⸻

68. Commit Standards

Commit messages should be clear and scoped.

Recommended format:

<type>(<module>): <description>

Examples:

feat(receipt): add idempotent receipt recording
fix(redemption): prevent parallel reservation overspend
test(status): cover membership-year downgrade
docs(automation): document execution retry behavior

Allowed types:

feat
fix
test
docs
refactor
perf
build
ci
chore
revert

⸻

69. Branch Standards

Format:

agent/<role>/<task-id>-<description>

One branch corresponds to one task.

No direct commit to:

main
uat
production

Branch names must not include personal data or secrets.

⸻

70. Generated Code Standards

Generated code must be:

* reproducible;
* identifiable;
* derived from versioned source;
* reviewed;
* committed only when project strategy requires it.

Do not manually edit generated files unless explicitly supported.

Generated API clients should come from approved contracts.

Generated code that affects business logic, security, financial calculations or public APIs must undergo review before acceptance.

Review may be performed by:

- Human reviewer
- Architecture Review Agent
- Pull Request Review Agent

For critical generated code, the implementation should record:

- prompt version (where applicable)
- generator identity
- review evidence

Generated code ownership belongs to the project after acceptance.

⸻

71. Technical Debt Classification

Technical debt should be classified using the following levels:

TD1
Minor cleanup.

TD2
Maintainability issue.

TD3
Architecture, scalability or performance concern.

TD4
Security, data integrity or production-release blocker.

Every TD item should include:

- description
- owner
- impact
- risk
- target milestone
- backlog reference

72. Documentation Standards

Every module README should include:

Purpose
Responsibilities
Out of Scope
Owned Data
Commands
Events Produced
Events Consumed
Queries
APIs
Dependencies
Permissions
Failure Modes
Tests
Observability
Rollback
Known Limitations

Documentation must match current implementation.

⸻

73. ADR Standards

ADR file format:

ADR-XXXX-short-title.md

Status values:

Proposed
Accepted
Rejected
Superseded
Deprecated

ADR must not override locked business decisions.

Material architecture changes require Product Owner or authorized technical approval.

⸻

74. Forbidden Patterns

Forbidden unless explicitly approved:

* business logic in frontend;
* business logic in controllers;
* direct cross-module table writes;
* mutable Reward Ledger;
* mutable XP Ledger;
* mutable Receipt;
* hidden tenant filtering only in UI;
* service-role without business validation;
* generic catch returning raw error;
* unbounded endpoint;
* floating-point money;
* Event without version;
* critical action without idempotency;
* manual production database change;
* migration edited after deployment;
* test disabled to pass CI;
* broad any;
* secrets in repository;
* one giant shared utility module;
* undocumented background job.

⸻

75. Lint and Automated Enforcement

Automated tooling should enforce where possible:

* TypeScript strict mode;
* unused imports;
* import boundaries;
* circular dependency detection;
* forbidden internal imports;
* formatting;
* test naming conventions where practical;
* secret scanning;
* dependency vulnerabilities;
* migration naming;
* generated contract validation.

Rules that cannot be automated remain mandatory review items.

⸻

76. Coding Standards Exceptions

Exception must include:

Rule:
Reason:
Scope:
Risk:
Owner:
Expiration:
Remediation Task:
Approval:

Agent cannot self-approve an exception.

Temporary exceptions must have removal date or milestone.

⸻

77. Definition of Coding Standards Ready

Coding Standards are ready when:

* naming rules are defined;
* module boundaries are enforceable;
* Command, Event and Query naming is standardized;
* API and error contracts are standardized;
* database and migration rules are defined;
* idempotency and concurrency rules are defined;
* frontend and mobile rules exist;
* test rules exist;
* security and privacy rules exist;
* PR and commit standards exist;
* forbidden patterns are documented;
* exceptions require explicit approval.

