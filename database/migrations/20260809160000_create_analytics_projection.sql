-- up migration
CREATE TABLE analytics_metric_observations (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  metric_name text NOT NULL CHECK (metric_name IN (
    'totalMembers','activeMembers','newMembers','suspendedMembers','closedMembers',
    'receiptCount','qualifyingReceiptCount','qualifyingPurchaseAmount',
    'pointsEarned','pointsRedeemed','pointsExpired',
    'redemptionCount','redemptionPoints','uniqueRedeemingMembers',
    'activeMembersWithActivity','earningMembers','redeemingMembers','membersByStatusLevel'
  )),
  source_type text NOT NULL CHECK (source_type IN ('MEMBERSHIP','RECEIPT','REWARD_LEDGER','REDEMPTION','STATUS')),
  source_id text NOT NULL CHECK (length(btrim(source_id)) > 0),
  program_configuration_version_id text REFERENCES loyalty_program_configuration_versions(id) ON DELETE RESTRICT,
  status_level_id text,
  currency_code text CHECK (currency_code IS NULL OR currency_code ~ '^[A-Z]{3}$'),
  metric_value bigint NOT NULL CHECK (metric_value >= 0),
  occurred_at timestamptz NOT NULL,
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_fingerprint text NOT NULL CHECK (length(btrim(request_fingerprint)) > 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (business_id, idempotency_key)
);
CREATE INDEX analytics_metric_period_idx ON analytics_metric_observations (business_id, loyalty_program_id, occurred_at, metric_name);

CREATE OR REPLACE FUNCTION reject_analytics_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Analytics projection history is append-only';
END; $$;

CREATE OR REPLACE FUNCTION record_analytics_observation(
  p_id uuid, p_business_id uuid, p_brand_id uuid, p_loyalty_program_id uuid,
  p_metric_name text, p_source_type text, p_source_id text,
  p_configuration_version_id text, p_status_level_id text, p_currency_code text,
  p_metric_value bigint, p_occurred_at timestamptz, p_idempotency_key text,
  p_request_fingerprint text
)
RETURNS TABLE (observation_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE existing_id uuid; existing_fp text;
BEGIN
  IF p_business_id::text <> current_setting('app.business_id', true) THEN
    RAISE EXCEPTION 'Analytics tenant context is required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM brands WHERE id=p_brand_id AND business_id=p_business_id) THEN
    RAISE EXCEPTION 'Analytics Brand is not in tenant context';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM loyalty_programs WHERE id=p_loyalty_program_id AND business_id=p_business_id AND brand_id=p_brand_id) THEN
    RAISE EXCEPTION 'Analytics Loyalty Program is not in tenant context';
  END IF;
  INSERT INTO analytics_metric_observations (
    id,business_id,brand_id,loyalty_program_id,metric_name,source_type,source_id,
    program_configuration_version_id,status_level_id,currency_code,metric_value,
    occurred_at,idempotency_key,request_fingerprint
  ) VALUES (
    p_id,p_business_id,p_brand_id,p_loyalty_program_id,p_metric_name,p_source_type,p_source_id,
    p_configuration_version_id,p_status_level_id,p_currency_code,p_metric_value,
    p_occurred_at,p_idempotency_key,p_request_fingerprint
  ) ON CONFLICT (business_id,idempotency_key) DO NOTHING RETURNING id INTO existing_id;
  IF NOT FOUND THEN
    SELECT id, request_fingerprint INTO existing_id, existing_fp
      FROM analytics_metric_observations
      WHERE business_id=p_business_id AND idempotency_key=p_idempotency_key
      FOR UPDATE;
    IF existing_fp <> p_request_fingerprint THEN
      RAISE EXCEPTION 'Analytics idempotency key conflicts with stored observation';
    END IF;
    RETURN QUERY SELECT existing_id, true;
    RETURN;
  END IF;
  RETURN QUERY SELECT existing_id, false;
END; $$;

CREATE OR REPLACE FUNCTION query_analytics_overview(
  p_business_id uuid, p_loyalty_program_id uuid, p_from timestamptz, p_to timestamptz
)
RETURNS TABLE (metric_name text, currency_code text, metric_value bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT a.metric_name, a.currency_code, COALESCE(SUM(a.metric_value),0)::bigint
  FROM analytics_metric_observations a
  WHERE a.business_id=p_business_id
    AND a.loyalty_program_id=p_loyalty_program_id
    AND a.occurred_at >= p_from AND a.occurred_at < p_to
    AND p_business_id::text = current_setting('app.business_id', true)
  GROUP BY a.metric_name, a.currency_code
  ORDER BY a.metric_name, a.currency_code;
$$;

GRANT SELECT ON analytics_metric_observations TO loyalty_app;
GRANT EXECUTE ON FUNCTION record_analytics_observation(uuid,uuid,uuid,uuid,text,text,text,text,text,text,bigint,timestamptz,text,text) TO loyalty_app;
GRANT EXECUTE ON FUNCTION query_analytics_overview(uuid,uuid,timestamptz,timestamptz) TO loyalty_app;
REVOKE INSERT, UPDATE, DELETE ON analytics_metric_observations FROM loyalty_app;
REVOKE ALL ON FUNCTION record_analytics_observation(uuid,uuid,uuid,uuid,text,text,text,text,text,text,bigint,timestamptz,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION query_analytics_overview(uuid,uuid,timestamptz,timestamptz) FROM PUBLIC;
ALTER TABLE analytics_metric_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metric_observations FORCE ROW LEVEL SECURITY;
CREATE POLICY analytics_business_isolation ON analytics_metric_observations
  USING (business_id::text=current_setting('app.business_id',true));
CREATE TRIGGER analytics_append_only BEFORE UPDATE OR DELETE ON analytics_metric_observations
  FOR EACH ROW EXECUTE FUNCTION reject_analytics_mutation();

-- down migration
DROP POLICY IF EXISTS analytics_business_isolation ON analytics_metric_observations;
ALTER TABLE analytics_metric_observations DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS analytics_append_only ON analytics_metric_observations;
DROP FUNCTION IF EXISTS query_analytics_overview(uuid,uuid,timestamptz,timestamptz);
DROP FUNCTION IF EXISTS record_analytics_observation(uuid,uuid,uuid,uuid,text,text,text,text,text,text,bigint,timestamptz,text,text);
DROP FUNCTION IF EXISTS reject_analytics_mutation();
DROP TABLE IF EXISTS analytics_metric_observations;
