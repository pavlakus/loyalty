-- Run against a clean migrated database with psql -v ON_ERROR_STOP=1.
-- Customer is global, while Business visibility is granted only for the
-- current Business's Loyalty Operations purpose.
BEGIN;
INSERT INTO businesses (id,legal_name,display_name,default_currency,timezone) VALUES
  ('00000000-0000-0000-0000-0000000000d1','UAT A','UAT A','RSD','Europe/Belgrade'),
  ('00000000-0000-0000-0000-0000000000d2','UAT B','UAT B','EUR','Europe/Belgrade');
INSERT INTO brands (id,business_id,name,default_locale,status) VALUES
  ('00000000-0000-0000-0000-0000000000d3','00000000-0000-0000-0000-0000000000d1','UAT A Brand','en-US','ACTIVE'),
  ('00000000-0000-0000-0000-0000000000d4','00000000-0000-0000-0000-0000000000d2','UAT B Brand','en-US','ACTIVE');
INSERT INTO loyalty_programs (id,business_id,brand_id,status) VALUES
  ('00000000-0000-0000-0000-0000000000d5','00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d3','ACTIVE'),
  ('00000000-0000-0000-0000-0000000000d6','00000000-0000-0000-0000-0000000000d2','00000000-0000-0000-0000-0000000000d4','ACTIVE');
INSERT INTO customers (id,normalized_phone_reference) VALUES
  ('00000000-0000-0000-0000-0000000000d7','+381601111111'),
  ('00000000-0000-0000-0000-0000000000d8','+381602222222');
INSERT INTO memberships (id,customer_id,business_id,brand_id,loyalty_program_id,reward_account_id,xp_account_id,status_level_id,joined_at) VALUES
  ('00000000-0000-0000-0000-0000000000d9','00000000-0000-0000-0000-0000000000d7','00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d3','00000000-0000-0000-0000-0000000000d5','00000000-0000-0000-0000-0000000000da','00000000-0000-0000-0000-0000000000db','bronze',CURRENT_TIMESTAMP);
SET ROLE loyalty_app;
SELECT set_config('app.business_id','00000000-0000-0000-0000-0000000000d2',true), set_config('app.access_purpose','LOYALTY_OPERATIONS',true);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM customers) THEN RAISE EXCEPTION 'Business B can read unrelated Customer participation'; END IF;
END $$;
SELECT set_config('app.business_id','00000000-0000-0000-0000-0000000000d1',true);
DO $$ BEGIN
  IF (SELECT count(*) FROM customers) <> 1 THEN RAISE EXCEPTION 'Business A cannot read its purpose-scoped Customer'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
