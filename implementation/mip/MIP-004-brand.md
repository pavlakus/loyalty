# MIP-004 Brand

## Status
READY FOR TASK DECOMPOSITION

## Purpose
Brand represents a customer-facing business identity inside a Business.

## Locked Decisions
- Brand belongs to exactly one Business.
- Business may own multiple Brands.
- Brand has exactly one active Loyalty Program.
- Brand is not a tenant boundary.
- Customers remain global.

## Responsibilities
Owns:
- Brand profile
- Brand settings
- Brand lifecycle
- Brand identity

Does NOT own:
- Customer
- Membership
- Reward
- Status
- Benefit

## Aggregate
Brand

Entities:
- BrandSettings
- BrandTheme

Value Objects:
- BrandStatus
- Locale
- Currency

## Lifecycle
Draft
→ Active
→ Suspended
→ Closed

## Commands
CreateBrand
UpdateBrand
ActivateBrand
SuspendBrand
CloseBrand

## Queries
GetBrand
ListBrandsByBusiness

## Events
BrandCreated
BrandUpdated
BrandActivated
BrandSuspended
BrandClosed

## APIs
POST /api/v1/businesses/{businessId}/brands
GET /api/v1/brands/{id}
PATCH /api/v1/brands/{id}

## Database
brands
brand_settings

## Security
- Business scoped
- RLS mandatory
- Service role validates Business ownership

## Tests
Unit
Integration
RLS
Concurrency
Security
Contract

## Definition of Done
- Aggregate implemented
- API implemented
- RLS validated
- Tests passing
- QA approved
- Security approved
