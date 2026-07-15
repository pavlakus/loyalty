52. Repository Structure

1. Purpose

Ovaj dokument definiše preporučenu strukturu repozitorijuma za Loyalty Platform.

Ciljevi su:

* jasno vlasništvo nad modulima;
* odvajanje poslovne logike od UI-a;
* deljenje zajedničkih tipova bez deljenja poslovne logike;
* jednostavan rad više ljudi i AI agenata;
* mogućnost kasnijeg izdvajanja modula u zasebne servise;
* kontrolisane zavisnosti između domena.

Struktura repozitorijuma ne sme menjati poslovne i arhitektonske odluke iz Blueprint-a.

⸻

2. Repository Strategy

Za početnu implementaciju koristi se monorepo.

Monorepo sadrži:

* backend aplikaciju;
* Customer App;
* Employee App;
* Business Portal;
* zajedničke pakete;
* bazu i migracije;
* testove;
* infrastrukturu;
* dokumentaciju.

Monorepo ne znači da svi moduli dele poslovnu logiku.

Svaki domen zadržava jasno vlasništvo i granice.

⸻

3. Recommended Top-Level Structure

loyalty-platform/
├── apps/
├── services/
├── packages/
├── database/
├── tests/
├── infrastructure/
├── scripts/
├── docs/
├── .github/
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
├── README.md
└── AGENTS.md

⸻

4. Applications

4.1 Customer App

apps/customer-mobile/
├── src/
│   ├── app/
│   ├── features/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── hooks/
│   ├── api/
│   ├── state/
│   ├── storage/
│   ├── analytics/
│   ├── notifications/
│   ├── localization/
│   ├── theme/
│   └── types/
├── assets/
├── tests/
├── app.config.ts
├── package.json
└── README.md

Responsibilities:

* customer authentication UI;
* loyalty program discovery;
* membership overview;
* QR presentation;
* reward balance and history;
* reward goals;
* challenges;
* status progress;
* benefits;
* instant rewards;
* notification preferences.

Customer App must not calculate:

* points;
* XP;
* status;
* benefits;
* redemption values;
* reward probabilities.

⸻

4.2 Employee App

apps/employee-mobile/
├── src/
│   ├── app/
│   ├── features/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── scanner/
│   ├── api/
│   ├── state/
│   ├── storage/
│   ├── localization/
│   ├── theme/
│   └── types/
├── assets/
├── tests/
├── app.config.ts
├── package.json
└── README.md

Responsibilities:

* employee authentication;
* membership QR scanning;
* receipt preview;
* receipt confirmation;
* redemption preview;
* redemption confirmation;
* cancellation request where permitted;
* transaction history within assigned scope.

Employee App does not directly grant points, XP, benefits or status.

It records business actions through backend APIs.

⸻

4.3 Business Portal

apps/business-portal/
├── src/
│   ├── app/
│   ├── features/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   ├── api/
│   ├── state/
│   ├── permissions/
│   ├── analytics/
│   ├── localization/
│   ├── theme/
│   └── types/
├── public/
├── tests/
├── package.json
└── README.md

Responsibilities:

* business onboarding;
* Brand configuration;
* Loyalty Program configuration;
* reward rules;
* status levels;
* benefit definitions;
* automation templates;
* campaign management;
* analytics;
* AI recommendations;
* employee and location management;
* network management;
* audit visibility.

Business Portal UI permissions do not replace backend authorization.

⸻

4.4 Platform Admin Portal

apps/platform-admin/
├── src/
├── tests/
├── package.json
└── README.md

Platform Admin Portal may be implemented after core MVP modules.

Responsibilities:

* platform-level Business management;
* support access management;
* system template management;
* provider configuration;
* platform monitoring;
* global audit review;
* feature flags.

Platform administrators must never directly edit immutable business ledgers.

⸻

5. Backend Service

For the initial implementation, backend business logic may run as one modular service.

services/api/
├── src/
│   ├── bootstrap/
│   ├── config/
│   ├── modules/
│   ├── shared/
│   ├── infrastructure/
│   ├── middleware/
│   ├── workers/
│   ├── jobs/
│   ├── observability/
│   └── server.ts
├── tests/
├── package.json
└── README.md

The service is modular internally and must not become one unstructured application.

⸻

6. Backend Module Structure

Each business module follows the same structure.

services/api/src/modules/<module-name>/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── policies/
│   ├── services/
│   └── errors/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   ├── dto/
│   └── ports/
├── infrastructure/
│   ├── repositories/
│   ├── persistence/
│   ├── projections/
│   └── adapters/
├── api/
│   ├── controllers/
│   ├── routes/
│   ├── schemas/
│   └── serializers/
├── tests/
└── index.ts

⸻

7. Core Backend Modules

services/api/src/modules/
├── authentication/
├── customer/
├── business/
├── brand/
├── location/
├── employee/
├── loyalty-program/
├── membership/
├── receipt/
├── reward/
├── redemption/
├── xp/
├── visit/
├── status/
├── benefit/
├── challenge/
├── reward-goal/
├── instant-reward/
├── automation/
├── notification/
├── analytics/
├── strategy/
├── loyalty-network/
├── audit/
└── platform-administration/

Modules must use the terminology defined in:
Module names are stable architectural identifiers.

Changing module names after implementation starts requires an ADR and migration impact assessment.

* 00-platform-glossary.md;
* 33-domain-model-v2.md;
* 42-data-model-v1.md.

⸻

8. Shared Backend Code

services/api/src/shared/
├── application/
├── domain/
├── errors/
├── events/
├── idempotency/
├── permissions/
├── tenancy/
├── time/
├── money/
├── pagination/
├── validation/
└── types/

Shared code may contain only genuinely cross-domain concepts.

Allowed examples:

* Money;
* Currency;
* Date range;
* Pagination;
* Domain event envelope;
* Correlation ID;
* Idempotency key;
* tenant context;
* common error base classes.

Forbidden shared code:

* reward calculation;
* status calculation;
* benefit eligibility;
* receipt processing;
* automation matching;
* domain-specific repositories.

Business logic must remain inside its owning module.

⸻

9. Workers and Background Processing

services/api/src/workers/
├── event-dispatcher/
├── automation-runner/
├── notification-delivery/
├── projection-builder/
├── reward-release/
├── reward-expiration/
├── benefit-expiration/
├── opportunity-expiration/
├── inactivity-evaluation/
└── analytics-aggregation/

Workers must:

* use atomic claiming;
* support retries;
* be idempotent;
* record execution history;
* avoid duplicate processing;
* expose operational metrics.

⸻

10. Scheduled Jobs

services/api/src/jobs/
├── daily/
├── hourly/
├── monthly/
└── membership-year/

Scheduled jobs only initiate commands or events.

They must not contain domain logic directly.

Example:

Points Expiration Job
→ identifies due records
→ sends ExpireRewardPoints command
→ Reward Engine performs expiration

⸻

11. Shared Packages

packages/
├── api-contracts/
├── event-contracts/
├── shared-types/
├── validation/
├── design-system/
├── mobile-ui/
├── web-ui/
├── localization/
├── observability/
├── testing/
└── config/

⸻

11.1 API Contracts

packages/api-contracts/
├── src/
│   ├── auth/
│   ├── customers/
│   ├── memberships/
│   ├── receipts/
│   ├── redemptions/
│   ├── benefits/
│   ├── instant-rewards/
│   ├── business/
│   ├── configuration/
│   └── networks/

Contains:

* request schemas;
* response schemas;
* public DTOs;
* API error contracts;
* endpoint version definitions.

Does not contain domain logic.

⸻

11.2 Event Contracts

packages/event-contracts/
├── src/
│   ├── authentication/
│   ├── customer/
│   ├── membership/
│   ├── receipt/
│   ├── reward/
│   ├── xp/
│   ├── status/
│   ├── benefit/
│   ├── challenge/
│   ├── instant-reward/
│   ├── automation/
│   ├── notification/
│   └── network/

Contains stable public event schemas.

Internal module implementation details must not be exposed through event contracts.

⸻

11.3 Design System

packages/design-system/

Used by web applications.

Contains:

* typography;
* spacing;
* colors;
* buttons;
* form components;
* tables;
* dialogs;
* accessibility rules.

Business logic is forbidden.

⸻

11.4 Mobile UI

packages/mobile-ui/

Used by Customer App and Employee App only where shared UX is appropriate.

Shared components must not force the two applications to have identical business journeys.

⸻

12. Database Structure

database/
├── migrations/
├── schemas/
├── functions/
├── triggers/
├── policies/
├── indexes/
├── seeds/
├── fixtures/
├── tests/
└── README.md

⸻

12.1 Migrations

database/migrations/
├── 0001_foundation.sql
├── 0002_authentication.sql
├── 0003_business.sql
├── 0004_brand.sql
├── 0005_loyalty_program.sql
├── 0006_membership.sql
├── 0007_receipts.sql
├── 0008_reward_ledger.sql
├── 0009_xp_ledger.sql
├── 0010_status.sql
├── 0011_benefits.sql
├── 0012_redemption.sql
├── 0013_automation.sql
├── 0014_notifications.sql
├── 0015_instant_rewards.sql
├── 0016_analytics.sql
└── 0017_loyalty_network.sql

Migration rules:

* migrations are immutable after deployment;
* corrections use new migrations;
* every migration must support rollback or documented recovery;
* destructive changes require explicit review;
* indexes and RLS policies are part of the module delivery;
* no manual production schema changes.

⸻

12.2 RLS Policies

database/policies/
├── customer/
├── business/
├── employee/
├── integration/
├── support/
└── admin/

Policy definitions may be split for documentation and testability, while deployment remains migration-driven.

⸻

12.3 Database Functions

Database functions are allowed for:

* atomic business operations;
* concurrency control;
* ledger-safe writes;
* queue claiming;
* cross-table validation that must be transactional.

Database functions must not become an undocumented second backend.

Every function requires:

* purpose;
* inputs;
* outputs;
* permission model;
* idempotency behavior;
* tests;
* owning module.

⸻

13. Testing Structure

tests/
├── contract/
├── integration/
├── end-to-end/
├── security/
├── performance/
├── resilience/
├── migration/
├── uat/
└── fixtures/

Module-local tests remain inside the module.

Cross-module and full-system tests live under top-level tests/.

⸻

14. Infrastructure

infrastructure/
├── environments/
│   ├── local/
│   ├── development/
│   ├── uat/
│   └── production/
├── deployment/
├── monitoring/
├── alerting/
├── secrets/
├── backups/
├── feature-flags/
└── README.md

Secrets must never be committed.

Only secret names, required formats and provisioning instructions belong in the repository.

⸻

15. Scripts

scripts/
├── setup/
├── database/
├── seed/
├── test/
├── lint/
├── release/
├── verification/
└── maintenance/

Scripts must:

* be repeatable;
* fail clearly;
* validate environment;
* avoid destructive defaults;
* document required permissions.

⸻

16. Documentation

docs/
├── blueprint/
├── engineering/
├── architecture/
├── api/
├── runbooks/
├── decisions/
├── uat/
└── agents/

Recommended placement:

docs/blueprint/
00-platform-glossary.md
...
50-blueprint-index.md
docs/engineering/
51-engineering-implementation-guide.md
52-repository-structure.md
...
docs/agents/
agent prompts
agent knowledge maps
agent execution rules

⸻

17. Architecture Decision Records

docs/decisions/
├── ADR-0001-monorepo.md
├── ADR-0002-event-driven-modular-backend.md
├── ADR-0003-ledger-immutability.md
└── ADR-0004-projection-strategy.md

Any material architectural change requires an ADR.

An ADR must include:

* context;
* decision;
* alternatives considered;
* consequences;
* migration impact;
* approval status.

AI agents may propose ADRs.

AI agents may not approve architecture changes themselves.

⸻

18. GitHub Configuration

.github/
├── workflows/
├── ISSUE_TEMPLATE/
├── PULL_REQUEST_TEMPLATE.md
├── CODEOWNERS
├── dependabot.yml
└── agents/

Required workflows:

* lint;
* type check;
* unit tests;
* integration tests;
* migration validation;
* security scan;
* build;
* deployment verification.

⸻

19. Agent Instructions

Every major directory should contain an AGENTS.md file when local instructions differ.

Example:

services/api/src/modules/reward/AGENTS.md

It defines:

* owning agent or role;
* required documents;
* allowed changes;
* forbidden changes;
* module-specific Definition of Done;
* mandatory tests.

Nearest AGENTS.md takes precedence for files inside its directory, but may not override Blueprint decisions.

⸻

20. Dependency Rules

Allowed:

apps
→ api-contracts
→ shared UI packages
API module
→ shared infrastructure abstractions
→ its own domain
Module A
→ public contract or event of Module B

Forbidden:

Customer App
→ backend domain implementation
Reward module
→ Status private repository
Analytics
→ modification of transactional tables
Shared package
→ feature-specific business logic
Circular module dependencies

⸻

21. Import Rules

Each module exposes a public entry point through:

index.ts

Other modules may import only from that public entry point.

Forbidden:

import from another-module/internal/path

Allowed:

import from another-module

This rule must be enforceable through linting or dependency-boundary tooling.

⸻

22. Naming Rules

Directories:

kebab-case

TypeScript files:

kebab-case.ts

Classes and types:

PascalCase

Functions and variables:

camelCase

Database objects:

snake_case

Events:

PastTensePascalCase

Examples:

ReceiptRecorded
RewardPointsEarned
StatusUpgraded
BenefitExpired

Commands:

ImperativePascalCase

Examples:

RecordReceipt
ReserveRewardPoints
OpenInstantReward

⸻

23. Ownership Rules

Each production file must have one clear owning module.

Cross-module changes require:

* explanation of dependency;
* review from affected module owners;
* updated tests;
* updated documentation where relevant.

No agent should perform broad refactoring outside the assigned scope without explicit authorization.

⸻

24. Initial Simplification

The first implementation may use:

* one backend deployment;
* one PostgreSQL database;
* one event outbox;
* one worker process;
* one shared CI pipeline.

It must still preserve logical module boundaries.

Operational simplification is allowed.

Domain boundary erosion is not allowed.

⸻

25. Future Service Extraction

A module may later become a separate service when justified by:

* independent scaling;
* security isolation;
* deployment frequency;
* operational ownership;
* sustained performance pressure;
* regulatory requirements.

Extraction must not be performed only because microservices appear more advanced.

The modular monolith remains the default until evidence justifies separation.

⸻

26. Definition of Repository Ready

The repository is ready for feature development when:

* top-level folders exist;
* workspace configuration works;
* TypeScript base configuration exists;
* linting and formatting work;
* test runner works;
* local environment starts;
* database migrations run;
* CI validates pull requests;
* module boundary rules are enforced;
* secrets are excluded;
* environment templates exist;
* root README explains setup;
* root AGENTS.md exists;
* no business feature is implemented before the foundation passes.52. Repository Structure

1. Purpose

Ovaj dokument definiše preporučenu strukturu repozitorijuma za Loyalty Platform.

Ciljevi su:

* jasno vlasništvo nad modulima;
* odvajanje poslovne logike od UI-a;
* deljenje zajedničkih tipova bez deljenja poslovne logike;
* jednostavan rad više ljudi i AI agenata;
* mogućnost kasnijeg izdvajanja modula u zasebne servise;
* kontrolisane zavisnosti između domena.

Struktura repozitorijuma ne sme menjati poslovne i arhitektonske odluke iz Blueprint-a.

⸻

2. Repository Strategy

Za početnu implementaciju koristi se monorepo.

Monorepo sadrži:

* backend aplikaciju;
* Customer App;
* Employee App;
* Business Portal;
* zajedničke pakete;
* bazu i migracije;
* testove;
* infrastrukturu;
* dokumentaciju.

Monorepo ne znači da svi moduli dele poslovnu logiku.

Svaki domen zadržava jasno vlasništvo i granice.

⸻

3. Recommended Top-Level Structure

loyalty-platform/
├── apps/
├── services/
├── packages/
├── database/
├── tests/
├── infrastructure/
├── scripts/
├── docs/
├── .github/
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
├── README.md
└── AGENTS.md

⸻

4. Applications

4.1 Customer App

apps/customer-mobile/
├── src/
│   ├── app/
│   ├── features/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── hooks/
│   ├── api/
│   ├── state/
│   ├── storage/
│   ├── analytics/
│   ├── notifications/
│   ├── localization/
│   ├── theme/
│   └── types/
├── assets/
├── tests/
├── app.config.ts
├── package.json
└── README.md

Responsibilities:

* customer authentication UI;
* loyalty program discovery;
* membership overview;
* QR presentation;
* reward balance and history;
* reward goals;
* challenges;
* status progress;
* benefits;
* instant rewards;
* notification preferences.

Customer App must not calculate:

* points;
* XP;
* status;
* benefits;
* redemption values;
* reward probabilities.

⸻

4.2 Employee App

apps/employee-mobile/
├── src/
│   ├── app/
│   ├── features/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── scanner/
│   ├── api/
│   ├── state/
│   ├── storage/
│   ├── localization/
│   ├── theme/
│   └── types/
├── assets/
├── tests/
├── app.config.ts
├── package.json
└── README.md

Responsibilities:

* employee authentication;
* membership QR scanning;
* receipt preview;
* receipt confirmation;
* redemption preview;
* redemption confirmation;
* cancellation request where permitted;
* transaction history within assigned scope.

Employee App does not directly grant points, XP, benefits or status.

It records business actions through backend APIs.

⸻

4.3 Business Portal

apps/business-portal/
├── src/
│   ├── app/
│   ├── features/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   ├── api/
│   ├── state/
│   ├── permissions/
│   ├── analytics/
│   ├── localization/
│   ├── theme/
│   └── types/
├── public/
├── tests/
├── package.json
└── README.md

Responsibilities:

* business onboarding;
* Brand configuration;
* Loyalty Program configuration;
* reward rules;
* status levels;
* benefit definitions;
* automation templates;
* campaign management;
* analytics;
* AI recommendations;
* employee and location management;
* network management;
* audit visibility.

Business Portal UI permissions do not replace backend authorization.

⸻

4.4 Platform Admin Portal

apps/platform-admin/
├── src/
├── tests/
├── package.json
└── README.md

Platform Admin Portal may be implemented after core MVP modules.

Responsibilities:

* platform-level Business management;
* support access management;
* system template management;
* provider configuration;
* platform monitoring;
* global audit review;
* feature flags.

Platform administrators must never directly edit immutable business ledgers.

⸻

5. Backend Service

For the initial implementation, backend business logic may run as one modular service.

services/api/
├── src/
│   ├── bootstrap/
│   ├── config/
│   ├── modules/
│   ├── shared/
│   ├── infrastructure/
│   ├── middleware/
│   ├── workers/
│   ├── jobs/
│   ├── observability/
│   └── server.ts
├── tests/
├── package.json
└── README.md

The service is modular internally and must not become one unstructured application.

⸻

6. Backend Module Structure

Each business module follows the same structure.

services/api/src/modules/<module-name>/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── policies/
│   ├── services/
│   └── errors/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   ├── dto/
│   └── ports/
├── infrastructure/
│   ├── repositories/
│   ├── persistence/
│   ├── projections/
│   └── adapters/
├── api/
│   ├── controllers/
│   ├── routes/
│   ├── schemas/
│   └── serializers/
├── tests/
└── index.ts

⸻

7. Core Backend Modules

services/api/src/modules/
├── authentication/
├── customer/
├── business/
├── brand/
├── location/
├── employee/
├── loyalty-program/
├── membership/
├── receipt/
├── reward/
├── redemption/
├── xp/
├── visit/
├── status/
├── benefit/
├── challenge/
├── reward-goal/
├── instant-reward/
├── automation/
├── notification/
├── analytics/
├── strategy/
├── loyalty-network/
├── audit/
└── platform-administration/

Modules must use the terminology defined in:

* 00-platform-glossary.md;
* 33-domain-model-v2.md;
* 42-data-model-v1.md.

⸻

8. Shared Backend Code

services/api/src/shared/
├── application/
├── domain/
├── errors/
├── events/
├── idempotency/
├── permissions/
├── tenancy/
├── time/
├── money/
├── pagination/
├── validation/
└── types/

Shared code may contain only genuinely cross-domain concepts.

Allowed examples:

* Money;
* Currency;
* Date range;
* Pagination;
* Domain event envelope;
* Correlation ID;
* Idempotency key;
* tenant context;
* common error base classes.

Forbidden shared code:

* reward calculation;
* status calculation;
* benefit eligibility;
* receipt processing;
* automation matching;
* domain-specific repositories.

Business logic must remain inside its owning module.

⸻

9. Workers and Background Processing

services/api/src/workers/
├── event-dispatcher/
├── automation-runner/
├── notification-delivery/
├── projection-builder/
├── reward-release/
├── reward-expiration/
├── benefit-expiration/
├── opportunity-expiration/
├── inactivity-evaluation/
└── analytics-aggregation/

Workers must:

* use atomic claiming;
* support retries;
* be idempotent;
* record execution history;
* avoid duplicate processing;
* expose operational metrics.

⸻

10. Scheduled Jobs

services/api/src/jobs/
├── daily/
├── hourly/
├── monthly/
└── membership-year/

Scheduled jobs only initiate commands or events.

They must not contain domain logic directly.

Example:

Points Expiration Job
→ identifies due records
→ sends ExpireRewardPoints command
→ Reward Engine performs expiration

⸻

11. Shared Packages

packages/
├── api-contracts/
├── event-contracts/
├── shared-types/
├── validation/
├── design-system/
├── mobile-ui/
├── web-ui/
├── localization/
├── observability/
├── testing/
└── config/

⸻

11.1 API Contracts

packages/api-contracts/
├── src/
│   ├── auth/
│   ├── customers/
│   ├── memberships/
│   ├── receipts/
│   ├── redemptions/
│   ├── benefits/
│   ├── instant-rewards/
│   ├── business/
│   ├── configuration/
│   └── networks/

Contains:

* request schemas;
* response schemas;
* public DTOs;
* API error contracts;
* endpoint version definitions.

Does not contain domain logic.

⸻

11.2 Event Contracts

packages/event-contracts/
├── src/
│   ├── authentication/
│   ├── customer/
│   ├── membership/
│   ├── receipt/
│   ├── reward/
│   ├── xp/
│   ├── status/
│   ├── benefit/
│   ├── challenge/
│   ├── instant-reward/
│   ├── automation/
│   ├── notification/
│   └── network/

Contains stable public event schemas.

Internal module implementation details must not be exposed through event contracts.

⸻

11.3 Design System

packages/design-system/

Used by web applications.

Contains:

* typography;
* spacing;
* colors;
* buttons;
* form components;
* tables;
* dialogs;
* accessibility rules.

Business logic is forbidden.

⸻

11.4 Mobile UI

packages/mobile-ui/

Used by Customer App and Employee App only where shared UX is appropriate.

Shared components must not force the two applications to have identical business journeys.

⸻

12. Database Structure

database/
├── migrations/
├── schemas/
├── functions/
├── triggers/
├── policies/
├── indexes/
├── seeds/
├── fixtures/
├── tests/
└── README.md

⸻

12.1 Migrations

database/migrations/
├── 0001_foundation.sql
├── 0002_authentication.sql
├── 0003_business.sql
├── 0004_brand.sql
├── 0005_loyalty_program.sql
├── 0006_membership.sql
├── 0007_receipts.sql
├── 0008_reward_ledger.sql
├── 0009_xp_ledger.sql
├── 0010_status.sql
├── 0011_benefits.sql
├── 0012_redemption.sql
├── 0013_automation.sql
├── 0014_notifications.sql
├── 0015_instant_rewards.sql
├── 0016_analytics.sql
└── 0017_loyalty_network.sql

Migration rules:

* migrations are immutable after deployment;
* corrections use new migrations;
* every migration must support rollback or documented recovery;
* destructive changes require explicit review;
* indexes and RLS policies are part of the module delivery;
* no manual production schema changes.

⸻

12.2 RLS Policies

database/policies/
├── customer/
├── business/
├── employee/
├── integration/
├── support/
└── admin/

Policy definitions may be split for documentation and testability, while deployment remains migration-driven.

⸻

12.3 Database Functions

Database functions are allowed for:

* atomic business operations;
* concurrency control;
* ledger-safe writes;
* queue claiming;
* cross-table validation that must be transactional.

Database functions must not become an undocumented second backend.

Every function requires:

* purpose;
* inputs;
* outputs;
* permission model;
* idempotency behavior;
* tests;
* owning module.

⸻

13. Testing Structure

tests/
├── contract/
├── integration/
├── end-to-end/
├── security/
├── performance/
├── resilience/
├── migration/
├── uat/
└── fixtures/

Module-local tests remain inside the module.

Cross-module and full-system tests live under top-level tests/.

⸻

14. Infrastructure

infrastructure/
├── environments/
│   ├── local/
│   ├── development/
│   ├── uat/
│   └── production/
├── deployment/
├── monitoring/
├── alerting/
├── secrets/
├── backups/
├── feature-flags/
└── README.md

Secrets must never be committed.

Only secret names, required formats and provisioning instructions belong in the repository.

⸻

15. Scripts

scripts/
├── setup/
├── database/
├── seed/
├── test/
├── lint/
├── release/
├── verification/
└── maintenance/

Scripts must:

* be repeatable;
* fail clearly;
* validate environment;
* avoid destructive defaults;
* document required permissions.

⸻

16. Documentation

docs/
├── blueprint/
├── engineering/
├── architecture/
├── api/
├── runbooks/
├── decisions/
├── uat/
└── agents/

Recommended placement:

docs/blueprint/
00-platform-glossary.md
...
50-blueprint-index.md
docs/engineering/
51-engineering-implementation-guide.md
52-repository-structure.md
...
docs/agents/
agent prompts
agent knowledge maps
agent execution rules

⸻

17. Architecture Decision Records

docs/decisions/
├── ADR-0001-monorepo.md
├── ADR-0002-event-driven-modular-backend.md
├── ADR-0003-ledger-immutability.md
└── ADR-0004-projection-strategy.md

Any material architectural change requires an ADR.

An ADR must include:

* context;
* decision;
* alternatives considered;
* consequences;
* migration impact;
* approval status.

AI agents may propose ADRs.

AI agents may not approve architecture changes themselves.

⸻

18. GitHub Configuration

.github/
├── workflows/
├── ISSUE_TEMPLATE/
├── PULL_REQUEST_TEMPLATE.md
├── CODEOWNERS
├── dependabot.yml
└── agents/

Required workflows:

* lint;
* type check;
* unit tests;
* integration tests;
* migration validation;
* security scan;
* build;
* deployment verification.

⸻

19. Agent Instructions

Every major directory should contain an AGENTS.md file when local instructions differ.

Example:

services/api/src/modules/reward/AGENTS.md

It defines:

* owning agent or role;
* required documents;
* allowed changes;
* forbidden changes;
* module-specific Definition of Done;
* mandatory tests.

Nearest AGENTS.md takes precedence for files inside its directory, but may not override Blueprint decisions.

⸻

20. Dependency Rules

Allowed:

apps
→ api-contracts
→ shared UI packages
API module
→ shared infrastructure abstractions
→ its own domain
Module A
→ public contract or event of Module B

Forbidden:

Customer App
→ backend domain implementation
Reward module
→ Status private repository
Analytics
→ modification of transactional tables
Shared package
→ feature-specific business logic
Circular module dependencies

⸻

21. Import Rules

Each module exposes a public entry point through:

index.ts

Other modules may import only from that public entry point.

Forbidden:

import from another-module/internal/path

Allowed:

import from another-module

This rule must be enforceable through linting or dependency-boundary tooling.

⸻

22. Naming Rules

Directories:

kebab-case

TypeScript files:

kebab-case.ts

Classes and types:

PascalCase

Functions and variables:

camelCase

Database objects:

snake_case

Events:

PastTensePascalCase

Examples:

ReceiptRecorded
RewardPointsEarned
StatusUpgraded
BenefitExpired

Commands:

ImperativePascalCase

Examples:

RecordReceipt
ReserveRewardPoints
OpenInstantReward

Detailed naming, API, Event, migration, testing and code-quality rules are defined in:

`59-coding-standards.md`

⸻

23. Ownership Rules

Each production file must have one clear owning module.

Cross-module changes require:

* explanation of dependency;
* review from affected module owners;
* updated tests;
* updated documentation where relevant.

No agent should perform broad refactoring outside the assigned scope without explicit authorization.

⸻

24. Initial Simplification

The first implementation may use:

* one backend deployment;
* one PostgreSQL database;
* one event outbox;
* one worker process;
* one shared CI pipeline.

It must still preserve logical module boundaries.

Operational simplification is allowed.

Domain boundary erosion is not allowed.

⸻

25. Future Service Extraction

A module may later become a separate service when justified by:

* independent scaling;
* security isolation;
* deployment frequency;
* operational ownership;
* sustained performance pressure;
* regulatory requirements.

Extraction must not be performed only because microservices appear more advanced.

The modular monolith remains the default until evidence justifies separation.

⸻

26. Definition of Repository Ready

The repository is ready for feature development when:

* top-level folders exist;
* workspace configuration works;
* TypeScript base configuration exists;
* linting and formatting work;
* test runner works;
* local environment starts;
* database migrations run;
* CI validates pull requests;
* module boundary rules are enforced;
* secrets are excluded;
* environment templates exist;
* root README explains setup;
* root AGENTS.md exists;
* no business feature is implemented before the foundation passes.