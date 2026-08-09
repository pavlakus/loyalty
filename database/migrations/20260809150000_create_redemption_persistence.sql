-- up migration
CREATE TABLE reward_definitions (
  id text PRIMARY KEY CHECK (length(btrim(id)) > 0),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  program_configuration_version_id text NOT NULL REFERENCES loyalty_program_configuration_versions(id) ON DELETE RESTRICT,
  reward_type text NOT NULL CHECK (reward_type IN ('FIXED_DISCOUNT','PERCENTAGE_DISCOUNT','FREE_PRODUCT','PARTNER_REWARD')),
  display_name text NOT NULL CHECK (length(btrim(display_name)) > 0),
  description text,
  points_cost bigint NOT NULL CHECK (points_cost > 0),
  enabled boolean NOT NULL DEFAULT true,
  eligible_status_level_ids jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(eligible_status_level_ids) = 'array'),
  required_benefit_definition_ids jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(required_benefit_definition_ids) = 'array'),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE redemptions (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  reward_account_id uuid NOT NULL REFERENCES reward_accounts(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  reward_definition_id text NOT NULL REFERENCES reward_definitions(id) ON DELETE RESTRICT,
  program_configuration_version_id text NOT NULL REFERENCES loyalty_program_configuration_versions(id) ON DELETE RESTRICT,
  points_cost bigint NOT NULL CHECK (points_cost > 0),
  state text NOT NULL CHECK (state IN ('RESERVED','CONFIRMED','CANCELLED','EXPIRED')),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_fingerprint text NOT NULL CHECK (length(btrim(request_fingerprint)) > 0),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  CONSTRAINT redemption_idempotency_unique UNIQUE (business_id, idempotency_key),
  CONSTRAINT redemption_state_time_check CHECK ((state = 'CONFIRMED') = (confirmed_at IS NOT NULL))
);
CREATE INDEX redemptions_membership_created_idx ON redemptions (membership_id, created_at DESC);

CREATE OR REPLACE FUNCTION reject_redemption_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF current_setting('app.redemption_transition', true) <> '1' THEN RAISE EXCEPTION 'Redemption history is immutable except through lifecycle commands'; END IF; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION reserve_redemption(
  p_id uuid, p_business_id uuid, p_membership_id uuid, p_reward_account_id uuid,
  p_loyalty_program_id uuid, p_reward_definition_id text,
  p_program_configuration_version_id text, p_created_at timestamptz,
  p_expires_at timestamptz, p_idempotency_key text, p_request_fingerprint text
)
RETURNS TABLE (redemption_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE cost bigint; existing_id uuid; existing_fp text; inserted boolean := false;
BEGIN
  IF p_business_id::text <> current_setting('app.business_id', true) THEN RAISE EXCEPTION 'Redemption tenant context is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM memberships WHERE id=p_membership_id AND business_id=p_business_id AND reward_account_id=p_reward_account_id AND loyalty_program_id=p_loyalty_program_id AND status='ACTIVE') THEN RAISE EXCEPTION 'Membership is not eligible for redemption'; END IF;
  SELECT points_cost INTO cost FROM reward_definitions WHERE id=p_reward_definition_id AND business_id=p_business_id AND loyalty_program_id=p_loyalty_program_id AND program_configuration_version_id=p_program_configuration_version_id AND enabled=true;
  IF cost IS NULL THEN RAISE EXCEPTION 'Reward Definition is unavailable'; END IF;
  INSERT INTO redemptions (id,business_id,membership_id,reward_account_id,loyalty_program_id,reward_definition_id,program_configuration_version_id,points_cost,state,idempotency_key,request_fingerprint,created_at,expires_at)
  VALUES (p_id,p_business_id,p_membership_id,p_reward_account_id,p_loyalty_program_id,p_reward_definition_id,p_program_configuration_version_id,cost,'RESERVED',p_idempotency_key,p_request_fingerprint,p_created_at,p_expires_at)
  ON CONFLICT (business_id,idempotency_key) DO NOTHING RETURNING id INTO existing_id;
  IF NOT FOUND THEN SELECT id,request_fingerprint INTO existing_id,existing_fp FROM redemptions WHERE business_id=p_business_id AND idempotency_key=p_idempotency_key FOR UPDATE; IF existing_fp<>p_request_fingerprint THEN RAISE EXCEPTION 'Redemption idempotency key conflicts with stored request'; END IF; RETURN QUERY SELECT existing_id,true; RETURN; END IF;
  PERFORM append_reward_ledger_transaction(p_id, p_business_id, p_membership_id, p_reward_account_id, 'redemption:'||p_id::text, 'redemption:'||p_id::text, p_loyalty_program_id, p_program_configuration_version_id, 'RESERVED', cost, p_created_at, 'redemption-reserve:'||p_id::text, p_request_fingerprint);
  RETURN QUERY SELECT existing_id,false;
END; $$;

CREATE OR REPLACE FUNCTION transition_redemption(
  p_redemption_id uuid, p_business_id uuid, p_ledger_transaction_id uuid,
  p_target_state text, p_transitioned_at timestamptz
)
RETURNS TABLE (redemption_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE r redemptions%ROWTYPE; ledger_type text; key_suffix text;
BEGIN
  IF p_business_id::text <> current_setting('app.business_id', true) THEN RAISE EXCEPTION 'Redemption tenant context is required'; END IF;
  SELECT * INTO r FROM redemptions WHERE id=p_redemption_id AND business_id=p_business_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Redemption was not found in tenant context'; END IF;
  IF r.state <> 'RESERVED' THEN
    IF (r.state='CONFIRMED' AND p_target_state='CONFIRMED') OR (r.state IN ('CANCELLED','EXPIRED') AND p_target_state=r.state) THEN RETURN QUERY SELECT r.id,true; RETURN; END IF;
    RAISE EXCEPTION 'Redemption transition is not allowed';
  END IF;
  IF p_target_state NOT IN ('CONFIRMED','CANCELLED','EXPIRED') THEN RAISE EXCEPTION 'Unsupported Redemption transition'; END IF;
  IF p_target_state='CONFIRMED' AND p_transitioned_at >= r.expires_at THEN RAISE EXCEPTION 'Redemption reservation has expired'; END IF;
  ledger_type := CASE WHEN p_target_state='CONFIRMED' THEN 'REDEEMED' ELSE 'RESERVATION_RELEASED' END;
  key_suffix := lower(p_target_state);
  PERFORM append_reward_ledger_transaction(p_ledger_transaction_id, p_business_id, r.membership_id, r.reward_account_id, 'redemption:'||r.id::text, 'redemption:'||r.id::text, r.loyalty_program_id, r.program_configuration_version_id, ledger_type, r.points_cost, p_transitioned_at, 'redemption-'||key_suffix||':'||r.id::text, r.request_fingerprint);
  PERFORM set_config('app.redemption_transition', '1', true);
  UPDATE redemptions SET state=p_target_state, confirmed_at=CASE WHEN p_target_state='CONFIRMED' THEN p_transitioned_at ELSE confirmed_at END, cancelled_at=CASE WHEN p_target_state IN ('CANCELLED','EXPIRED') THEN p_transitioned_at ELSE cancelled_at END WHERE id=r.id;
  RETURN QUERY SELECT r.id,false;
END; $$;

GRANT SELECT, INSERT ON reward_definitions, redemptions TO loyalty_app;
GRANT EXECUTE ON FUNCTION reserve_redemption(uuid,uuid,uuid,uuid,uuid,text,text,timestamptz,timestamptz,text,text) TO loyalty_app;
GRANT EXECUTE ON FUNCTION transition_redemption(uuid,uuid,uuid,text,timestamptz) TO loyalty_app;
REVOKE ALL ON FUNCTION reject_redemption_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION reserve_redemption(uuid,uuid,uuid,uuid,uuid,text,text,timestamptz,timestamptz,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION transition_redemption(uuid,uuid,uuid,text,timestamptz) FROM PUBLIC;
ALTER TABLE reward_definitions ENABLE ROW LEVEL SECURITY; ALTER TABLE reward_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY; ALTER TABLE redemptions FORCE ROW LEVEL SECURITY;
CREATE POLICY reward_definition_business_isolation ON reward_definitions USING (business_id::text=current_setting('app.business_id',true)) WITH CHECK (business_id::text=current_setting('app.business_id',true));
CREATE POLICY redemption_business_isolation ON redemptions USING (business_id::text=current_setting('app.business_id',true)) WITH CHECK (business_id::text=current_setting('app.business_id',true));
CREATE TRIGGER redemption_immutable BEFORE UPDATE OR DELETE ON redemptions FOR EACH ROW EXECUTE FUNCTION reject_redemption_mutation();

-- down migration
DROP POLICY IF EXISTS redemption_business_isolation ON redemptions; DROP POLICY IF EXISTS reward_definition_business_isolation ON reward_definitions;
ALTER TABLE redemptions DISABLE ROW LEVEL SECURITY; ALTER TABLE reward_definitions DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS redemption_immutable ON redemptions;
DROP FUNCTION IF EXISTS transition_redemption(uuid,uuid,uuid,text,timestamptz); DROP FUNCTION IF EXISTS reserve_redemption(uuid,uuid,uuid,uuid,uuid,text,text,timestamptz,timestamptz,text,text); DROP FUNCTION IF EXISTS reject_redemption_mutation();
DROP TABLE IF EXISTS redemptions; DROP TABLE IF EXISTS reward_definitions;
