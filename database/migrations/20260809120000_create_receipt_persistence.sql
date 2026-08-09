-- up migration
CREATE TABLE receipts (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  loyalty_program_id uuid NOT NULL REFERENCES loyalty_programs(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  location_id text NOT NULL CHECK (length(btrim(location_id)) > 0),
  receipt_number text NOT NULL CHECK (length(btrim(receipt_number)) > 0),
  source_id text NOT NULL CHECK (length(btrim(source_id)) > 0),
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'ACCEPTED' CHECK (status = 'ACCEPTED'),
  CONSTRAINT receipts_business_source_unique UNIQUE (business_id, source_id)
);

CREATE INDEX receipts_business_occurred_idx ON receipts (business_id, occurred_at DESC);
CREATE INDEX receipts_membership_occurred_idx ON receipts (membership_id, occurred_at DESC);

CREATE TABLE receipt_ingestion_idempotency (
  id uuid PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_fingerprint text NOT NULL CHECK (length(btrim(request_fingerprint)) > 0),
  receipt_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT receipt_ingestion_idempotency_unique UNIQUE (business_id, idempotency_key),
  CONSTRAINT receipt_ingestion_receipt_fk FOREIGN KEY (receipt_id)
    REFERENCES receipts(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE receipt_cancellations (
  id uuid PRIMARY KEY,
  receipt_id uuid NOT NULL UNIQUE REFERENCES receipts(id) ON DELETE RESTRICT,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  reason text NOT NULL CHECK (length(btrim(reason)) > 0),
  location_id text NOT NULL CHECK (length(btrim(location_id)) > 0),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  cancelled_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT receipt_cancellation_idempotency_unique UNIQUE (business_id, idempotency_key)
);

CREATE OR REPLACE FUNCTION validate_receipt_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.memberships m
      JOIN public.loyalty_programs lp ON lp.id = m.loyalty_program_id
     WHERE m.id = NEW.membership_id
       AND m.business_id = NEW.business_id
       AND m.brand_id = NEW.brand_id
       AND m.loyalty_program_id = NEW.loyalty_program_id
       AND lp.business_id = NEW.business_id
       AND lp.brand_id = NEW.brand_id
  ) THEN
    RAISE EXCEPTION 'Receipt context does not match Membership and Loyalty Program ownership';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER receipt_context_validation
  BEFORE INSERT ON receipts
  FOR EACH ROW EXECUTE FUNCTION validate_receipt_context();

CREATE OR REPLACE FUNCTION reject_receipt_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Accepted Receipt history is immutable';
END;
$$;

CREATE TRIGGER receipt_immutable
  BEFORE UPDATE OR DELETE ON receipts
  FOR EACH ROW EXECUTE FUNCTION reject_receipt_mutation();

CREATE OR REPLACE FUNCTION record_receipt_with_outbox(
  p_id uuid,
  p_business_id uuid,
  p_brand_id uuid,
  p_loyalty_program_id uuid,
  p_membership_id uuid,
  p_location_id text,
  p_receipt_number text,
  p_source_id text,
  p_amount_minor bigint,
  p_currency char(3),
  p_occurred_at timestamptz,
  p_created_at timestamptz,
  p_idempotency_key text,
  p_request_fingerprint text,
  p_event_payload jsonb
)
RETURNS TABLE (receipt_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  existing_receipt uuid;
  existing_fingerprint text;
  inserted_idempotency boolean := false;
BEGIN
  IF p_business_id::text <> current_setting('app.tenant_id', true) THEN
    RAISE EXCEPTION 'Receipt tenant context is required';
  END IF;
  IF jsonb_typeof(p_event_payload) <> 'object' THEN
    RAISE EXCEPTION 'Receipt event payload must be an object';
  END IF;

  INSERT INTO public.receipt_ingestion_idempotency (
    id, business_id, idempotency_key, request_fingerprint, receipt_id
  ) VALUES (
    p_id, p_business_id, p_idempotency_key, p_request_fingerprint, p_id
  ) ON CONFLICT (business_id, idempotency_key) DO NOTHING
    RETURNING id INTO existing_receipt;

  IF FOUND THEN
    inserted_idempotency := true;
  END IF;

  IF NOT inserted_idempotency THEN
    SELECT i.receipt_id, i.request_fingerprint
      INTO existing_receipt, existing_fingerprint
      FROM public.receipt_ingestion_idempotency i
     WHERE i.business_id = p_business_id AND i.idempotency_key = p_idempotency_key
     FOR UPDATE;

    IF existing_fingerprint <> p_request_fingerprint THEN
      RAISE EXCEPTION 'Receipt idempotency key conflicts with the stored request';
    END IF;
    RETURN QUERY SELECT existing_receipt, true;
    RETURN;
  END IF;

  INSERT INTO public.receipts (
    id, business_id, brand_id, loyalty_program_id, membership_id,
    location_id, receipt_number, source_id, amount_minor, currency,
    occurred_at, created_at
  ) VALUES (
    p_id, p_business_id, p_brand_id, p_loyalty_program_id, p_membership_id,
    p_location_id, p_receipt_number, p_source_id, p_amount_minor, p_currency,
    p_occurred_at, p_created_at
  );

  INSERT INTO public.outbox_events (
    id, tenant_id, event_name, event_version, aggregate_type, aggregate_id,
    aggregate_version, payload, correlation_id, idempotency_key, occurred_at
  ) VALUES (
    p_id, p_business_id::text, 'ReceiptRecorded', 1, 'Receipt', p_id::text,
    1, p_event_payload, p_idempotency_key, p_idempotency_key, p_occurred_at
  );

  RETURN QUERY SELECT p_id, false;
END;
$$;

CREATE OR REPLACE FUNCTION cancel_receipt_with_outbox(
  p_id uuid,
  p_receipt_id uuid,
  p_business_id uuid,
  p_reason text,
  p_location_id text,
  p_idempotency_key text,
  p_cancelled_at timestamptz,
  p_event_payload jsonb
)
RETURNS TABLE (cancellation_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  existing_cancellation uuid;
BEGIN
  IF p_business_id::text <> current_setting('app.tenant_id', true) THEN
    RAISE EXCEPTION 'Receipt cancellation tenant context is required';
  END IF;
  IF jsonb_typeof(p_event_payload) <> 'object' THEN
    RAISE EXCEPTION 'Receipt cancellation event payload must be an object';
  END IF;
  SELECT c.id INTO existing_cancellation
    FROM public.receipt_cancellations c
   WHERE c.business_id = p_business_id AND c.idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF existing_cancellation IS NOT NULL THEN
    RETURN QUERY SELECT existing_cancellation, true;
    RETURN;
  END IF;

  INSERT INTO public.receipt_cancellations (
    id, receipt_id, business_id, reason, location_id, idempotency_key, cancelled_at
  ) VALUES (
    p_id, p_receipt_id, p_business_id, p_reason, p_location_id, p_idempotency_key, p_cancelled_at
  );
  INSERT INTO public.outbox_events (
    id, tenant_id, event_name, event_version, aggregate_type, aggregate_id,
    aggregate_version, payload, correlation_id, idempotency_key, occurred_at
  ) VALUES (
    p_id, p_business_id::text, 'ReceiptCancelled', 1, 'Receipt', p_receipt_id::text,
    2, p_event_payload, p_idempotency_key, p_idempotency_key, p_cancelled_at
  );
  RETURN QUERY SELECT p_id, false;
END;
$$;

GRANT SELECT, INSERT ON receipts, receipt_ingestion_idempotency, receipt_cancellations TO loyalty_app;
GRANT EXECUTE ON FUNCTION record_receipt_with_outbox(uuid, uuid, uuid, uuid, uuid, text, text, text, bigint, char, timestamptz, timestamptz, text, text, jsonb) TO loyalty_app;
GRANT EXECUTE ON FUNCTION cancel_receipt_with_outbox(uuid, uuid, uuid, text, text, text, timestamptz, jsonb) TO loyalty_app;
REVOKE ALL ON FUNCTION validate_receipt_context() FROM PUBLIC;
REVOKE ALL ON FUNCTION reject_receipt_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION record_receipt_with_outbox(uuid, uuid, uuid, uuid, uuid, text, text, text, bigint, char, timestamptz, timestamptz, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_receipt_with_outbox(uuid, uuid, uuid, text, text, text, timestamptz, jsonb) FROM PUBLIC;

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_ingestion_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY receipt_business_isolation ON receipts
  USING (business_id::text = current_setting('app.tenant_id', true))
  WITH CHECK (business_id::text = current_setting('app.tenant_id', true));
CREATE POLICY receipt_idempotency_business_isolation ON receipt_ingestion_idempotency
  USING (business_id::text = current_setting('app.tenant_id', true))
  WITH CHECK (business_id::text = current_setting('app.tenant_id', true));
CREATE POLICY receipt_cancellation_business_isolation ON receipt_cancellations
  USING (business_id::text = current_setting('app.tenant_id', true))
  WITH CHECK (business_id::text = current_setting('app.tenant_id', true));

-- down migration
DROP POLICY IF EXISTS receipt_cancellation_business_isolation ON receipt_cancellations;
DROP POLICY IF EXISTS receipt_idempotency_business_isolation ON receipt_ingestion_idempotency;
DROP POLICY IF EXISTS receipt_business_isolation ON receipts;
ALTER TABLE receipt_cancellations DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_ingestion_idempotency DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON receipts, receipt_ingestion_idempotency, receipt_cancellations FROM loyalty_app;
REVOKE EXECUTE ON FUNCTION record_receipt_with_outbox(uuid, uuid, uuid, uuid, uuid, text, text, text, bigint, char, timestamptz, timestamptz, text, text, jsonb) FROM loyalty_app;
REVOKE EXECUTE ON FUNCTION cancel_receipt_with_outbox(uuid, uuid, uuid, text, text, text, timestamptz, jsonb) FROM loyalty_app;
DROP TRIGGER IF EXISTS receipt_immutable ON receipts;
DROP TRIGGER IF EXISTS receipt_context_validation ON receipts;
DROP FUNCTION IF EXISTS reject_receipt_mutation();
DROP FUNCTION IF EXISTS validate_receipt_context();
DROP FUNCTION IF EXISTS record_receipt_with_outbox(uuid, uuid, uuid, uuid, uuid, text, text, text, bigint, char, timestamptz, timestamptz, text, text, jsonb);
DROP FUNCTION IF EXISTS cancel_receipt_with_outbox(uuid, uuid, uuid, text, text, text, timestamptz, jsonb);
DROP TABLE IF EXISTS receipt_cancellations;
DROP TABLE IF EXISTS receipt_ingestion_idempotency;
DROP TABLE IF EXISTS receipts;
