56. UAT Scenarios

Blueprint References

Every UAT scenario must reference:

Business Rule

Event

API

Module

Definition of Done section

1. Purpose

Ovaj dokument definiše obavezne User Acceptance Testing scenarije za Loyalty Platform.

Ciljevi su:

* potvrditi da implementacija prati zaključana poslovna pravila;
* proveriti kompletne end-to-end tokove;
* proveriti različite korisničke uloge;
* potvrditi tenant isolation;
* proveriti failure, retry i compensation scenarije;
* obezbediti standardnu osnovu za QA Agent-a;
* sprečiti produkcioni rollout bez poslovne potvrde.

Ovaj dokument predstavlja osnovni UAT katalog.

Detaljni test case-ovi mogu biti izvedeni iz svakog scenarija.

⸻

2. UAT Principles

Svaki UAT scenario mora sadržati:

* scenario ID;
* naziv;
* poslovni cilj;
* preconditions;
* test data;
* actor;
* steps;
* expected result;
* audit expectation;
* notification expectation;
* analytics expectation;
* cleanup ili reset instrukciju;
* status;
* evidence.

UAT rezultat mora biti jedan od:

PASS
PASS WITH LIMITATION
FAIL
BLOCKED
NOT EXECUTED

⸻

3. UAT Environments

UAT se izvršava samo u kontrolisanom okruženju.

Dozvoljena okruženja:

* local;
* development;
* UAT;
* pilot.

Produkcioni podaci se ne koriste bez eksplicitnog odobrenja.

UAT environment mora imati:

* test Business-e;
* najmanje dva Brand-a;
* najmanje dva Loyalty Programa;
* najmanje tri Location-a;
* test Customer-e;
* test Employee-e;
* test Manager-a;
* Business Owner-a;
* Platform Support korisnika;
* Platform Admin korisnika;
* Integration Client credential;
* konfigurisan Notification provider sandbox;
* kontrolisano sistemsko vreme ili clock abstraction gde je moguće.

⸻

4. Standard UAT Test Data

Preporučeni osnovni podaci:

Business A

Business:
Demo Hospitality Group
Brand:
Demo Coffee
Loyalty Program:
Demo Coffee Club
Locations:
Coffee Center
Coffee Riverside

Business B

Business:
Demo Retail Group
Brand:
Demo Sport
Loyalty Program:
Demo Sport Rewards
Location:
Retail Mall

Customers

Customer A:
Active member of Demo Coffee Club
Customer B:
Active member of Demo Sport Rewards
Customer C:
Member of both programs
Customer D:
No membership
Customer E:
Inactive member
Customer F:
Suspended membership

Employees

Employee A:
Coffee Center only
Employee B:
Coffee Riverside only
Manager A:
Both Demo Coffee locations
Employee B2:
Retail Mall only

⸻

5. Authentication UAT

UAT-AUTH-001 — Customer OTP Login

Preconditions

Customer has a valid phone number.

Steps

1. Customer requests OTP.
2. Valid OTP is received through configured channel.
3. Customer enters OTP.
4. Customer completes authentication.

Expected result

* Customer is authenticated.
* Session is created.
* Customer account is resolved by phone number.
* No duplicate Customer is created.
* Authentication event is recorded.
* OTP is no longer reusable.

⸻

UAT-AUTH-002 — Invalid OTP

Steps

1. Request OTP.
2. Enter incorrect code.

Expected result

* Authentication is rejected.
* Safe error is shown.
* Attempt is recorded.
* No session is created.

⸻

UAT-AUTH-003 — Expired OTP

Expected result

* Expired code is rejected.
* Customer may request a new code.
* Old code cannot be reused.

⸻

UAT-AUTH-004 — OTP Rate Limit

Steps

Send repeated OTP requests within configured limit window.

Expected result

* Requests above the limit are rejected.
* Response uses stable rate-limit error.
* Audit or security telemetry is recorded.
* No excessive provider calls are made.

⸻

UAT-AUTH-005 — Same Customer on New Device

Expected result

* Same phone number resolves the same global Customer.
* Existing Memberships are visible.
* No new Customer is created.

⸻

6. Customer Registration UAT

UAT-CUST-001 — New Customer Registration

Expected result

* Global Customer is created.
* Phone number is verified.
* Optional email may be omitted.
* Customer has no Membership until joining a program.

⸻

UAT-CUST-002 — Existing Customer Login

Expected result

* Existing Customer is resolved.
* Customer profile is not duplicated.
* Existing Memberships remain visible.

⸻

UAT-CUST-003 — Customer Profile Update

Expected result

* Allowed profile fields are updated.
* Phone number is not self-service changed.
* Update is audited where required.
* Other Business-es cannot access private profile data.

⸻

UAT-CUST-004 — Customer Anonymization

Expected result

* Personal data is anonymized.
* Immutable financial and audit history remains.
* Membership transaction history remains referentially consistent.
* Customer can no longer authenticate with the anonymized identity.
* Analytics retains only allowed anonymized or aggregated data.

⸻

7. Business and Brand Onboarding UAT

UAT-BIZ-001 — Create Business

Actor

Business Owner.

Expected result

* Business is created.
* Owner is assigned.
* Tenant boundary exists.
* Audit record is created.

⸻

UAT-BIZ-002 — Create Brand

Expected result

* Brand belongs to the correct Business.
* Brand configuration can be added.
* Another Business cannot access the Brand.

⸻

UAT-BIZ-003 — Create Loyalty Program

Expected result

* Brand receives one active Loyalty Program.
* A second active Loyalty Program for the same Brand is rejected.
* Configuration starts in valid draft state.

⸻

UAT-BIZ-004 — Accept Strategy Recommendation

Expected result

* Recommendation is visible with explanation.
* Owner may accept or modify it.
* Accepted configuration is versioned.
* Historical transactions are not changed.

⸻

8. Membership UAT

UAT-MEM-001 — Join Loyalty Program

Preconditions

Customer is authenticated and not yet a member.

Steps

1. Open program.
2. Select Join.
3. Confirm membership.

Expected result

* Membership is created once.
* Membership is active.
* Membership Year starts.
* CustomerJoinedLoyaltyProgram is emitted.
* Welcome automation may execute if enabled.

⸻

UAT-MEM-002 — Duplicate Join

Expected result

* No duplicate Membership is created.
* Existing Membership is returned or safe conflict is shown.
* Welcome reward is not granted twice.

⸻

UAT-MEM-003 — Customer with Multiple Memberships

Expected result

* Customer sees both programs.
* Balances remain separate.
* Status remains separate.
* Benefits remain separate.
* One program never exposes data from another.

⸻

UAT-MEM-004 — Suspended Membership

Expected result

* Customer can see suspension status.
* Earning and redemption are blocked according to rules.
* Historical transactions remain visible where allowed.
* Employee cannot bypass suspension.

⸻

UAT-MEM-005 — Membership QR

Expected result

* QR identifies Membership.
* QR contains no phone number.
* QR contains no internal database ID.
* QR resolves only through backend.
* Customer may display previously loaded QR without internet.
* Employee location still requires online backend validation.

⸻

9. Employee Access UAT

UAT-EMP-001 — Employee Assigned Location

Expected result

* Employee can work only in assigned Location.
* Employee can resolve Membership and record allowed transactions.

⸻

UAT-EMP-002 — Employee Other Location

Expected result

* Access is denied.
* No Customer details are leaked.
* Attempt is logged where required.

⸻

UAT-EMP-003 — Manager Configurable Permissions

Expected result

* Manager sees only enabled capabilities.
* Backend enforces the same permissions.
* Removing permission takes effect without requiring code change.

⸻

UAT-EMP-004 — Employee Role Revoked

Expected result

* New operations are denied.
* Existing session cannot continue privileged actions.
* Revocation is audited.

⸻

10. Receipt Processing UAT

UAT-REC-001 — Standard Receipt

Steps

1. Employee scans Customer QR.
2. Enters final receipt amount.
3. Requests preview.
4. Reviews calculation.
5. Confirms receipt.

Expected result

* Receipt is recorded once.
* Receipt is immutable.
* Employee and Location are recorded.
* Correct root event is emitted.
* Reward, XP and Visit processing follow asynchronously or transactionally according to design.
* Customer sees transaction after processing.

⸻

UAT-REC-002 — Duplicate Receipt Submission

Steps

Submit the same request twice with the same idempotency key.

Expected result

* One Receipt exists.
* One set of loyalty effects exists.
* Duplicate request returns the original result or stable idempotent response.

⸻

UAT-REC-003 — Parallel Duplicate Receipt

Expected result

* Exactly one Receipt is created.
* Exactly one Reward effect occurs.
* Exactly one XP effect occurs.
* No duplicate Visit occurs where the same event should count once.

⸻

UAT-REC-004 — Invalid Membership

Expected result

* Receipt is rejected.
* No loyalty effect is created.
* No private Customer information is exposed.

⸻

UAT-REC-005 — Cross-Tenant Membership

Expected result

* Business A Employee cannot record a Receipt against Business B Membership.
* Request is rejected.
* No cross-tenant event is emitted.

⸻

UAT-REC-006 — Invalid Amount

Test:

* zero;
* negative;
* unsupported currency;
* malformed value;
* amount above configured operational limit.

Expected result

* Request is rejected according to configured business rules.
* No Receipt is recorded.

⸻

UAT-REC-007 — POS Integration Receipt

Expected result

* Scoped Integration Client records Receipt only for permitted Business and Location.
* Client-provided business_id cannot override credential scope.
* Duplicate external receipt identifier is handled idempotently.

⸻

11. Reward Earning UAT

UAT-RWD-001 — Immediate Points

Expected result

* Correct points are earned.
* Reward Ledger contains immutable transaction.
* Available balance projection updates.
* Calculation explanation is available.

⸻

UAT-RWD-002 — Pending Points

Expected result

* Points enter pending state.
* Available balance does not include them.
* Pending balance displays separately.
* Points release on configured date.
* Release occurs exactly once.

⸻

UAT-RWD-003 — Reward Rule Version

Expected result

* Receipt uses the rule version applicable at processing time.
* Later configuration change does not recalculate historical Receipt.

⸻

UAT-RWD-004 — Points Expiration

Expected result

* Eligible points expire.
* Expiration is recorded in ledger.
* Balance updates.
* Already redeemed allocations do not expire again.
* Expiration notification follows configuration.

⸻

UAT-RWD-005 — No Expiration Model

Expected result

* Points remain available.
* Business Portal displays warning or liability information where specified.
* No expiration job removes points.

⸻

UAT-RWD-006 — Receipt Cancellation Reward Reversal

Expected result

* Original Reward transaction remains.
* Compensating reversal is added.
* Balance is corrected.
* Audit links the Receipt and reversal.

⸻

12. XP and Visit UAT

UAT-XP-001 — XP Earning

Expected result

* XP is earned independently from Reward Points.
* XP Ledger is updated.
* Spending points does not reduce XP.

⸻

UAT-XP-002 — Qualified Visit

Expected result

* Receipt meeting visit criteria creates one qualified Visit.
* Visit affects Status progress.

⸻

UAT-XP-003 — Multiple Receipts in Visit Window

Expected result

* Visit deduplication follows configured rule.
* XP and points may still follow their independent rules.
* Customer is not incorrectly advanced by duplicate Visits.

⸻

UAT-XP-004 — Receipt Cancellation XP Reversal

Expected result

* XP is compensated.
* Visit is reversed or invalidated according to rule.
* Status is reevaluated without violating Membership Year downgrade rules.

⸻

13. Status UAT

UAT-STATUS-001 — Immediate Upgrade

Expected result

* Customer meeting all required conditions upgrades immediately.
* Status History is created.
* Upgrade notification is sent.
* Status Benefits are reevaluated.

⸻

UAT-STATUS-002 — Missing One Condition

Expected result

* Customer does not upgrade.
* UI explains remaining XP and Visit requirements.

⸻

UAT-STATUS-003 — No Mid-Year Downgrade

Expected result

* Customer falling below threshold during Membership Year keeps current Status.
* Progress may show renewal risk.
* No downgrade event occurs.

⸻

UAT-STATUS-004 — Membership Year Completion

Expected result

* Membership Year closes.
* Status is reevaluated.
* Downgrade occurs only now if required.
* New Membership Year starts.
* Completed year remains immutable.

⸻

UAT-STATUS-005 — Points Redemption Does Not Affect Status

Expected result

* Reward balance decreases.
* XP and Status remain unchanged.

⸻

14. Benefit UAT

UAT-BEN-001 — Status Benefit Grant

Expected result

* Status upgrade emits required event.
* Benefit is granted once.
* Benefit lifecycle is independent from Status record.

⸻

UAT-BEN-002 — Birthday Benefit

Expected result

* Eligible Customer receives one Benefit.
* Validity is correct.
* Notification respects classification and consent rules.

⸻

UAT-BEN-003 — Benefit Redemption

Expected result

* Active Benefit is redeemed once.
* Concurrent second redemption fails safely.
* Redemption is audited.

⸻

UAT-BEN-004 — Expired Benefit

Expected result

* Expired Benefit cannot be redeemed.
* Customer App clearly marks it expired or removes it from active list.
* Expiration event is recorded.

⸻

UAT-BEN-005 — Benefit Revocation

Expected result

* Revoked Benefit cannot be redeemed.
* Original grant remains in history.
* Revocation reason and actor are audited.

⸻

15. Reward Redemption UAT

UAT-RED-001 — Redemption Options

Expected result

* System returns allowed options.
* Maximum allowed value is calculated automatically.
* Employee cannot override backend maximum.
* Available balance is not yet consumed.

⸻

UAT-RED-002 — Reserve Points

Expected result

* Points are reserved atomically.
* Available balance decreases by reservation.
* Ledger or reservation records remain consistent.
* Second concurrent reservation cannot spend the same points.

⸻

UAT-RED-003 — Confirm Redemption

Expected result

* Reservation is consumed once.
* Points are redeemed using FIFO.
* Employee receives confirmed result.
* Customer transaction history updates.

⸻

UAT-RED-004 — Cancel Reservation

Expected result

* Reserved points are released.
* Available balance returns.
* Cancellation is idempotent.

⸻

UAT-RED-005 — Reservation Expiration

Expected result

* Unconfirmed reservation expires.
* Points are released exactly once.
* Customer does not lose balance.

⸻

UAT-RED-006 — Insufficient Balance

Expected result

* Reservation is rejected.
* Balance does not become negative.
* No partial hidden state remains.

⸻

UAT-RED-007 — Parallel Redemption

Expected result

* Only one valid redemption succeeds where both compete for the same balance.
* No negative balance.
* No duplicate confirmation.

⸻

16. Instant Rewards UAT

UAT-IR-001 — Opportunity Generation

Expected result

* Eligible Receipt creates one opportunity.
* Opportunity belongs to correct Membership.
* Open-opportunity limit is respected.

⸻

UAT-IR-002 — Open Opportunity

Expected result

* Customer opens opportunity.
* Backend selects reward.
* Client did not know reward in advance.
* Reward is granted once.
* Result is persisted immutably.

⸻

UAT-IR-003 — Concurrent Open

Expected result

* Two parallel open requests produce one granted reward.
* Both requests resolve consistently.
* No duplicate Benefit or points are granted.

⸻

UAT-IR-004 — Expired Opportunity

Expected result

* Opening is rejected.
* No reward is granted.
* Expiration is visible in history where appropriate.

⸻

UAT-IR-005 — Opportunity Limit

Expected result

* New opportunity is not created when configured limit is reached.
* Existing opportunities remain.
* Customer receives suitable message.
* Analytics records suppression.

⸻

UAT-IR-006 — Receipt Cancelled Before Open

Expected result

* Opportunity is cancelled.
* It cannot be opened.

⸻

UAT-IR-007 — Receipt Cancelled After Reward Grant

Expected result

* Granted reward is compensated:
    * points reversed; or
    * Benefit revoked.
* Original history remains.
* Customer does not retain invalid reward.

⸻

17. Reward Goal UAT

UAT-GOAL-001 — Select Goal

Expected result

* Customer selects valid goal.
* Only allowed goal selection rules apply.
* Progress starts correctly.

⸻

UAT-GOAL-002 — Progress Update

Expected result

* Relevant events update progress.
* Duplicate events do not double progress.

⸻

UAT-GOAL-003 — Goal Completion

Expected result

* Goal completes exactly once.
* Configured reward is granted.
* Completion notification is sent.

⸻

UAT-GOAL-004 — Near Completion Notification

Expected result

* Notification is generated at configured threshold.
* Duplicate suppression prevents repeated spam.

⸻

18. Automation UAT

UAT-AUTO-001 — Welcome Bonus

Expected result

* New Membership triggers configured reward.
* Existing Membership does not receive it again.
* Execution history is recorded.

⸻

UAT-AUTO-002 — Birthday Bonus

Expected result

* Eligible Customer receives one reward per configured period.
* Invalid or missing birthday does not cause failure.
* Consent rules are respected.

⸻

UAT-AUTO-003 — Double Points

Expected result

* Eligible Receipt receives configured multiplier.
* Campaign date and Location filters apply.
* Overlapping rules follow defined priority and stacking rules.

⸻

UAT-AUTO-004 — Happy Hour

Expected result

* Only receipts inside configured day and time window receive action.
* Time zone is Business or Location appropriate.

⸻

UAT-AUTO-005 — Spend Bonus

Expected result

* Receipt meeting threshold receives bonus.
* Receipt below threshold does not.
* Threshold uses final recorded amount.

⸻

UAT-AUTO-006 — Win-back Attempt 1

Expected result

* Inactive eligible Customers enter target segment.
* Notification or Benefit follows configured actions.
* Active Customers are excluded.

⸻

UAT-AUTO-007 — Win-back Attempt 2

Expected result

* Only Customers still inactive are targeted.
* Maximum attempt count is respected.
* No endless loop exists.

⸻

UAT-AUTO-008 — Loop Protection

Expected result

* Automation-generated event cannot cause endless execution.
* Execution is stopped safely.
* Reason is recorded.
* Alert or operational metric exists.

⸻

UAT-AUTO-009 — Action Failure

Expected result

* Failure is recorded.
* Retry follows policy.
* Successful prior actions are not duplicated.
* Domain consistency remains intact.

⸻

UAT-AUTO-010 — Dry Run

Expected result

* Simulation shows expected audience and actions.
* No real points, Benefits, notifications or Events are committed.

⸻

19. Notification UAT

UAT-NOT-001 — Transactional Notification

Expected result

* Transactional message may be sent without marketing consent.
* Correct template and Brand are used.

⸻

UAT-NOT-002 — Marketing Consent Required

Expected result

* Marketing message is blocked without consent.
* Customer with valid consent receives it.

⸻

UAT-NOT-003 — Quiet Hours

Expected result

* Engagement or Marketing notification is delayed during quiet hours.
* Security notification follows priority rules.
* Delivery occurs at valid time.

⸻

UAT-NOT-004 — Duplicate Suppression

Expected result

* Same logical notification is not sent repeatedly.
* Suppression does not block genuinely different messages.

⸻

UAT-NOT-005 — Provider Temporary Failure

Expected result

* Business transaction remains successful.
* Notification retries.
* Delivery status is visible.

⸻

UAT-NOT-006 — Provider Permanent Failure

Expected result

* Notification is marked failed.
* Retry stops according to policy.
* Operational visibility exists.
* Core loyalty transaction remains successful.

⸻

UAT-NOT-007 — Channel Fallback

Expected result

* Configured fallback is used where allowed.
* Consent and classification remain respected.
* Customer does not receive duplicate messages on multiple channels unless explicitly configured.

⸻

20. Analytics UAT

UAT-AN-001 — Executive Dashboard

Expected result

* Metrics match source transactions.
* Filters apply.
* Tenant isolation is preserved.
* Time zone is correct.

⸻

UAT-AN-002 — Reward Reconciliation

Expected result

* Issued, pending, released, redeemed and expired values reconcile with ledger.
* Outstanding liability follows documented formula.

⸻

UAT-AN-003 — Projection Rebuild

Expected result

* Analytics projection can be rebuilt.
* Rebuilt values match current production projection within documented freshness rules.

⸻

UAT-AN-004 — Customer Anonymization

Expected result

* Personal identifiers disappear.
* Aggregated historical metrics remain valid.
* Drill-down follows privacy rules.

⸻

UAT-AN-005 — Cross-Tenant Analytics

Expected result

* Business A cannot view Business B metrics.
* Platform benchmark only shows allowed anonymous aggregates.

⸻

21. AI Recommendation UAT

UAT-AI-001 — Recommendation with Evidence

Expected result

* Recommendation includes supporting KPI data.
* Explanation is understandable.
* Priority and confidence are visible.

⸻

UAT-AI-002 — Accept Recommendation

Expected result

* Acceptance opens relevant wizard or draft configuration.
* No campaign or rule is activated automatically.
* User confirms final change.

⸻

UAT-AI-003 — Reject Recommendation

Expected result

* Rejection is recorded.
* No system configuration changes.
* Feedback may influence future recommendations.

⸻

UAT-AI-004 — Stale Recommendation

Expected result

* Recommendation expires or refreshes when underlying conditions are no longer valid.
* Stale advice is not shown as current.

⸻

UAT-AI-005 — Low Confidence

Expected result

* Low-confidence recommendation is clearly marked or deprioritized.
* It is not presented as certain.

⸻

22. Loyalty Network UAT

UAT-NET-001 — Create Network

Expected result

* Authorized owner creates Network.
* Invitations can be issued.
* Network is audited.

⸻

UAT-NET-002 — Accept Invitation

Expected result

* Authorized program joins.
* Membership in Network becomes active.
* Other programs remain unaffected.

⸻

UAT-NET-003 — One-Way Redemption

Expected result

* Origin points may be redeemed only in configured direction.
* Reverse direction is rejected.
* Balances are not merged.

⸻

UAT-NET-004 — Bidirectional Redemption

Expected result

* Both permitted directions work.
* Origin and redeem program are recorded.
* Conversion rule version is retained.

⸻

UAT-NET-005 — Leave Network

Expected result

* Future cross-program redemptions stop.
* Historical transactions remain.
* Existing local balances remain unchanged.

⸻

UAT-NET-006 — Settlement Not Executed

Expected result

* MVP records settlement evidence values.
* No actual partner financial settlement is automatically executed.

⸻

23. Receipt Cancellation UAT

UAT-CAN-001 — Cancel Unredeemed Receipt

Expected result

* Receipt remains immutable.
* Cancellation record is created.
* Points and XP are reversed.
* Visit and Status are reevaluated.
* unopened Instant Reward is cancelled.
* relevant Benefits are revoked.

⸻

UAT-CAN-002 — Cancel Receipt with Redeemed Effects

Expected result

* System follows documented compensation rules.
* No silent deletion occurs.
* Negative Reward balance is not created.
* Manual support path is invoked where automatic compensation is impossible.

⸻

UAT-CAN-003 — Duplicate Cancellation

Expected result

* One cancellation exists.
* Compensation occurs once.
* Duplicate request returns stable response.

⸻

UAT-CAN-004 — Unauthorized Cancellation

Expected result

* Request is denied.
* No data changes.
* Attempt is audited where required.

⸻

24. Security and Tenant Isolation UAT

UAT-SEC-001 — Customer Cross-Access

Customer A attempts to access Customer B data.

Expected result

* Denied.
* No existence leakage beyond safe response.

⸻

UAT-SEC-002 — Business Cross-Access

Business A user attempts Business B API or object ID.

Expected result

* Denied at backend and database level.

⸻

UAT-SEC-003 — Employee Location Scope

Expected result

* Employee cannot act outside assigned Locations.

⸻

UAT-SEC-004 — Manager Permission Scope

Expected result

* Manager cannot perform disabled actions even by direct API call.

⸻

UAT-SEC-005 — Service Role Validation

Expected result

* Internal service-role path still validates tenant ownership and business rules.
* Forged foreign identifiers are rejected.

⸻

UAT-SEC-006 — Integration Client Scope

Expected result

* Integration credential can call only allowed endpoints.
* It cannot act for another Business or Location.

⸻

UAT-SEC-007 — Support Temporary Access

Expected result

* Access is time-limited.
* Scope is explicit.
* Every action is audited.
* Access stops after expiry or revocation.

⸻

UAT-SEC-008 — Platform Admin Immutable Protection

Expected result

* Admin cannot directly edit Reward or XP Ledger.
* Corrections require approved domain commands.

⸻

25. Reliability UAT

UAT-REL-001 — Retry After Timeout

Expected result

* Client retries critical action.
* Idempotency prevents duplicate business result.

⸻

UAT-REL-002 — Worker Restart

Expected result

* Pending jobs resume safely.
* Claimed but incomplete jobs become available according to timeout policy.
* No duplicate domain effects.

⸻

UAT-REL-003 — Notification Provider Down

Expected result

* Core transactions continue.
* Queue grows within controlled limits.
* Alerts fire.
* Delivery resumes after provider recovery.

⸻

UAT-REL-004 — Projection Failure

Expected result

* Source ledger or Events remain correct.
* Projection can be rebuilt.
* Transaction processing is not corrupted.

⸻

UAT-REL-005 — Database Restore Exercise

Expected result

* Backup can be restored into isolated environment.
* Data integrity checks pass.
* Recovery steps are documented.

⸻

26. Performance UAT

Performance UAT must include representative scale.

Required scenarios

* Customer membership home load;
* Employee QR resolution;
* Receipt preview;
* Receipt confirmation;
* Reward reservation;
* Automation event processing;
* Notification queue processing;
* Analytics dashboard;
* bulk campaign audience calculation;
* projection rebuild.

Each scenario must record:

* concurrency;
* dataset size;
* average latency;
* p95 latency;
* p99 latency where relevant;
* error rate;
* throughput;
* database load;
* queue lag.

Performance pass criteria come from:

22-non-functional-requirements.md

⸻

27. Mobile UX UAT

Customer App

Test:

* new Customer;
* returning Customer;
* multiple Memberships;
* pending points;
* active and expired Benefits;
* no available reward;
* available Instant Rewards;
* offline QR display;
* session expiration;
* accessibility;
* supported languages.

Employee App

Test:

* camera permission denied;
* invalid QR;
* slow network;
* duplicate submit;
* expired session;
* Location switch where permitted;
* permission removed during session;
* failed receipt confirmation;
* redemption conflict.

⸻

28. Business Portal UX UAT

Test:

* onboarding completion;
* incomplete onboarding;
* configuration draft;
* invalid reward rule;
* unsaved changes;
* concurrent configuration edit;
* permission-restricted Manager;
* empty analytics state;
* no active automation;
* failed automation;
* recommendation acceptance;
* audit history;
* export.

⸻

29. UAT Evidence

Za svaki izvršeni scenario čuva se:

Scenario ID:
Environment:
Application version:
Database migration version:
Tester:
Date:
Test data:
Steps executed:
Expected result:
Actual result:
Status:
Screenshots or recordings:
API evidence:
Database or event evidence:
Logs or correlation ID:
Defect ID:
Retest status:
Comments:

⸻

30. Defect Severity

P0 — Critical

Primeri:

* tenant data leakage;
* duplicate redemption;
* negative reward balance;
* irreversible ledger corruption;
* authentication bypass;
* production data loss;
* wrong reward issued at scale.

Result:

Immediate NO-GO.

⸻

P1 — High

Primeri:

* core business flow unusable;
* race condition;
* incorrect points;
* status incorrectly changed;
* automation repeatedly duplicates rewards;
* critical notification consent violation.

Result:

NO-GO unless explicitly resolved before release.

⸻

P2 — Medium

Primeri:

* secondary flow issue;
* incorrect non-critical analytics filter;
* recoverable UI issue;
* missing non-critical error state.

Result:

May proceed only with accepted limitation and backlog task.

⸻

P3 — Low

Primeri:

* cosmetic issue;
* minor wording;
* non-blocking alignment problem.

Result:

Does not normally block release.

⸻

31. UAT Go/No-Go Rules

GO

Allowed only when:

* all P0 scenarios pass;
* no open P0 defect;
* no open unaccepted P1 defect;
* tenant isolation passes;
* Reward and Redemption reconciliation passes;
* critical race-condition tests pass;
* rollback is tested;
* monitoring is available;
* Product Owner accepts business flows;
* QA recommends GO.

CONDITIONAL GO

Allowed only when:

* only accepted P2/P3 limitations remain;
* workaround exists;
* risk owner is named;
* remediation date exists;
* affected scope can be feature-flagged where needed.

NO-GO

Required when:

* tenant leakage exists;
* duplicate financial or Reward effect exists;
* negative balance is possible;
* immutable history is corrupted;
* critical UAT flow fails;
* rollback is unavailable;
* known P0 or unaccepted P1 remains.

⸻

32. UAT Ownership

Product Owner

* validates business correctness;
* approves user journeys;
* accepts or rejects limitations;
* gives final product approval.

QA Agent

* prepares and executes scenarios;
* records evidence;
* manages defects;
* issues GO/NO-GO recommendation.

Security Agent

* validates security and tenant scenarios.

Implementation Agents

* provide environment notes;
* support defect analysis;
* implement fixes;
* do not self-approve UAT.

Release Manager

* confirms evidence and readiness;
* coordinates approved release.

⸻

33. Minimum Pilot UAT Set

Pre pilot launch-a moraju proći najmanje:

* Customer OTP;
* Customer registration;
* join program;
* Membership QR;
* Employee scope;
* Receipt preview and confirmation;
* duplicate Receipt;
* points earning;
* pending points;
* XP and Visit;
* Status upgrade;
* Benefit grant and redemption;
* Reward reservation and confirmation;
* parallel redemption;
* Receipt cancellation;
* Instant Reward opening;
* automation Welcome Bonus;
* automation Win-back;
* notification consent;
* provider failure;
* analytics reconciliation;
* tenant isolation;
* support access;
* backup restore;
* rollback;
* full Customer journey;
* full Employee journey;
* Business onboarding and configuration.

⸻

34. Definition of UAT Complete

UAT je završen kada:

* svi obavezni scenariji imaju status;
* evidence postoji;
* svi P0 defect-i su zatvoreni;
* svi P1 defect-i su zatvoreni ili release blokiran;
* retest je završen;
* regression suite prolazi;
* known limitations su dokumentovana;
* Security daje preporuku;
* QA daje preporuku;
* Product Owner odobrava poslovni rezultat;
* Release Manager potvrđuje release readiness.

Chaos / Failure Injection UAT