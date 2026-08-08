import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LOCAL_DATABASE_URL,
  listMigrationFiles,
  migrationHashes,
  redactSecrets,
  validateEnvironment,
} from './migrate.mjs';

test('development may use the documented local fallback', () => {
  assert.deepEqual(validateEnvironment({ NODE_ENV: 'development' }), {
    nodeEnv: 'development',
    databaseUrl: LOCAL_DATABASE_URL,
  });
});

test('fallback is rejected outside development', () => {
  for (const NODE_ENV of ['test', 'production', 'unknown', undefined]) {
    assert.throws(() => validateEnvironment({ NODE_ENV }), /DATABASE_URL|NODE_ENV/);
  }
});

test('production requires TLS and a non-loopback database', () => {
  assert.throws(() => validateEnvironment({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://u:p@127.0.0.1/db?sslmode=require' }), /loopback/);
  assert.throws(() => validateEnvironment({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://u:p@db.example/db' }), /TLS/);
  assert.equal(validateEnvironment({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://u:p@db.example/db?sslmode=verify-full' }).nodeEnv, 'production');
});

test('redaction removes credentials from URLs and configuration output', () => {
  assert.equal(redactSecrets('postgresql://user:secret@db.example/app'), 'postgresql://***:***@db.example/app');
  assert.equal(redactSecrets('DATABASE_URL=postgresql://user:secret@db.example/app'), 'DATABASE_URL=[REDACTED]');
});

test('migration files have deterministic names and hashes', async () => {
  assert.deepEqual(await listMigrationFiles(), ['00000000000000_create_platform_migration_hashes.sql']);
  const hashes = await migrationHashes();
  assert.match(hashes['00000000000000_create_platform_migration_hashes.sql'], /^[0-9a-f]{64}$/);
});
