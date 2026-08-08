# MIP-011 — Business Observation and Analytics

Business Observation is a read-only aggregate view over authoritative Membership, Receipt, Reward Ledger, Redemption, and Status history. It supports explicit UTC half-open periods, preserves historical attribution, separates monetary totals by currency, and exposes no Customer PII. The initial package provides deterministic domain/query contracts and in-memory projections only. Production projections, persistence, materialized views, and event consumers remain deferred.
