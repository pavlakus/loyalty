# MIP-003-business.md

## Status
READY FOR TASK DECOMPOSITION

## Purpose
Business is the tenant boundary of the Loyalty Platform.

## Locked Decisions
- Business is the tenant boundary.
- One Business owns multiple Brands.
- One Brand has exactly one active Loyalty Program.
- Customer is global.
- Business never owns Customer identity.
- Business isolation is mandatory.

## Responsibilities
Owns:
- Business aggregate
- Business settings
- Business lifecycle
- Business administrators
- Business configuration
- Business audit

Does NOT own:
- Customer
- Membership
- Rewards
- Status
- Benefits
- Notifications

## Aggregate

Business

Entities:
- BusinessSettings
- BusinessAdministrator

Value Objects:
- BusinessStatus
- BusinessType
- TimeZone
- Currency

## Lifecycle

Draft
→ Active
→ Suspended
→ Closed

Closed is terminal.

## Commands

- CreateBusiness
- UpdateBusiness
- ActivateBusiness
- SuspendBusiness
- CloseBusiness
- UpdateBusinessSettings

## Queries

- GetBusiness
- ListBusinesses
- GetBusinessSettings

## Events

Publishes:
- BusinessCreated
- BusinessActivated
- BusinessUpdated
- BusinessSuspended
- BusinessClosed

Consumes:
- none in MVP

## API

POST /api/v1/businesses
GET /api/v1/businesses/{id}
PATCH /api/v1/businesses/{id}
POST /api/v1/businesses/{id}/activate
POST /api/v1/businesses/{id}/suspend

## Database

Tables:
- businesses
- business_settings
- business_administrators

## Security

- RLS mandatory
- deny by default
- tenant isolation
- service-role validates ownership

## Performance

Lookup <50ms
Create <300ms

## Tests

Unit
Integration
RLS
Concurrency
Security
API Contract

## UAT

UAT-BUS-001
UAT-BUS-002
UAT-SEC-001

## Definition of Done

- Aggregate implemented
- API implemented
- Events published
- RLS validated
- Tests green
- QA approved
- Security approved
- Architecture approved
