# ADR-008: Cross-Platform Mobile Architecture

## Status

Accepted

## Date

2026-07-15

## Context

The platform requires Customer and Employee mobile applications for Android and iOS from a shared cross-platform codebase. The immediate Android testing requirement is an installable preview APK. Store publication is not a Sprint 0 requirement. Mobile apps must never own authoritative business calculations.

## Problem

The project needs a mobile architecture that supports one codebase per app, Android preview builds, later iOS builds, camera and QR scanning, secure storage, push notifications and integration with shared API contracts without introducing native complexity too early.

## Decision

React Native with Expo is the selected cross-platform framework for Customer Mobile and Employee Mobile applications. Each app will live under `apps/customer-mobile` and `apps/employee-mobile`, with approved shared UI and mobile utilities in `packages/mobile-ui`, `packages/localization`, `packages/api-contracts` and related shared packages.

Expo Application Services (EAS Build) is the default build mechanism. The Android preview profile produces an installable APK using internal distribution. The production Android profile later produces an Android App Bundle. iOS build and store submission are deferred but supported by the same codebase. Local native builds remain an approved fallback when EAS is unavailable.

Detailed commands, credentials and distribution procedures belong to the future `MOB-001-android-build-and-apk-distribution.md`. Google Play publication is not required for preview testing.

## Alternatives Considered

- Native Android and iOS apps: maximum platform control, but duplicates effort and slows MVP delivery.
- Flutter: strong cross-platform capability, but introduces a non-TypeScript stack and weaker sharing with TypeScript contracts and web tooling.
- React Native CLI without Expo: more native flexibility, but higher setup and maintenance cost for Sprint 0.
- Progressive Web App only: faster web delivery, but weaker access to camera, push and installable mobile app expectations.

## Rationale

React Native with Expo aligns with the Blueprint's React Native direction while supporting TypeScript, shared contracts, Android APK preview builds, future iOS builds, camera and QR capabilities, secure storage and push notifications. It reduces native setup while preserving an escape path through Expo config plugins or prebuild if needed.

## Positive Consequences

- One shared technology stack across mobile and TypeScript packages.
- Faster preview builds for Android testing.
- Later iOS builds can use the same application codebase.
- Expo ecosystem supports camera, QR scanning, secure storage and push notifications.
- Mobile apps can consume shared API contracts without owning backend business rules.

## Negative Consequences and Tradeoffs

- Some advanced native integrations may require Expo config plugins or prebuild.
- Build service usage introduces operational dependency on Expo tooling.
- Native module compatibility must be reviewed before adding dependencies.
- App store publication still requires later release planning and evidence.

## Implementation Impact

- Create Expo React Native app placeholders for Customer and Employee mobile apps.
- Configure TypeScript strict mode and shared linting.
- Add API client abstractions that consume approved contracts.
- Add secure storage abstraction without storing excessive personal data.
- Add build scripts for Android preview APK generation in a later mobile build task.

## Security Impact

- Mobile apps must never include service-role credentials or backend secrets.
- Secure storage is required for approved sensitive local values.
- Cached QR must follow the public Membership token strategy and must not contain personal data.
- Push notification tokens are sensitive operational data and must be handled through backend APIs.
- UI permissions do not replace backend authorization.

## Testing Impact

- Add mobile typecheck, lint and build validation.
- Add preview APK generation verification for Android when the build task is implemented.
- Add tests for camera permission denied, invalid QR, expired session and duplicate submit in later feature tasks.
- Add contract tests to ensure mobile clients use stable API envelopes.

## Migration or Adoption Impact

Foundation creates placeholders and architecture only. No customer-facing screens, authentication behavior or loyalty flows are implemented in this ADR task. Store publication is explicitly deferred.

## Related Blueprint Documents

- `docs/blueprint/05-system-architecture.md`
- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`
- `docs/blueprint/43-api-contract.md`
- `docs/blueprint/44-permission-matrix.md`

## Related Engineering Documents

- `docs/engineering/51-engineering-implementation-guide.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/58-project-knowledge-map.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`
