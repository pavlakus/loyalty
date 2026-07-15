31 - Instant Rewards

Purpose

Instant Rewards introduce surprise-based rewards that increase customer engagement immediately after qualifying business events.

Instant Rewards are designed to create excitement and anticipation without changing the core Reward Point economy.

They complement the Loyalty Program rather than replace it.

⸻

Design Principles

Instant Rewards should be:

* Immediate
* Optional
* Configurable
* Fair
* Exciting
* Business Driven

The platform determines eligibility.

The customer experiences surprise.

⸻

# Reward Experience

The platform supports multiple Reward Experiences.

Reward Experience defines how customers receive rewards after qualifying business events.

Reward Experience does not change Reward calculations.

It changes only the customer experience.

Supported Reward Experiences:

## Standard Experience

Customers immediately receive the configured Reward.

Examples:

- Reward Points
- Free Product
- Voucher

No additional customer interaction is required.

Recommended for:

- Traditional loyalty programs
- Retail
- Beauty salons
- Service businesses

---

## Surprise Experience

Customers receive a Reward Opportunity after qualifying events.

The opportunity may later be opened from the Customer App.

The final reward is selected according to configured Reward Pools and probabilities.

Recommended for:

- Coffee shops
- Restaurants
- Entertainment
- Kids play centers
- Businesses seeking higher customer engagement

---

Businesses may change Reward Experience at any time.

Changing Reward Experience must never modify existing Reward balances, Memberships or historical transactions.

Business Concept

An Instant Reward is earned after a qualifying event.

Examples:

* Completed Purchase
* First Purchase
* Birthday Purchase
* Promotion
* Campaign Completion
* Special Event

Every qualifying event creates one reward opportunity.

⸻

Reward Opportunities

Each qualifying event generates exactly one unopened reward.

Examples:

Purchase #1

↓

Instant Reward #1

Purchase #2

↓

Instant Reward #2

Purchase #3

↓

Instant Reward #3

Multiple purchases generate multiple independent reward opportunities.

Every Reward Opportunity owns its own lifecycle.

Opening, expiration, redemption or cancellation of one Reward Opportunity never affects any other Reward Opportunity belonging to the same Membership.

Customers may open them immediately or later.

⸻

# Maximum Unopened Reward Opportunities

Businesses may configure the maximum number of unopened Reward Opportunities.

Supported values:

- 1
- 3
- 5 (recommended)
- 10
- Unlimited

If the configured limit has been reached:

- new qualifying events do not create additional Reward Opportunities;
- the Customer is encouraged to open existing opportunities first.

The platform recommendation is 5 unopened opportunities.

Reward Opening

Customers reveal rewards from the Customer App.

The user experience may vary.

Examples:

* Scratch Card
* Gift Box
* Mystery Envelope
* Treasure Chest
* Lucky Ticket

Presentation is a UI concern.

The business concept remains Instant Reward.

⸻

Reward Definition

Businesses configure available rewards.

Examples:

* Reward Points
* Free Product
* Percentage Discount
* Fixed Discount
* Double Points on Next Purchase
* Free Dessert
* Free Coffee
* Free Delivery
* Special Voucher

Future reward types should integrate without architectural changes.

⸻

Reward Probability

Every reward may define its own probability.

Example:

Reward A

70%

Reward B

20%

Reward C

8%

Reward D

2%

The platform selects rewards according to configured probabilities.

⸻

Reward Pools

Businesses may create multiple reward pools.

Examples:

* Standard Rewards
* Weekend Rewards
* VIP Rewards
* Birthday Rewards
* Seasonal Rewards

Automation selects which reward pool is active.

⸻

Expiration

Businesses define how long unopened Instant Rewards remain valid.

Examples:

* 24 hours
* 7 days
* 30 days
* Never

Expired opportunities are archived and cannot be opened.

⸻

Redemption

Some Instant Rewards grant benefits immediately.

Others create redeemable vouchers.

Examples:

Immediate:

+20 Reward Points

Voucher:

Free Coffee

The Reward Type determines redemption behavior.

⸻

Automation Integration

Automation Engine may trigger Instant Rewards.

Examples:

* Every Purchase
* Every Fifth Purchase
* Purchases Above 2,000 RSD
* Weekend Campaign
* Happy Hour

Instant Rewards are event-driven.

⸻

Customer Experience

The Customer App should prioritize anticipation.

Customers should see:

“You have 2 unopened rewards.”

The application should encourage opening rewards without creating unnecessary complexity.

⸻

Analytics

Businesses may monitor:

* Rewards Generated
* Rewards Opened
* Rewards Expired
* Most Common Rewards
* Redemption Rate
* Campaign Performance

Instant Rewards should provide measurable business value.

⸻

# Reward Analytics

Businesses should be able to monitor:

- generated opportunities
- opened opportunities
- expired opportunities
- reward distribution
- reward probabilities
- redemption rate
- average time before opening
- business cost by reward
- engagement generated by Reward Experience

Future AI recommendations may optimize Reward Pools based on these metrics.

Security

Reward generation is performed only by the backend.

Customers cannot influence:

* reward selection
* probabilities
* reward contents

Every generated reward is auditable.

⸻

Future Extensions

Future versions may include:

* Limited-time jackpots
* Partner-sponsored rewards
* Multi-stage rewards
* Team challenges
* Seasonal collections
* Achievement-linked rewards

These extensions should build upon the same architecture.

⸻

Design Principles

Instant Rewards increase customer engagement through positive surprise.

They are designed to strengthen customer habits and emotional connection while remaining fully configurable and measurable by the business.

