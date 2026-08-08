-- up migration
CREATE TABLE IF NOT EXISTS platform_migration_hashes (
  name text PRIMARY KEY,
  sha256 char(64) NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- down migration
DROP TABLE IF EXISTS platform_migration_hashes;
