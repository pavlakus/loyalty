-- Run against a clean migrated database with psql -v ON_ERROR_STOP=1.
-- This verifies the application-owned persistence primitives and tenant scope.
BEGIN;
INSERT INTO businesses (id,legal_name,display_name,default_currency,timezone) VALUES
  ('00000000-0000-0000-0000-0000000000c1','MVP A','MVP A','RSD','Europe/Belgrade'),
  ('00000000-0000-0000-0000-0000000000c2','MVP B','MVP B','EUR','Europe/Belgrade');
INSERT INTO brands (id,business_id,name,default_locale,status) VALUES
  ('00000000-0000-0000-0000-0000000000c3','00000000-0000-0000-0000-0000000000c1','MVP A Brand','en-US','ACTIVE');
INSERT INTO loyalty_programs (id,business_id,brand_id,status) VALUES
  ('00000000-0000-0000-0000-0000000000c4','00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000c3','ACTIVE');
SET ROLE loyalty_app;
SELECT set_config('app.business_id','00000000-0000-0000-0000-0000000000c2',true);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM loyalty_programs) THEN RAISE EXCEPTION 'cross-tenant Program visibility'; END IF;
END $$;
SELECT set_config('app.business_id','00000000-0000-0000-0000-0000000000c1',true);
DO $$ BEGIN
  IF (SELECT count(*) FROM loyalty_programs) <> 1 THEN RAISE EXCEPTION 'owning tenant cannot read Program'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
