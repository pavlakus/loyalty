# 41. Event Storming — Instant Rewards

# 1. Purpose

Ovaj dokument opisuje kompletan poslovni tok Instant Rewards (Surprise Experience).

Instant Reward omogućava da kupac nakon kupovine dobije Reward Opportunity koju kasnije može otvoriti i osvojiti nagradu.

Reward se nikada ne određuje na klijentu.

Backend je jedini odgovoran za izbor nagrade.

---

# 2. Business Goal

Povećati engagement.

Povećati broj otvaranja aplikacije.

Stvoriti osećaj iznenađenja.

Povećati redemption rate.

---

# 3. Happy Path

Customer purchases

↓

ReceiptRecorded

↓

Reward Engine finishes

↓

Automation evaluates rules

↓

Reward Experience = Surprise

↓

Reward Opportunity created

↓

Notification queued

↓

Customer opens application

↓

Reward Opportunity opened

↓

Reward Pool evaluated

↓

Winning Reward selected

↓

Reward granted

↓

Benefit / Points / Voucher activated

↓

Notification sent

↓

Analytics updated

---

# 4. Commands

CreateRewardOpportunity

ExpireRewardOpportunity

OpenRewardOpportunity

EvaluateRewardPool

GrantReward

ExpireReward

CancelRewardOpportunity

---

# 5. Events

ReceiptRecorded

↓

InstantRewardOpportunityCreated

↓

NotificationQueued

↓

InstantRewardOpened

↓

InstantRewardSelected

↓

InstantRewardGranted

↓

BenefitGranted

↓

RewardPointsEarned (optional)

↓

NotificationSent

---

# 6. Aggregates

Reward Opportunity

Reward Pool

Reward Definition

Benefit Grant

Reward Account

---

# 7. Reward Opportunity Lifecycle

Created

↓

Available

↓

Opened

↓

Granted

↓

Redeemed (if benefit)

↓

Expired

↓

Archived

---

# 8. Reward Pool

Reward Pool sadrži:

Reward Definition

Probability

Validity

Cost

Limits

Priority

Pool može sadržati:

Reward Points

Benefit

Voucher

Discount

Free Product

Experience

Multiplier

---

# 9. Reward Selection

Backend:

učitava Reward Pool

↓

proverava eligibility

↓

uklanja nedozvoljene nagrade

↓

normalizuje verovatnoće

↓

nasumično bira nagradu

↓

kreira immutable zapis
Reward selection must be deterministic for audit purposes.

The platform stores sufficient evidence (Reward Pool version, eligibility result and selection reference) to reproduce and explain the awarded result during future audits.

↓

vraća rezultat

---

# 10. Eligibility

Reward može imati uslove:

Status

Membership

Location

Campaign

Business

Brand

Visit Count

Receipt Amount

Customer Segment

Challenge

Reward Goal

Time Window

Automation Context

---

# 11. Limits

Reward Definition može imati:

Per Customer

Per Day

Per Week

Per Month

Per Campaign

Per Business

Global

Ako limit nije ispunjen:

sledeća nagrada se razmatra.

---

# 12. Maximum Open Opportunities

Business definiše limit.

Primer:

1

3

5

10

Unlimited

Ako je dostignut limit:

nova Opportunity se ne kreira.

Generiše se Analytics Event.

---

# 13. Opening

Customer bira Opportunity.

↓

Backend proverava:

Ownership

Status

Expiration

Already Opened

↓

Reward selected

↓

Opportunity Closed

---

# 14. Expiration

Daily Scheduler

↓

Opportunity expires

↓

InstantRewardOpportunityExpired

↓

Notification optional

↓

Analytics updated

---

# 15. Error Scenarios

Reward Pool empty

↓

Opportunity remains unavailable

↓

Support alert

---

Reward selection failure

↓

Retry

↓

Audit

---

Already opened

↓

Reject request

---

Expired opportunity

↓

Reject request

---

Customer not eligible

↓

Reject request

---

# 16. Idempotency

OpenRewardOpportunity mora biti idempotentan.

Dupli zahtev nikada ne sme dodeliti dve nagrade.

---

# 17. Notifications

Opportunity Created

Opportunity Expiring

Reward Won

Reward Expiring

Benefit Ready

---

# 18. Analytics

Generated

Opened

Granted

Expired

Average Opening Time

Distribution

Cost

Redemption Rate

Most Popular Reward

---

# 19. Security

Reward nikada nije poznat klijentu unapred.

Reward Pool nije javno dostupan.

Probability nije dostupna klijentu.

Reward selection radi samo backend.

Opportunity Token nije predvidiv.

Sve akcije prolaze permission proveru.

---

# 20. Audit

Čuva se:

Receipt

Opportunity

Reward Pool Version

Reward Definition

Random Seed Reference

Granted Reward

Execution Time

Automation Context

Employee (if applicable)

---

# 21. Compensation

Ako se Receipt poništi:

proverava se stanje Opportunity.

Scenario A

Opportunity nije otvorena

↓

Opportunity se poništava.

---

Scenario B

Reward dodeljen

↓

Benefit se opoziva.

ili

Reward Points se reverziraju.

Sve kroz compensating transactions.

---

# 22. Event Flow Summary

ReceiptRecorded

↓

AutomationRuleMatched

↓

InstantRewardOpportunityCreated

↓

NotificationQueued

↓

Customer opens reward

↓

InstantRewardOpened

↓

EvaluateRewardPool

↓

InstantRewardSelected

↓

InstantRewardGranted

↓

BenefitGranted / RewardPointsEarned

↓

NotificationQueued

↓

AnalyticsUpdated