-- LP-004003 schema assertions. Run inside a disposable database after migrations.
BEGIN;

INSERT INTO businesses (
  id, legal_name, display_name, default_currency, timezone
) VALUES (
  '20000000-0000-0000-0000-000000000001', 'Brand Owner LLC', 'Brand Owner', 'EUR', 'Europe/Belgrade'
);

INSERT INTO brands (id, business_id, name, default_locale)
VALUES ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Main Brand', 'en-US');

DO $$
BEGIN
  IF (SELECT status FROM brands WHERE id = '20000000-0000-0000-0000-000000000002') <> 'DRAFT' THEN
    RAISE EXCEPTION 'Brand default status is not DRAFT';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'brands'::regclass AND contype = 'f'
      AND conname = 'brands_business_id_fkey'
  ) THEN
    RAISE EXCEPTION 'Brand must reference Business';
  END IF;
END;
$$;

ROLLBACK;
