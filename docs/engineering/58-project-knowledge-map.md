58. Project Knowledge Map

1. Purpose

Ovaj dokument povezuje:

* poslovne domene;
* Blueprint dokumente;
* Engineering Playbook dokumente;
* aplikacije;
* API-je;
* Events;
* data ownership;
* agentske uloge;
* UAT scenarije.

Njegov cilj je da svakom članu tima i AI agentu omogući da brzo utvrdi:

* koje dokumente mora da pročita;
* koji dokument je autoritativan;
* koji modul poseduje podatke;
* koje Events i API-je treba da proveri;
* koje testove i UAT scenarije treba da koristi;
* koje druge module sme da kontaktira samo kroz javne contracts.

Ovaj dokument ne uvodi nove poslovne odluke.

⸻

2. Knowledge Priority

Kada dokumenti sadrže preklapanje, koristi se sledeći red prioriteta:

1. Locked Product Decisions
2. Final Blueprint Documents
3. Engineering Playbook
4. Approved ADRs
5. Current API and Event Contracts
6. Module Documentation
7. Implementation Code
8. Historical or Deprecated Documents

Ako implementacija odstupa od višeg prioriteta, odstupanje mora biti prijavljeno.

⸻

3. Authoritative Documents

Sledeći dokumenti imaju poseban autoritet.

Terminology

00-platform-glossary.md

Product scope

01-product-vision.md
02-mvp-scope.md
03-business-rules.md
26-product-decisions.md
49-open-questions-final.md

Domain ownership

33-domain-model-v2.md

Implementation data model

42-data-model-v1.md

Events

37-event-catalog.md

API contracts

43-api-contract.md

Permissions

44-permission-matrix.md

Notifications

45-notification-matrix.md

Engineering rules

51-engineering-implementation-guide.md
52-repository-structure.md
53-development-roadmap.md
54-agent-development-plan.md
55-module-definition-of-done.md
56-uat-scenarios.md
57-agent-prompts.md
58-project-knowledge-map.md

⸻

4. Deprecated or Historical Documents

Sledeći dokumenti ostaju kao istorijski kontekst, ali nisu konačni izvor istine kada postoji novija definicija:

04-domain-model.md
07-domain-aggregates.md
08-data-model.md
28-glossary.md

Pravila:

* 00-platform-glossary.md ima prednost nad 28-glossary.md;
* 33-domain-model-v2.md ima prednost nad ranijim domain model dokumentima;
* 42-data-model-v1.md ima prednost nad 08-data-model.md;
* novije zaključane odluke imaju prednost nad ranim predlozima.

Agent ne sme koristiti deprecated dokument kao jedini izvor za implementaciju.

⸻

5. Universal Reading Set

Svaki agent koji menja produkcioni kod mora pročitati najmanje:

00-platform-glossary.md
26-product-decisions.md
33-domain-model-v2.md
37-event-catalog.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md
51-engineering-implementation-guide.md
52-repository-structure.md
54-agent-development-plan.md
55-module-definition-of-done.md
57-agent-prompts.md

Pored toga, mora pročitati dokumente specifične za dodeljeni modul.

⸻

6. Foundation and Repository

Domain or area

Engineering Foundation

Primary documents

05-system-architecture.md
17-security.md
22-non-functional-requirements.md
23-ai-development-guidelines.md
24-testing-strategy.md
27-ai-operating-manual.md
51-engineering-implementation-guide.md
52-repository-structure.md
53-development-roadmap.md
54-agent-development-plan.md
55-module-definition-of-done.md
57-agent-prompts.md

Owning roles

* Solution Architect Agent
* DevOps Agent
* Database Agent
* QA Agent
* Security Agent

Primary implementation areas

repository root
.github/
infrastructure/
scripts/
packages/config/
packages/observability/
packages/testing/

Required review

* Architect
* DevOps
* Security
* QA

⸻

7. Authentication and Customer Identity

Primary documents

03-business-rules.md
17-security.md
34-event-storming-customer-registration.md
37-event-catalog.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md
45-notification-matrix.md

Relevant decisions

* phone number is Customer identity;
* OTP through SMS or Viber;
* email is optional;
* Customer is global;
* phone change is not self-service;
* anonymization preserves financial and audit history.

Owning modules

authentication
customer
audit
notification

Commands

Examples:

RequestPhoneVerification
VerifyPhoneCode
AuthenticateCustomer
UpdateCustomerProfile
AnonymizeCustomer

Events

PhoneVerificationRequested
PhoneVerificationSucceeded
CustomerAuthenticated
CustomerRegistered
CustomerProfileUpdated
CustomerAnonymized

APIs

POST /api/v1/auth/request-otp
POST /api/v1/auth/verify-otp
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET /customers/me
PATCH /customers/me
POST /customers/me/anonymize

Required agents

* Backend Developer
* Database
* QA
* Security
* Customer App

UAT references

UAT-AUTH-001 to UAT-AUTH-005
UAT-CUST-001 to UAT-CUST-004
UAT-SEC-001

⸻

8. Business, Brand and Location

Primary documents

03-business-rules.md
26-product-decisions.md
29-deployment-models.md
30-brand-configuration.md
33-domain-model-v2.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md

Owning modules

business
brand
location
employee
brand-configuration

Core rules

* Business is tenant boundary;
* Business may own multiple Brands;
* Brand is customer-facing identity;
* Brand has exactly one active Loyalty Program;
* Employees and Managers are Location-scoped;
* Brand Configuration does not change domain ownership.

APIs

POST /businesses
POST /businesses/{business_id}/brands
POST /brands/{brand_id}/loyalty-program

Required agents

* Architect
* Database
* Backend Developer
* Business Portal
* QA
* Security

UAT references

UAT-BIZ-001 to UAT-BIZ-004
UAT-EMP-001 to UAT-EMP-004
UAT-SEC-002 to UAT-SEC-004

⸻

9. Loyalty Program and Strategy

Primary documents

03-business-rules.md
10-reward-engine.md
11-xp-engine.md
12-status-engine.md
26-product-decisions.md
31-instant-rewards.md
32-strategy-templates.md
43-api-contract.md
46-automation-catalog.md

Owning modules

loyalty-program
strategy
reward
xp
status
benefit
automation
instant-reward

Core rules

* one active Loyalty Program per Brand;
* Business selects a business goal, not only technical parameters;
* recommendation is explainable;
* Business Owner may accept or modify strategy;
* configuration changes do not rewrite history;
* Standard and Surprise Reward Experiences are supported.

APIs

POST /loyalty-programs/{program_id}/strategy
POST /loyalty-programs/{program_id}/strategy/accept
PUT /loyalty-programs/{program_id}/reward-rules
PUT /loyalty-programs/{program_id}/reward-experience
PUT /loyalty-programs/{program_id}/status-levels

Required agents

* Product Analysis
* Architect
* Backend Developer
* Business Portal
* QA

UAT references

UAT-BIZ-003
UAT-BIZ-004
UAT-RWD-003
UAT-AI-002

⸻

10. Membership

Primary documents

03-business-rules.md
18-customer-mobile-app.md
35-event-storming-join-loyalty-program.md
37-event-catalog.md
40-event-storming-status-and-membership-year.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md

Owning module

membership

Core rules

* Membership links Customer and Loyalty Program;
* duplicate Membership is forbidden;
* Customer may have multiple Memberships;
* each Membership has its own Membership Year;
* QR uses public Membership token;
* QR contains no personal data;
* Membership lifecycle is independent per program.

Events

MembershipCreated
MembershipActivated
MembershipBecameInactive
MembershipSuspended
MembershipClosed
CustomerJoinedLoyaltyProgram
MembershipYearStarted
MembershipYearCompleted

APIs

POST /loyalty-programs/{program_id}/join
GET /memberships/{membership_id}
GET /memberships/{membership_id}/qr
GET /memberships/{membership_id}/progress
GET /memberships/{membership_id}/transactions
POST /memberships/resolve-token

Required agents

* Architect
* Database
* Backend Developer
* Customer App
* Employee App
* QA
* Security

UAT references

UAT-MEM-001 to UAT-MEM-005

⸻

11. Receipt Processing

Primary documents

03-business-rules.md
05-system-architecture.md
19-employee-mobile-app.md
36-event-storming-purchase-processing.md
37-event-catalog.md
39-event-storming-receipt-cancellation.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md

Owning module

receipt

Core rules

* Employee App and POS record Receipt;
* they do not grant points directly;
* Receipt is immutable source of truth;
* ReceiptRecorded is root event;
* duplicate submission must be idempotent;
* cancellation creates a compensating record;
* provider or downstream failure must not delete Receipt.

Events

ReceiptRecorded
ReceiptCancellationRequested
ReceiptCancelled
ReceiptProcessingFailed

APIs

POST /receipts/preview
POST /receipts
POST /integrations/receipts
GET /receipts/{receipt_id}
POST /receipts/{receipt_id}/cancel

Required agents

* Architect
* Database
* Backend Developer
* Employee App
* QA
* Security

Mandatory specialist reviews

* concurrency;
* idempotency;
* tenant isolation;
* immutable history;
* integration scopes.

UAT references

UAT-REC-001 to UAT-REC-007
UAT-CAN-001 to UAT-CAN-004
UAT-REL-001

⸻

12. Reward Engine and Ledger

Primary documents

03-business-rules.md
10-reward-engine.md
36-event-storming-purchase-processing.md
37-event-catalog.md
38-event-storming-reward-redemption.md
39-event-storming-receipt-cancellation.md
42-data-model-v1.md
43-api-contract.md

Owning module

reward

Owned data

* Reward Ledger;
* Reward Account;
* Reward Allocations;
* Reward Reservations where assigned by final model;
* balance projection;
* Reward Rules;
* expiration state.

Core rules

* ledger is source of truth;
* balance is projection;
* FIFO redemption;
* pending points;
* configurable expiration;
* balance cannot be negative;
* reversal uses compensating transaction;
* historical Reward Rule result is not recalculated.

Events

RewardPointsEarned
RewardPointsPending
RewardPointsReleased
RewardPointsReserved
RewardReservationReleased
RewardPointsRedeemed
RewardRedemptionCancelled
RewardPointsExpired
RewardPointsReversed
RewardPointsAdjusted

Required agents

* Architect
* Database
* Backend Developer
* QA
* Security for redemption-related flows

UAT references

UAT-RWD-001 to UAT-RWD-006
UAT-RED-001 to UAT-RED-007
UAT-CAN-001 to UAT-CAN-003

⸻

13. Redemption

Primary documents

03-business-rules.md
10-reward-engine.md
16-api-design.md
38-event-storming-reward-redemption.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md

Owning module

redemption

If the final architecture keeps redemption inside Reward Engine, the logical boundary and public contracts still remain explicit.

Core rules

* preview/options;
* reserve;
* confirm;
* cancel;
* reservation prevents double spending;
* maximum allowed redemption is calculated by backend;
* no negative balance;
* Employee manually applies resulting discount in POS for MVP.

APIs

POST /redemptions/options
POST /redemptions/reserve
POST /redemptions/{reservation_id}/confirm
POST /redemptions/{reservation_id}/cancel

Required agents

* Architect
* Database
* Backend Developer
* Employee App
* QA
* Security

UAT references

UAT-RED-001 to UAT-RED-007

⸻

14. XP and Visits

Primary documents

03-business-rules.md
11-xp-engine.md
36-event-storming-purchase-processing.md
37-event-catalog.md
40-event-storming-status-and-membership-year.md
42-data-model-v1.md

Owning modules

xp
visit

If Visit remains internally under XP, the ownership must still be explicit.

Core rules

* XP has no monetary value;
* XP does not expire through Reward expiration rules;
* XP is not spent;
* Visit is qualified through configured rule;
* duplicate Visits must be prevented;
* Receipt cancellation compensates XP and Visit impact.

Events

XPEarned
XPReversed
XPAdjusted
VisitQualified

Required agents

* Architect
* Database
* Backend Developer
* QA

UAT references

UAT-XP-001 to UAT-XP-004

⸻

15. Status and Membership Year

Primary documents

03-business-rules.md
12-status-engine.md
26-product-decisions.md
37-event-catalog.md
40-event-storming-status-and-membership-year.md
42-data-model-v1.md

Owning module

status

Core rules

* Status depends on XP and qualified Visits;
* all conditions must be met;
* upgrade is immediate;
* downgrade occurs only at Membership Year completion;
* Reward redemption never lowers Status;
* Status grants Benefits rather than directly encoding discount.

Events

StatusEvaluated
StatusUpgraded
StatusDowngraded
StatusMaintained
MembershipBenefitsReevaluated

Required agents

* Architect
* Backend Developer
* Database
* QA
* Customer App
* Business Portal

UAT references

UAT-STATUS-001 to UAT-STATUS-005

⸻

16. Benefits

Primary documents

03-business-rules.md
12-status-engine.md
26-product-decisions.md
33-domain-model-v2.md
37-event-catalog.md
42-data-model-v1.md
43-api-contract.md
46-automation-catalog.md

Owning module

benefit

Core rules

* Benefit is separate domain;
* Status grants Benefit;
* Benefit may also originate from Birthday, Welcome, Campaign, Instant Reward or manual grant;
* Benefit has lifecycle;
* redemption and revocation are explicit;
* original history remains.

Events

BenefitGranted
BenefitActivated
BenefitRedemptionRequested
BenefitRedeemed
BenefitExpired
BenefitRevoked

APIs

GET /memberships/{membership_id}/benefits
POST /benefits/{benefit_grant_id}/redeem
POST /loyalty-programs/{program_id}/benefit-definitions

Required agents

* Architect
* Database
* Backend Developer
* Customer App
* Employee App where redemption applies
* Business Portal
* QA
* Security for redemption

UAT references

UAT-BEN-001 to UAT-BEN-005

⸻

17. Challenges and Gamification

Primary documents

03-business-rules.md
18-customer-mobile-app.md
20-business-portal.md
26-product-decisions.md
33-domain-model-v2.md
37-event-catalog.md
46-automation-catalog.md

Owning module

challenge

Core rules

* Challenges must have explicit assignment and lifecycle;
* progress is event-driven;
* completion occurs once;
* reward is granted through owning Reward or Benefit module;
* gamification serves business goals;
* streaks, seasons and advanced achievements may be future scope.

Events

ChallengeAssigned
ChallengeProgressUpdated
ChallengeCompleted
ChallengeExpired
ChallengeRewardGranted

Required agents

* Product Analysis
* Architect
* Backend Developer
* Customer App
* Business Portal
* QA

UAT reference

Relevant scenarios are derived from automation and Reward Goal patterns until a dedicated challenge UAT extension is created.

⸻

18. Reward Goals

Primary documents

03-business-rules.md
18-customer-mobile-app.md
26-product-decisions.md
33-domain-model-v2.md
37-event-catalog.md
43-api-contract.md
46-automation-catalog.md

Owning module

reward-goal

Core rules

* Customer may select eligible goal;
* progress is event-driven;
* near-completion notification is configurable;
* completion occurs once;
* reward is granted through Reward or Benefit module.

Events

RewardGoalAssigned
RewardGoalProgressUpdated
RewardGoalCompleted
RewardGoalChanged

APIs

GET /memberships/{membership_id}/reward-goals
POST /memberships/{membership_id}/reward-goals/{goal_id}/select

Required agents

* Backend Developer
* Customer App
* Business Portal
* QA

UAT references

UAT-GOAL-001 to UAT-GOAL-004

⸻

19. Instant Rewards

Primary documents

31-instant-rewards.md
33-domain-model-v2.md
37-event-catalog.md
41-event-storming-instant-rewards.md
42-data-model-v1.md
43-api-contract.md
46-automation-catalog.md

Owning module

instant-reward

Core rules

* backend selects reward;
* client cannot know reward in advance;
* Reward Pool is versioned;
* each purchase may create independent opportunity;
* open-opportunity limit is configurable;
* opening is idempotent;
* probability and selection are auditable;
* Receipt cancellation compensates opportunity or granted reward.

Events

InstantRewardOpportunityCreated
InstantRewardOpened
InstantRewardSelected
InstantRewardGranted
InstantRewardOpportunityExpired

APIs

GET /memberships/{membership_id}/instant-rewards
POST /instant-rewards/{opportunity_id}/open

Required agents

* Architect
* Database
* Backend Developer
* Customer App
* Business Portal
* QA
* Security

UAT references

UAT-IR-001 to UAT-IR-007

⸻

20. Automation Engine

Primary documents

09-automation-engine.md
13-notification-engine.md
26-product-decisions.md
37-event-catalog.md
43-api-contract.md
45-notification-matrix.md
46-automation-catalog.md

Owning module

automation

Core rules

* Automation orchestrates;
* it does not own Reward, Status, Benefit or Notification business logic;
* rule matching is event-driven;
* actions go through owning module contracts;
* execution is idempotent;
* loops are prevented;
* priority, cooldown and execution limits are supported;
* execution history and audit are required;
* dry run and simulation cannot create real effects.

Events

AutomationExecutionStarted
AutomationRuleMatched
AutomationActionExecuted
AutomationActionFailed
AutomationExecutionCompleted
AutomationExecutionFailed
AutomationExecutionStopped

API

POST /loyalty-programs/{program_id}/automations/from-template

Required agents

* Architect
* Backend Developer
* Database
* Business Portal
* QA
* Security where actions affect financial value

UAT references

UAT-AUTO-001 to UAT-AUTO-010

⸻

21. Notifications

Primary documents

13-notification-engine.md
17-security.md
37-event-catalog.md
45-notification-matrix.md
46-automation-catalog.md

Owning module

notification

Core rules

* delivery is asynchronous;
* Push and In-App are primary loyalty channels;
* OTP uses SMS or Viber;
* marketing requires consent;
* transactional messaging does not require marketing consent;
* quiet hours apply by classification;
* duplicate suppression is mandatory;
* provider failure does not change transaction success;
* retries apply only where appropriate.

Events

NotificationQueued
NotificationSent
NotificationDelivered
NotificationFailed
NotificationRead

Required agents

* Backend Developer
* DevOps
* Customer App
* Business Portal
* QA
* Security

UAT references

UAT-NOT-001 to UAT-NOT-007
UAT-REL-003

⸻

22. Analytics

Primary documents

21-analytics.md
22-non-functional-requirements.md
37-event-catalog.md
47-analytics-catalog.md
48-ai-recommendation-catalog.md

Owning module

analytics

Core rules

* analytics uses projections and read models;
* analytics never changes transactional data;
* every KPI requires documented formula;
* projections must be rebuildable;
* Customer anonymization must preserve allowed aggregates;
* benchmarks never expose another Business;
* operational metrics and business analytics are separate concerns.

Required agents

* Architect
* Database
* Backend Developer
* Business Portal
* QA
* Security for drill-down and export

UAT references

UAT-AN-001 to UAT-AN-005
UAT-PERFORMANCE scenarios

⸻

23. AI Recommendations

Primary documents

21-analytics.md
23-ai-development-guidelines.md
32-strategy-templates.md
47-analytics-catalog.md
48-ai-recommendation-catalog.md

Owning module

ai-recommendation

or a clearly defined application component above Analytics, depending on implementation architecture.

Core rules

* AI analyzes, explains, recommends and simulates;
* AI does not auto-apply configuration;
* recommendation requires evidence;
* priority and confidence are visible;
* stale recommendation expires;
* user acceptance opens a controlled workflow;
* prediction is not shown as guarantee;
* deterministic rules may be used before advanced models.

Required agents

* Product Analysis
* Architect
* Backend Developer or AI specialist
* Business Portal
* QA
* Security
* Product Owner review

UAT references

UAT-AI-001 to UAT-AI-005

⸻

24. Loyalty Network

Primary documents

03-business-rules.md
14-loyalty-network.md
15-settlement-engine.md
26-product-decisions.md
37-event-catalog.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md

Owning module

loyalty-network

Core rules

* points remain owned by origin program;
* balances do not merge;
* Network defines where points may be redeemed;
* direction may be one-way or bidirectional;
* every cross-program transaction preserves origin and redeem evidence;
* settlement is not executed in MVP;
* leaving Network stops future right but preserves history.

Events

LoyaltyNetworkCreated
LoyaltyProgramJoinedNetwork
LoyaltyProgramLeftNetwork
LoyaltyNetworkActivated
LoyaltyNetworkDeactivated
CrossProgramRedemptionCompleted

APIs

POST /loyalty-networks
POST /loyalty-networks/{network_id}/invitations
POST /loyalty-networks/{network_id}/invitations/{invitation_id}/accept
PUT /loyalty-networks/{network_id}/redemption-rules
POST /loyalty-networks/{network_id}/leave

Required agents

* Architect
* Database
* Backend Developer
* Business Portal
* QA
* Security
* Product Owner for legal/business implications

UAT references

UAT-NET-001 to UAT-NET-006

⸻

25. Customer App

Primary documents

18-customer-mobile-app.md
29-deployment-models.md
30-brand-configuration.md
31-instant-rewards.md
37-event-catalog.md
43-api-contract.md
45-notification-matrix.md

Required supporting domain documents

Based on feature:

* Membership;
* Reward;
* XP;
* Status;
* Benefit;
* Reward Goal;
* Instant Reward;
* Notification.

Owning agent

Customer App Agent

Forbidden ownership

Customer App never owns authoritative:

* Reward calculation;
* XP calculation;
* Status evaluation;
* Benefit eligibility;
* Instant Reward selection;
* redemption calculation.

UAT references

Relevant Customer journeys across sections 5–22 and Mobile UX UAT.

⸻

26. Employee App

Primary documents

19-employee-mobile-app.md
36-event-storming-purchase-processing.md
38-event-storming-reward-redemption.md
39-event-storming-receipt-cancellation.md
43-api-contract.md
44-permission-matrix.md

Owning agent

Employee App Agent

Core responsibilities

* QR scanning;
* Membership resolution;
* Receipt preview;
* Receipt confirmation;
* redemption workflow;
* allowed cancellation flow;
* Location-scoped history.

Forbidden ownership

Employee App never owns:

* reward calculation;
* direct ledger writes;
* Status changes;
* Benefit grant;
* permission decision.

UAT references

UAT-EMP-001 to UAT-EMP-004
UAT-REC-001 to UAT-REC-006
UAT-RED-001 to UAT-RED-007
Mobile UX UAT

⸻

27. Business Portal

Primary documents

20-business-portal.md
26-product-decisions.md
30-brand-configuration.md
32-strategy-templates.md
43-api-contract.md
44-permission-matrix.md
46-automation-catalog.md
47-analytics-catalog.md
48-ai-recommendation-catalog.md

Owning agent

Business Portal Agent

Core responsibilities

* onboarding;
* configuration;
* employee and Location management;
* automation;
* analytics;
* AI recommendations;
* audit visibility;
* Network management.

Forbidden ownership

Business Portal does not:

* enforce security alone;
* modify immutable ledgers;
* calculate authoritative loyalty outcomes;
* auto-apply AI recommendation;
* silently overwrite configuration versions.

UAT references

Business onboarding, portal UX, automation, analytics and AI scenarios.

⸻

28. Security

Primary documents

17-security.md
22-non-functional-requirements.md
24-testing-strategy.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md
51-engineering-implementation-guide.md
55-module-definition-of-done.md
56-uat-scenarios.md

Required review areas

* authentication;
* authorization;
* RLS;
* service role;
* integration clients;
* support access;
* Platform Admin;
* Receipt;
* Reward;
* Redemption;
* Benefits;
* Instant Rewards;
* Automation;
* Loyalty Network;
* analytics drill-down;
* exports;
* secrets;
* provider integrations.

Owning role

Security Agent

UAT references

UAT-SEC-001 to UAT-SEC-008

⸻

29. Testing and QA

Primary documents

24-testing-strategy.md
44-permission-matrix.md
45-notification-matrix.md
55-module-definition-of-done.md
56-uat-scenarios.md
57-agent-prompts.md

Owning role

QA Agent

Required sources per task

* task acceptance criteria;
* relevant Event Storming document;
* relevant API contract;
* relevant permission rules;
* relevant UAT scenarios;
* changed code and migrations;
* Definition of Done.

Required output

Uses QA prompt from:

57-agent-prompts.md

⸻

30. DevOps and Release

Primary documents

22-non-functional-requirements.md
24-testing-strategy.md
25-roadmap.md
51-engineering-implementation-guide.md
52-repository-structure.md
53-development-roadmap.md
54-agent-development-plan.md
55-module-definition-of-done.md

Owning roles

* DevOps Agent
* Release Manager Agent

Key areas

* environments;
* CI/CD;
* migrations;
* secrets;
* observability;
* backups;
* recovery;
* feature flags;
* rollback;
* release evidence;
* pilot and production gates.

⸻

31. Knowledge Map by Agent

Product Analysis Agent

Always read:

00-platform-glossary.md
01-product-vision.md
02-mvp-scope.md
03-business-rules.md
26-product-decisions.md
49-open-questions-final.md
53-development-roadmap.md
54-agent-development-plan.md
57-agent-prompts.md

Then read the relevant domain documents.

⸻

Solution Architect Agent

Always read:

05-system-architecture.md
17-security.md
22-non-functional-requirements.md
33-domain-model-v2.md
37-event-catalog.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md
51-engineering-implementation-guide.md
52-repository-structure.md
53-development-roadmap.md
55-module-definition-of-done.md

⸻

Database Agent

Always read:

06-database-design.md
17-security.md
33-domain-model-v2.md
42-data-model-v1.md
44-permission-matrix.md
51-engineering-implementation-guide.md
52-repository-structure.md
55-module-definition-of-done.md

Plus owning domain and Event Storming documents.

⸻

Backend Developer Agent

Always read:

00-platform-glossary.md
26-product-decisions.md
33-domain-model-v2.md
37-event-catalog.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md
51-engineering-implementation-guide.md
52-repository-structure.md
55-module-definition-of-done.md
57-agent-prompts.md

Plus module-specific documents.

⸻

Frontend Agents

Always read:

relevant application document
30-brand-configuration.md
43-api-contract.md
44-permission-matrix.md
45-notification-matrix.md
52-repository-structure.md
55-module-definition-of-done.md
57-agent-prompts.md

Plus relevant domain flows.

⸻

QA Agent

Always read:

03-business-rules.md
relevant Event Storming documents
37-event-catalog.md
43-api-contract.md
44-permission-matrix.md
45-notification-matrix.md
55-module-definition-of-done.md
56-uat-scenarios.md
57-agent-prompts.md

⸻

Security Agent

Always read:

17-security.md
22-non-functional-requirements.md
33-domain-model-v2.md
42-data-model-v1.md
43-api-contract.md
44-permission-matrix.md
51-engineering-implementation-guide.md
55-module-definition-of-done.md
56-uat-scenarios.md

⸻

DevOps Agent

Always read:

05-system-architecture.md
17-security.md
22-non-functional-requirements.md
24-testing-strategy.md
52-repository-structure.md
53-development-roadmap.md
54-agent-development-plan.md
55-module-definition-of-done.md

⸻

Release Manager Agent

Always read:

25-roadmap.md
53-development-roadmap.md
54-agent-development-plan.md
55-module-definition-of-done.md
56-uat-scenarios.md
60-release-strategy.md

The final reference becomes active when 60-release-strategy.md is created.

⸻

32. Task Knowledge Package

Za svaki task mora se formirati mali Knowledge Package.

Format:

Task ID:
Owning Module:
Assigned Agent:
Universal Documents:
Module Documents:
Event Storming Documents:
API Documents:
Permission Documents:
Data Model Documents:
UAT Scenarios:
Engineering Documents:
Relevant ADRs:
Relevant Code Paths:
Read-only References:

Estimated Reading Size:

- Small
- Medium
- Large
- Very Large

Cilj je da agent dobije samo potreban, ali dovoljan kontekst.

⸻

33. Knowledge Package Example — Receipt Idempotency

Task ID:
LP-REC-004
Owning Module:
receipt
Assigned Agent:
Backend Developer Agent
Universal Documents:
00-platform-glossary.md
26-product-decisions.md
33-domain-model-v2.md
37-event-catalog.md
42-data-model-v1.md
51-engineering-implementation-guide.md
55-module-definition-of-done.md
Module Documents:
03-business-rules.md
05-system-architecture.md
19-employee-mobile-app.md
Event Storming:
36-event-storming-purchase-processing.md
39-event-storming-receipt-cancellation.md
API:
43-api-contract.md
Permissions:
44-permission-matrix.md
UAT:
UAT-REC-002
UAT-REC-003
UAT-REL-001
Engineering:
52-repository-structure.md
53-development-roadmap.md
54-agent-development-plan.md
57-agent-prompts.md
Relevant Code Paths:
services/api/src/modules/receipt/
packages/api-contracts/src/receipts/
database/migrations/
tests/integration/receipt/

⸻

34. Knowledge Package Example — Instant Reward Opening

Task ID:
LP-IR-007
Owning Module:
instant-reward
Assigned Agent:
Backend Developer Agent
Module Documents:
31-instant-rewards.md
41-event-storming-instant-rewards.md
46-automation-catalog.md
Domain:
33-domain-model-v2.md
Events:
37-event-catalog.md
Data:
42-data-model-v1.md
API:
43-api-contract.md
Permissions:
44-permission-matrix.md
UAT:
UAT-IR-002
UAT-IR-003
UAT-IR-004
UAT-IR-007
Required Review:
Architect
QA
Security

⸻

35. Knowledge Package Example — Business Analytics Dashboard

Task ID:
LP-AN-012
Owning Module:
analytics
Assigned Agents:
Backend Developer Agent
Business Portal Agent
Module Documents:
20-business-portal.md
21-analytics.md
47-analytics-catalog.md
Events:
37-event-catalog.md
Data:
42-data-model-v1.md
Permissions:
44-permission-matrix.md
UAT:
UAT-AN-001
UAT-AN-002
UAT-AN-005
Engineering:
51-engineering-implementation-guide.md
52-repository-structure.md
55-module-definition-of-done.md
57-agent-prompts.md

This capability must be decomposed into separate backend and frontend tasks.

⸻

36. Missing Knowledge Rule

Ako agent ne može da pronađe odgovor u dodeljenom Knowledge Package-u:

1. pretražuje autoritativne dokumente;
2. proverava deprecated dokumente samo kao istorijski kontekst;
3. proverava relevantne ADR-ove;
4. dokumentuje šta nedostaje;
5. razlikuje:
    * poslovnu odluku;
    * tehničku odluku;
    * implementation detail;
6. eskalira samo kada je odgovor potreban za ispravno ponašanje.

Agent ne sme popuniti prazninu nasumičnom pretpostavkom.

⸻

37. Token Budget Rule

When the available context window is insufficient to load all referenced documents, the agent must prioritize documents according to the Knowledge Priority defined in this document.

Documents should be removed from context in reverse priority order.

Recommended order:

Keep first:

- Locked Product Decisions
- Blueprint
- Domain Model
- API Contracts
- Event Catalog
- Data Model
- Engineering Guide

Remove first:

- Historical documents
- Deprecated documents
- Previous ADR versions
- Examples
- Implementation notes

The agent must never omit an authoritative document in favor of historical documentation.

38. Knowledge Conflict Rule

Kada dva dokumenta daju različite odgovore:

1. koristi Knowledge Priority;
2. proveri datume i status dokumenta;
3. proveri da li je jedan dokument deprecated;
4. proveri 26-product-decisions.md;
5. proveri 49-open-questions-final.md;
6. dokumentuj konflikt.

Ako konflikt menja poslovni rezultat:

BLOCKED BY PRODUCT DECISION

Ako je konflikt tehnički i reverzibilan:

* predložiti ADR;
* ne menjati zaključane business rules.

⸻

39. Knowledge Maintenance

Documentation Agent održava ovu mapu kada:

* nastane novi dokument;
* dokument postane deprecated;
* ownership se promeni odobrenim ADR-om;
* novi API ili Event bude odobren;
* novi modul bude uveden;
* novi UAT scenario bude dodat;
* repository struktura bude promenjena;
* Agent prompt bude versioned.
60-release-strategy.md

Svaka izmena ove mape mora očuvati veze ka autoritativnim dokumentima.

⸻

40. Definition of Knowledge Map Ready

Project Knowledge Map je spreman kada:

* svaki glavni domen ima dokumente;
* svaki domen ima owning module;
* svaki domen ima relevantne Events;
* svaki domen ima API reference;
* svaki domen ima UAT reference;
* svaki agent ima minimalni reading set;
* deprecated dokumenti su označeni;
* knowledge priority je definisan;
* task Knowledge Package format postoji;
* missing knowledge i conflict pravila su definisana.