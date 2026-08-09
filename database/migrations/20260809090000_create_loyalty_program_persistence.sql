-- up migration
-- Loyalty Program is owned by one Brand. Business tenant access is derived
-- through brands.business_id; Customer and Membership state do not belong here.
CREATE TABLE loyalty_programs (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  brand_id uuid NOT NULL UNIQUE REFERENCES brands(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE INDEX loyalty_programs_business_status_idx ON loyalty_programs (business_id, status);
CREATE INDEX loyalty_programs_brand_status_idx ON loyalty_programs (brand_id, status);

CREATE OR REPLACE FUNCTION validate_loyalty_program_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.brands
    WHERE brands.id = NEW.brand_id
      AND brands.business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION 'Loyalty Program Brand does not belong to the supplied Business';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER loyalty_program_business_consistency
  BEFORE INSERT OR UPDATE OF business_id, brand_id ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION validate_loyalty_program_business();

-- Configuration versions are append-only historical records. The stable id
-- matches the domain version key: <program id>:<positive version>.
CREATE TABLE loyalty_program_configuration_versions (
  id text PRIMARY KEY,
  program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  version bigint NOT NULL CHECK (version > 0),
  effective_from timestamptz NOT NULL,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(configuration) = 'object'),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT loyalty_program_configuration_version_id_check
    CHECK (id = program_id::text || ':' || version::text),
  CONSTRAINT loyalty_program_configuration_version_unique
    UNIQUE (program_id, version),
  CONSTRAINT loyalty_program_configuration_effective_from_unique
    UNIQUE (program_id, effective_from)
);

CREATE INDEX loyalty_program_configuration_effective_idx
  ON loyalty_program_configuration_versions (program_id, effective_from DESC);

CREATE OR REPLACE FUNCTION reject_loyalty_program_configuration_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'loyalty program configuration versions are immutable';
END;
$$;

CREATE TRIGGER loyalty_program_configuration_no_update
  BEFORE UPDATE OR DELETE ON loyalty_program_configuration_versions
  FOR EACH ROW EXECUTE FUNCTION reject_loyalty_program_configuration_mutation();

-- The application role is deliberately non-login and receives only the
-- privileges needed by application composition. Migrations run as the owner.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'loyalty_app') THEN
    CREATE ROLE loyalty_app NOLOGIN;
  END IF;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON loyalty_programs TO loyalty_app;
GRANT SELECT, INSERT ON loyalty_program_configuration_versions TO loyalty_app;

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs FORCE ROW LEVEL SECURITY;
ALTER TABLE loyalty_program_configuration_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_program_configuration_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY loyalty_program_business_isolation
  ON loyalty_programs
  USING (
    loyalty_programs.business_id::text = current_setting('app.business_id', true)
  )
  WITH CHECK (
    loyalty_programs.business_id::text = current_setting('app.business_id', true)
  );

CREATE POLICY loyalty_program_configuration_business_isolation
  ON loyalty_program_configuration_versions
  USING (
    EXISTS (
      SELECT 1
      FROM loyalty_programs
      WHERE loyalty_programs.id = loyalty_program_configuration_versions.program_id
        AND loyalty_programs.business_id::text = current_setting('app.business_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM loyalty_programs
      WHERE loyalty_programs.id = loyalty_program_configuration_versions.program_id
        AND loyalty_programs.business_id::text = current_setting('app.business_id', true)
    )
  );

REVOKE UPDATE, DELETE ON loyalty_program_configuration_versions FROM loyalty_app;

-- down migration
DROP POLICY IF EXISTS loyalty_program_configuration_business_isolation ON loyalty_program_configuration_versions;
DROP POLICY IF EXISTS loyalty_program_business_isolation ON loyalty_programs;
ALTER TABLE loyalty_program_configuration_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs DISABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON loyalty_program_configuration_versions FROM loyalty_app;
REVOKE ALL PRIVILEGES ON loyalty_programs FROM loyalty_app;
DROP TRIGGER IF EXISTS loyalty_program_configuration_no_update ON loyalty_program_configuration_versions;
DROP FUNCTION IF EXISTS reject_loyalty_program_configuration_mutation();
DROP TRIGGER IF EXISTS loyalty_program_business_consistency ON loyalty_programs;
DROP FUNCTION IF EXISTS validate_loyalty_program_business();
DROP TABLE IF EXISTS loyalty_program_configuration_versions;
DROP TABLE IF EXISTS loyalty_programs;
