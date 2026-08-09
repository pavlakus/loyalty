-- up migration
-- Business is the tenant boundary. Customer identity is global and is not
-- owned by this table.
CREATE TABLE businesses (
  id uuid PRIMARY KEY,
  legal_name text NOT NULL CHECK (length(btrim(legal_name)) > 0),
  display_name text NOT NULL CHECK (length(btrim(display_name)) > 0),
  registration_number text,
  tax_number text,
  default_currency char(3) NOT NULL CHECK (default_currency ~ '^[A-Z]{3}$'),
  timezone text NOT NULL CHECK (length(btrim(timezone)) > 0),
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE INDEX businesses_status_idx ON businesses (status);

-- down migration
DROP TABLE IF EXISTS businesses;
