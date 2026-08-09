-- up migration
-- Customer is a global platform identity. Tenant-scoped access is owned by
-- the Customer RLS/purpose-scoped access tasks and is intentionally not
-- encoded as a business_id on this root table.
CREATE TABLE customers (
  id uuid PRIMARY KEY,
  normalized_phone_reference text NOT NULL UNIQUE,
  phone_verification_state text NOT NULL DEFAULT 'verified'
    CHECK (phone_verification_state = 'verified'),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'anonymized', 'closed')),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  anonymized_at timestamptz,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  CONSTRAINT customers_anonymization_state_check
    CHECK ((status = 'anonymized') = (anonymized_at IS NOT NULL)),
  CONSTRAINT customers_phone_reference_not_blank
    CHECK (length(btrim(normalized_phone_reference)) > 0)
);

CREATE TABLE customer_profiles (
  customer_id uuid PRIMARY KEY REFERENCES customers(id) ON DELETE RESTRICT,
  first_name text CHECK (first_name IS NULL OR length(btrim(first_name)) > 0),
  last_name text CHECK (last_name IS NULL OR length(btrim(last_name)) > 0),
  email text CHECK (email IS NULL OR length(btrim(email)) > 0),
  preferred_language text CHECK (
    preferred_language IS NULL OR preferred_language ~ '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$'
  ),
  birth_date date,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_profile_history (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  version bigint NOT NULL CHECK (version > 0),
  changed_fields text[] NOT NULL CHECK (cardinality(changed_fields) > 0),
  recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT customer_profile_history_version_unique UNIQUE (customer_id, version)
);

CREATE TABLE customer_privacy_actions (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  action_type text NOT NULL CHECK (action_type IN ('anonymized', 'export_requested', 'access_reviewed')),
  recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX customer_profile_history_customer_recorded_idx
  ON customer_profile_history (customer_id, recorded_at DESC);

CREATE INDEX customer_privacy_actions_customer_recorded_idx
  ON customer_privacy_actions (customer_id, recorded_at DESC);

-- down migration
DROP TABLE IF EXISTS customer_privacy_actions;
DROP TABLE IF EXISTS customer_profile_history;
DROP TABLE IF EXISTS customer_profiles;
DROP TABLE IF EXISTS customers;
