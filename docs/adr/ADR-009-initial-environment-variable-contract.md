# ADR-009: Initial Environment Variable Contract

## Status

Accepted

## Date

2026-07-29

## Authors

Architecture Role

## Related ADRs

- `docs/adr/ADR-007-environment-and-secret-management.md`
- `docs/adr/ADR-001-monorepo-and-workspace-strategy.md`

## Related Engineering Documents

- `implementation/mip/MIP-000-platform-foundation.md`
- `docs/engineering/52-repository-structure.md`
- `docs/engineering/59-coding-standards.md`
- `docs/engineering/60-release-strategy.md`

## Context

ADR-007 requires startup validation, safe examples, explicit public configuration, and strict separation of secrets from source control. The Platform Foundation task for environment validation is ready to be prepared, but the existing authoritative documents do not define the initial variable names, types, formats, defaults, or visibility classification.

The repository currently has only API process configuration for host and port. Database, Supabase, authentication, notification and other provider credentials belong to later tasks and have no approved foundation contract yet.

## Problem Statement

The initial contract must be small enough to avoid requiring credentials before the corresponding platform capability exists, while still making process behavior deterministic and safe across development, test and production.

## Decision

The initial Platform Foundation contract contains only three server-only process variables. It defines no client/public variables and no secret variables at this stage.

| Name | Visibility | Requiredness | Type | Format and validation | Development and test behavior | Production behavior |
| --- | --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | server-only | Optional in development/test; required for production | string enum | Exactly `development`, `test`, or `production`; no trimming or case folding | Defaults to `development` when absent. Test runners may set `test`. | Must be explicitly set to `production`; any other value or omission fails startup. |
| `PORT` | server-only | Optional | integer | Base-10 integer from `0` through `65535`; no whitespace, decimal, sign, or non-numeric suffix | Defaults to `3000`. `0` remains valid for an ephemeral test port. | Must be supplied by the deployment environment and pass the same validation. No source-controlled production value is provided. |
| `HOST` | server-only | Optional | string | Non-empty hostname or IP-literal suitable for the Node HTTP server; reject control characters and whitespace | Defaults to `127.0.0.1`. | May be supplied by deployment; if omitted, the safe loopback default remains in effect. Container deployments must explicitly set the bind address when external traffic is intended. |

### Public/client variables

There are no public/client variables in the initial contract. No client-facing runtime configuration is required by the existing foundation code. Later client configuration must add explicitly allowlisted, `PUBLIC_`-prefixed variables in a separate approved task or ADR and must never reuse this server configuration object.

### Secret variables

There are no secret variables in the initial contract. No database, Supabase, JWT, provider, deployment or service-role credential is required by the current foundation implementation. Later capability tasks must add only the credentials they require, through their own approved configuration contract and managed secret references.

## Decision Rationale

- `NODE_ENV` is required only in production because production safety depends on explicit environment identity, while local and test execution must remain usable without committed credentials.
- `PORT` is retained because the existing API startup already supports it and deployment platforms commonly inject it. The local default preserves the existing bootstrap behavior.
- `HOST` is retained because the existing API startup already supports it. The loopback default avoids unintentionally exposing a local development server; production/container exposure must be explicit.
- No database or provider variables are added because no current task implements those integrations. Requiring them now would create premature coupling and force unsupported secrets into local setup.
- No client variables are added because no current client behavior consumes runtime configuration.

## Alternatives Considered

### Require database and provider credentials now

Rejected. Those capabilities are not implemented by the current foundation task, and requiring their secrets would expand scope and make local startup depend on future infrastructure.

### Make every variable mandatory in every environment

Rejected. It would make the existing local and test bootstrap unnecessarily brittle without improving security for capabilities that do not yet exist.

### Add a generic arbitrary-variable registry

Rejected. A caller-defined registry would weaken reviewability, public/server separation and deterministic validation.

### Add public client configuration now

Rejected. No current client consumer exists, so there is no approved public contract to expose.

## Implementation Impact

The environment-validation implementation may expose a typed server configuration object containing only the three approved variables and may integrate it at API startup. Validation errors must identify the variable and expected format without printing its value. `.env.example` may contain variable names and safe examples only.

The implementation must not add credentials, provider configuration, client exports, deployment files or new environment names.

## Security Impact

- No secret value is committed or required.
- Server configuration is not exported to client packages.
- Production mode is explicit.
- Local binding defaults to loopback.
- Error messages must not echo environment values.
- Future secrets require separate reviewed contracts and managed secret storage under ADR-007.

## Testing Impact

The implementation must test:

- absent `NODE_ENV` in development/test uses the documented default;
- production without `NODE_ENV` fails safely;
- invalid enum, port and host values fail safely;
- valid `PORT=0` is accepted for tests;
- configuration output contains no undeclared variables and no client/public values;
- secret scanning finds no committed credentials.

## Adoption and Rollback

LP-000006 should reference this ADR and implement only this initial contract after the ADR is accepted. Rollback is a code/configuration revert; no migration or persistent data recovery is required.

## Approval Record

The authorized Product/Architecture decision owner approved this contract on 2026-07-29. LP-000006 may use this ADR as its accepted environment-variable contract.
