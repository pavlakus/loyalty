# Loyalty Program Task Index

## Package

`implementation/mip/MIP-005-loyalty-program.md`

## Tasks

- LP-005001 — Define Loyalty Program aggregate and lifecycle
- LP-005002 — Define Loyalty Program API and event contracts
- LP-005003 — Define Loyalty Program configuration model
- LP-005004 — Implement configuration versioning and effective history
- LP-005005 — Define reward rule configuration
- LP-005006 — Define reward experience configuration
- LP-005007 — Define pending period and point expiration configuration
- LP-005008 — Define XP rule configuration
- LP-005009 — Define Status Level configuration
- LP-005010 — Define Benefit definitions and configuration
- LP-005011 — Define strategy selection and recommendation integration
- LP-005012 — Implement Program validation and invariants
- LP-005013 — Implement Program audit and event requirements
- LP-005014 — Implement Program persistence and RLS (DONE)
- LP-005015 — Add Program domain, API, and security contract tests
- LP-005016 — Perform Loyalty Program architecture review
- LP-005017 — Perform Loyalty Program QA and security gate

## Ordering

LP-005001 is the first executable domain task after preparation because LP-004001 Brand is DONE and the aggregate can be implemented without persistence. Configuration tasks depend on the aggregate. Versioning and validation follow the configuration model. Persistence/RLS remains blocked by the declared database foundations. The final review and gate close only the executable baseline.
