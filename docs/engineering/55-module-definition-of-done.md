55. Module Definition of Done

1. Purpose

Ovaj dokument definiše obavezne kriterijume koje svaki modul Loyalty Platform-e mora ispuniti pre nego što se smatra završenim.

Definition of Done sprečava da se modul proglasi završenim kada:

* postoji samo osnovni kod;
* testirani su samo happy-path scenariji;
* permissions nisu proverene;
* migracije nisu bezbedne;
* observability ne postoji;
* dokumentacija nije ažurirana;
* rollback nije definisan;
* postoje poznati kritični problemi.

Modul se smatra završenim samo kada su ispunjeni svi primenljivi kriterijumi iz ovog dokumenta.

⸻

2. Definition of Done Levels

Koriste se četiri nivoa završetka.

Level 1 — Implementation Complete

Kod i osnovni testovi postoje.

Ovaj nivo nije dovoljan za merge u stabilnu granu.

⸻

Level 2 — Integration Ready

Modul je povezan sa svojim zavisnostima.

Contracts i migracije su provereni.

Modul je spreman za QA.

⸻

Level 3 — UAT Ready

Funkcionalni, integracioni, permission i ključni failure testovi prolaze.

Modul je spreman za poslovni UAT.

⸻

Level 4 — Production Ready

Modul ima:

* security review;
* observability;
* operativnu dokumentaciju;
* rollback;
* performance evidence;
* rešene kritične probleme.

Samo Level 4 modul može biti uključen u produkcioni rollout.

⸻

3. Universal Module Checklist

Svaki modul mora imati:

* jasno definisanu svrhu;
* owning domain;
* odgovornosti;
* eksplicitno definisan out-of-scope;
* javne contracts;
* dependencies;
* podatke koje poseduje;
* Commands;
* Events;
* Queries;
* permissions;
* audit;
* error model;
* testove;
* dokumentaciju;
* monitoring;
* rollback ili recovery plan.

⸻

4. Business Rules

Svi relevantni poslovni zahtevi moraju biti:

* identifikovani;
* povezani sa Blueprint dokumentima;
* implementirani u owning backend modulu;
* pokriveni testovima;
* objašnjivi kroz logs ili audit gde je potrebno.

Nije dozvoljeno:

* inventiranje novih poslovnih pravila;
* implicitno ponašanje bez dokumentacije;
* poslovna logika samo u UI-u;
* poslovna logika samo u database trigger-u bez owning module dokumentacije.

⸻

5. Domain Ownership

Modul mora jasno definisati:

* koje aggregate-e poseduje;
* koje entitete poseduje;
* koje tabele poseduje;
* koje Events proizvodi;
* koje Events konzumira;
* koje Commands prihvata;
* koje Queries izlaže.

Modul ne sme:

* direktno menjati privatne podatke drugog modula;
* koristiti privatni repository drugog modula;
* zaobilaziti javni contract;
* stvarati circular dependency.

⸻

6. API Definition of Done

Za svaki API endpoint mora postojati:

* business action naziv;
* request schema;
* response schema;
* validacija;
* authentication;
* authorization;
* tenant validation;
* permission validation;
* idempotency ponašanje gde je primenljivo;
* error contract;
* audit ponašanje;
* API testovi;
* dokumentacija.

Obavezno testirati:

* valid request;
* invalid request;
* unauthenticated request;
* unauthorized request;
* cross-tenant request;
* duplicate request;
* concurrency gde je relevantna;
* not-found bez data leakage-a;
* expected business error.

Endpoint ne sme vraćati interne stack trace ili sirove database greške.

⸻

7. Event Definition of Done

Svaki Event mora imati:

* jedinstveno ime;
* business značenje;
* owning module;
* producer;
* consumers;
* schema;
* version;
* timestamp;
* correlation ID;
* causation ID;
* aggregate reference;
* tenant context;
* idempotency identifikator;
* dokumentovanu retry semantiku.

Event handler mora biti:

* idempotentan;
* retry-safe;
* otporan na duplikate;
* otporan na out-of-order delivery gde je potrebno;
* observabilan;
* pokriven testovima.

Event se ne smatra uspešno obrađenim ako je nastalo parcijalno nekonzistentno stanje.

⸻

8. Database Definition of Done

Svaka database promena mora imati:

* novu immutable migration datoteku;
* jasno vlasništvo;
* primary key;
* foreign keys;
* unique constraints;
* check constraints;
* tenant reference;
* audit fields gde su potrebna;
* odgovarajuće index-e;
* RLS policy;
* migration test;
* recovery ili rollback plan;
* procenu uticaja na postojeće podatke.

Obavezno proveriti:

* nullable polja;
* cascade ponašanje;
* soft-delete ili immutable strategiju;
* concurrency;
* duplicate prevention;
* referential integrity;
* query plan;
* large-table impact;
* deployment order.

Nije dozvoljeno:

* ručno menjanje production schema;
* izmena već primenjene migracije;
* oslanjanje samo na application validation;
* uklanjanje constraint-a da bi test prošao.

⸻

9. RLS and Permission Definition of Done

Svaka tenant-scoped tabela mora imati odgovarajući RLS model.

Obavezno testirati:

* Customer access;
* Employee access;
* Manager access;
* Business Owner access;
* Platform Support access;
* Platform Admin access;
* Integration Client access;
* service-role path.

Minimalni testovi:

* dozvoljen pristup sopstvenim podacima;
* zabranjen pristup drugom Business-u;
* zabranjen pristup drugom Customer-u;
* Location scope;
* revoked role;
* suspended user;
* missing tenant context;
* malformed identifier;
* service-role business-rule validation.

UI visibility nije deo Definition of Done za security.

⸻

10. Immutable Data Definition of Done

Za immutable podatke mora biti dokazano da:

* ne postoji običan update flow;
* correction koristi compensating record;
* originalni zapis ostaje očuvan;
* audit povezuje original i korekciju;
* balance ili projection se pravilno ažurira;
* replay daje isto poslovno stanje.

Odnosi se najmanje na:

* Receipts;
* Receipt Cancellations;
* Reward Ledger;
* XP Ledger;
* Status History;
* completed Membership Years;
* business Events;
* Audit Records.

⸻

11. Idempotency Definition of Done

Svaka kritična poslovna akcija mora imati definisanu idempotency strategiju.

Obavezno za:

* Receipt Recording;
* Receipt Cancellation;
* Reward Earning;
* Reward Release;
* Redemption Reservation;
* Redemption Confirmation;
* Instant Reward Opening;
* Benefit Redemption;
* Automation execution;
* Notification enqueue;
* integration callbacks.

Testovi moraju uključiti:

* isti zahtev dva puta;
* isti zahtev paralelno;
* retry nakon timeout-a;
* retry nakon delimičnog infrastructure failure-a;
* duplicate Event delivery.

Rezultat mora biti jedno poslovno izvršenje.

⸻

12. Concurrency Definition of Done

Moduli koji menjaju finansijski ili ograničeni resurs moraju imati race-condition testove.

Primeri:

* Reward balance;
* Reward reservation;
* Benefit redemption;
* Instant Reward opening;
* campaign limit;
* Reward Definition limit;
* queue claiming;
* configuration version activation.

Test mora dokazati da:

* nema duplog izvršenja;
* nema negativnog stanja;
* nema izgubljenog update-a;
* nema dva aktivna zapisa kada je dozvoljen samo jedan;
* retry ostaje bezbedan.

⸻

13. Error Handling Definition of Done

Modul mora razlikovati:

* validation error;
* authentication error;
* authorization error;
* not-found;
* business-rule violation;
* conflict;
* concurrency error;
* rate-limit error;
* temporary infrastructure error;
* permanent provider error;
* unexpected error.

Svaka greška mora imati:

* stabilan error code;
* bezbednu poruku;
* odgovarajući HTTP status gde je primenljivo;
* correlation ID;
* log nivo;
* retry klasifikaciju;
* audit ponašanje gde je potrebno.

Interni detalji se ne izlažu klijentu.

⸻

14. Audit Definition of Done

Audit mora postojati za:

* konfiguracione promene;
* permission promene;
* ručne korekcije;
* support pristup;
* admin akcije;
* receipt cancellation;
* Reward adjustment;
* Benefit manual grant ili revocation;
* automation activation;
* strategy acceptance;
* network membership changes;
* sensitive export.

Audit zapis mora sadržati:

* ko;
* kada;
* šta;
* nad kojim objektom;
* prethodnu vrednost gde je primenljivo;
* novu vrednost gde je primenljivo;
* razlog;
* tenant;
* correlation ID;
* izvor akcije.

Audit ne sme sadržati nepotrebne osetljive podatke.

⸻

15. Testing Definition of Done

Svaki modul mora imati primenljive testove iz sledećih kategorija:

* unit;
* integration;
* API;
* contract;
* event;
* database;
* permission;
* tenant isolation;
* concurrency;
* idempotency;
* failure recovery;
* regression;
* performance;
* UAT.

Testovi moraju biti:

* deterministički;
* ponovljivi;
* izolovani;
* jasni;
* povezani sa acceptance criteria;
* uključeni u CI gde je moguće.

Test koji samo potvrđuje da endpoint vraća 200 nije dovoljan.

⸻

16. Test Evidence

Agent mora dokumentovati:

* testove koji su dodati;
* testove koji su pokrenuti;
* environment;
* rezultat;
* neuspele testove;
* razloge za preskočene testove;
* poznate praznine;
* potreban retest.

Modul nije završen ako mandatory test nije pokrenut bez jasnog i odobrenog razloga.

⸻

17. Performance Definition of Done

Za performance-sensitive module moraju biti definisani:

* očekivano opterećenje;
* latency cilj;
* throughput cilj;
* query plan;
* index strategija;
* queue ponašanje;
* batch ponašanje;
* timeout;
* retry limit;
* memory risk;
* data growth model.

Obavezni performance moduli:

* Receipt Processing;
* Reward Ledger;
* Redemption;
* Automation;
* Notifications;
* Analytics;
* Customer membership home;
* Employee receipt flow.

Performance optimizacija ne sme ugroziti correctness ili tenant isolation.

⸻

18. Observability Definition of Done

Modul mora imati primenljive:

* structured logs;
* correlation IDs;
* metrics;
* traces;
* queue metrics;
* error rate;
* latency metrics;
* retry metrics;
* dead-letter visibility;
* health signal;
* alert threshold.

Logs ne smeju sadržati:

* OTP kodove;
* auth tokene;
* service-role keys;
* potpune payment podatke;
* nepotrebne lične podatke;
* tajne konfiguracije.

⸻

19. Security Definition of Done

Svaki modul mora potvrditi:

* input validation;
* output filtering;
* authorization;
* RLS;
* tenant isolation;
* secret handling;
* rate limiting gde je potrebno;
* abuse scenarios;
* secure defaults;
* dependency security;
* auditability;
* least privilege.

Security review je obavezan za:

* authentication;
* permissions;
* support access;
* service-role functions;
* Receipt;
* Redemption;
* Instant Rewards;
* Loyalty Network;
* exports;
* integrations;
* admin functionality.

⸻

20. Frontend Definition of Done

Frontend modul ili feature mora imati:

* loading state;
* empty state;
* error state;
* retry state;
* permission-denied state;
* expired-session state;
* duplicate-submit prevention;
* accessibility;
* localization;
* responsive ili device behavior;
* analytics instrumentation gde je potrebno;
* testove;
* backend error mapping.

Frontend ne sme:

* računati autoritativne loyalty vrednosti;
* pretpostavljati permission samo iz navigation-a;
* prikazivati stale data kao potvrđenu transakciju;
* potvrditi uspeh pre backend potvrde;
* sakriti kritične greške.

⸻

21. Customer App Definition of Done

Za Customer App capability obavezno proveriti:

* Customer vidi samo svoje podatke;
* Membership pripada pravilnom programu;
* QR ne sadrži lične podatke;
* balance je jasno označen;
* pending points su odvojeni;
* expired Benefit se ne prikazuje kao aktivan;
* Instant Reward rezultat dolazi sa backend-a;
* notification preferences se poštuju;
* više Loyalty Programa je podržano;
* Brand context je jasan.

⸻

22. Employee App Definition of Done

Za Employee App capability obavezno proveriti:

* Employee radi samo u dodeljenoj Location;
* QR resolution je backend-controlled;
* receipt preview nije potvrđena transakcija;
* duplicate submit je sprečen;
* redemption zahteva reservation i confirmation;
* greške se jasno prikazuju;
* nema direktne dodele bodova;
* nema pristupa nepotrebnim Customer podacima;
* cancellation prati permission model;
* audit beleži Employee i Location.

⸻

23. Business Portal Definition of Done

Za Business Portal capability obavezno proveriti:

* permission-aware navigation;
* backend authorization;
* configuration validation;
* draft i active stanje gde je potrebno;
* audit history;
* unsaved changes warning;
* optimistic concurrency;
* tenant isolation;
* Brand i Location scope;
* jasna objašnjenja poslovnog efekta;
* opasne akcije zahtevaju potvrdu;
* AI preporuke se ne primenjuju automatski.

⸻

24. Automation Definition of Done

Automation capability mora imati:

* trigger;
* conditions;
* actions;
* priority;
* start i end date;
* cooldown;
* audience;
* execution limits;
* loop protection;
* idempotency;
* execution history;
* failure handling;
* retry;
* simulation;
* dry run;
* audit.

Automation ne sme:

* direktno pisati u tuđe domenske tabele;
* zaobići Reward, Benefit ili Notification module;
* beskonačno generisati Events;
* izvršiti action izvan tenant scope-a.

⸻

25. Notification Definition of Done

Notification capability mora imati:

* classification;
* channel;
* template;
* consent rule;
* quiet-hours rule;
* duplicate suppression;
* provider route;
* retry policy;
* delivery tracking;
* failure classification;
* fallback ponašanje gde postoji;
* read status gde je primenljivo.

Provider failure ne sme promeniti uspeh osnovne business transakcije.

⸻

26. Analytics Definition of Done

Svaki KPI mora imati:

* naziv;
* business značenje;
* formulu;
* source data;
* owner;
* tenant scope;
* time-zone pravilo;
* update frequency;
* data freshness;
* reconciliation method;
* drill-down;
* privacy pravilo;
* test.

Projection mora biti rebuildable.

Analytics ne sme menjati transactional data.

⸻

27. AI Recommendation Definition of Done

Svaka preporuka mora imati:

* recommendation type;
* evidence;
* affected KPI;
* explanation;
* priority;
* confidence;
* lifecycle;
* expiration;
* action link;
* user approval requirement;
* feedback capture;
* tenant isolation.

AI ne sme:

* menjati konfiguraciju bez potvrde;
* aktivirati kampanju;
* dodeliti bodove;
* menjati Status;
* prikazati procenu kao garantovan rezultat.

⸻

28. Documentation Definition of Done

Modul mora imati ažurirane:

* module README;
* public API docs;
* Event docs;
* data ownership;
* migration notes;
* environment requirements;
* test instructions;
* known limitations;
* operational notes;
* rollback instructions;
* relevant Blueprint ili Engineering references.

Dokumentacija mora opisivati stvarno implementirano stanje.

⸻

29. Operational Definition of Done

Za production-ready modul mora postojati:

* deployment procedure;
* migration order;
* required secrets;
* configuration defaults;
* health verification;
* smoke test;
* rollback;
* recovery;
* alerting;
* ownership;
* incident contact ili odgovorna uloga;
* known failure modes;
* support runbook.

⸻

30. Rollback and Recovery Definition of Done

Svaka promena mora definisati jedan od sledećih pristupa:

* safe rollback;
* feature flag disable;
* forward fix;
* compensating migration;
* queue pause;
* provider fallback;
* projection rebuild;
* data recovery procedure.

Rollback ne sme brisati immutable poslovnu istoriju.

Za destructive migration mora postojati eksplicitno odobrena recovery strategija.

⸻

31. Known Limitations

Poznata ograničenja moraju biti:

* dokumentovana;
* procenjena;
* klasifikovana po severity;
* povezana sa backlog taskom;
* prihvaćena od odgovorne osobe;
* vidljiva QA i Release Agent-u.

Modul sa poznatim P0 problemom nije završen.

Modul sa poznatim P1 problemom nije Production Ready bez eksplicitnog risk acceptance-a.

⸻

32. Review Requirements

Minimalni review po vrsti modula:

Standard backend module

* Backend review;
* QA review.

Database-heavy module

* Database review;
* Architect review;
* QA review.

Security-sensitive module

* Architect review;
* QA review;
* Security review.

Frontend feature

* Frontend review;
* QA review;
* Product UX review gde je relevantno.

Infrastructure change

* DevOps review;
* Security review gde je relevantno;
* Release review.

⸻

33. Merge Definition of Done

Promena može biti merge-ovana kada:

* scope je ispunjen;
* acceptance criteria prolaze;
* mandatory testovi prolaze;
* CI prolazi;
* izmene su usklađene sa `59-coding-standards.md`;
* review je odobren;
* nema scope violation-a;
* migrations su proverene;
* documentation je ažurirana;
* poznati rizici su navedeni;
* rollback je dokumentovan;
* nema P0 ili neprihvaćenog P1 problema.

Merge ne znači automatski da je feature Production Ready.

⸻

34. UAT Ready Definition

Modul je UAT Ready kada:

* Integration Ready kriterijumi prolaze;
* svi glavni business flows rade;
* permission testovi prolaze;
* tenant isolation prolazi;
* error states su testirani;
* UAT data i fixtures postoje;
* relevantni scenariji iz `56-uat-scenarios.md` su identifikovani i pripremljeni;
* poznata ograničenja su navedena;
* rollback iz UAT-a je moguć;
* QA daje GO FOR UAT.
* UAT evidence format je pripremljen u skladu sa `56-uat-scenarios.md`.

⸻

35. Production Ready Definition

Modul je Production Ready kada:

* UAT je uspešno završen;
* Security review je završen gde je potreban;
* performance ciljevi su potvrđeni;
* monitoring i alerting postoje;
* backup i recovery su provereni;
* rollback je testiran;
* release notes postoje;
* release plan i release evidence su pripremljeni u skladu sa `60-release-strategy.md`;
* support runbook postoji;
* nema kritičnih otvorenih problema;
* Product Owner odobrava rollout;
* Release Manager daje GO.

⸻

36. Module Completion Evidence

Za svaki završen modul mora postojati evidencija:

Module:
Version:
Owner:
Implemented capabilities:
Excluded capabilities:
Blueprint references:
API references:
Events produced:
Events consumed:
Owned tables:
Migrations:
Tests executed:
QA result:
Security result:
Performance result:
Known limitations:
Rollback:
Documentation:
Readiness level:
Knowledge Package used:

Referenced Blueprint documents:

Referenced Engineering documents:
Approval:

Bez ove evidencije modul nije formalno završen.

⸻

37. Definition of Done Exceptions

Izuzetak od kriterijuma mora biti:

* eksplicitan;
* dokumentovan;
* vremenski ograničen;
* povezan sa risk owner-om;
* povezan sa remediation taskom;
* odobren od odgovarajuće uloge.

Agent ne sme sam sebi odobriti izuzetak.

⸻

38. Definition of Module Done

Modul se smatra potpuno završenim samo kada:

* ispunjava zaključane poslovne zahteve;
* poštuje owning domain;
* ne narušava module boundaries;
* API i Events su stabilni;
* podaci su bezbedni;
* tenant isolation je dokazan;
* kritični tokovi su idempotentni;
* concurrency je testirana;
* audit postoji;
* testovi prolaze;
* observability postoji;
* dokumentacija je ažurirana;
* rollback ili recovery postoji;
* QA je odobrio;
* Security je odobrio gde je potrebno;
* Product Owner je prihvatio poslovni rezultat.