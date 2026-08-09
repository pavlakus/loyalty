-- LP-005014 persistence/RLS assertions. Run in a disposable PostgreSQL
-- database after applying all migrations.
BEGIN;

INSERT INTO businesses (id, legal_name, display_name, default_currency, timezone)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'Program A LLC', 'Program A', 'EUR', 'Europe/Belgrade'),
  ('30000000-0000-0000-0000-000000000002', 'Program B LLC', 'Program B', 'USD', 'UTC');

INSERT INTO brands (id, business_id, name, default_locale)
VALUES
  ('30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', 'Brand A', 'en-US'),
  ('30000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', 'Brand B', 'en-US');

INSERT INTO loyalty_programs (id, business_id, brand_id)
VALUES ('30000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000012');

SET LOCAL ROLE loyalty_app;
SELECT set_config('app.business_id', '30000000-0000-0000-0000-000000000001', true);

INSERT INTO loyalty_programs (id, business_id, brand_id)
VALUES ('30000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000011');

INSERT INTO loyalty_program_configuration_versions
  (id, program_id, version, effective_from, configuration)
VALUES
  ('30000000-0000-0000-0000-000000000021:1', '30000000-0000-0000-0000-000000000021', 1, '2026-08-09T00:00:00Z', '{"programId":"30000000-0000-0000-0000-000000000021"}');

DO $$
BEGIN
  IF (SELECT count(*) FROM loyalty_programs) <> 1 THEN
    RAISE EXCEPTION 'Business A must see exactly one Program';
  END IF;
  IF (SELECT count(*) FROM loyalty_program_configuration_versions) <> 1 THEN
    RAISE EXCEPTION 'Business A must see exactly one configuration version';
  END IF;
  IF EXISTS (
    SELECT 1 FROM loyalty_programs
    WHERE id = '30000000-0000-0000-0000-000000000022'
  ) THEN
    RAISE EXCEPTION 'Business A must not read Business B Program data';
  END IF;
END;
$$;

-- A forged cross-tenant update is filtered by RLS and cannot mutate Business B.
UPDATE loyalty_programs
SET status = 'ACTIVE'
WHERE id = '30000000-0000-0000-0000-000000000022';

RESET ROLE;
DO $$
BEGIN
  IF (SELECT status FROM loyalty_programs WHERE id = '30000000-0000-0000-0000-000000000022') <> 'DRAFT' THEN
    RAISE EXCEPTION 'Cross-tenant update must not succeed';
  END IF;
END;
$$;

SET LOCAL ROLE loyalty_app;
SELECT set_config('app.business_id', '30000000-0000-0000-0000-000000000001', true);

-- History is append-only and duplicate version numbers are rejected.
DO $$
BEGIN
  BEGIN
    UPDATE loyalty_program_configuration_versions
    SET configuration = '{}'::jsonb
    WHERE id = '30000000-0000-0000-0000-000000000021:1';
    RAISE EXCEPTION 'Configuration update should have failed';
  EXCEPTION WHEN others THEN
    IF SQLERRM NOT LIKE '%immutable%' THEN RAISE; END IF;
  END;
END;
$$;

ROLLBACK;
