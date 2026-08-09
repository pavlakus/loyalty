BEGIN;

INSERT INTO outbox_events (
  id, tenant_id, event_name, event_version, aggregate_type, aggregate_id,
  aggregate_version, payload, correlation_id, causation_id, idempotency_key,
  occurred_at
)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'business-a', 'ReceiptRecorded', 1, 'Receipt', 'receipt-a', 1, '{"safe":true}', 'corr-a', 'cause-a', 'receipt-a-1', '2026-08-09T07:00:00Z'),
  ('10000000-0000-0000-0000-000000000002', 'business-b', 'ReceiptRecorded', 1, 'Receipt', 'receipt-b', 1, '{"safe":true}', 'corr-b', 'cause-b', 'receipt-b-1', '2026-08-09T07:00:00Z');

SET ROLE loyalty_app;
SELECT set_config('app.tenant_id', 'business-a', true);

DO $$
BEGIN
  IF (SELECT count(*) FROM outbox_events) <> 1 THEN
    RAISE EXCEPTION 'Tenant A can read the wrong outbox rows';
  END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO outbox_events (
      id, tenant_id, event_name, event_version, aggregate_type, aggregate_id,
      aggregate_version, payload, correlation_id, occurred_at
    ) VALUES (
      '10000000-0000-0000-0000-000000000003', 'business-b', 'ReceiptRecorded', 1, 'Receipt', 'receipt-b-2', 1, '{}', 'corr-b-2', '2026-08-09T07:00:00Z'
    );
    RAISE EXCEPTION 'Tenant A inserted a Business B outbox row';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    NULL;
  END;
END;
$$;

RESET ROLE;
SET ROLE loyalty_worker;

DO $$
DECLARE
  claimed integer;
BEGIN
  SELECT count(*) INTO claimed FROM claim_outbox_events('worker-a', 1, '2026-08-09T08:00:00Z');
  IF claimed <> 1 THEN RAISE EXCEPTION 'First atomic claim did not claim one event'; END IF;
  SELECT count(*) INTO claimed FROM claim_outbox_events('worker-b', 1, '2026-08-09T08:00:00Z');
  IF claimed <> 1 THEN RAISE EXCEPTION 'Second atomic claim did not claim the next event'; END IF;
END;
$$;

DO $$
BEGIN
  IF NOT complete_outbox_event('10000000-0000-0000-0000-000000000001', 'worker-a', '2026-08-09T08:01:00Z') THEN
    RAISE EXCEPTION 'Owned outbox completion failed';
  END IF;
  IF complete_outbox_event('10000000-0000-0000-0000-000000000001', 'worker-b', '2026-08-09T08:02:00Z') THEN
    RAISE EXCEPTION 'A second worker completed the same outbox event';
  END IF;
  IF NOT fail_outbox_event('10000000-0000-0000-0000-000000000002', 'worker-b', 'DELIVERY_PERMANENT', true) THEN
    RAISE EXCEPTION 'Outbox dead-letter transition failed';
  END IF;
END;
$$;

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM outbox_events WHERE status = 'PROCESSING') <> 0
     OR (SELECT count(*) FROM outbox_events WHERE status = 'COMPLETED') <> 1
     OR (SELECT count(*) FROM outbox_events WHERE status = 'DEAD_LETTER') <> 1 THEN
    RAISE EXCEPTION 'Outbox completion/dead-letter state is not observable';
  END IF;
END;
$$;

ROLLBACK;

BEGIN;
SET ROLE loyalty_app;
SELECT set_config('app.tenant_id', 'business-a', true);
INSERT INTO outbox_events (
  id, tenant_id, event_name, event_version, aggregate_type, aggregate_id,
  aggregate_version, payload, correlation_id, occurred_at
) VALUES (
  '10000000-0000-0000-0000-000000000004', 'business-a', 'RolledBack', 1, 'Test', 'rollback', 1, '{}', 'corr-rollback', '2026-08-09T07:00:00Z'
);
ROLLBACK;
