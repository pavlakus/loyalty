BEGIN;

SET LOCAL search_path = public;

INSERT INTO businesses (id, legal_name, display_name, default_currency, timezone)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Receipt Business A', 'Business A', 'RSD', 'Europe/Belgrade'),
  ('00000000-0000-0000-0000-0000000000b1', 'Receipt Business B', 'Business B', 'RSD', 'Europe/Belgrade');

INSERT INTO brands (id, business_id, name, default_locale, status)
VALUES
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'Brand A', 'en-US', 'ACTIVE'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b1', 'Brand B', 'en-US', 'ACTIVE');

INSERT INTO loyalty_programs (id, business_id, brand_id, status)
VALUES
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'ACTIVE'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'ACTIVE');

INSERT INTO customers (id, normalized_phone_reference)
VALUES
  ('00000000-0000-0000-0000-0000000000a4', 'receipt-customer-a'),
  ('00000000-0000-0000-0000-0000000000b4', 'receipt-customer-b');

INSERT INTO memberships (
  id, customer_id, business_id, brand_id, loyalty_program_id,
  reward_account_id, xp_account_id, status_level_id, joined_at
)
VALUES
  ('00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000a4',
   '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2',
   '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a6',
   '00000000-0000-0000-0000-0000000000a7', 'bronze', '2026-08-09T00:00:00Z'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000b4',
   '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2',
   '00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b6',
   '00000000-0000-0000-0000-0000000000b7', 'bronze', '2026-08-09T00:00:00Z');

SET ROLE loyalty_app;
SELECT set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);

SELECT * FROM record_receipt_with_outbox(
  '00000000-0000-0000-0000-0000000000a8',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a2',
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-0000000000a5',
  'location-a', 'receipt-1', 'source-1', 500000, 'RSD',
  '2026-08-09T08:00:00Z', '2026-08-09T08:01:00Z',
  'receipt-key-1', 'fingerprint-1', '{"receiptId":"00000000-0000-0000-0000-0000000000a8"}'::jsonb
);

DO $$
BEGIN
  IF NOT (SELECT replayed FROM record_receipt_with_outbox(
    '00000000-0000-0000-0000-0000000000a8',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a5',
    'location-a', 'receipt-1', 'source-1', 500000, 'RSD',
    '2026-08-09T08:00:00Z', '2026-08-09T08:01:00Z',
    'receipt-key-1', 'fingerprint-1', '{"receiptId":"00000000-0000-0000-0000-0000000000a8"}'::jsonb
  )) THEN RAISE EXCEPTION 'Receipt retry was not idempotent'; END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    PERFORM * FROM record_receipt_with_outbox(
      '00000000-0000-0000-0000-0000000000a9',
      '00000000-0000-0000-0000-0000000000a1',
      '00000000-0000-0000-0000-0000000000a2',
      '00000000-0000-0000-0000-0000000000a3',
      '00000000-0000-0000-0000-0000000000a5',
      'location-a', 'receipt-1', 'source-1', 500000, 'RSD',
      '2026-08-09T08:00:00Z', '2026-08-09T08:01:00Z',
      'receipt-key-1', 'different-fingerprint', '{"receiptId":"different"}'::jsonb
    );
    RAISE EXCEPTION 'Idempotency fingerprint mismatch was accepted';
  EXCEPTION WHEN insufficient_privilege OR raise_exception THEN
    IF SQLERRM = 'Idempotency fingerprint mismatch was accepted' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
BEGIN
  IF (SELECT count(*) FROM receipts) <> 1 OR (SELECT count(*) FROM outbox_events) <> 1 THEN
    RAISE EXCEPTION 'Receipt recording did not create exactly one receipt and event';
  END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    UPDATE receipts SET amount_minor = 1
     WHERE id = '00000000-0000-0000-0000-0000000000a8';
    RAISE EXCEPTION 'Receipt mutation was accepted';
  EXCEPTION WHEN insufficient_privilege OR raise_exception THEN
    IF SQLERRM = 'Receipt mutation was accepted' THEN RAISE; END IF;
  END;
  BEGIN
    DELETE FROM receipts WHERE id = '00000000-0000-0000-0000-0000000000a8';
    RAISE EXCEPTION 'Receipt deletion was accepted';
  EXCEPTION WHEN insufficient_privilege OR raise_exception THEN
    IF SQLERRM = 'Receipt deletion was accepted' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    PERFORM * FROM record_receipt_with_outbox(
      '00000000-0000-0000-0000-0000000000aa',
      '00000000-0000-0000-0000-0000000000b1',
      '00000000-0000-0000-0000-0000000000b2',
      '00000000-0000-0000-0000-0000000000b3',
      '00000000-0000-0000-0000-0000000000b5',
      'location-b', 'receipt-b', 'source-b', 100, 'RSD',
      '2026-08-09T08:00:00Z', '2026-08-09T08:01:00Z',
      'receipt-key-b', 'fingerprint-b', '{"receiptId":"b"}'::jsonb
    );
    RAISE EXCEPTION 'Tenant A inserted a Business B receipt';
  EXCEPTION WHEN insufficient_privilege OR raise_exception THEN
    IF SQLERRM = 'Tenant A inserted a Business B receipt' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM receipts WHERE business_id = '00000000-0000-0000-0000-0000000000b1') THEN
    RAISE EXCEPTION 'Tenant A can read Business B receipts';
  END IF;
END;
$$;

SELECT * FROM cancel_receipt_with_outbox(
  '00000000-0000-0000-0000-0000000000ab',
  '00000000-0000-0000-0000-0000000000a8',
  '00000000-0000-0000-0000-0000000000a1',
  'customer-request', 'location-a', 'cancel-key-1',
  '2026-08-09T09:00:00Z', '{"receiptId":"00000000-0000-0000-0000-0000000000a8"}'::jsonb
);

DO $$
BEGIN
  IF NOT (SELECT replayed FROM cancel_receipt_with_outbox(
    '00000000-0000-0000-0000-0000000000ab',
    '00000000-0000-0000-0000-0000000000a8',
    '00000000-0000-0000-0000-0000000000a1',
    'customer-request', 'location-a', 'cancel-key-1',
    '2026-08-09T09:00:00Z', '{"receiptId":"00000000-0000-0000-0000-0000000000a8"}'::jsonb
  )) THEN RAISE EXCEPTION 'Receipt cancellation retry was not idempotent'; END IF;
END;
$$;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM receipt_cancellations) <> 1
     OR (SELECT count(*) FROM outbox_events WHERE event_name IN ('ReceiptRecorded', 'ReceiptCancelled')) <> 2 THEN
    RAISE EXCEPTION 'Receipt cancellation history or outbox event is incomplete';
  END IF;
END;
$$;

ROLLBACK;
