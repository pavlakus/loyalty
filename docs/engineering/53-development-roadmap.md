53. Development Roadmap

1. Purpose

Ovaj dokument definiše preporučeni redosled razvoja Loyalty Platform-e.

Ciljevi su:

* sprečiti prerani razvoj zavisnih modula;
* omogućiti kontrolisan paralelni rad;
* definisati jasne faze i izlazne kriterijume;
* omogućiti AI agentima da rade u ograničenom i proverljivom obimu;
* smanjiti rizik od velikih integracionih problema;
* obezbediti da bezbednost, testiranje i observability budu deo razvoja, a ne završna aktivnost.

Ovaj roadmap ne menja Product Roadmap iz dokumenta:

25-roadmap.md

25-roadmap.md definiše proizvodne faze.

Ovaj dokument definiše tehnički redosled implementacije.

⸻

2. Roadmap Principles

Razvoj prati sledeće principe:

* Foundation pre poslovnih modula.
* Backend ugovori pre frontend integracije.
* Tenant isolation pre realnih podataka.
* Ledger pre balance projection-a.
* Receipt Processing pre loyalty posledica.
* Reward, XP i Status ostaju odvojeni moduli.
* Security i QA počinju od prve faze.
* Svaka faza mora imati demo i testabilan rezultat.
* Naredna faza ne počinje dok kritične zavisnosti nisu stabilne.
* Feature completeness nije važniji od ispravnosti podataka.
* Svaki agent radi samo na dodeljenom scope-u.

⸻

3. Delivery Model

Preporučeni model razvoja:

Foundation
→ Core Identity and Tenant Model
→ Loyalty Core
→ Transaction Processing
→ Engagement Domains
→ Customer and Employee Experiences
→ Business Configuration
→ Automation and Notifications
→ Analytics and AI
→ Loyalty Network
→ Security Hardening
→ Pilot
→ Production

Svaka faza sadrži:

* implementation scope;
* dependencies;
* deliverables;
* mandatory tests;
* exit criteria;
* rollback considerations.

⸻

4. Phase 0 — Repository and Engineering Foundation

Scope

* monorepo initialization;
* workspace configuration;
* TypeScript base configuration;
* linting;
* formatting;
* test runner;
* environment configuration;
* CI pipeline;
* local development setup;
* Supabase project setup;
* database migration framework;
* logging foundation;
* tracing and correlation IDs;
* error contract;
* root AGENTS.md;
* pull request template;
* CODEOWNERS;
* secret handling;
* feature flag foundation.

Deliverables

Repository boots locally.
CI runs on every pull request.
Empty database can be created from migrations.
Environment validation fails clearly.
Shared API and event contract packages exist.
Module boundaries can be enforced.

Mandatory tests

* clean installation;
* clean database migration;
* CI pipeline validation;
* missing environment variable failure;
* secret leakage scan;
* build of all applications.

Exit criteria

* repository structure matches 52-repository-structure.md;
* local setup is documented;
* no business feature is implemented yet;
* all foundation checks pass.

⸻

5. Phase 1 — Authentication, Authorization and Tenant Model

Scope

* Customer OTP authentication;
* Business User authentication;
* session and token handling;
* global Customer identity;
* Business tenant boundary;
* Brand ownership;
* Location ownership;
* employee assignments;
* role model;
* permission evaluation;
* RLS foundation;
* audit context;
* support access foundation;
* integration client identity and scopes.

Primary modules

* authentication;
* customer;
* business;
* brand;
* location;
* employee;
* audit.

Dependencies

Phase 0 completed.

Deliverables

* Customer can request and verify OTP.
* Business Owner can authenticate.
* Business, Brand and Location can be created.
* Employee can be assigned to permitted locations.
* Cross-tenant access is denied.
* Permission checks exist in backend and database.
* Authentication and authorization actions are audited.

Mandatory tests

* valid OTP;
* invalid OTP;
* expired OTP;
* reused OTP;
* rate limiting;
* Customer data isolation;
* Business isolation;
* Location scope;
* Manager permission configuration;
* Integration Client scope enforcement;
* Support access audit;
* service-role business validation.

Exit criteria

No feature proceeds if tenant isolation is not proven through automated tests.

⸻

6. Phase 2 — Business Onboarding and Loyalty Program Configuration

Scope

* Business onboarding;
* Brand creation;
* Loyalty Program creation;
* exactly one active Loyalty Program per Brand;
* strategy selection;
* strategy recommendation persistence;
* reward experience configuration;
* basic reward rule configuration;
* XP rule configuration;
* status level configuration;
* Brand Configuration foundation;
* configuration versioning;
* configuration audit history.

Primary modules

* business;
* brand;
* loyalty-program;
* strategy;
* brand-configuration.

Deliverables

* Business Owner can complete onboarding.
* Brand can receive a Loyalty Program.
* Strategy template can generate a proposed configuration.
* Business Owner can accept or modify the proposal.
* Configuration changes are audited.
* Historical transactions remain tied to the applicable configuration version where required.

Mandatory tests

* duplicate active Loyalty Program prevention;
* invalid strategy configuration;
* unauthorized Brand modification;
* configuration version creation;
* rollback to previous draft configuration where supported;
* immutable historical transaction behavior.

Exit criteria

A valid Loyalty Program can be configured without manual database changes.

⸻

7. Phase 3 — Membership

Scope

* Membership creation;
* program joining;
* membership lifecycle;
* public membership token;
* static membership QR;
* Membership Year creation;
* membership progress projection foundation;
* Membership suspension and closure;
* customer membership list.

Primary modules

* membership;
* customer;
* loyalty-program.

Deliverables

* Customer joins a Loyalty Program.
* Membership is created exactly once.
* QR resolves to the correct Membership.
* QR contains no personal data.
* Membership Year starts correctly.
* Customer sees all memberships in one account.

Mandatory tests

* duplicate join;
* cross-program isolation;
* suspended Membership;
* closed Membership;
* QR token enumeration resistance;
* invalid token;
* Membership Year boundary;
* Customer access to another customer’s Membership.

Exit criteria

Membership is stable before any reward or receipt processing begins.

⸻

8. Phase 4 — Receipt Processing

Scope

* receipt preview;
* receipt recording;
* Employee App receipt API;
* POS integration receipt API;
* receipt idempotency;
* receipt ownership;
* receipt amount validation;
* immutable receipt records;
* receipt cancellation request;
* event outbox;
* ReceiptRecorded event;
* ReceiptCancelled event;
* failure handling.

Primary modules

* receipt;
* membership;
* employee;
* integration.

Deliverables

* Employee can resolve Membership and preview a receipt.
* Receipt can be recorded exactly once.
* POS integration can submit receipt through scoped credentials.
* Duplicate requests do not create duplicate receipts.
* Receipt becomes root source for later loyalty processing.
* Cancellation produces a compensating record, not mutation.

Mandatory tests

* duplicate idempotency key;
* parallel duplicate requests;
* cross-tenant Membership;
* invalid Location;
* unauthorized Employee;
* negative amount;
* invalid currency;
* cancelled receipt;
* receipt event outbox consistency;
* failed downstream processing does not delete receipt.

Exit criteria

Receipt flow is production-grade before Reward, XP and Status side effects are enabled.

⸻

9. Phase 5 — Reward Ledger and Reward Engine

Scope

* reward rule evaluation;
* Reward Points earning;
* pending points;
* release of pending points;
* expiration;
* Reward Ledger;
* Reward Allocation;
* balance projection;
* FIFO allocation;
* reversal;
* adjustment;
* idempotent event handling;
* reward calculation explanation.

Primary modules

* reward;
* receipt;
* membership.

Deliverables

* Receipt generates the correct reward outcome.
* Pending and immediately available points are supported.
* Balance projection matches ledger.
* Expiration model is configurable.
* FIFO is enforced.
* Receipt cancellation reverses reward effects.
* Balance never becomes negative.

Mandatory tests

* fixed earning rule;
* ratio earning rule;
* pending points release;
* rolling expiration;
* fixed-date expiration;
* no-expiration model;
* FIFO consumption;
* duplicate event;
* concurrent earning;
* reversal after redemption-related state;
* projection rebuild.

Exit criteria

Reward Ledger is treated as authoritative and passes concurrency tests.

⸻

10. Phase 6 — XP, Visits and Status

Scope

* XP Ledger;
* XP earning;
* XP reversal;
* Visit qualification;
* visit deduplication;
* Membership Year progress;
* status evaluation;
* immediate upgrade;
* end-of-year downgrade;
* status history;
* status projection;
* membership benefit reevaluation event.

Primary modules

* xp;
* visit;
* status;
* membership;
* receipt.

Deliverables

* Receipt can generate XP independently of Reward Points.
* Qualified Visit rules are respected.
* Status uses XP and visit conditions.
* Upgrade happens immediately.
* Downgrade occurs only at Membership Year completion.
* Spending Reward Points never affects Status.

Mandatory tests

* XP earning;
* XP reversal;
* duplicate Visit prevention;
* multiple receipts within Visit window;
* all status conditions required;
* immediate upgrade;
* no mid-year downgrade;
* Membership Year completion;
* projection rebuild;
* receipt cancellation effect.

Exit criteria

Status transitions are deterministic, explainable and fully audited.

⸻

11. Phase 7 — Benefits

Scope

* Benefit Definition;
* Benefit Grant;
* activation;
* redemption request;
* redemption;
* expiration;
* revocation;
* status-generated Benefits;
* manually granted Benefits;
* Birthday and Welcome Benefit support;
* Benefit audit history.

Primary modules

* benefit;
* status;
* membership;
* reward.

Deliverables

* Status may grant Benefits.
* Benefit lifecycle is independent from Status.
* Benefit can be redeemed exactly once where applicable.
* Expiration and revocation are supported.
* Receipt cancellation can revoke a related Benefit.

Mandatory tests

* duplicate grant prevention;
* status-triggered grant;
* manual grant permission;
* invalid redemption;
* expired Benefit;
* revoked Benefit;
* concurrent redemption;
* scope and ownership;
* cancellation compensation.

Exit criteria

Benefits are not implemented as direct fields on Status or Membership.

⸻

12. Phase 8 — Redemption

Scope

* redemption options;
* automatic maximum allowed redemption;
* reservation;
* confirmation;
* cancellation;
* reservation expiration;
* FIFO allocation consumption;
* Benefit redemption integration;
* employee confirmation flow;
* cross-program preparation hooks without settlement.

Primary modules

* redemption;
* reward;
* benefit;
* membership;
* receipt.

Deliverables

* Employee can request redemption options.
* System calculates allowed redemption.
* Points are reserved atomically.
* Confirm consumes reservation exactly once.
* Cancel releases reservation.
* Expired reservations are released.
* Double spending is prevented.

Mandatory tests

* insufficient balance;
* concurrent reservation;
* duplicate confirmation;
* cancel after confirmation;
* expired reservation;
* negative balance prevention;
* FIFO allocation;
* receipt amount constraints;
* Benefit and points conflict rules;
* permission and Location scope.

Exit criteria

Redemption passes parallel race-condition tests before frontend rollout.

⸻

13. Phase 9 — Instant Rewards and Reward Goals

Scope

* Reward Experience configuration;
* Reward Pool;
* Reward Definitions;
* opportunity generation;
* maximum open opportunity limit;
* reward opening;
* backend reward selection;
* reward granting;
* opportunity expiration;
* receipt cancellation compensation;
* Reward Goal assignment;
* goal selection;
* progress tracking;
* completion.

Primary modules

* instant-reward;
* reward-goal;
* reward;
* benefit;
* automation.

Deliverables

* Surprise Experience creates opportunities.
* Reward is unknown to the client before opening.
* Opening is idempotent.
* Reward Pool version is retained.
* Reward Goal progress is updated from Events.
* Completed goals grant configured outcomes.

Mandatory tests

* empty Reward Pool;
* probability distribution sanity test;
* reward limits;
* concurrent opening;
* already opened opportunity;
* expired opportunity;
* maximum opportunity count;
* cancellation before opening;
* cancellation after reward grant;
* goal completion exactly once.

Exit criteria

Reward selection and granting are auditable and tamper-resistant.

⸻

14. Phase 10 — Customer and Employee Applications

Customer App scope

* OTP login;
* program discovery;
* join flow;
* membership home;
* QR;
* progress;
* transactions;
* status;
* benefits;
* Reward Goals;
* Instant Rewards;
* notification inbox;
* preferences.

Employee App scope

* login;
* Location context;
* QR scanning;
* membership summary;
* receipt preview;
* receipt confirmation;
* redemption options;
* reservation confirmation;
* cancellation flow;
* transaction history.

Dependencies

Stable APIs from Phases 1–9.

Mandatory tests

* happy-path end-to-end journeys;
* offline UI behavior without claiming offline transactions;
* expired session;
* permission loss;
* duplicate button submission;
* accessibility;
* localization;
* device compatibility;
* API error handling.

Exit criteria

No business calculation exists in either mobile app.

⸻

15. Phase 11 — Business Portal

Scope

* onboarding;
* Brand and Location management;
* employee management;
* reward configuration;
* status configuration;
* Benefits;
* Reward Experience;
* Reward Goals;
* Instant Reward Pools;
* audit visibility;
* campaign and automation configuration foundation;
* permission-aware navigation.

Dependencies

Backend configuration APIs stable.

Mandatory tests

* Owner and Manager permission differences;
* draft configuration;
* invalid configuration prevention;
* audit history;
* Location scope;
* unsaved changes protection;
* optimistic concurrency;
* API authorization independent of UI visibility.

Exit criteria

Business can configure core loyalty behavior without support intervention.

⸻

16. Phase 12 — Automation Engine

Scope

* event consumption;
* rule matching;
* condition evaluation;
* action dispatching;
* execution context;
* execution history;
* priority;
* cooldown;
* maximum executions;
* loop protection;
* idempotency;
* template instantiation;
* simulation;
* dry run;
* MVP automation catalog.

Primary modules

* automation;
* reward;
* benefit;
* instant-reward;
* notification;
* membership.

Deliverables

Templates from:

46-automation-catalog.md

can be instantiated and safely executed.

Mandatory tests

* Welcome Bonus;
* Birthday Bonus;
* Double Points;
* Happy Hour;
* Spend Bonus;
* Visit Challenge;
* Win-back Attempt 1;
* Win-back Attempt 2;
* Points Expiration Reminder;
* Membership Anniversary;
* Status Upgrade Celebration;
* Instant Reward Generation;
* Reward Goal Near Completion;
* Inactivity Detection;
* Benefit Expiration Reminder;
* loop protection;
* duplicate Event;
* action failure;
* partial execution;
* retry.

Exit criteria

Automation cannot directly bypass owning domain modules.

⸻

17. Phase 13 — Notification Engine

Scope

* notification queue;
* templates;
* Push;
* In-App;
* SMS;
* Viber;
* consent;
* quiet hours;
* duplicate suppression;
* provider routing;
* retries;
* delivery status;
* read status;
* operational monitoring.

Deliverables

Notification rules from:

45-notification-matrix.md

are enforced.

Mandatory tests

* transactional without marketing consent;
* marketing blocked without consent;
* quiet hours;
* duplicate suppression;
* temporary provider failure;
* permanent provider failure;
* fallback routing;
* notification success independent from transaction success;
* cross-tenant template access.

Exit criteria

No transactional API waits for external notification provider completion.

⸻

18. Phase 14 — Analytics

Scope

* event-driven projections;
* Executive Dashboard;
* Customer metrics;
* Revenue metrics;
* Reward metrics;
* Status metrics;
* Benefit metrics;
* Challenge metrics;
* Reward Goal metrics;
* Instant Reward metrics;
* campaign metrics;
* automation metrics;
* notification metrics;
* Location metrics;
* Program Health Score;
* exports.

Dependencies

Stable business Events from previous phases.

Deliverables

Metrics from:

47-analytics-catalog.md

are implemented with documented formulas.

Mandatory tests

* source event reconciliation;
* projection rebuild;
* time-zone correctness;
* date-range filtering;
* tenant isolation;
* anonymized Customer handling;
* delayed Event processing;
* duplicate Event handling;
* large-range query performance.

Exit criteria

Every KPI has:

* formula;
* source;
* owner;
* update frequency;
* reconciliation method.

⸻

19. Phase 15 — AI Recommendations

Scope

* rule-based recommendation foundation;
* recommendation generation;
* evidence and explanation;
* priority;
* confidence;
* lifecycle;
* acceptance;
* rejection;
* recommendation action links;
* simulation interface;
* feedback capture.

AI may initially use deterministic analytics rules before predictive models.

Deliverables

Recommendations from:

48-ai-recommendation-catalog.md

are available in Business Portal.

Mandatory tests

* no recommendation without evidence;
* tenant isolation;
* explanation availability;
* stale recommendation expiration;
* acceptance does not auto-activate changes;
* rejected recommendation history;
* low-confidence handling;
* action opens correct configuration workflow.

Exit criteria

AI never modifies transactional or configuration data without explicit user approval.

⸻

20. Phase 16 — Loyalty Network

Scope

* Network creation;
* invitations;
* joining;
* leaving;
* one-way and bidirectional rules;
* cross-program redemption eligibility;
* origin and redeem program tracking;
* conversion rule versioning;
* settlement evidence fields;
* history retention.

Deliverables

Programs can participate in a Network without combining balances.

Mandatory tests

* one-way redemption;
* bidirectional redemption;
* program leaving Network;
* historical record retention;
* invalid origin;
* invalid redeem program;
* conversion rule version;
* cross-Business isolation;
* settlement not executed in MVP.

Exit criteria

Cross-program transactions preserve full accounting evidence.

⸻

21. Phase 17 — Platform Administration and Support

Scope

* Business overview;
* support access request;
* temporary support sessions;
* scoped impersonation where permitted;
* template management;
* system feature flags;
* provider status;
* system audit visibility;
* operational controls.

Mandatory tests

* time-limited support access;
* scope enforcement;
* audit of every support action;
* immutable ledger protection;
* admin cannot bypass domain commands;
* feature flag isolation.

Exit criteria

Support can diagnose issues without unrestricted or unaudited data access.

⸻

22. Phase 18 — Security and Reliability Hardening

Security is continuous, but this phase performs final focused hardening.

Scope

* threat modeling;
* RLS audit;
* API authorization audit;
* service-role audit;
* rate limiting;
* abuse prevention;
* secret rotation;
* dependency scanning;
* penetration testing;
* backup restore testing;
* disaster recovery;
* event replay testing;
* queue recovery;
* performance testing;
* failure injection;
* observability review.

Exit criteria

No open:

* P0 security issue;
* P0 data-integrity issue;
* P1 tenant-isolation issue;
* P1 race-condition issue;
* P1 ledger issue.

⸻

23. Phase 19 — UAT and Pilot

Scope

* full business UAT;
* operational UAT;
* security UAT;
* device testing;
* provider testing;
* Business onboarding pilot;
* Customer journey pilot;
* Employee training;
* support runbooks;
* production readiness review.

Pilot recommendation

Start with a limited number of Businesses and Locations.

Pilot should include more than one industry where feasible, but not at the expense of operational control.

Exit criteria

* all critical UAT scenarios pass;
* pilot Businesses approve workflows;
* support process works;
* monitoring and alerting work;
* rollback has been tested;
* known limitations are documented.

⸻

24. Phase 20 — Production Rollout

Scope

* controlled production launch;
* feature flags;
* gradual Business onboarding;
* production monitoring;
* incident process;
* adoption tracking;
* KPI baseline;
* post-launch review.

Rollout sequence

Internal Accounts
→ Design Partners
→ Closed Pilot
→ Limited Availability
→ General Availability

General Availability is not based only on feature completion.

It requires proven operational stability.

⸻

25. Parallel Workstreams

The following work may run in parallel after dependencies are stable.

Workstream A — Platform Foundation

* authentication;
* tenancy;
* security;
* infrastructure;
* observability.

Workstream B — Loyalty Core

* Membership;
* Receipt;
* Reward;
* XP;
* Status;
* Benefits;
* Redemption.

Workstream C — Experience

* Customer App;
* Employee App;
* Business Portal;
* Design System.

Workstream D — Engagement

* Automation;
* Notifications;
* Instant Rewards;
* Reward Goals.

Workstream E — Intelligence

* Analytics;
* Program Health;
* AI Recommendations.

Parallel work does not permit bypassing unstable contracts.

⸻

26. Dependency Gates

Gate A — Foundation Ready

Required before any domain feature:

* repository;
* CI;
* migrations;
* environment management;
* error contracts;
* test runner.

Gate B — Tenant Safe

Required before business data:

* authentication;
* permissions;
* RLS;
* audit context;
* cross-tenant tests.

Gate C — Transaction Safe

Required before loyalty effects:

* immutable Receipt;
* idempotency;
* event outbox;
* concurrency controls.

Gate D — Ledger Safe

Required before redemption:

* Reward Ledger;
* projection;
* FIFO;
* reversal;
* rebuild tests.

Gate E — Engagement Safe

Required before Automation:

* stable Events;
* stable commands;
* Benefit and Reward APIs;
* Notification queue.

Gate F — Pilot Ready

Required before external pilot:

* end-to-end UAT;
* security review;
* monitoring;
* backup restore;
* rollback;
* support runbooks.

⸻

27. Agent Task Size

AI agents must not receive an entire phase as one task.

Recommended task size:

One module capability
or
One API flow
or
One migration set
or
One bounded test package

Good task examples:

* Implement Membership creation and duplicate prevention.
* Implement Reward Ledger earning transaction.
* Implement receipt idempotency and race-condition tests.
* Implement Welcome Bonus automation template.
* Implement Benefit expiration worker.

Bad task examples:

* Build the Reward Engine.
* Build the entire backend.
* Implement all automations.
* Create the full Customer App.

⸻

28. Task Lifecycle

Every implementation task follows:

Planned
→ Ready
→ In Progress
→ Code Review
→ QA
→ Ready for Merge
→ Merged
→ UAT Ready
→ Done

A task may return to:

In Progress

when review or QA finds issues.

⸻

29. Mandatory Task Inputs

Every agent task must include:

* business objective;
* exact scope;
* owning module;
* required Blueprint documents;
* allowed files;
* forbidden files;
* dependencies;
* acceptance criteria;
* mandatory tests;
* Definition of Done;
* expected output format;
* rollback expectation.
* task ID;
* title;
* assigned agent role;
* task-specific Knowledge Package reference;
* required review agents;

⸻

30. Change Control

If implementation reveals a missing or contradictory business decision:

Agent must stop that part of implementation.

Agent must:

1. document the contradiction;
2. identify affected documents;
3. propose options;
4. assess migration and data impact;
5. request Product Owner decision.

Agent must not silently invent business rules.

If implementation reveals an inconsistency between Blueprint and Engineering Playbook, Blueprint remains the authoritative source until Product Owner explicitly approves a change.

Non-blocking technical assumptions may be proposed through ADRs.

⸻

31. Roadmap Tracking

Each phase should track:

* planned capabilities;
* completed capabilities;
* open blockers;
* test status;
* security status;
* documentation status;
* migration status;
* demo status;
* UAT status.

Progress must be capability-based, not only percentage-based.

⸻

32. Definition of Roadmap Complete

This Engineering Roadmap is fulfilled when:

* all MVP modules meet Definition of Done;
* all required UAT scenarios pass;
* no critical security or data-integrity issue remains;
* architecture boundaries are preserved;
* operational runbooks exist;
* production rollback is tested;
* Pilot results meet agreed success criteria;
* Blueprint and implementation documentation are synchronized.