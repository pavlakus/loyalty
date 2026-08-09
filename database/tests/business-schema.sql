-- LP-003003 schema assertions. Run inside a disposable database after migrations.
BEGIN;

INSERT INTO businesses (
  id, legal_name, display_name, registration_number, tax_number,
  default_currency, timezone
) VALUES (
  '10000000-0000-0000-0000-000000000001', 'Acme Loyalty LLC', 'Acme',
  'REG-1', 'TAX-1', 'EUR', 'Europe/Belgrade'
);

DO $$
DECLARE
  columns text[];
BEGIN
  IF (SELECT status FROM businesses WHERE id = '10000000-0000-0000-0000-000000000001') <> 'ACTIVE' THEN
    RAISE EXCEPTION 'Business default status is not ACTIVE';
  END IF;
  IF (SELECT version FROM businesses WHERE id = '10000000-0000-0000-0000-000000000001') <> 1 THEN
    RAISE EXCEPTION 'Business default version is not one';
  END IF;
  SELECT array_agg(column_name ORDER BY ordinal_position)
    INTO columns
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'businesses';
  IF 'customer_id' = ANY(columns) THEN
    RAISE EXCEPTION 'Business must not own Customer identity';
  END IF;
END;
$$;

ROLLBACK;
