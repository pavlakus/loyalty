-- up migration
-- Generic transactional outbox foundation. Domain consumers and worker
-- orchestration remain outside LP-000010.
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY,
  tenant_id text NOT NULL CHECK (length(btrim(tenant_id)) > 0),
  event_name text NOT NULL CHECK (length(btrim(event_name)) > 0),
  event_version integer NOT NULL CHECK (event_version > 0),
  aggregate_type text NOT NULL CHECK (length(btrim(aggregate_type)) > 0),
  aggregate_id text NOT NULL CHECK (length(btrim(aggregate_id)) > 0),
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  correlation_id text NOT NULL CHECK (length(btrim(correlation_id)) > 0),
  causation_id text,
  idempotency_key text,
  occurred_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  claimed_by text,
  claimed_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT outbox_completed_state_check CHECK (
    (status = 'COMPLETED') = (completed_at IS NOT NULL)
  ),
  CONSTRAINT outbox_claimed_state_check CHECK (
    (status = 'PROCESSING') = (claimed_by IS NOT NULL AND claimed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX outbox_event_idempotency_unique
  ON outbox_events (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX outbox_claim_ready_idx
  ON outbox_events (status, next_attempt_at, created_at)
  WHERE status IN ('PENDING', 'FAILED');
CREATE INDEX outbox_aggregate_order_idx
  ON outbox_events (aggregate_type, aggregate_id, aggregate_version);

CREATE OR REPLACE FUNCTION reject_outbox_payload_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id <> OLD.id
     OR NEW.tenant_id <> OLD.tenant_id
     OR NEW.event_name <> OLD.event_name
     OR NEW.event_version <> OLD.event_version
     OR NEW.aggregate_type <> OLD.aggregate_type
     OR NEW.aggregate_id <> OLD.aggregate_id
     OR NEW.aggregate_version <> OLD.aggregate_version
     OR NEW.payload <> OLD.payload
     OR NEW.correlation_id <> OLD.correlation_id
     OR NEW.causation_id IS DISTINCT FROM OLD.causation_id
     OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
     OR NEW.occurred_at <> OLD.occurred_at
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Outbox event identity and payload are immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER outbox_payload_immutable
  BEFORE UPDATE ON outbox_events
  FOR EACH ROW EXECUTE FUNCTION reject_outbox_payload_mutation();

CREATE OR REPLACE FUNCTION claim_outbox_events(
  p_worker_id text,
  p_limit integer DEFAULT 10,
  p_now timestamptz DEFAULT CURRENT_TIMESTAMP
)
RETURNS SETOF outbox_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF p_worker_id IS NULL OR length(btrim(p_worker_id)) = 0 THEN
    RAISE EXCEPTION 'Outbox worker identity is required';
  END IF;
  IF p_limit < 1 OR p_limit > 1000 THEN
    RAISE EXCEPTION 'Outbox claim limit is outside the allowed range';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT id
      FROM public.outbox_events
     WHERE status IN ('PENDING', 'FAILED')
       AND next_attempt_at <= p_now
     ORDER BY created_at, id
     FOR UPDATE SKIP LOCKED
     LIMIT p_limit
  )
  UPDATE public.outbox_events event
     SET status = 'PROCESSING',
         attempt_count = event.attempt_count + 1,
         claimed_by = p_worker_id,
         claimed_at = p_now,
         completed_at = NULL
    FROM candidates
   WHERE event.id = candidates.id
  RETURNING event.*;
END;
$$;

CREATE OR REPLACE FUNCTION complete_outbox_event(
  p_event_id uuid,
  p_worker_id text,
  p_completed_at timestamptz DEFAULT CURRENT_TIMESTAMP
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  changed boolean;
BEGIN
  UPDATE public.outbox_events
     SET status = 'COMPLETED', completed_at = p_completed_at,
         claimed_by = NULL, claimed_at = NULL, next_attempt_at = p_completed_at
   WHERE id = p_event_id AND status = 'PROCESSING' AND claimed_by = p_worker_id;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed;
END;
$$;

CREATE OR REPLACE FUNCTION fail_outbox_event(
  p_event_id uuid,
  p_worker_id text,
  p_failure_code text,
  p_permanent boolean DEFAULT false,
  p_next_attempt_at timestamptz DEFAULT CURRENT_TIMESTAMP
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  changed boolean;
BEGIN
  IF p_failure_code IS NULL OR length(btrim(p_failure_code)) = 0 THEN
    RAISE EXCEPTION 'Outbox failure code is required';
  END IF;
  UPDATE public.outbox_events
     SET status = CASE WHEN p_permanent THEN 'DEAD_LETTER' ELSE 'FAILED' END,
         failure_code = p_failure_code, failed_at = CURRENT_TIMESTAMP,
         claimed_by = NULL, claimed_at = NULL,
         next_attempt_at = CASE WHEN p_permanent THEN CURRENT_TIMESTAMP ELSE p_next_attempt_at END
   WHERE id = p_event_id AND status = 'PROCESSING' AND claimed_by = p_worker_id;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'loyalty_worker') THEN
    CREATE ROLE loyalty_worker NOLOGIN;
  END IF;
END;
$$;

GRANT SELECT, INSERT ON outbox_events TO loyalty_app;
GRANT EXECUTE ON FUNCTION claim_outbox_events(text, integer, timestamptz) TO loyalty_worker;
GRANT EXECUTE ON FUNCTION complete_outbox_event(uuid, text, timestamptz) TO loyalty_worker;
GRANT EXECUTE ON FUNCTION fail_outbox_event(uuid, text, text, boolean, timestamptz) TO loyalty_worker;
REVOKE ALL ON FUNCTION reject_outbox_payload_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_outbox_events(text, integer, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION complete_outbox_event(uuid, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION fail_outbox_event(uuid, text, text, boolean, timestamptz) FROM PUBLIC;

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY outbox_tenant_isolation
  ON outbox_events
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- down migration
DROP POLICY IF EXISTS outbox_tenant_isolation ON outbox_events;
ALTER TABLE outbox_events DISABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON outbox_events FROM loyalty_app;
REVOKE EXECUTE ON FUNCTION claim_outbox_events(text, integer, timestamptz) FROM loyalty_worker;
REVOKE EXECUTE ON FUNCTION complete_outbox_event(uuid, text, timestamptz) FROM loyalty_worker;
REVOKE EXECUTE ON FUNCTION fail_outbox_event(uuid, text, text, boolean, timestamptz) FROM loyalty_worker;
DROP TRIGGER IF EXISTS outbox_payload_immutable ON outbox_events;
DROP FUNCTION IF EXISTS reject_outbox_payload_mutation();
DROP FUNCTION IF EXISTS claim_outbox_events(text, integer, timestamptz);
DROP FUNCTION IF EXISTS complete_outbox_event(uuid, text, timestamptz);
DROP FUNCTION IF EXISTS fail_outbox_event(uuid, text, text, boolean, timestamptz);
DROP TABLE IF EXISTS outbox_events;
