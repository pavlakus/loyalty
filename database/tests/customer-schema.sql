-- LP-002003 schema assertions. Run inside a disposable database after migrations.
BEGIN;

INSERT INTO customers (id, normalized_phone_reference)
VALUES ('00000000-0000-0000-0000-000000000001', '+381601234567');

INSERT INTO customer_profiles (customer_id, preferred_language)
VALUES ('00000000-0000-0000-0000-000000000001', 'sr-Latn-RS');

INSERT INTO customer_profile_history (id, customer_id, version, changed_fields)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1, ARRAY['preferred_language']);

INSERT INTO customer_privacy_actions (id, customer_id, action_type)
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'access_reviewed');

DO $$
BEGIN
  IF (SELECT status FROM customers WHERE id = '00000000-0000-0000-0000-000000000001') <> 'active' THEN
    RAISE EXCEPTION 'Customer default status is not active';
  END IF;
  IF (SELECT version FROM customers WHERE id = '00000000-0000-0000-0000-000000000001') <> 1 THEN
    RAISE EXCEPTION 'Customer default version is not one';
  END IF;
END;
$$;

ROLLBACK;
