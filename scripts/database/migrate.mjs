import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const MIGRATIONS_DIR = resolve(ROOT, 'database/migrations');
export const LOCAL_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const MIGRATION_NAME = /^\d{14}_[a-z0-9]+(?:[-_][a-z0-9]+)*\.sql$/;

export function redactSecrets(value) {
  if (value === undefined || value === null) return value;
  const text = String(value);
  try {
    const url = new URL(text);
    if (url.protocol === 'postgres:' || url.protocol === 'postgresql:') {
      url.username = url.username ? '***' : '';
      url.password = url.password ? '***' : '';
      return url.toString();
    }
  } catch {
    // Fall through to the conservative textual redaction below.
  }
  return text
    .replace(/(postgres(?:ql)?(?:\+[^:]+)?:\/\/)([^:@/]+)(?::[^@/]*)?@/gi, '$1***:***@')
    .replace(/(DATABASE_URL\s*[=:]\s*)[^\s,}]+/gi, '$1[REDACTED]');
}

export function validateEnvironment(env = process.env) {
  const nodeEnv = env.NODE_ENV;
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be explicitly set to development, test, or production for database operations');
  }

  const configured = env.DATABASE_URL;
  if (!configured && nodeEnv !== 'development') {
    throw new Error('DATABASE_URL is required outside development');
  }
  const databaseUrl = configured ?? LOCAL_DATABASE_URL;

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql scheme');
  }
  if (!parsed.hostname || !parsed.pathname || parsed.pathname === '/') {
    throw new Error('DATABASE_URL must include a host and database name');
  }
  if (nodeEnv !== 'development' && ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)) {
    throw new Error('DATABASE_URL must not target a loopback host outside development');
  }
  if (nodeEnv === 'production' && !['require', 'verify-ca', 'verify-full'].includes(parsed.searchParams.get('sslmode'))) {
    throw new Error('DATABASE_URL must require TLS in production');
  }
  return { nodeEnv, databaseUrl };
}

export async function listMigrationFiles(directory = MIGRATIONS_DIR) {
  const names = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
  const invalid = names.filter((name) => !MIGRATION_NAME.test(name));
  if (invalid.length > 0) {
    throw new Error(`Invalid migration filename(s): ${invalid.join(', ')}`);
  }
  const versions = names.map((name) => name.slice(0, 14));
  if (new Set(versions).size !== versions.length) {
    throw new Error('Migration versions must be unique');
  }
  return names;
}

export async function migrationHashes(directory = MIGRATIONS_DIR) {
  const names = await listMigrationFiles(directory);
  return Object.fromEntries(await Promise.all(names.map(async (name) => {
    const content = await readFile(join(directory, name));
    return [name, createHash('sha256').update(content).digest('hex')];
  })));
}

function hashForAppliedMigration(name, hashes) {
  return hashes[name] ?? hashes[`${name}.sql`];
}

function cliArguments(command) {
  return [
    command,
    '--migrations-dir',
    MIGRATIONS_DIR,
    '--database-url-var',
    'DATABASE_URL',
    '--migrations-table',
    'pgmigrations',
    '--create-migrations-schema',
    '--check-order',
    '--single-transaction',
    '--lock',
    '--verbose=false',
  ];
}

function runCli(command, databaseUrl) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [resolve(ROOT, 'node_modules/node-pg-migrate/bin/node-pg-migrate.js'), ...cliArguments(command)], {
      cwd: ROOT,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => rejectPromise(new Error(redactSecrets(error.message))));
    child.on('close', (code) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim();
      if (code !== 0) {
        rejectPromise(new Error(`Migration ${command} failed${output ? `: ${redactSecrets(output)}` : ''}`));
        return;
      }
      resolvePromise(output);
    });
  });
}

async function openPool(databaseUrl) {
  return new Pool({ connectionString: databaseUrl, max: 10 });
}

async function verifyAppliedHashes(pool, hashes) {
  try {
    const result = await pool.query('SELECT name, sha256 FROM platform_migration_hashes ORDER BY name');
    for (const row of result.rows) {
      const expected = hashForAppliedMigration(row.name, hashes);
      if (expected && expected !== row.sha256) {
        throw new Error(`Applied migration was modified: ${row.name}`);
      }
    }
  } catch (error) {
    if (error?.code === '42P01') return;
    throw error;
  }
}

async function recordAppliedHashes(pool, hashes) {
  try {
    await pool.query('BEGIN');
    const applied = await pool.query('SELECT name FROM pgmigrations ORDER BY id');
    for (const row of applied.rows) {
      const fileName = hashes[row.name] ? row.name : `${row.name}.sql`;
      const sha256 = hashForAppliedMigration(row.name, hashes);
      if (!sha256) continue;
      await pool.query(
        'INSERT INTO platform_migration_hashes (name, sha256) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET sha256 = platform_migration_hashes.sha256',
        [fileName, sha256],
      );
    }
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    if (error?.code === '42P01') return;
    throw error;
  }
}

export async function migrationStatus(env = process.env) {
  const { databaseUrl } = validateEnvironment(env);
  const pool = await openPool(databaseUrl);
  try {
    const result = await pool.query('SELECT name, run_on FROM pgmigrations ORDER BY id');
    return result.rows;
  } catch (error) {
    if (error?.code === '42P01') return [];
    throw new Error(`Migration status failed: ${redactSecrets(error.message)}`);
  } finally {
    await pool.end();
  }
}

export async function runMigration(command = 'up', env = process.env) {
  if (!['up', 'down', 'redo'].includes(command)) throw new Error(`Unsupported migration command: ${command}`);
  const { databaseUrl } = validateEnvironment(env);
  const hashes = await migrationHashes();
  const pool = await openPool(databaseUrl);
  try {
    await verifyAppliedHashes(pool, hashes);
  } finally {
    await pool.end();
  }
  const output = await runCli(command, databaseUrl);
  const recordPool = await openPool(databaseUrl);
  try {
    await recordAppliedHashes(recordPool, hashes);
  } finally {
    await recordPool.end();
  }
  return output;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? 'up';
  try {
    if (command === 'status') {
      const rows = await migrationStatus();
      for (const row of rows) console.log(`${row.name}\t${row.run_on.toISOString()}`);
    } else if (command === 'check') {
      const hashes = await migrationHashes();
      console.log(`Validated ${Object.keys(hashes).length} migration file(s)`);
    } else {
      const output = await runMigration(command);
      if (output) console.log(redactSecrets(output));
    }
  } catch (error) {
    console.error(redactSecrets(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}
