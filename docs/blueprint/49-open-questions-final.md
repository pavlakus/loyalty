# 49. Open Questions — Final Review

# 1. Purpose

Ovaj dokument predstavlja završnu reviziju Blueprint-a.

Ciljevi:

- potvrditi da su sve ključne poslovne odluke donete;
- identifikovati teme koje ostaju otvorene;
- jasno razdvojiti:
    - MVP,
    - Blueprint v1.0,
    - Future roadmap.

Ovaj dokument služi kao poslednja kontrolna lista pre zamrzavanja Blueprint-a.

---

# 2. Closed Decisions

Sledeće odluke smatraju se konačnim za Blueprint v1.0.

## Customer

✔ Phone number kao jedinstveni identitet

✔ OTP login

✔ Email opcioni

✔ Global Customer

✔ Membership po Loyalty Program-u

---

## Reward Points

✔ Ledger kao source of truth

✔ FIFO redemption

✔ Pending points

✔ Configurable expiration

✔ Balance kao projection

---

## Redemption

✔ Preview

✔ Reserve

✔ Confirm

✔ Cancel

✔ Bez negativnog salda

✔ POS ostaje izvor konačnog računa

---

## Status

✔ XP odvojen od Reward Points

✔ Upgrade odmah

✔ Downgrade samo na kraju Membership Year-a

✔ Status daje Benefits

---

## Benefits

✔ Poseban domen

✔ Benefit lifecycle

✔ Status dodeljuje Benefit

---

## Loyalty Network

✔ Programi ostaju vlasnici svojih bodova

✔ Settlement nije MVP

✔ Istorija ostaje trajno

---

## Instant Rewards

✔ Surprise Experience

✔ Backend bira nagradu

✔ Reward Pool

✔ Opportunity model

---

## Automation

✔ Event Driven

✔ Templates

✔ Rule Engine

✔ Audit

---

## Notifications

✔ Async

✔ Retry

✔ Duplicate suppression

✔ Marketing consent

---

## Security

✔ RLS

✔ Immutable ledger

✔ Scoped permissions

✔ Audit log

---

# 3. Decisions Deferred

Sledeće teme nisu deo Blueprint v1.0.

## Referral Program

Status:

Future

---

## Family Accounts

Future

---

## Corporate Accounts

Future

---

## Marketplace Rewards

Future

---

## AI Generated Campaigns

Future

---

## Dynamic Reward Optimization

Future

---

## Geo Campaigns

Future

---

## White-label Advanced Customization

Future

---

## Settlement Engine

Future implementation

Domain ostaje definisan.

---

## Cross-program Financial Settlement

Future

---

## Offline Mode

Nije MVP.

---

## Wearables

Future.

---

## Apple Wallet

Future.

---

## Google Wallet

Future.

---

## NFC Membership

Future.

---

## Blockchain Rewards

Out of scope.

---

# 4. Legal Review Required

Pre produkcije obavezno proveriti:

Point liability

Expired points

Privacy

GDPR

Consent

Terms of Use

Partner redemption

Loyalty shutdown

Tax treatment

Digital vouchers

Country specific regulations

---

# 5. Technical Review Required

Potrebno proveriti:

API consistency

Naming consistency

Aggregate ownership

Event naming

Projection ownership

Data model consistency

Permission matrix

Notification matrix

Automation catalog

Analytics catalog

AI catalog

---

# 6. UX Review Required

Customer App

Employee App

Business Portal

Onboarding Wizard

Automation Wizard

Analytics Dashboard

AI Assistant

---

# 7. Architecture Review

Proveriti:

Domain boundaries

Event ownership

Idempotency

Compensation

Immutable history

Performance

Scalability

Security

---

# 8. Engineering Review

Pre implementacije:

Database migrations

API contracts

Indexes

RLS

Testing strategy

Seed data

Automation templates

Monitoring

Logging

Observability

---

# 9. Product Readiness Checklist

Blueprint mora imati:

✓ Vision

✓ Domain Model

✓ Architecture

✓ Events

✓ APIs

✓ Security

✓ Analytics

✓ Automation

✓ AI

✓ UX principles

✓ Business Rules

✓ Data Model

✓ Deployment

✓ Notifications

✓ Testing Strategy

✓ Product Decisions

---

# 10. Definition of Blueprint Done

Blueprint se smatra završenim kada:

nema otvorenih poslovnih kontradikcija;

svaki domen ima owner-a;

svaki događaj ima jasno značenje;

API podržava sve poslovne procese;

nema nedorečenih MVP funkcionalnosti;

Business Portal podržava konfiguraciju;

Customer App podržava kompletan loyalty tok;

Employee App podržava kompletan receipt tok;

Automation podržava definisane template-e;

Analytics podržava definisane KPI-jeve.

---

# 11. Version

Blueprint Version:

1.0

Status:

Ready for Architecture Review

Ready for Engineering Planning

Ready for AI-assisted Development

all implementation-ready documents are identified;

deprecated and superseded documents are clearly marked;

the Blueprint Index references the authoritative document for every major domain.