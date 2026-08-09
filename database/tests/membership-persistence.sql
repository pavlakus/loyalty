BEGIN;

SET LOCAL search_path = public;

INSERT INTO businesses (id, legal_name, display_name, default_currency, timezone)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Membership Business A', 'Business A', 'RSD', 'Europe/Belgrade'),
  ('00000000-0000-0000-0000-0000000000b1', 'Membership Business B', 'Business B', 'RSD', 'Europe/Belgrade');

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
  ('00000000-0000-0000-0000-0000000000a4', 'customer-a-phone'),
  ('00000000-0000-0000-0000-0000000000b4', 'customer-b-phone');

-- Seed Business B's operational Membership as the privileged migration/test
-- owner so Business A's read and mutation denial can be asserted directly.
INSERT INTO memberships (
  id, customer_id, business_id, brand_id, loyalty_program_id,
  reward_account_id, xp_account_id, status_level_id, joined_at
)
VALUES (
  '00000000-0000-0000-0000-0000000000b5',
  '00000000-0000-0000-0000-0000000000b4',
  '00000000-0000-0000-0000-0000000000b1',
  '00000000-0000-0000-0000-0000000000b2',
  '00000000-0000-0000-0000-0000000000b3',
  '00000000-0000-0000-0000-0000000000b6',
  '00000000-0000-0000-0000-0000000000b7',
  'bronze', '2026-08-09T00:00:00.000Z'
);

SET ROLE loyalty_app;
SELECT set_config('app.business_id', '00000000-0000-0000-0000-0000000000a1', true);

INSERT INTO memberships (
  id, customer_id, business_id, brand_id, loyalty_program_id,
  reward_account_id, xp_account_id, status_level_id, joined_at
)
VALUES (
  '00000000-0000-0000-0000-0000000000a5',
  '00000000-0000-0000-0000-0000000000a4',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a2',
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-0000000000a6',
  '00000000-0000-0000-0000-0000000000a7',
  'bronze', '2026-08-09T00:00:00.000Z'
);

INSERT INTO membership_enrollment_idempotency (
  id, business_id, customer_id, loyalty_program_id,
  idempotency_key, request_fingerprint, membership_id
)
VALUES (
  '00000000-0000-0000-0000-0000000000a8',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a4',
  '00000000-0000-0000-0000-0000000000a3',
  'enroll-a-1', 'fingerprint-a-1', '00000000-0000-0000-0000-0000000000a5'
);

DO $$
BEGIN
  IF (SELECT count(*) FROM memberships) <> 1
     OR (SELECT count(*) FROM membership_enrollment_idempotency) <> 1 THEN
    RAISE EXCEPTION 'Business A cannot see its expected Membership records';
  END IF;
  IF EXISTS (
    SELECT 1 FROM memberships
    WHERE business_id = '00000000-0000-0000-0000-0000000000b1'
  ) THEN
    RAISE EXCEPTION 'Business A can read Business B Membership data';
  END IF;
END;
$$;

DO $$
DECLARE
  changed integer;
BEGIN
  UPDATE memberships
     SET status = 'SUSPENDED'
   WHERE id = '00000000-0000-0000-0000-0000000000b5';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN
    RAISE EXCEPTION 'Business A mutated Business B Membership data';
  END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO memberships (
      id, customer_id, business_id, brand_id, loyalty_program_id,
      reward_account_id, xp_account_id, status_level_id, joined_at
    ) VALUES (
      '00000000-0000-0000-0000-0000000000a9',
      '00000000-0000-0000-0000-0000000000a4',
      '00000000-0000-0000-0000-0000000000a1',
      '00000000-0000-0000-0000-0000000000a2',
      '00000000-0000-0000-0000-0000000000a3',
      '00000000-0000-0000-0000-0000000000a6',
      '00000000-0000-0000-0000-0000000000a7',
      'bronze', '2026-08-09T00:00:00.000Z'
    );
    RAISE EXCEPTION 'Duplicate Customer/Program Membership was accepted';
  EXCEPTION WHEN unique_violation THEN
    NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO memberships (
      id, customer_id, business_id, brand_id, loyalty_program_id,
      reward_account_id, xp_account_id, status_level_id, joined_at
    ) VALUES (
      '00000000-0000-0000-0000-0000000000aa',
      '00000000-0000-0000-0000-0000000000b4',
      '00000000-0000-0000-0000-0000000000b1',
      '00000000-0000-0000-0000-0000000000b2',
      '00000000-0000-0000-0000-0000000000b3',
      '00000000-0000-0000-0000-0000000000ab',
      '00000000-0000-0000-0000-0000000000ac',
      'bronze', '2026-08-09T00:00:00.000Z'
    );
    RAISE EXCEPTION 'Business A inserted Business B Membership data';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    NULL;
  END;
END;
$$;

UPDATE memberships SET status = 'SUSPENDED'
 WHERE id = '00000000-0000-0000-0000-0000000000a5';
UPDATE memberships SET status = 'ACTIVE'
 WHERE id = '00000000-0000-0000-0000-0000000000a5';
UPDATE memberships SET status = 'CLOSED'
 WHERE id = '00000000-0000-0000-0000-0000000000a5';

DO $$
BEGIN
  BEGIN
    UPDATE memberships SET status = 'ACTIVE'
     WHERE id = '00000000-0000-0000-0000-0000000000a5';
    RAISE EXCEPTION 'Closed Membership was reactivated';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Closed Membership was reactivated' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    UPDATE memberships SET customer_id = '00000000-0000-0000-0000-0000000000b4'
     WHERE id = '00000000-0000-0000-0000-0000000000a5';
    RAISE EXCEPTION 'Membership identity was mutated';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Membership identity was mutated' THEN RAISE; END IF;
  END;
END;
$$;

RESET ROLE;

DO $$
BEGIN
  IF (SELECT status FROM memberships
      WHERE id = '00000000-0000-0000-0000-0000000000a5') <> 'CLOSED' THEN
    RAISE EXCEPTION 'Membership closure was not persisted';
  END IF;
END;
$$;

ROLLBACK;
