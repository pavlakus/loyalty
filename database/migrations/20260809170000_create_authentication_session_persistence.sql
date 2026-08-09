-- up migration
CREATE TABLE authentication_challenges (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  phone_reference text NOT NULL CHECK (length(btrim(phone_reference)) > 0),
  otp_salt text NOT NULL CHECK (length(btrim(otp_salt)) > 0),
  otp_digest text NOT NULL CHECK (length(btrim(otp_digest)) > 0),
  state text NOT NULL CHECK (state IN ('PENDING','VERIFIED','EXPIRED','LOCKED')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts integer NOT NULL CHECK (max_attempts > 0),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  verified_at timestamptz
);

CREATE TABLE authentication_sessions (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  token_digest text NOT NULL UNIQUE CHECK (length(btrim(token_digest)) > 0),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE OR REPLACE FUNCTION reject_authentication_history_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Authentication history is immutable'; END; $$;

CREATE TRIGGER authentication_challenge_immutable
  BEFORE DELETE ON authentication_challenges FOR EACH ROW EXECUTE FUNCTION reject_authentication_history_mutation();
CREATE TRIGGER authentication_session_immutable
  BEFORE DELETE ON authentication_sessions FOR EACH ROW EXECUTE FUNCTION reject_authentication_history_mutation();

GRANT SELECT, INSERT, UPDATE ON authentication_challenges, authentication_sessions TO loyalty_app;

ALTER TABLE authentication_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_challenges FORCE ROW LEVEL SECURITY;
ALTER TABLE authentication_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY authentication_challenge_customer_scope ON authentication_challenges
  USING (customer_id::text = current_setting('app.customer_id', true));
CREATE POLICY authentication_session_customer_scope ON authentication_sessions
  USING (customer_id::text = current_setting('app.customer_id', true));

-- down migration
DROP POLICY IF EXISTS authentication_session_customer_scope ON authentication_sessions;
DROP POLICY IF EXISTS authentication_challenge_customer_scope ON authentication_challenges;
ALTER TABLE authentication_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_challenges DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS authentication_session_immutable ON authentication_sessions;
DROP TRIGGER IF EXISTS authentication_challenge_immutable ON authentication_challenges;
DROP FUNCTION IF EXISTS reject_authentication_history_mutation();
DROP TABLE IF EXISTS authentication_sessions;
DROP TABLE IF EXISTS authentication_challenges;
