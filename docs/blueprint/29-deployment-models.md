29 - Deployment Models

Purpose

This document defines the supported deployment models of the platform.

The platform is designed as a single multi-tenant backend capable of serving different customer experiences without architectural changes.

Deployment models affect branding and feature exposure only.

Business logic remains identical.

⸻

Design Principle

One Platform

One Backend

Multiple Deployment Models

Deployment type must never require separate business logic implementations.

⸻

Deployment Models

The platform supports three deployment models.

Model A — Marketplace

A shared mobile application where customers participate in multiple Loyalty Programs.

Characteristics:

* Shared application
* Shared authentication
* Multiple Loyalty Programs
* Customer selects a Loyalty Program
* Shared infrastructure

Target customers:

* Small businesses
* Local stores
* Restaurants
* Cafés

⸻

Model B — Private Brand

A dedicated branded application for a single Business.

Characteristics:

* Custom application branding
* Single Loyalty Program
* No competing businesses visible
* Business-specific customer experience

The backend remains shared.

Only presentation changes.

Target customers:

* Restaurant chains
* Retail chains
* Fitness brands
* Medium-sized businesses

⸻

Model C — Enterprise White Label

A fully branded enterprise deployment.

Characteristics:

* Custom branding
* Custom application name
* Custom theme
* Configurable modules
* Enterprise integrations

Business logic remains identical to Marketplace.

Only branding and enabled capabilities differ.

⸻

Shared Architecture

All deployment models use:

* the same Backend
* the same Database
* the same Business Engines
* the same APIs
* the same Security Model
* the same Automation Engine

No deployment model introduces duplicate business logic.

⸻

Branding

Every Brand may define:

* Application Name
* Logo
* Colors
* Icons
* Splash Screen
* Terms of Service
* Privacy Policy
* Contact Information

Brand configuration is data-driven.

⸻

Feature Configuration

Each Brand may enable or disable platform modules.

Examples:

* Rewards
* XP
* Challenges
* Coupons
* Notifications
* Loyalty Network
* Reservations (future)
* Gift Cards (future)

Feature configuration must not require code changes.

⸻

Marketplace Visibility

Marketplace deployments display multiple Loyalty Programs.

Private Brand and White Label deployments display only the owning Business.

Customers should never see competing businesses unless Marketplace mode is enabled.

⸻

Authentication

Authentication remains identical across all deployment models.

Customer identity is shared at the platform level.

Deployment model does not affect authentication.

⸻

Product Evolution

New deployment models should extend this architecture rather than introduce parallel implementations.

The backend remains deployment-agnostic.

Presentation adapts to the selected deployment model.

⸻

Design Principles

Deployment models change the customer experience.

They do not change the business architecture.

One platform should serve many business models without duplication.