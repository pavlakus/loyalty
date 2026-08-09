-- up migration
CREATE TABLE brands (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  default_locale text NOT NULL CHECK (default_locale ~ '^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$'),
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE INDEX brands_business_id_idx ON brands (business_id);
CREATE INDEX brands_business_status_idx ON brands (business_id, status);

-- down migration
DROP TABLE IF EXISTS brands;
