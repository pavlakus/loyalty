# 50. Blueprint Index

# 1. Purpose

Ovaj dokument predstavlja ulaznu tačku u Loyalty Platform Blueprint.

Njegov cilj je da:

- objasni strukturu Blueprint-a;
- prikaže zavisnosti između dokumenata;
- definiše preporučeni redosled čitanja;
- pomogne novim članovima tima i AI agentima da brzo razumeju sistem.
- usmerava čitaoca ka Engineering Playbook dokumentima koji definišu način implementacije.

---

# 2. Blueprint Overview

Blueprint opisuje kompletnu SaaS Customer Engagement Platform.

Glavni moduli:

- Foundation
- Product
- Domain
- Architecture
- Security
- Events
- APIs
- Mobile Apps
- Business Portal
- Automation
- Analytics
- AI
- Deployment

---

# 3. Document Map

## Foundation

00-platform-glossary.md

01-product-vision.md

02-mvp-scope.md

03-business-rules.md

26-product-decisions.md

---

## Domain

04-domain-model.md

(The historical Domain Model. The authoritative Domain Model is 33-domain-model-v2.md.)

07-domain-aggregates.md

08-data-model.md

33-domain-model-v2.md

42-data-model-v1.md

(Implementation-ready logical data model.)

---

## Architecture

05-system-architecture.md

09-automation-engine.md

10-reward-engine.md

11-xp-engine.md

12-status-engine.md

13-notification-engine.md

14-loyalty-network.md

15-settlement-engine.md

17-security.md

22-non-functional-requirements.md

---

## APIs

16-api-design.md

43-api-contract.md

44-permission-matrix.md

45-notification-matrix.md

---

## Applications

18-customer-mobile-app.md

19-employee-mobile-app.md

20-business-portal.md

29-deployment-models.md

30-brand-configuration.md

---

## Product Features

31-instant-rewards.md

32-strategy-templates.md

46-automation-catalog.md

47-analytics-catalog.md

48-ai-recommendation-catalog.md

---

## Event Storming

34-event-storming-customer-registration.md

35-event-storming-join-loyalty-program.md

36-event-storming-purchase-processing.md

37-event-catalog.md

38-event-storming-reward-redemption.md

39-event-storming-receipt-cancellation.md

40-event-storming-status-and-membership-year.md

41-event-storming-instant-rewards.md

---

## Governance

21-analytics.md

23-ai-development-guidelines.md

24-testing-strategy.md

25-roadmap.md

27-ai-operating-manual.md

49-open-questions-final.md

---

# 4. Recommended Reading Order

Business stakeholders

↓

01 Product Vision

02 MVP Scope

03 Business Rules

26 Product Decisions

31 Instant Rewards

32 Strategy Templates

46 Automation Catalog

47 Analytics Catalog

---

Product Owners

↓

Business documents

↓

Domain Model

↓

Event Storming

↓

API Contract

↓

Business Portal

---

Solution Architects

↓

Domain Model

↓

Architecture

↓

Event Catalog

↓

Data Model

↓

Security

↓

API

---

Backend Developers

↓

Architecture

↓

Data Model

↓

Event Catalog

↓

API Contract

↓

Automation

↓

Analytics

---

Frontend Developers

↓

Customer App

↓

Employee App

↓

Business Portal

↓

Brand Configuration

↓

API Contract

---

QA Engineers

↓

Business Rules

↓

Event Storming

↓

Permission Matrix

↓

Notification Matrix

↓

Testing Strategy

---

AI Agents

↓

Platform Glossary

↓

Product Decisions

↓

Domain Model

↓

Architecture

↓

Event Catalog

↓

API Contract

↓

Automation

↓

Analytics

↓

AI Recommendation Catalog

---

# 5. Domain Dependencies

Customer

↓

Membership

↓

Receipt

↓

Reward

↓

XP

↓

Status

↓

Benefits

↓

Challenges

↓

Reward Goals

↓

Automation

↓

Notifications

↓

Analytics

---

# 6. Event Flow

Receipt Recorded

↓

Reward Engine

↓

XP Engine

↓

Status Engine

↓

Benefit Engine

↓

Automation Engine

↓

Notification Engine

↓

Analytics

---

# 7. Main Business Flows

Customer Registration

Join Loyalty Program

Receipt Processing

Reward Redemption

Receipt Cancellation

Status Evaluation

Instant Rewards

Campaign Automation

AI Recommendations

---

# 8. MVP Scope Summary

Included:

Customer Mobile App

Employee App

Business Portal

Reward Points

XP

Status

Benefits

Automation

Analytics

Instant Rewards

Loyalty Network

Excluded:

Settlement

Referral

Corporate Accounts

Family Accounts

Wallet

Offline Mode

Marketplace Rewards

Advanced AI

---

# 9. Architecture Principles

Event Driven

Immutable Ledger

Source of Truth

RLS

Business Actions API

Configuration over Custom Code

Automation First

AI Assisted

---

# 10. Version

Blueprint Version:

1.0

Status:

Frozen

Owner:

Product Team

Implementation Status:

Ready

Last Updated:

v1.0