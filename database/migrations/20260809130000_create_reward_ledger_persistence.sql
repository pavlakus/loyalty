-- up migration
CREATE TABLE reward_accounts (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  available_points bigint NOT NULL DEFAULT 0 CHECK (available_points >= 0),
  pending_points bigint NOT NULL DEFAULT 0 CHECK (pending_points >= 0),
  reserved_points bigint NOT NULL DEFAULT 0 CHECK (reserved_points >= 0),
  redeemed_points bigint NOT NULL DEFAULT 0 CHECK (redeemed_points >= 0),
  expired_points bigint NOT NULL DEFAULT 0 CHECK (expired_points >= 0),
  reversed_points bigint NOT NULL DEFAULT 0 CHECK (reversed_points >= 0),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reward_account_membership_unique UNIQUE (membership_id),
  CONSTRAINT reward_account_id_membership_unique UNIQUE (id, membership_id)
);

CREATE TABLE reward_ledger_transactions (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  reward_account_id uuid NOT NULL REFERENCES reward_accounts(id) ON DELETE RESTRICT,
  activity_id text NOT NULL CHECK (length(btrim(activity_id)) > 0),
  earning_decision_id text NOT NULL CHECK (length(btrim(earning_decision_id)) > 0),
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  program_configuration_version_id text NOT NULL REFERENCES loyalty_program_configuration_versions(id) ON DELETE RESTRICT,
  transaction_type text NOT NULL CHECK (transaction_type IN ('EARNED','PENDING','RELEASED','RESERVED','RESERVATION_RELEASED','REDEEMED','REDEMPTION_CANCELLED','EXPIRED','REVERSED')),
  points bigint NOT NULL CHECK (points > 0),
  occurred_at timestamptz NOT NULL,
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_fingerprint text NOT NULL CHECK (length(btrim(request_fingerprint)) > 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reward_ledger_idempotency_unique UNIQUE (business_id, idempotency_key),
  CONSTRAINT reward_ledger_earning_source_unique UNIQUE (business_id, earning_decision_id, transaction_type)
);

CREATE INDEX reward_ledger_account_occurred_idx
  ON reward_ledger_transactions (reward_account_id, occurred_at, id);
CREATE INDEX reward_ledger_business_occurred_idx
  ON reward_ledger_transactions (business_id, occurred_at);

CREATE OR REPLACE FUNCTION validate_reward_account_context()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.loyalty_programs lp ON lp.id = m.loyalty_program_id
    WHERE m.id = NEW.membership_id
      AND m.reward_account_id = NEW.id
      AND m.business_id = NEW.business_id
      AND m.loyalty_program_id = NEW.loyalty_program_id
      AND lp.business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION 'Reward Account context does not match Membership and Loyalty Program ownership';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reward_account_context_validation
  BEFORE INSERT ON reward_accounts FOR EACH ROW EXECUTE FUNCTION validate_reward_account_context();

CREATE OR REPLACE FUNCTION reject_reward_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Posted Reward Ledger history is immutable'; END;
$$;

CREATE TRIGGER reward_ledger_immutable
  BEFORE UPDATE OR DELETE ON reward_ledger_transactions
  FOR EACH ROW EXECUTE FUNCTION reject_reward_ledger_mutation();

CREATE OR REPLACE FUNCTION append_reward_ledger_transaction(
  p_id uuid,
  p_business_id uuid,
  p_membership_id uuid,
  p_reward_account_id uuid,
  p_activity_id text,
  p_earning_decision_id text,
  p_loyalty_program_id uuid,
  p_program_configuration_version_id text,
  p_transaction_type text,
  p_points bigint,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_request_fingerprint text
)
RETURNS TABLE (ledger_transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $$
DECLARE
  existing_id uuid;
  existing_fingerprint text;
  inserted boolean := false;
BEGIN
  IF p_business_id::text <> current_setting('app.business_id', true) THEN
    RAISE EXCEPTION 'Reward Ledger tenant context is required';
  END IF;
  IF p_points IS NULL OR p_points <= 0 OR p_transaction_type NOT IN ('EARNED','PENDING','RELEASED','RESERVED','RESERVATION_RELEASED','REDEEMED','REDEMPTION_CANCELLED','EXPIRED','REVERSED') THEN
    RAISE EXCEPTION 'Invalid Reward Ledger transaction';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.id = p_membership_id AND m.business_id = p_business_id
      AND m.reward_account_id = p_reward_account_id
      AND m.loyalty_program_id = p_loyalty_program_id
  ) THEN
    RAISE EXCEPTION 'Reward Ledger context does not match Membership';
  END IF;

  INSERT INTO public.reward_ledger_transactions (
    id, business_id, membership_id, reward_account_id, activity_id,
    earning_decision_id, loyalty_program_id, program_configuration_version_id,
    transaction_type, points, occurred_at, idempotency_key, request_fingerprint
  ) VALUES (
    p_id, p_business_id, p_membership_id, p_reward_account_id, p_activity_id,
    p_earning_decision_id, p_loyalty_program_id, p_program_configuration_version_id,
    p_transaction_type, p_points, p_occurred_at, p_idempotency_key, p_request_fingerprint
  ) ON CONFLICT (business_id, idempotency_key) DO NOTHING
  RETURNING id INTO existing_id;

  IF FOUND THEN
    inserted := true;
  ELSE
    SELECT id, request_fingerprint INTO existing_id, existing_fingerprint
      FROM public.reward_ledger_transactions
     WHERE business_id = p_business_id AND idempotency_key = p_idempotency_key
     FOR UPDATE;
    IF existing_fingerprint <> p_request_fingerprint THEN
      RAISE EXCEPTION 'Reward Ledger idempotency key conflicts with stored request';
    END IF;
    RETURN QUERY SELECT existing_id, true;
    RETURN;
  END IF;

  PERFORM 1 FROM public.reward_accounts
   WHERE id = p_reward_account_id AND business_id = p_business_id
   FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reward Account was not found in tenant context'; END IF;

  IF p_transaction_type IN ('EARNED','RELEASED','REDEMPTION_CANCELLED') THEN
    UPDATE public.reward_accounts SET available_points = available_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id;
  ELSIF p_transaction_type = 'PENDING' THEN
    UPDATE public.reward_accounts SET pending_points = pending_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id;
  ELSIF p_transaction_type = 'RESERVED' THEN
    UPDATE public.reward_accounts SET available_points = available_points - p_points, reserved_points = reserved_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id AND available_points >= p_points;
  ELSIF p_transaction_type = 'RESERVATION_RELEASED' THEN
    UPDATE public.reward_accounts SET reserved_points = reserved_points - p_points, available_points = available_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id AND reserved_points >= p_points;
  ELSIF p_transaction_type = 'REDEEMED' THEN
    UPDATE public.reward_accounts SET reserved_points = reserved_points - p_points, redeemed_points = redeemed_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id AND reserved_points >= p_points;
  ELSIF p_transaction_type = 'EXPIRED' THEN
    UPDATE public.reward_accounts SET available_points = available_points - p_points, expired_points = expired_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id AND available_points >= p_points;
  ELSIF p_transaction_type = 'REVERSED' THEN
    UPDATE public.reward_accounts SET available_points = available_points - p_points, reversed_points = reversed_points + p_points, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = p_reward_account_id AND available_points >= p_points;
  END IF;
  IF NOT FOUND AND p_transaction_type IN ('RESERVED','RESERVATION_RELEASED','REDEEMED','EXPIRED','REVERSED') THEN
    RAISE EXCEPTION 'Reward Account has insufficient points for transaction';
  END IF;
  RETURN QUERY SELECT existing_id, false;
END;
$$;

GRANT SELECT, INSERT ON reward_accounts, reward_ledger_transactions TO loyalty_app;
GRANT EXECUTE ON FUNCTION append_reward_ledger_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,bigint,timestamptz,text,text) TO loyalty_app;
REVOKE ALL ON FUNCTION validate_reward_account_context() FROM PUBLIC;
REVOKE ALL ON FUNCTION reject_reward_ledger_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION append_reward_ledger_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,bigint,timestamptz,text,text) FROM PUBLIC;

ALTER TABLE reward_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger_transactions FORCE ROW LEVEL SECURITY;

CREATE POLICY reward_account_business_isolation ON reward_accounts
  USING (business_id::text = current_setting('app.business_id', true))
  WITH CHECK (business_id::text = current_setting('app.business_id', true));
CREATE POLICY reward_ledger_business_isolation ON reward_ledger_transactions
  USING (business_id::text = current_setting('app.business_id', true))
  WITH CHECK (business_id::text = current_setting('app.business_id', true));

-- down migration
DROP POLICY IF EXISTS reward_ledger_business_isolation ON reward_ledger_transactions;
DROP POLICY IF EXISTS reward_account_business_isolation ON reward_accounts;
ALTER TABLE reward_ledger_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_accounts DISABLE ROW LEVEL SECURITY;
REVOKE ALL ON FUNCTION append_reward_ledger_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,bigint,timestamptz,text,text) FROM loyalty_app;
DROP TRIGGER IF EXISTS reward_ledger_immutable ON reward_ledger_transactions;
DROP TRIGGER IF EXISTS reward_account_context_validation ON reward_accounts;
DROP FUNCTION IF EXISTS append_reward_ledger_transaction(uuid,uuid,uuid,uuid,text,text,uuid,text,text,bigint,timestamptz,text,text);
DROP FUNCTION IF EXISTS reject_reward_ledger_mutation();
DROP FUNCTION IF EXISTS validate_reward_account_context();
DROP TABLE IF EXISTS reward_ledger_transactions;
DROP TABLE IF EXISTS reward_accounts;
