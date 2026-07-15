# 46. Automation Catalog

## 1. Purpose

Automation Templates predstavljaju gotove poslovne automatizacije koje Business može uključiti bez kreiranja pravila od nule.

Cilj je da većina malih i srednjih biznisa može pokrenuti loyalty program za nekoliko minuta.

Template:

- ima poslovni naziv;
- opisuje cilj;
- definiše trigger;
- definiše conditions;
- definiše actions;
- ima preporučene podrazumevane vrednosti;
- može se menjati nakon kreiranja.

Svaki template se pretvara u jednu ili više Automation Rules.

---

# 2. Automation Categories

Platform podržava sledeće kategorije:

- Customer onboarding
- Engagement
- Rewards
- Status
- Benefits
- Win-back
- Notifications
- Seasonal campaigns
- Anniversary
- Gamification
- Instant Rewards

---

# 3. Welcome Bonus

Business goal:

Nagraditi novo učlanjenje.

Default trigger:

CustomerJoinedLoyaltyProgram

Conditions:

- first membership
- membership active

Actions:

- grant welcome benefit
- grant reward points
- send welcome notification

Default recommendation:

Reward Points:
100

Validity:
30 days

Industry recommendations:

Coffee:
Free coffee coupon

Retail:
200 points

Beauty:
10% first visit

Gym:
Free training session

---

# 4. Birthday Bonus

Goal:

Povećati verovatnoću rođendanske kupovine.

Trigger:

Scheduled Daily Job

Conditions:

today == customer birthday

Actions:

Grant Benefit

Send Notification

Optional Instant Reward

Default validity:

14 days

Industry recommendation:

Restaurant:
Free dessert

Coffee:
Free drink

Retail:
Birthday coupon

Beauty:
20% service discount

---

# 5. Double Points Day

Goal:

Increase sales during selected period.

Trigger:

ReceiptRecorded

Conditions:

today within campaign

Actions:

Multiply Reward Points

Default multiplier:

2x

Options:

3x

5x

Industry recommendation:

Weekend

Holiday

Store opening

---

# 6. Happy Hour

Goal:

Increase off-peak traffic.

Trigger:

ReceiptRecorded

Conditions:

weekday

time window

location optional

Actions:

Extra points

Benefit

Instant Reward

Default:

Monday-Friday

14:00-17:00

---

# 7. Spend Bonus

Goal:

Increase average basket value.

Trigger:

ReceiptRecorded

Condition:

Receipt Amount >= Threshold

Actions:

Bonus Reward Points

Benefit

Instant Reward

Default recommendation:

Threshold:

2 × average receipt

Bonus:

20%

---

# 8. Visit Challenge

Goal:

Increase visit frequency.

Trigger:

VisitQualified

Condition:

Visit Count

Actions:

Grant Benefit

Grant Reward Points

Create Instant Reward

Default:

5 visits

Reward:

Free product

---

# 9. Win-back Attempt 1

Goal:

Bring inactive customers back.

Trigger:

Daily inactivity evaluation

Condition:

No qualified visit

Default threshold:

30 days

Actions:

Notification

Benefit

Optional coupon

Priority:

Medium

---

# 10. Win-back Attempt 2

Condition:

Still inactive

Default threshold:

45 days

Actions:

Higher value reward

Reminder notification

Priority:

High

Rule:

Never repeat endlessly.

Default maximum attempts:

2

---

# 11. Points Expiration Reminder

Goal:

Reduce unused balances.

Trigger:

Scheduled Daily Job

Condition:

Points expire within X days

Default:

14 days

Actions:

Push

In-App

SMS optional

Notification example:

"You have 350 points expiring in 14 days."

---

# 12. Membership Anniversary

Goal:

Celebrate customer loyalty.

Trigger:

MembershipYearStarted

Actions:

Grant Benefit

Grant Points

Notification

Default:

Every year

---

# 13. Status Upgrade Celebration

Trigger:

StatusUpgraded

Actions:

Congratulations notification

Benefit activation

Optional Instant Reward

Industry recommendation:

Premium visual celebration

---

# 14. Instant Reward Generation

Trigger:

ReceiptRecorded

Conditions:

Reward Experience == Surprise

Actions:

Create Reward Opportunity

Constraints:

Maximum open opportunities respected.

---

# 15. Reward Goal Near Completion

Trigger:

RewardGoalProgressUpdated

Condition:

Progress >= configurable %

Default:

80%

Actions:

Notification

Industry example:

"Only 120 points left for your reward."

---

# 16. Inactivity Detection

Purpose:

Detection only.

Trigger:

Daily evaluation

Output:

Customer segment

Actions:

Raise event:

CustomerBecameInactive

No notification by default.

Other automations decide what happens next.

---

# 17. Benefit Expiration Reminder

Trigger:

Scheduled Daily Job

Condition:

Benefit expires soon

Default:

7 days

Actions:

Notification

Optional Reminder

---

# 18. Seasonal Campaign

Examples:

Christmas

Black Friday

Summer

Opening Anniversary

Trigger:

ReceiptRecorded

Conditions:

Campaign period

Actions:

Bonus points

Benefits

Instant Rewards

Custom notification

---

# 19. First Purchase Bonus

Trigger:

ReceiptRecorded

Condition:

Customer purchase count == 1

Actions:

Bonus points

Benefit

Notification

Purpose:

Improve second purchase probability.

---

# 20. High Value Customer Reward

Trigger:

ReceiptRecorded

Condition:

Receipt above configurable threshold

Actions:

Extra Reward Points

Premium Benefit

Instant Reward

Purpose:

Reward exceptional purchases.

---

# 21. Reactivation Success

Trigger:

ReceiptRecorded

Condition:

Customer marked inactive before purchase

Actions:

Grant welcome-back reward

Remove inactive segment

Analytics event

---

# 22. Automation Priorities

Default execution order:

1. Security
2. Receipt validation
3. Reward calculations
4. XP calculations
5. Status evaluation
6. Benefit generation
7. Instant Rewards
8. Customer segmentation
9. Notifications
10. Analytics

Templates may define priority, but platform enforces this execution order for system-critical actions.

---

# 23. Default Safeguards

Every automation supports:

Enabled

Start date

End date

Priority

Audience

Industry

Location filter

Status filter

Membership filter

Maximum executions

Cooldown period

Execution history

Audit log

Dry-run validation

Simulation before activation

Every Automation execution must be idempotent.

Repeated processing of the same triggering Business Event must not execute the same Automation Action more than once unless the Automation explicitly defines repeatable behavior.
---

# 24. Best Practice Recommendations

Platform should recommend:

No more than 2 simultaneous win-back campaigns.

No more than 1 birthday reward.

Limit stacked point multipliers.

Avoid overlapping Happy Hour campaigns.

Prefer Benefits over excessive point inflation.

Review campaign performance monthly.

---

# 25. Future Templates

Not MVP:

Referral Campaign

Bring a Friend

Family Account Rewards

Corporate Challenges

Team Competitions

Season Pass

Treasure Hunt

Geo-fenced Campaigns

AI-generated Campaigns

Partner Campaigns

Weather-based Promotions

Real-time Inventory Campaigns