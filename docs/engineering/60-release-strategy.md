60. Release Strategy

1. Purpose

Ovaj dokument definiše način pripreme, odobravanja, puštanja i povlačenja verzija Loyalty Platform-e.

Ciljevi su:

* bezbedan i ponovljiv release proces;
* jasno razdvajanje development, UAT i production okruženja;
* sprečavanje neodobrenih promena;
* kontrolisano izvršavanje database migracija;
* mogućnost brzog rollback-a ili deaktivacije funkcionalnosti;
* očuvanje immutable poslovnih podataka;
* jasna odgovornost za GO/NO-GO odluke;
* potpuna release evidencija.

Release se ne smatra uspešnim samo zato što je deployment tehnički završen.

Release je uspešan kada:

* aplikacija radi;
* migracije su uspešne;
* monitoring ne pokazuje kritične probleme;
* ključni poslovni tokovi prolaze;
* nije ugrožen integritet podataka;
* postoji potvrđena mogućnost oporavka.

⸻

2. Release Principles

Svaki release mora pratiti sledeće principe:

* no direct production changes;
* immutable migrations;
* automated verification;
* explicit approval;
* rollback or recovery before deployment;
* feature flags for risky capabilities;
* small and reversible releases;
* monitoring before, during and after release;
* no release with unresolved P0;
* no release with unaccepted P1;
* no silent schema changes;
* no bypass of QA or security evidence;
* no manual ledger correction as part of deployment.

⸻

3. Environments

Platforma koristi najmanje sledeća okruženja:

Local
Development
UAT
Production

Opcionalno:

Preview
Integration
Pilot
Staging

⸻

3.1 Local

Purpose:

* individual development;
* unit tests;
* local integration tests;
* migration development;
* debugging.

Local environment may use:

* local Supabase;
* local PostgreSQL;
* sandbox providers;
* seeded test data.

Local configuration must never contain production secrets.

⸻

3.2 Development

Purpose:

* merged development work;
* shared integration;
* early QA;
* API contract validation;
* agent integration testing.

Development may be reset when required, but reset procedure must be documented.

Development is not a substitute for UAT.

⸻

3.3 UAT

Purpose:

* business acceptance testing;
* full end-to-end validation;
* release candidate verification;
* permission and tenant testing;
* migration rehearsal;
* provider sandbox testing.

UAT must remain controlled.

Agents must not directly modify UAT data or configuration unless the task explicitly authorizes it.

UAT should resemble Production in:

* schema;
* enabled modules;
* provider routing;
* permissions;
* deployment topology;
* feature flags;
* monitoring.

⸻

3.4 Production

Purpose:

* real Business, Customer and Employee operations.

Production changes require:

* approved release;
* verified artifact;
* migration plan;
* rollback or recovery plan;
* QA evidence;
* Security evidence where required;
* Product Owner approval;
* Release Manager coordination.

No agent may independently deploy to Production.

⸻

4. Branch Strategy

Recommended long-lived branches:

main
uat
development

Meaning:

development
→ active integrated development
uat
→ approved release candidate
main
→ production-approved code

Agent branches use:

agent/<role>/<task-id>-<description>

Example:

agent/backend/LP-142-receipt-idempotency

⸻

5. Branch Rules

Development branch

Changes enter through reviewed pull requests.

Required:

* task reference;
* passing CI;
* mandatory tests;
* reviewer approval;
* no unresolved merge conflict.

UAT branch

Only approved release candidate changes may enter.

No experimental changes.

No direct agent development.

Main branch

Represents production-approved code.

Direct commits are forbidden.

Force push is forbidden.

Merge requires release approval.

⸻

6. Release Types

Patch Release

Examples:

* bug fix;
* security fix;
* small backward-compatible correction;
* provider configuration correction.

Version example:

1.2.3 → 1.2.4

⸻

Minor Release

Examples:

* new backward-compatible capability;
* new automation template;
* new report;
* new optional API field;
* new feature behind a flag.

Version example:

1.2.0 → 1.3.0

⸻

Major Release

Examples:

* breaking API change;
* major domain change;
* incompatible data-model change;
* removed behavior;
* significant operational migration.

Version example:

1.x.x → 2.0.0

Major release requires:

* migration strategy;
* compatibility plan;
* customer communication where relevant;
* extended UAT;
* architecture approval.

⸻

Hotfix Release

Used only for urgent Production issues.

Examples:

* tenant leakage;
* authentication failure;
* duplicate redemption;
* ledger corruption risk;
* critical outage.

Hotfix does not remove the need for:

* review;
* tests;
* rollback;
* audit.

The process may be accelerated, but not bypassed.

⸻

7. Versioning

Use Semantic Versioning:

MAJOR.MINOR.PATCH

Examples:

1.0.0
1.1.0
1.1.1

Every deployed version must be identifiable through:

* application version;
* commit SHA;
* build ID;
* database migration version;
* deployment timestamp;
* environment.

⸻

8. Release Candidate

Release Candidate format:

1.2.0-rc.1
1.2.0-rc.2

A new Release Candidate is required when:

* code changes;
* migration changes;
* configuration changes affecting behavior;
* failed UAT issue is fixed;
* release artifact changes.

The same Release Candidate artifact should be promoted between environments where technically possible.

Do not rebuild different code for Production after UAT approval.

⸻

9. Release Lifecycle

Standard lifecycle:

Task Complete
→ Merge to Development
→ Development Verification
→ Release Scope Selected
→ Release Candidate Created
→ Deploy to UAT
→ UAT
→ Security Review
→ Release Approval
→ Merge or Promote to Main
→ Production Deployment
→ Smoke Test
→ Monitoring Period
→ Release Closure

⸻

10. Release Scope

Every release must define:

* version;
* business objective;
* included tasks;
* excluded tasks;
* changed modules;
* changed APIs;
* changed Events;
* database migrations;
* feature flags;
* provider changes;
* configuration changes;
* known limitations;
* operational risk.

Release scope must be frozen before final UAT.

Only critical fixes may enter after scope freeze.

Any added fix requires impact analysis and retest.

⸻

11. Release Readiness Checklist

Before UAT deployment:

* release scope defined;
* all included tasks merged;
* CI passes;
* migrations validated;
* API contracts updated;
* Event contracts updated;
* documentation updated;
* feature flags documented;
* test data prepared;
* UAT scenarios selected;
* rollback or recovery documented.

Before Production deployment:

* UAT passed;
* QA recommendation is GO or approved CONDITIONAL GO;
* Security approval exists where required;
* no open P0;
* no unaccepted P1;
* migration rehearsal completed;
* backup status verified;
* rollback tested or validated;
* monitoring ready;
* alerting ready;
* support informed;
* Product Owner approval recorded;
* Release Manager recommendation recorded.

⸻

12. Database Migration Strategy

Database migrations must execute in controlled order.

Recommended order:

1. Pre-deployment validation
2. Backward-compatible schema expansion
3. Application deployment
4. Data backfill where required
5. Feature activation
6. Constraint tightening where safe
7. Deprecated structure removal in later release

Prefer:

Expand
→ Migrate
→ Contract

Do not combine all destructive changes into one release unless unavoidable.

⸻

13. Backward-Compatible Migrations

Preferred changes:

* add nullable column;
* add table;
* add index;
* add new enum value safely;
* add function version;
* add new API field;
* add new Event version.

Risky changes:

* rename column;
* drop column;
* change data type;
* tighten nullability;
* change primary key;
* remove enum value;
* rewrite large table;
* change ledger semantics.

Risky changes require staged migration.

⸻

14. Migration Validation

Before release, validate:

* clean database migration;
* existing database upgrade;
* migration execution time;
* lock behavior;
* RLS after migration;
* constraints;
* indexes;
* functions;
* triggers;
* seed compatibility;
* rollback or forward-fix path;
* application compatibility before and after deployment.

Production migration must be recorded with:

* start time;
* finish time;
* migration version;
* executor;
* result;
* warnings;
* rollback or recovery status.

⸻

15. Data Backfill

Backfills must be:

* separate from request path;
* resumable;
* idempotent;
* observable;
* rate-limited;
* tenant-safe;
* restartable;
* verified after completion.

Backfill must not silently recalculate historical business outcomes using new rules.

Historical data uses the configuration version applicable when the original event occurred.

⸻

16. Feature Flags

Use feature flags for:

* incomplete rollout;
* risky feature;
* pilot Business;
* selected Brand;
* selected deployment model;
* provider switch;
* new automation behavior;
* new analytics report;
* AI Recommendations;
* Loyalty Network;
* Instant Rewards where gradual rollout is useful.

Feature flag must define:

* owner;
* purpose;
* default state;
* scope;
* activation conditions;
* rollback behavior;
* removal milestone.

Feature flags must not permanently replace proper versioning or architecture.

⸻

17. Dark Launch

A feature may be deployed but not exposed.

Examples:

* new analytics projection running in parallel;
* new reward calculation comparison;
* new notification provider;
* new API endpoint not yet enabled;
* new AI recommendation generation.

Dark launch must not create duplicate business effects.

Shadow processing may compare outcomes but must not mutate authoritative state unless explicitly designed.

⸻

18. Canary Release

For supported infrastructure, release may first target:

* internal Business;
* test Brand;
* selected Location;
* small percentage of traffic;
* pilot customers.

Canary success criteria must be defined before activation.

Monitor:

* error rate;
* latency;
* queue lag;
* database load;
* reward reconciliation;
* duplicate effects;
* tenant errors;
* notification failures;
* user-reported issues.

⸻

19. Pilot Release

Pilot sequence:

Internal Test Business
→ Design Partner
→ Small Closed Pilot
→ Expanded Pilot
→ General Availability

Pilot Business must understand:

* current scope;
* known limitations;
* support process;
* data handling;
* rollback possibilities;
* feedback process.

Pilot does not permit lower security or data-integrity standards.

⸻

20. Deployment Strategy

Preferred deployment characteristics:

* automated;
* repeatable;
* environment-specific configuration;
* immutable build artifact;
* health verification;
* migration coordination;
* feature-flag control;
* observable result.

Manual steps must be minimized and documented.

Every manual Production step must have:

* responsible person;
* exact command or action;
* expected result;
* failure response;
* evidence.

⸻

21. Deployment Order

Recommended order:

1. Verify backup and environment
2. Pause selected workers if required
3. Apply backward-compatible migrations
4. Deploy backend
5. Verify backend health
6. Deploy workers
7. Verify queues
8. Deploy web applications
9. Publish mobile version where applicable
10. Activate feature flags
11. Execute smoke tests
12. Monitor
13. Resume paused jobs
14. Close release

Actual order may differ by release but must be documented.

⸻

22. Mobile Release Strategy

Customer App and Employee App releases require:

* app version;
* build number;
* supported backend version;
* minimum supported app version;
* release notes;
* store review planning;
* staged rollout where supported;
* crash monitoring;
* forced upgrade policy only where necessary.

Backend must remain compatible with supported mobile versions.

Do not introduce immediate breaking API changes that make installed apps unusable.

⸻

23. API Compatibility

Before release, verify:

* existing clients still work;
* optional fields remain optional;
* removed fields have deprecation period;
* Event consumers support current versions;
* mobile apps support backend response;
* integration clients receive advance notice for breaking changes.

Breaking API release requires:

* version increment;
* migration guide;
* support period;
* consumer inventory;
* monitoring.

⸻

24. Event Compatibility

Event schema changes must follow versioning rules.

During transition:

* producer may emit old and new version where required;
* consumers are upgraded safely;
* replay compatibility is tested;
* historical Events remain readable.

Do not mutate historical Event payloads.

⸻

25. Configuration Release

Not every production behavior change requires code deployment.

Configuration changes may include:

* Reward Rules;
* status thresholds;
* Benefit Definitions;
* Automation Rules;
* notification templates;
* provider routing;
* feature flags.

Configuration release still requires:

* permission;
* validation;
* versioning;
* audit;
* effective date;
* rollback or previous-version restoration where supported.

High-impact configuration changes may require UAT even without code deployment.

⸻

26. Release Roles

Product Owner

Responsible for:

* business approval;
* scope approval;
* accepted limitations;
* pilot approval;
* Production rollout approval.

Release Manager

Responsible for:

* release coordination;
* readiness evidence;
* scope control;
* release checklist;
* deployment record;
* GO/NO-GO recommendation.

QA Agent

Responsible for:

* test evidence;
* UAT status;
* regression status;
* defect status;
* GO/NO-GO recommendation.

Security Agent

Responsible for:

* required security review;
* unresolved risk statement;
* security approval or block.

DevOps Agent

Responsible for:

* deployment automation;
* environment validation;
* migrations;
* monitoring;
* rollback execution support.

Implementation Agents

Responsible for:

* accurate handoff;
* release notes input;
* migration notes;
* known limitations;
* defect fixes.

Implementation Agent does not approve its own release.

⸻

27. GO Decision

Production GO requires:

* Release Manager recommendation;
* QA GO;
* Security approval where required;
* Product Owner approval;
* successful migration rehearsal;
* verified rollback or recovery;
* monitoring readiness;
* no release blocker.

Product Owner owns final business GO decision.

Technical reviewers may block release for critical safety or integrity reasons.

⸻

28. Conditional GO

Conditional GO is allowed only when:

* remaining issues are P2 or P3;
* limitations are documented;
* workaround exists where needed;
* risk owner is named;
* remediation task exists;
* affected capability can be disabled if necessary;
* Product Owner accepts the limitation;
* Release Manager records the condition.

Conditional GO is forbidden for:

* tenant leakage;
* authentication bypass;
* negative balance;
* duplicate redemption;
* ledger corruption;
* data loss;
* critical consent violation;
* untested destructive migration.

⸻

29. NO-GO Conditions

Release must be blocked when:

* open P0 exists;
* unaccepted P1 exists;
* tenant isolation fails;
* critical UAT fails;
* migrations are not validated;
* backup is unavailable;
* rollback or recovery is undefined;
* required approval is missing;
* release scope is unknown;
* unreviewed commits are included;
* immutable history may be corrupted;
* monitoring is unavailable for critical flows.

⸻

30. Smoke Tests

Immediately after deployment, run at least:

* application health;
* database connectivity;
* authentication;
* tenant isolation sample;
* Customer profile read;
* Membership read;
* QR resolution;
* receipt preview;
* controlled receipt recording if safe;
* Reward projection verification;
* queue processing;
* notification sandbox or controlled test;
* Business Portal access;
* analytics health;
* audit recording.

Production smoke tests must use controlled accounts and must not create uncontrolled financial or Reward effects.

⸻

31. Post-Deployment Monitoring

Monitor closely after release:

First 15 minutes
First hour
First 24 hours
First 7 days for major releases

Key indicators:

* authentication failures;
* API error rate;
* latency;
* database CPU and connections;
* lock contention;
* queue lag;
* failed Events;
* dead-letter count;
* duplicate Receipt signals;
* Reward reconciliation mismatch;
* negative balance attempts;
* failed Redemptions;
* notification failure rate;
* crash rate;
* tenant-scope errors;
* support tickets.

⸻

32. Release Verification

Release is verified when:

* deployed version matches approved artifact;
* migrations match expected version;
* smoke tests pass;
* feature flags match release plan;
* dashboards show healthy state;
* no critical alert exists;
* business sample flows work;
* release evidence is stored.

⸻

33. Rollback Strategy

Rollback method depends on change type.

Possible approaches:

* application rollback;
* feature flag disable;
* worker pause;
* provider route revert;
* configuration version restore;
* forward-fix migration;
* projection rebuild;
* compensating business transaction;
* mobile staged rollout stop.

Database rollback is not always safe.

Immutable business records must not be deleted to simulate rollback.

⸻

34. Roll-Forward Preference

Whenever immutable business data, ledger entries or irreversible database migrations are involved, Roll Forward is preferred over Rollback.

Rollback should be considered only when data integrity can still be guaranteed.

When choosing between rollback and forward fix, priority must be given to preserving:

- immutable history
- financial correctness
- audit integrity
- tenant isolation

The Release Manager must document the reasoning for the selected recovery strategy.

35. Rollback Decision

Rollback should be considered when:

* error rate rises materially;
* critical flow fails;
* data corruption risk exists;
* tenant isolation fails;
* duplicate business effects occur;
* migration causes unacceptable degradation;
* queue processing becomes unstable;
* support cannot safely operate.

Release Manager coordinates rollback.

Security or technical owner may require immediate shutdown of affected feature.

⸻

36. Rollback Execution

Rollback plan must specify:

Trigger
Decision owner
Commands or actions
Feature flags
Application version
Database considerations
Worker behavior
Verification
Customer impact
Communication
Recovery follow-up

Rollback must be rehearsed for critical releases where practical.

⸻

37. Forward Fix

Forward fix may be preferred when:

* schema rollback is unsafe;
* issue is isolated;
* fix is small and verified;
* data integrity remains intact;
* affected capability can be disabled.

Forward fix requires a new release version and standard evidence.

Do not call an unreviewed Production edit a forward fix.

⸻

38. Data Incident Handling

If release creates incorrect business data:

1. stop further impact;
2. disable affected capability;
3. preserve evidence;
4. identify impacted records;
5. determine source of truth;
6. design compensating correction;
7. review correction;
8. execute through approved domain flow;
9. reconcile;
10. notify affected stakeholders where required.

Never directly delete or overwrite ledger history.

⸻

39. Failed Migration Handling

If migration fails:

* stop deployment;
* do not repeatedly rerun blindly;
* identify partial state;
* verify transactional behavior;
* apply documented recovery;
* restore only when required and approved;
* create incident record;
* do not deploy application incompatible with current schema.

Migration failure automatically blocks release until resolved.

⸻

40. Queue and Worker Release Safety

Before worker deployment verify:

* Event versions;
* handler idempotency;
* retry behavior;
* claim timeout;
* dead-letter visibility;
* backward compatibility;
* deployment order.

When necessary:

Pause worker
→ deploy compatible code
→ verify
→ resume worker

Pausing must not lose Events.

⸻

41. Provider Release Safety

For SMS, Viber, Push or external integrations:

* use sandbox before Production;
* verify credentials;
* verify callback URLs;
* verify rate limits;
* verify fallback;
* verify consent behavior;
* verify cost controls;
* monitor provider errors;
* support quick provider disable.

Provider failure must not roll back successful loyalty transactions.

⸻

42. Release Notes

Every release note must contain:

Version
Release date
Business summary
New capabilities
Changed behavior
Bug fixes
Security changes
Database migrations
API changes
Event changes
Feature flags
Known limitations
Operational actions
Rollback notes

Internal release notes may include technical details.

Customer-facing release notes should be understandable and avoid exposing sensitive implementation details.

⸻

43. Release Record

Store a permanent release record:

Release version:
Environment:
Release candidate:
Commit SHA:
Build ID:
Database version:
Included tasks:
Excluded tasks:
Approvals:
QA result:
Security result:
Migration result:
Deployment start:
Deployment finish:
Smoke-test result:
Monitoring result:
Known issues:
Rollback status:
Final outcome:

⸻

44. Production Postmortem

Every Production incident requiring rollback, emergency release or customer communication must produce a Postmortem document.

The Postmortem should include:

- incident summary
- timeline
- root cause
- affected modules
- affected Businesses
- customer impact
- missing tests
- missing monitoring
- missing documentation
- corrective actions
- preventive actions
- follow-up tasks
- ownership

The objective of the Postmortem is continuous improvement rather than assigning blame.

45. Incident Linkage

Any incident caused by a release must reference:

* release version;
* relevant task;
* changed module;
* commit;
* migration;
* feature flag;
* detected time;
* affected tenants;
* remediation;
* preventive action.

Post-incident improvements may include:

* new test;
* new alert;
* stricter gate;
* new rollback step;
* documentation update;
* agent prompt update.

⸻

46. Release Metrics

Track:

* deployment frequency;
* lead time;
* release success rate;
* rollback rate;
* hotfix rate;
* change failure rate;
* mean time to recovery;
* escaped defect count;
* UAT defect count;
* migration failure count;
* incidents by module;
* feature-flag rollback count.

Metrics must improve process, not encourage unsafe release speed.

⸻

47. Release Freeze

Release freeze may apply during:

* major holidays;
* critical Business periods;
* major marketing campaigns;
* financial closing;
* known provider maintenance;
* team unavailability.

Only approved emergency hotfixes may enter during freeze.

Freeze dates must be visible before planning.

⸻

48. Emergency Release

Emergency release still requires:

* incident reference;
* exact scope;
* reviewer;
* minimum test evidence;
* rollback;
* release record;
* post-release review.

Emergency process may shorten waiting time but does not permit uncontrolled Production changes.

⸻

49. Mobile Emergency Handling

If a mobile bug cannot be immediately fixed because of store review:

* disable affected backend capability where possible;
* use feature flag;
* show safe maintenance state;
* preserve backward compatibility;
* prepare expedited store release;
* communicate limitation.

Backend must not leave older installed apps in unsafe state.

⸻

50. Deprecation Strategy

Deprecated API, Event or feature must define:

* deprecation date;
* replacement;
* affected consumers;
* migration guide;
* monitoring;
* removal version;
* communication.

Removal must not occur before known consumers migrate.

⸻

51. Production Access

Production access must be:

* least privilege;
* role-based;
* audited;
* time-limited where appropriate;
* reviewed periodically.

Agents do not receive unrestricted Production access.

Support access follows scoped and audited rules.

⸻

52. Release Documentation Package

Every Production release should have:

release-plan.md
release-checklist.md
migration-plan.md
rollback-plan.md
release-notes.md
uat-evidence/
security-evidence/
deployment-evidence/

Small patch releases may combine documents, but all required information must remain present.

⸻

53. Standard Release Checklist

[ ] Scope frozen
[ ] Included tasks approved
[ ] CI green
[ ] QA GO
[ ] Security approval where required
[ ] UAT complete
[ ] Migrations validated
[ ] Backup verified
[ ] Rollback prepared
[ ] Feature flags prepared
[ ] Monitoring prepared
[ ] Alerting prepared
[ ] Support informed
[ ] Product Owner approved
[ ] Release Manager GO
[ ] Deployment completed
[ ] Smoke tests passed
[ ] Monitoring healthy
[ ] Release record completed

⸻

54. Release Manager Output

Release Manager must return:

1. Release Version
2. Environment
3. Release Scope
4. Included Tasks
5. Excluded Tasks
6. Artifact and Commit
7. CI Evidence
8. QA Evidence
9. Security Evidence
10. UAT Evidence
11. Migration Plan
12. Feature Flags
13. Monitoring Readiness
14. Known Issues
15. Rollback Plan
16. Required Approvals
17. GO/NO-GO Recommendation
18. Deployment Result
19. Smoke-Test Result
20. Final Release Status

⸻

55. Final Release Status

Allowed final statuses:

PLANNED
READY FOR UAT
UAT IN PROGRESS
READY FOR PRODUCTION
DEPLOYING
DEPLOYED — MONITORING
COMPLETED
ROLLED BACK
FAILED
BLOCKED

A release remains:

DEPLOYED — MONITORING

until the defined monitoring window passes.

⸻

56. Definition of Release Strategy Ready

Release Strategy is ready when:

* environments are defined;
* branch strategy is defined;
* release types are defined;
* versioning is defined;
* readiness gates are defined;
* migration strategy is defined;
* feature flags are defined;
* UAT and Production approvals are defined;
* GO/NO-GO rules are defined;
* rollback and forward-fix rules are defined;
* smoke tests are defined;
* monitoring is defined;
* release evidence is standardized;
* emergency process is defined;
* Production access is controlled.  