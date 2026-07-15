# ADR-007: Environment and Secret Management

## Status

Accepted

## Date

2026-07-15

## Context

The platform requires local, development, UAT and production environments. Secrets include database credentials, Supabase service-role keys, JWT secrets, API keys, notification provider credentials and deployment credentials. The Security Blueprint states that secrets must never be stored in source code.

## Problem

Configuration must be repeatable and validated, but secret values must remain outside the repository. Client applications must receive only explicitly public configuration. Agents must not modify UAT or production configuration without authorization.

## Decision

Use environment-specific configuration with startup validation and secret references. Commit only safe examples, variable names and documentation. Secret values are provided by local untracked `.env` files for local development and by managed environment secret stores for shared environments.

Configuration validation must fail fast when required variables are missing or invalid. Public client variables must be explicitly prefixed and reviewed. Production and UAT credentials must be isolated.

## Alternatives Considered

- Commit `.env` files with development secrets: convenient but violates security rules and risks credential leakage.
- Hardcode configuration constants: simple but not environment-safe and not reviewable for secrets.
- Single shared environment for all testing: cheaper but breaks isolation and release safety.
- Load configuration lazily at first use: defers errors and makes failures harder to diagnose.

## Rationale

Validated environment configuration provides repeatable deployments while preserving secret isolation. Safe examples allow developers and agents to set up local environments without exposing real credentials.

## Positive Consequences

- Missing configuration fails before unsafe runtime behavior.
- Secret scanning can enforce repository hygiene.
- UAT and production remain isolated.
- Client bundles can be reviewed for accidental secret exposure.
- Release records can document configuration changes without revealing values.

## Negative Consequences and Tradeoffs

- Initial setup requires clear documentation.
- Secret rotation requires operational process.
- Validation schemas must be maintained as variables evolve.
- Local developer setup depends on correct untracked values.

## Implementation Impact

- Add `.env.example` files with safe sample values only.
- Add configuration schema validation in backend and application packages.
- Add secret scanning to CI.
- Document required, optional and public variables.
- Add environment-specific deployment guidance.

## Security Impact

- Secrets must never be committed.
- Service-role keys must never reach clients.
- Logs and validation errors must not print secret values.
- Access to shared environment secrets must be least privilege and audited.
- Production access remains controlled by release process.

## Testing Impact

- Test missing required variable fails startup.
- Test invalid variable fails startup.
- Test public client configuration whitelist.
- Run secret scan in CI.
- Test configuration exposure does not include service credentials.

## Migration or Adoption Impact

Foundation introduces environment validation before feature modules. Later modules must register configuration through the same validation mechanism and update documentation when adding variables.

## Related Blueprint Documents

- `docs/blueprint/17-security.md`
- `docs/blueprint/22-non-functional-requirements.md`
- `docs/blueprint/44-permission-matrix.md`

## Related Engineering Documents

- `docs/engineering/52-repository-structure.md`
- `docs/engineering/55-module-definition-of-done.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`

