54. Agent Development Plan

1. Purpose

Ovaj dokument definiše kako AI agenti učestvuju u razvoju Loyalty Platform-e.

Ciljevi su:

* jasno razdvojiti odgovornosti;
* sprečiti preklapanje i konfliktne izmene;
* sprečiti da agenti donose poslovne odluke;
* definisati obavezne ulaze i izlaze svakog agenta;
* omogućiti kontrolisan paralelni rad;
* obezbediti da svaki zadatak prođe arhitektonsku, razvojnu i QA proveru.

AI agent nije vlasnik proizvoda.

AI agent izvršava zadatak unutar eksplicitno definisanog scope-a.

⸻

2. Operating Model

Preporučeni tok rada:

Product Owner
→ Architect Agent
→ Implementation Agent
→ QA Agent
→ Security Agent where applicable
→ Release Agent
→ Product Owner approval

Nije obavezno da svaki mali zadatak prođe kroz sve agente.

Međutim, svaki zadatak koji utiče na:

* tenant isolation;
* autentifikaciju;
* autorizaciju;
* immutable ledger;
* Receipt Processing;
* Reward Redemption;
* Instant Rewards;
* Automation;
* Loyalty Network;
* lične podatke;
* finansijske ili settlement podatke;

mora imati najmanje:

Architect Review
→ Implementation
→ QA
→ Security Review

⸻

3. Agent Roles

Planirani agenti:

1. Product Analysis Agent
2. Solution Architect Agent
3. Database Agent
4. Backend Developer Agent
5. Customer App Agent
6. Employee App Agent
7. Business Portal Agent
8. QA Agent
9. Security Agent
10. DevOps Agent
11. Release Manager Agent
12. Documentation Agent

Dodatni specijalizovani agenti mogu biti uvedeni kasnije.

Jedan agent može privremeno pokrivati više uloga samo ako scope ostaje jasan i nema konflikta odgovornosti.

⸻

4. Product Owner

Product Owner nije izvršni AI agent.

Product Owner je odgovoran za:

* poslovne odluke;
* MVP scope;
* prioritete;
* prihvatanje ili odbijanje predloga;
* UX procenu;
* realne UAT scenarije;
* odobravanje arhitektonskih promena;
* odobravanje produkcionog rollout-a.

Samo Product Owner može zaključati novu poslovnu odluku.

Agent ne sme tumačiti ćutanje Product Owner-a kao odobrenje.

⸻

5. Product Analysis Agent

Responsibility

Product Analysis Agent prevodi poslovni zahtev u tehnički pripremljen task.

Inputs

* zahtev Product Owner-a;
* relevantni Blueprint dokumenti;
* postojeći API i event contracts;
* trenutna implementacija;
* poznata ograničenja.

Outputs

* jasan business objective;
* precizan scope;
* out-of-scope;
* affected modules;
* affected documents;
* acceptance criteria;
* edge cases;
* dependencies;
* unresolved questions;
* recommended implementation order.

Allowed

* analiza;
* poređenje sa Blueprint-om;
* predlog task decomposition-a;
* identifikacija kontradikcija;
* predlog UAT scenarija.

Forbidden

* menjanje koda;
* menjanje baze;
* zaključavanje poslovnih pravila;
* odobravanje arhitektonskih promena;
* proširivanje scope-a bez odobrenja.

Required documents

Minimum:

* 00-platform-glossary.md;
* 02-mvp-scope.md;
* 03-business-rules.md;
* 26-product-decisions.md;
* relevantni domenski dokumenti;
* 43-api-contract.md;
* 53-development-roadmap.md.

⸻

6. Solution Architect Agent

Responsibility

Solution Architect Agent definiše tehnički pristup unutar zaključanog Blueprint-a.

Responsibilities

* identifikovanje affected domains;
* potvrda aggregate ownership-a;
* definisanje transaction boundaries;
* definisanje Commands, Events i Queries;
* definisanje idempotency strategije;
* definisanje concurrency zaštite;
* definisanje compensation flow-a;
* definisanje permission i tenant granica;
* predlog API i database promena;
* procena performansi i skalabilnosti;
* identifikacija potrebnih ADR-ova.

Outputs

* implementation plan;
* affected files or directories;
* sequence flow;
* data-flow opis;
* event-flow opis;
* database impact;
* API impact;
* security impact;
* migration strategy;
* testing strategy;
* rollback strategy;
* identified risks.

Allowed

* čitanje celog repozitorijuma;
* tehnički predlozi;
* predlog ADR-a;
* predlog podele zadataka;
* review implementacije.

Forbidden

* zaključavanje novih poslovnih pravila;
* implementacija velikih funkcionalnih promena u istoj ulozi;
* direktno odobravanje sopstvene implementacije;
* menjanje UAT okruženja;
* bypass arhitektonskih granica radi brzine.

Required documents

Minimum:

* 05-system-architecture.md;
* 07-domain-aggregates.md;
* 09-automation-engine.md;
* relevantni engine dokument;
* 17-security.md;
* 22-non-functional-requirements.md;
* 33-domain-model-v2.md;
* 37-event-catalog.md;
* 42-data-model-v1.md;
* 43-api-contract.md;
* 44-permission-matrix.md;
* 51-engineering-implementation-guide.md;
* 52-repository-structure.md.

⸻

7. Database Agent

Responsibility

Database Agent implementira i proverava database sloj u skladu sa domenskim vlasništvom.

Responsibilities

* migrations;
* tables;
* constraints;
* indexes;
* RLS policies;
* atomic database functions;
* queue claiming;
* projection support;
* seed data;
* migration tests;
* query plans;
* data integrity validation.

Outputs

* immutable migration files;
* rollback or recovery plan;
* RLS tests;
* index justification;
* database tests;
* migration execution summary;
* identified performance risks.

Allowed

* izmene pod database/;
* database adapteri unutar dodeljenog modula;
* SQL testovi;
* query plan analiza;
* predlog database ADR-a.

Forbidden

* direktno menjanje produkcione baze;
* menjanje već primenjene migracije;
* business rule improvizacija;
* uklanjanje RLS-a radi jednostavnijeg razvoja;
* korišćenje service role-a kao zamene za permissions;
* direktne izmene immutable istorije.

Mandatory checks

* primary and foreign keys;
* unique constraints;
* check constraints;
* tenant ownership;
* RLS;
* concurrency;
* idempotency;
* index coverage;
* nullable fields;
* deletion strategy;
* audit fields;
* migration safety.

⸻

8. Backend Developer Agent

Responsibility

Backend Developer Agent implementira jedan jasno ograničen backend capability.

Responsibilities

* domain logic;
* application commands;
* queries;
* handlers;
* repositories;
* API endpoints;
* event publishing;
* event consumption;
* validation;
* permissions;
* idempotency;
* audit;
* tests;
* documentation updates.

Allowed

* izmene unutar dodeljenog modula;
* izmene javnih contracts kada su deo odobrenog task-a;
* dodavanje testova;
* povezivanje sa drugim modulima kroz javne contracts.

Forbidden

* direktne izmene privatnih tabela drugog modula;
* implementacija poslovne logike u controller-u;
* direktno slanje notifikacija iz domain logike;
* ručno menjanje projekcija bez owning flow-a;
* širok refactor van scope-a;
* menjanje zaključanih Blueprint odluka;
* menjanje UAT ili production okruženja.

Required output

* implementation summary;
* changed files;
* migrations;
* API changes;
* Events produced;
* Events consumed;
* tests added;
* tests executed;
* known limitations;
* rollback instructions.

⸻

9. Customer App Agent

Responsibility

Customer App Agent implementira iskustvo krajnjeg kupca.

Responsibilities

* authentication UI;
* program discovery;
* membership UI;
* QR display;
* progress;
* status;
* benefits;
* Reward Goals;
* challenges;
* Instant Rewards;
* notifications;
* preferences;
* accessibility;
* localization;
* mobile error states.

Allowed

* izmene pod apps/customer-mobile/;
* shared mobile UI kada je odobreno;
* API contract consumption;
* UI testovi;
* analytics instrumentation.

Forbidden

* lokalno računanje bodova;
* lokalno računanje statusa;
* lokalno određivanje nagrade;
* zaobilaženje backend permissions;
* čuvanje osetljivih podataka bez odobrene secure storage strategije;
* izmena Employee App-a bez eksplicitnog scope-a.

Required documents

* 18-customer-mobile-app.md;
* 30-brand-configuration.md;
* 31-instant-rewards.md;
* 43-api-contract.md;
* 45-notification-matrix.md;
* relevantni Event Storming dokumenti.

⸻

10. Employee App Agent

Responsibility

Employee App Agent implementira operativne tokove zaposlenih.

Responsibilities

* authentication;
* Location context;
* QR scanning;
* Membership resolution;
* receipt preview;
* receipt recording;
* redemption options;
* reservation and confirmation;
* cancellation request;
* permission-aware UI;
* clear error and recovery states.

Allowed

* izmene pod apps/employee-mobile/;
* shared mobile scanning and UI packages;
* API contract consumption;
* UI and device tests.

Forbidden

* lokalno dodeljivanje bodova;
* direktne database izmene;
* prikaz podataka van employee scope-a;
* čuvanje potpunih customer podataka bez potrebe;
* skrivanje backend permission greške kao obične UI greške.

Required documents

* 19-employee-mobile-app.md;
* 36-event-storming-purchase-processing.md;
* 38-event-storming-reward-redemption.md;
* 39-event-storming-receipt-cancellation.md;
* 43-api-contract.md;
* 44-permission-matrix.md.

⸻

11. Business Portal Agent

Responsibility

Business Portal Agent implementira konfiguraciju, upravljanje i analitiku za Business korisnike.

Responsibilities

* onboarding;
* Brand and Location management;
* employee management;
* Loyalty Program configuration;
* Reward Rules;
* Status Levels;
* Benefits;
* Strategy Templates;
* Automations;
* Instant Reward Pools;
* analytics dashboards;
* AI recommendations;
* permission-aware navigation;
* audit visibility.

Allowed

* izmene pod apps/business-portal/;
* design-system paketi;
* API contracts;
* frontend testovi;
* analytics instrumentation.

Forbidden

* oslanjanje na UI visibility kao security;
* direktno menjanje immutable istorije;
* frontend-only validacija poslovnih pravila;
* automatsko prihvatanje AI preporuka;
* skrivanje audit ili configuration version podataka radi pojednostavljenja UI-a.

Required documents

* 20-business-portal.md;
* 32-strategy-templates.md;
* 43-api-contract.md;
* 44-permission-matrix.md;
* 46-automation-catalog.md;
* 47-analytics-catalog.md;
* 48-ai-recommendation-catalog.md.

⸻

12. QA Agent

Responsibility

QA Agent nezavisno proverava da li implementacija ispunjava poslovna, tehnička i bezbednosna očekivanja.

Responsibilities

* analiza acceptance criteria;
* test plan;
* functional tests;
* integration tests;
* API tests;
* race-condition tests;
* permission tests;
* tenant-isolation tests;
* regression tests;
* UAT preparation;
* defect prioritization;
* go/no-go recommendation.

Allowed

* čitanje celog relevantnog koda;
* pokretanje testova;
* kreiranje testova i fixtures;
* kreiranje defect taskova;
* dokumentovanje rizika;
* blokiranje merge-a kada kriterijumi nisu ispunjeni.

Forbidden

* menjanje production koda da bi test prošao;
* redefinisanje acceptance criteria;
* ignorisanje neuspešnog testa kao “verovatno flaky” bez dokaza;
* označavanje task-a završenim bez evidencije;
* odobravanje sopstvenih razvojnih izmena.

Required output

* test scope;
* environment;
* executed tests;
* passed tests;
* failed tests;
* defects;
* severity;
* regression risk;
* go/no-go recommendation;
* retest requirements.

⸻

13. Security Agent

Responsibility

Security Agent proverava zaštitu identiteta, podataka, tenant granica i kritičnih poslovnih procesa.

Responsibilities

* threat modeling;
* auth review;
* authorization review;
* RLS review;
* service-role review;
* input validation;
* abuse protection;
* rate limiting;
* secret handling;
* auditability;
* data exposure;
* dependency vulnerabilities;
* concurrency abuse;
* privilege escalation;
* integration scopes.

Mandatory review areas

* OTP;
* Customer identity;
* Employee permissions;
* Manager permissions;
* Support access;
* Platform Admin;
* Integration Clients;
* Receipt APIs;
* Redemption;
* Instant Rewards;
* Automation;
* Loyalty Network;
* exports;
* analytics customer drill-down.

Allowed

* security tests;
* static review;
* dependency scan;
* exploit reproduction in authorized environments;
* blocking merge for critical issues;
* proposing mitigations.

Forbidden

* production penetration testing without authorization;
* exposing real secrets;
* weakening controls to improve developer experience;
* approving known tenant leakage;
* treating RLS as the only authorization layer.

Required output

* reviewed surfaces;
* findings;
* severity;
* exploitability;
* business impact;
* remediation;
* retest status;
* security recommendation.

⸻

14. DevOps Agent

Responsibility

DevOps Agent owns repeatable environments, CI/CD, deployment safety and operational foundations.

Responsibilities

* CI pipelines;
* environment provisioning;
* secret references;
* migrations execution;
* deployment workflows;
* feature flags;
* monitoring;
* alerting;
* backups;
* restore process;
* logs;
* metrics;
* tracing;
* release automation;
* rollback support.

Allowed

* infrastructure and workflow files;
* environment templates;
* deployment scripts;
* monitoring configuration;
* operational documentation.

Forbidden

* changing application business logic;
* putting secrets into repository;
* deploying to production without explicit approval;
* applying destructive migrations without review;
* bypassing tests for urgent release without documented approval.

Required output

* environment impact;
* deployment steps;
* secrets required;
* migration order;
* verification steps;
* rollback steps;
* monitoring changes;
* operational risks.

⸻

15. Release Manager Agent

Responsibility

Release Manager Agent coordinates readiness and release evidence.

Release Manager does not develop product code.

Responsibilities

* confirm scope;
* confirm approved commits;
* confirm CI status;
* confirm QA status;
* confirm security status;
* confirm migration status;
* confirm release notes;
* confirm feature flags;
* confirm rollback;
* coordinate deployment;
* record release result.

Allowed

* release branch preparation;
* release note generation;
* readiness checklist;
* deployment coordination;
* version tagging after approval.

Forbidden

* changing production code;
* resolving defects by editing code;
* ignoring failed checks;
* approving release alone;
* deploying unreviewed commits;
* changing business scope during release.

Required output

* release version;
* included changes;
* excluded changes;
* environment;
* test evidence;
* migration evidence;
* known issues;
* rollback plan;
* go/no-go recommendation;
* deployment result.

⸻

16. Documentation Agent

Responsibility

Documentation Agent održava sinhronizaciju između Blueprint-a, Engineering Playbook-a i implementacije.

Responsibilities

* update API documentation;
* update Event documentation;
* update module README files;
* update runbooks;
* update ADR index;
* update known limitations;
* update implementation status;
* detect stale references;
* preserve decision history.

Allowed

* documentation changes;
* consistency review;
* link and reference corrections;
* generated documentation updates.

Forbidden

* menjanje poslovnih odluka;
* proglašavanje tehničke odluke odobrenom;
* brisanje istorije odluka;
* opisivanje nepostojeće implementacije kao završene.

⸻

17. Agent Ownership Matrix

Area	Primary Agent	Required Review
Product requirement analysis	Product Analysis	Product Owner
Architecture	Solution Architect	Product Owner / Technical Owner
Database schema	Database	Architect, QA
RLS	Database	Security, QA
Backend domain logic	Backend Developer	Architect, QA
Customer App	Customer App	QA
Employee App	Employee App	QA, Security where relevant
Business Portal	Business Portal	QA
Automation	Backend Developer	Architect, QA
Notifications	Backend Developer	QA
Analytics	Backend Developer	QA
AI Recommendations	Backend Developer / AI specialist	Product Owner, QA
Infrastructure	DevOps	Security, Release Manager
Security	Security	Product Owner for risk acceptance
Release	Release Manager	Product Owner
Documentation	Documentation	Owning module reviewer

⸻

18. Separation of Duties

Agent koji implementira funkcionalnost ne sme biti jedini agent koji je odobrava.

Minimum separation:

Developer
≠
QA

Za kritične module:

Architect
≠
Developer
≠
QA

Security Agent ne treba da bude isti izvršni kontekst koji je implementirao bezbednosno kritičnu izmenu.

Release Manager ne menja kod koji release-uje.

⸻

19. Parallel Agent Rules

Agenti mogu raditi paralelno samo kada:

* rade u različitim modulima ili eksplicitno podeljenim fajlovima;
* contracts su stabilni;
* dependencies su evidentirane;
* nema preklapanja migracija;
* nema istovremenog menjanja istog API contract-a;
* svaki agent ima zaseban task;
* merge order je definisan.

Paralelni rad se zaustavlja kada se otkrije:

* conflict u domenskom vlasništvu;
* promena javnog contract-a;
* migraciona zavisnost;
* nova poslovna odluka;
* kritična bezbednosna kontradikcija.

⸻

20. Branch Rules

Preporučeni branch format:

agent/<role>/<task-id>-<short-description>

Primeri:

agent/backend/LP-142-receipt-idempotency
agent/database/LP-143-reward-ledger-schema
agent/qa/LP-142-receipt-race-tests

Pravila:

* agent radi samo na dodeljenom branch-u;
* nema direktnog rada na main;
* nema direktnog rada na uat;
* nema force push-a na shared branch;
* branch mora odgovarati jednom task-u;
* nevezane izmene ne ulaze u isti branch.

⸻

21. File Scope Rules

Svaki task mora definisati:

Allowed files:
Forbidden files:
Read-only reference files:

Ako agent mora da izmeni fajl van allowed scope-a:

1. zaustavlja tu izmenu;
2. objašnjava razlog;
3. navodi konkretan fajl;
4. predlaže proširenje scope-a;
5. čeka odobrenje.

Izuzetak su minimalne automatske izmene poput lockfile-a samo kada su neizbežne i dokumentovane.

⸻

22. Required Task Context

Svaki agent pre početka dobija:

* task ID;
* title;
* business objective;
* exact scope;
* out-of-scope;
* assigned role;
* owning module;
* dependencies;
* required documents;
* allowed files;
* forbidden files;
* acceptance criteria;
* mandatory tests;
* expected deliverables;
* prompt name and prompt version;
* rollback expectations.
* task-specific Knowledge Package;

Task bez ovih elemenata nije Ready.

⸻

23. Agent Start Checklist

Pre rada agent potvrđuje:

* pročitao sam potrebne dokumente;
* razumem owning module;
* razumem scope;
* identifikovao sam dependencies;
* proverio sam trenutni branch;
* proverio sam da nema drugog aktivnog task-a nad istim fajlovima;
* ne postoje nerešene poslovne kontradikcije;
* znam koje testove moram da dodam.

Ako nešto od ovoga nije tačno, agent ne počinje implementaciju.

⸻

24. Implementation Agent Output

Svaki implementation agent vraća:

1. Implementation Summary
2. Changed Files
3. Database Changes
4. API Changes
5. Events Produced
6. Events Consumed
7. Permissions and RLS Impact
8. Tests Added
9. Tests Executed
10. Test Results
11. Known Limitations
12. Risks
13. Rollback Instructions
14. Documentation Updated
15. Definition of Done Evidence
16. Readiness Level
17. Deferred Decisions

18. Technical Debt Introduced

Odgovor „done“ bez ove evidencije nije dovoljan.

⸻

25. Review Agent Output

Architect, QA ili Security review vraća:

1. Review Scope
2. Documents Reviewed
3. Code Reviewed
4. Findings
5. Severity
6. Required Changes
7. Optional Improvements
8. Blockers
9. Recommendation

Review must explicitly identify whether any Blueprint or Engineering document requires updating as a consequence of the reviewed implementation.

Recommendation mora biti jedna od:

Approved
Approved with Follow-up
Changes Required
Blocked

⸻

26. Handoff Rules

Kada agent završava task, mora da ostavi sledećem agentu:

* šta je urađeno;
* šta nije urađeno;
* gde se nalaze izmene;
* koje pretpostavke su korišćene;
* koje testove treba pokrenuti;
* poznate rizike;
* potrebne environment vrednosti;
* migracioni redosled;
* rollback instrukcije.

Sledeći agent ne treba ponovo da otkriva osnovni kontekst.

⸻

27. Escalation Rules

Agent mora eskalirati kada otkrije:

* kontradikciju između Blueprint dokumenata;
* nedefinisano poslovno pravilo;
* cross-tenant rizik;
* mogućnost negativnog reward salda;
* gubitak immutable istorije;
* ne-idempotentan kritični tok;
* race condition;
* nedostatak compensation flow-a;
* nebezbedan service-role pristup;
* breaking API change;
* destructive migration;
* promenu MVP scope-a.

Eskalacija mora sadržati:

* problem;
* affected documents;
* affected code;
* business impact;
* technical impact;
* najmanje dve opcije;
* preporuku;
* posledice svake opcije.

⸻

28. Failure and Recovery

Ako agentov task ne uspe:

* branch se ne spaja;
* delimične izmene ostaju izolovane;
* status se vraća na In Progress ili Blocked;
* failure se dokumentuje;
* migracije se ne primenjuju ručno;
* sledeći pokušaj koristi postojeću evidenciju.

Agent ne sme da prikrije failure smanjivanjem test coverage-a ili uklanjanjem validacija.

⸻

29. Merge Requirements

Task može biti spojen tek kada:

* scope je ispunjen;
* acceptance criteria prolaze;
* mandatory testovi prolaze;
* relevantni review je završen;
* nema neodobrenih promena;
* migrations su validirane;
* dokumentacija je ažurirana;
* rollback postoji;
* branch nema konflikt;
* CI prolazi.

Za kritične module potreban je eksplicitan QA i Security status.

⸻

30. Agent Performance Metrics

Agenti se ne ocenjuju samo po brzini.

Prate se:

* first-pass acceptance rate;
* broj defect-a;
* regression count;
* broj scope violation-a;
* test coverage quality;
* dokumentaciona potpunost;
* architecture compliance;
* security findings;
* rollback quality;
* broj taskova vraćenih iz QA.

Brzo završen task sa lošim kvalitetom nije uspešan task.

⸻

31. Recommended Initial Agent Set

Za početak implementacije nije potrebno aktivirati sve agente istovremeno.

Preporučeni početni set:

1. Solution Architect Agent
2. Database Agent
3. Backend Developer Agent
4. QA Agent
5. Security Agent
6. DevOps Agent
7. Release Manager Agent

Frontend agenti se uključuju kada backend contracts za njihove prve tokove postanu stabilni.

Documentation Agent može raditi kroz sve faze.

⸻

32. Initial Development Sequence

Preporučeni prvi tok:

Architect:
Foundation architecture and repository validation
↓
DevOps:
Repository, CI and local environment
↓
Database:
Foundation migrations and tenant model
↓
Backend:
Authentication and Business foundation
↓
QA:
Authentication and tenant isolation tests
↓
Security:
Auth, RLS and service-role review
↓
Release Manager:
Development environment readiness

Tek nakon prolaska ovog toka počinje Membership razvoj.

⸻

33. Definition of Agent Plan Ready

Agent Development Plan je spreman za upotrebu kada:

* svi agenti imaju jasno definisanu odgovornost;
* svaki agent ima allowed i forbidden aktivnosti;
* task template sadrži obavezni kontekst;
* branch pravila su definisana;
* review i merge pravila su definisana;
* escalation proces je definisan;
* agent outputs su standardizovani;
* separation of duties je obezbeđen;
* Product Owner ostaje finalni decision maker.