-- up migration
-- Membership is the durable Customer + Loyalty Program participation identity.
-- Reward/XP account persistence is owned by later tasks; these identifiers are
-- relationship boundaries until those account tables exist.
CREATE TABLE memberships (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  reward_account_id uuid NOT NULL,
  xp_account_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
  status_level_id text NOT NULL CHECK (length(btrim(status_level_id)) > 0),
  joined_at timestamptz NOT NULL,
  suspended_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  CONSTRAINT memberships_customer_program_unique
    UNIQUE (customer_id, loyalty_program_id),
  CONSTRAINT memberships_closed_at_consistency
    CHECK ((status = 'CLOSED') = (closed_at IS NOT NULL)),
  CONSTRAINT memberships_suspended_at_consistency
    CHECK (status <> 'SUSPENDED' OR suspended_at IS NOT NULL)
);

CREATE INDEX memberships_business_program_status_idx
  ON memberships (business_id, loyalty_program_id, status);
CREATE INDEX memberships_customer_idx
  ON memberships (customer_id);

CREATE TABLE membership_enrollment_idempotency (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_fingerprint text NOT NULL CHECK (length(btrim(request_fingerprint)) > 0),
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT membership_enrollment_idempotency_unique
    UNIQUE (business_id, idempotency_key)
);

CREATE INDEX membership_enrollment_membership_idx
  ON membership_enrollment_idempotency (membership_id);

CREATE OR REPLACE FUNCTION validate_membership_persistence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  program_business_id uuid;
  program_brand_id uuid;
  program_status text;
  brand_status text;
BEGIN
  SELECT lp.business_id, lp.brand_id, lp.status, b.status
    INTO program_business_id, program_brand_id, program_status, brand_status
    FROM public.loyalty_programs lp
    JOIN public.brands b ON b.id = lp.brand_id
   WHERE lp.id = NEW.loyalty_program_id;

  IF program_business_id IS NULL
     OR program_business_id <> NEW.business_id
     OR program_brand_id <> NEW.brand_id THEN
    RAISE EXCEPTION 'Membership context does not match Loyalty Program ownership';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'ACTIVE' OR program_status <> 'ACTIVE' OR brand_status <> 'ACTIVE' THEN
      RAISE EXCEPTION 'Membership enrollment requires an active Brand and Loyalty Program';
    END IF;
  ELSE
    IF NEW.customer_id <> OLD.customer_id
       OR NEW.business_id <> OLD.business_id
       OR NEW.brand_id <> OLD.brand_id
       OR NEW.loyalty_program_id <> OLD.loyalty_program_id
       OR NEW.reward_account_id <> OLD.reward_account_id
       OR NEW.xp_account_id <> OLD.xp_account_id
       OR NEW.joined_at <> OLD.joined_at THEN
      RAISE EXCEPTION 'Membership identity and account relationships are immutable';
    END IF;

    IF OLD.status = 'CLOSED' AND NEW.status <> 'CLOSED' THEN
      RAISE EXCEPTION 'Closed Membership is terminal';
    END IF;
    IF OLD.status = 'ACTIVE' AND NEW.status NOT IN ('ACTIVE', 'SUSPENDED', 'CLOSED') THEN
      RAISE EXCEPTION 'Invalid Membership lifecycle transition';
    END IF;
    IF OLD.status = 'SUSPENDED' AND NEW.status NOT IN ('SUSPENDED', 'ACTIVE', 'CLOSED') THEN
      RAISE EXCEPTION 'Invalid Membership lifecycle transition';
    END IF;
    IF NEW.status = 'ACTIVE' AND (program_status <> 'ACTIVE' OR brand_status <> 'ACTIVE') THEN
      RAISE EXCEPTION 'Membership reactivation requires an active Brand and Loyalty Program';
    END IF;
  END IF;

  IF NEW.status = 'SUSPENDED' AND NEW.suspended_at IS NULL THEN
    NEW.suspended_at := CURRENT_TIMESTAMP;
  END IF;
  IF NEW.status = 'CLOSED' AND NEW.closed_at IS NULL THEN
    NEW.closed_at := CURRENT_TIMESTAMP;
  END IF;
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER membership_persistence_validation
  BEFORE INSERT OR UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION validate_membership_persistence();

-- Enrollment records preserve retry identity and link one request to one durable
-- Membership. A payload fingerprint mismatch is rejected by the application
-- command before retrying the same idempotency key.
CREATE OR REPLACE FUNCTION reject_membership_enrollment_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Membership enrollment idempotency records are immutable';
END;
$$;

CREATE OR REPLACE FUNCTION validate_membership_enrollment_idempotency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.memberships m
     WHERE m.id = NEW.membership_id
       AND m.business_id = NEW.business_id
       AND m.customer_id = NEW.customer_id
       AND m.loyalty_program_id = NEW.loyalty_program_id
  ) THEN
    RAISE EXCEPTION 'Membership enrollment idempotency context does not match Membership';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER membership_enrollment_idempotency_validation
  BEFORE INSERT ON membership_enrollment_idempotency
  FOR EACH ROW EXECUTE FUNCTION validate_membership_enrollment_idempotency();

CREATE TRIGGER membership_enrollment_idempotency_immutable
  BEFORE UPDATE OR DELETE ON membership_enrollment_idempotency
  FOR EACH ROW EXECUTE FUNCTION reject_membership_enrollment_mutation();

GRANT SELECT, INSERT, UPDATE ON memberships TO loyalty_app;
GRANT SELECT, INSERT ON membership_enrollment_idempotency TO loyalty_app;

REVOKE ALL ON FUNCTION validate_membership_persistence() FROM PUBLIC;
REVOKE ALL ON FUNCTION reject_membership_enrollment_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_membership_enrollment_idempotency() FROM PUBLIC;

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE membership_enrollment_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_enrollment_idempotency FORCE ROW LEVEL SECURITY;

CREATE POLICY membership_business_isolation
  ON memberships
  USING (memberships.business_id::text = current_setting('app.business_id', true))
  WITH CHECK (memberships.business_id::text = current_setting('app.business_id', true));

CREATE POLICY membership_enrollment_business_isolation
  ON membership_enrollment_idempotency
  USING (membership_enrollment_idempotency.business_id::text = current_setting('app.business_id', true))
  WITH CHECK (membership_enrollment_idempotency.business_id::text = current_setting('app.business_id', true));

-- down migration
DROP POLICY IF EXISTS membership_enrollment_business_isolation ON membership_enrollment_idempotency;
DROP POLICY IF EXISTS membership_business_isolation ON memberships;
ALTER TABLE membership_enrollment_idempotency DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON membership_enrollment_idempotency FROM loyalty_app;
REVOKE ALL PRIVILEGES ON memberships FROM loyalty_app;
DROP TRIGGER IF EXISTS membership_enrollment_idempotency_immutable ON membership_enrollment_idempotency;
DROP TRIGGER IF EXISTS membership_enrollment_idempotency_validation ON membership_enrollment_idempotency;
DROP FUNCTION IF EXISTS reject_membership_enrollment_mutation();
DROP FUNCTION IF EXISTS validate_membership_enrollment_idempotency();
DROP TRIGGER IF EXISTS membership_persistence_validation ON memberships;
DROP FUNCTION IF EXISTS validate_membership_persistence();
DROP TABLE IF EXISTS membership_enrollment_idempotency;
DROP TABLE IF EXISTS memberships;
