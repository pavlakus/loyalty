-- up migration
-- Customer remains global. Operational access is explicitly purpose-scoped and
-- is granted only through the current Business's participation boundary.
CREATE TABLE uat_business_actors (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  token_digest text NOT NULL UNIQUE CHECK (length(btrim(token_digest)) > 0),
  role text NOT NULL CHECK (role = 'UAT_BUSINESS_ACTOR'),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION resolve_authentication_session(p_token_digest text)
RETURNS TABLE (session_id uuid, customer_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT s.id, s.customer_id
    FROM public.authentication_sessions s
   WHERE s.token_digest = p_token_digest
     AND s.revoked_at IS NULL
     AND s.expires_at > CURRENT_TIMESTAMP;
$$;

CREATE OR REPLACE FUNCTION resolve_uat_business_actor(p_token_digest text)
RETURNS TABLE (actor_id uuid, business_id uuid, role text)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT a.id, a.business_id, a.role
    FROM public.uat_business_actors a
   WHERE a.token_digest = p_token_digest
     AND a.expires_at > CURRENT_TIMESTAMP;
$$;

GRANT SELECT, INSERT ON uat_business_actors TO loyalty_app;
GRANT EXECUTE ON FUNCTION resolve_authentication_session(text) TO loyalty_app;
GRANT EXECUTE ON FUNCTION resolve_uat_business_actor(text) TO loyalty_app;
ALTER TABLE uat_business_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE uat_business_actors FORCE ROW LEVEL SECURITY;
CREATE POLICY uat_business_actor_scope ON uat_business_actors
  USING (business_id::text = current_setting('app.business_id', true))
  WITH CHECK (business_id::text = current_setting('app.business_id', true));

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
GRANT SELECT ON customers, customer_profiles TO loyalty_app;
CREATE POLICY customer_global_self_or_loyalty_purpose ON customers
  USING (
    id::text = current_setting('app.customer_id', true)
    OR (
      current_setting('app.access_purpose', true) = 'LOYALTY_OPERATIONS'
      AND EXISTS (
        SELECT 1 FROM memberships m
         WHERE m.customer_id = customers.id
           AND m.business_id::text = current_setting('app.business_id', true)
      )
    )
  );

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles FORCE ROW LEVEL SECURITY;
CREATE POLICY customer_profile_global_self_or_loyalty_purpose ON customer_profiles
  USING (
    customer_id::text = current_setting('app.customer_id', true)
    OR (
      current_setting('app.access_purpose', true) = 'LOYALTY_OPERATIONS'
      AND EXISTS (
        SELECT 1 FROM memberships m
         WHERE m.customer_id = customer_profiles.customer_id
           AND m.business_id::text = current_setting('app.business_id', true)
      )
    )
  );

-- down migration
DROP POLICY IF EXISTS customer_profile_global_self_or_loyalty_purpose ON customer_profiles;
ALTER TABLE customer_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customer_global_self_or_loyalty_purpose ON customers;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS uat_business_actor_scope ON uat_business_actors;
ALTER TABLE uat_business_actors DISABLE ROW LEVEL SECURITY;
DROP FUNCTION IF EXISTS resolve_uat_business_actor(text);
DROP FUNCTION IF EXISTS resolve_authentication_session(text);
DROP TABLE IF EXISTS uat_business_actors;
