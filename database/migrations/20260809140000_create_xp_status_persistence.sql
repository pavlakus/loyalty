-- up migration
CREATE TABLE xp_accounts (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL UNIQUE REFERENCES memberships(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  current_xp bigint NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  lifetime_xp bigint NOT NULL DEFAULT 0 CHECK (lifetime_xp >= 0),
  membership_year_xp bigint NOT NULL DEFAULT 0 CHECK (membership_year_xp >= 0),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT xp_account_id_membership_unique UNIQUE (id, membership_id)
);

CREATE TABLE xp_transactions (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  xp_account_id uuid NOT NULL REFERENCES xp_accounts(id) ON DELETE RESTRICT,
  activity_id text NOT NULL CHECK (length(btrim(activity_id)) > 0),
  rule_id text NOT NULL CHECK (length(btrim(rule_id)) > 0),
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  program_configuration_version_id text NOT NULL REFERENCES loyalty_program_configuration_versions(id) ON DELETE RESTRICT,
  membership_year_id text NOT NULL CHECK (length(btrim(membership_year_id)) > 0),
  transaction_type text NOT NULL CHECK (transaction_type IN ('EARNED','REVERSED','ADJUSTED')),
  xp_amount bigint NOT NULL CHECK (xp_amount > 0),
  occurred_at timestamptz NOT NULL,
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_fingerprint text NOT NULL CHECK (length(btrim(request_fingerprint)) > 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT xp_transaction_idempotency_unique UNIQUE (business_id, idempotency_key),
  CONSTRAINT xp_transaction_rule_source_unique UNIQUE (business_id, membership_id, activity_id, rule_id, transaction_type)
);

CREATE TABLE status_history (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  from_status_level_id text NOT NULL CHECK (length(btrim(from_status_level_id)) > 0),
  to_status_level_id text NOT NULL CHECK (length(btrim(to_status_level_id)) > 0),
  membership_year_id text NOT NULL CHECK (length(btrim(membership_year_id)) > 0),
  program_configuration_version_id text NOT NULL REFERENCES loyalty_program_configuration_versions(id) ON DELETE RESTRICT,
  benefit_definition_ids jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(benefit_definition_ids) = 'array'),
  evaluated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT status_history_transition_unique UNIQUE (membership_id, membership_year_id, from_status_level_id, to_status_level_id, evaluated_at)
);

CREATE OR REPLACE FUNCTION validate_xp_account_context()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM memberships m JOIN loyalty_programs lp ON lp.id = m.loyalty_program_id WHERE m.id = NEW.membership_id AND m.xp_account_id = NEW.id AND m.business_id = NEW.business_id AND m.loyalty_program_id = NEW.loyalty_program_id AND lp.business_id = NEW.business_id) THEN
    RAISE EXCEPTION 'XP Account context does not match Membership and Program ownership';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER xp_account_context_validation BEFORE INSERT ON xp_accounts FOR EACH ROW EXECUTE FUNCTION validate_xp_account_context();

CREATE OR REPLACE FUNCTION reject_xp_history_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'XP history is immutable'; END; $$;
CREATE TRIGGER xp_transaction_immutable BEFORE UPDATE OR DELETE ON xp_transactions FOR EACH ROW EXECUTE FUNCTION reject_xp_history_mutation();
CREATE TRIGGER status_history_immutable BEFORE UPDATE OR DELETE ON status_history FOR EACH ROW EXECUTE FUNCTION reject_xp_history_mutation();

CREATE OR REPLACE FUNCTION append_xp_transaction(
  p_id uuid, p_business_id uuid, p_membership_id uuid, p_xp_account_id uuid,
  p_activity_id text, p_rule_id text, p_loyalty_program_id uuid,
  p_program_configuration_version_id text, p_membership_year_id text,
  p_transaction_type text, p_xp_amount bigint, p_occurred_at timestamptz,
  p_idempotency_key text, p_request_fingerprint text
)
RETURNS TABLE (xp_transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE existing_id uuid; existing_fingerprint text;
BEGIN
  IF p_business_id::text <> current_setting('app.business_id', true) THEN RAISE EXCEPTION 'XP tenant context is required'; END IF;
  IF p_transaction_type NOT IN ('EARNED','REVERSED','ADJUSTED') OR p_xp_amount IS NULL OR p_xp_amount <= 0 THEN RAISE EXCEPTION 'Invalid XP transaction'; END IF;
  IF NOT EXISTS (SELECT 1 FROM memberships m WHERE m.id = p_membership_id AND m.business_id = p_business_id AND m.xp_account_id = p_xp_account_id AND m.loyalty_program_id = p_loyalty_program_id) THEN RAISE EXCEPTION 'XP context does not match Membership'; END IF;
  INSERT INTO xp_transactions (id,business_id,membership_id,xp_account_id,activity_id,rule_id,loyalty_program_id,program_configuration_version_id,membership_year_id,transaction_type,xp_amount,occurred_at,idempotency_key,request_fingerprint)
  VALUES (p_id,p_business_id,p_membership_id,p_xp_account_id,p_activity_id,p_rule_id,p_loyalty_program_id,p_program_configuration_version_id,p_membership_year_id,p_transaction_type,p_xp_amount,p_occurred_at,p_idempotency_key,p_request_fingerprint)
  ON CONFLICT (business_id,idempotency_key) DO NOTHING RETURNING id INTO existing_id;
  IF NOT FOUND THEN
    SELECT id, request_fingerprint INTO existing_id, existing_fingerprint FROM xp_transactions WHERE business_id=p_business_id AND idempotency_key=p_idempotency_key FOR UPDATE;
    IF existing_fingerprint <> p_request_fingerprint THEN RAISE EXCEPTION 'XP idempotency key conflicts with stored request'; END IF;
    RETURN QUERY SELECT existing_id, true; RETURN;
  END IF;
  PERFORM 1 FROM xp_accounts WHERE id=p_xp_account_id AND business_id=p_business_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'XP Account was not found in tenant context'; END IF;
  IF p_transaction_type IN ('EARNED','ADJUSTED') THEN
    UPDATE xp_accounts SET current_xp=current_xp+p_xp_amount, lifetime_xp=lifetime_xp+p_xp_amount, membership_year_xp=membership_year_xp+p_xp_amount, version=version+1, updated_at=CURRENT_TIMESTAMP WHERE id=p_xp_account_id;
  ELSE
    UPDATE xp_accounts SET current_xp=current_xp-p_xp_amount, version=version+1, updated_at=CURRENT_TIMESTAMP WHERE id=p_xp_account_id AND current_xp >= p_xp_amount;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'XP Account has insufficient XP for reversal'; END IF;
  RETURN QUERY SELECT existing_id, false;
END; $$;

CREATE OR REPLACE FUNCTION record_status_transition(
  p_id uuid, p_business_id uuid, p_membership_id uuid, p_loyalty_program_id uuid,
  p_from_status_level_id text, p_to_status_level_id text, p_membership_year_id text,
  p_program_configuration_version_id text, p_benefit_definition_ids jsonb,
  p_evaluated_at timestamptz
)
RETURNS TABLE (status_history_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE existing_id uuid;
BEGIN
  IF p_business_id::text <> current_setting('app.business_id', true) THEN RAISE EXCEPTION 'Status tenant context is required'; END IF;
  PERFORM 1 FROM memberships WHERE id=p_membership_id AND business_id=p_business_id AND loyalty_program_id=p_loyalty_program_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Membership was not found in tenant context'; END IF;
  INSERT INTO status_history (id,business_id,membership_id,loyalty_program_id,from_status_level_id,to_status_level_id,membership_year_id,program_configuration_version_id,benefit_definition_ids,evaluated_at)
  VALUES (p_id,p_business_id,p_membership_id,p_loyalty_program_id,p_from_status_level_id,p_to_status_level_id,p_membership_year_id,p_program_configuration_version_id,p_benefit_definition_ids,p_evaluated_at)
  ON CONFLICT (membership_id,membership_year_id,from_status_level_id,to_status_level_id,evaluated_at) DO NOTHING RETURNING id INTO existing_id;
  IF NOT FOUND THEN SELECT id INTO existing_id FROM status_history WHERE membership_id=p_membership_id AND membership_year_id=p_membership_year_id AND from_status_level_id=p_from_status_level_id AND to_status_level_id=p_to_status_level_id AND evaluated_at=p_evaluated_at; RETURN QUERY SELECT existing_id,true; RETURN; END IF;
  UPDATE memberships SET status_level_id=p_to_status_level_id WHERE id=p_membership_id;
  RETURN QUERY SELECT existing_id,false;
END; $$;

GRANT SELECT, INSERT ON xp_accounts, xp_transactions, status_history TO loyalty_app;
GRANT EXECUTE ON FUNCTION append_xp_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,text,bigint,timestamptz,text,text) TO loyalty_app;
GRANT EXECUTE ON FUNCTION record_status_transition(uuid,uuid,uuid,uuid,text,text,text,text,jsonb,timestamptz) TO loyalty_app;
REVOKE ALL ON FUNCTION validate_xp_account_context(), reject_xp_history_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION append_xp_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,text,bigint,timestamptz,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_status_transition(uuid,uuid,uuid,uuid,text,text,text,text,jsonb,timestamptz) FROM PUBLIC;

ALTER TABLE xp_accounts ENABLE ROW LEVEL SECURITY; ALTER TABLE xp_accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY; ALTER TABLE xp_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY; ALTER TABLE status_history FORCE ROW LEVEL SECURITY;
CREATE POLICY xp_account_business_isolation ON xp_accounts USING (business_id::text=current_setting('app.business_id',true)) WITH CHECK (business_id::text=current_setting('app.business_id',true));
CREATE POLICY xp_transaction_business_isolation ON xp_transactions USING (business_id::text=current_setting('app.business_id',true)) WITH CHECK (business_id::text=current_setting('app.business_id',true));
CREATE POLICY status_history_business_isolation ON status_history USING (business_id::text=current_setting('app.business_id',true)) WITH CHECK (business_id::text=current_setting('app.business_id',true));

-- down migration
DROP POLICY IF EXISTS status_history_business_isolation ON status_history; DROP POLICY IF EXISTS xp_transaction_business_isolation ON xp_transactions; DROP POLICY IF EXISTS xp_account_business_isolation ON xp_accounts;
ALTER TABLE status_history DISABLE ROW LEVEL SECURITY; ALTER TABLE xp_transactions DISABLE ROW LEVEL SECURITY; ALTER TABLE xp_accounts DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS status_history_immutable ON status_history; DROP TRIGGER IF EXISTS xp_transaction_immutable ON xp_transactions; DROP TRIGGER IF EXISTS xp_account_context_validation ON xp_accounts;
DROP FUNCTION IF EXISTS record_status_transition(uuid,uuid,uuid,uuid,text,text,text,text,jsonb,timestamptz); DROP FUNCTION IF EXISTS append_xp_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,text,bigint,timestamptz,text,text); DROP FUNCTION IF EXISTS reject_xp_history_mutation(); DROP FUNCTION IF EXISTS validate_xp_account_context();
DROP TABLE IF EXISTS status_history; DROP TABLE IF EXISTS xp_transactions; DROP TABLE IF EXISTS xp_accounts;
