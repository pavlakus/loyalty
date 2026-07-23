import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { copyFcrFixture, packageRoot, readJson, writeJson } from './fixture-helpers.js';
import { repositoryRoot } from './test-helpers.js';

const sourceCli = path.join(packageRoot, 'src/cli.ts');
const tsxLoader = path.join(packageRoot, 'node_modules/tsx/dist/loader.mjs');

function runCli(args: string[], cwd: string) {
  return spawnSync(process.execPath, ['--import', tsxLoader, sourceCli, ...args], { cwd, encoding: 'utf8' });
}

test('CLI returns complete JSON success accounting from root and nested directories', () => {
  const root = runCli(['validate-artifacts', '--json'], repositoryRoot);
  assert.equal(root.status, 0);
  const rootOutput = JSON.parse(root.stdout) as Record<string, unknown>;
  assert.equal(rootOutput.status, 'PASS');
  assert.equal(rootOutput.error_count, 0);
  assert.equal(rootOutput.normative_record_count, rootOutput.validated_record_count);
  const nested = runCli(['validate-artifacts', '--json'], path.join(repositoryRoot, 'packages/fcr/src'));
  assert.equal(nested.status, 0);
  const nestedOutput = JSON.parse(nested.stdout) as Record<string, unknown>;
  delete rootOutput.duration_ms;
  delete nestedOutput.duration_ms;
  assert.deepEqual(nestedOutput, rootOutput);
});

test('CLI reports fixture failures, help, unknown commands and preserves files', async () => {
  const root = await copyFcrFixture(repositoryRoot);
  try {
    const target = 'docs/ai-engineering-framework/fcr/predicates/preparation-complete.json';
    const original = await fs.readFile(path.join(root, target));
    const record = await readJson<Record<string, unknown>>(root, target);
    delete record.canonical_path_pattern;
    await writeJson(root, target, record);
    const beforeCli = await fs.readFile(path.join(root, target));
    const failure = runCli(['validate-artifacts', '--json'], root);
    assert.notEqual(failure.status, 0);
    const failureOutput = JSON.parse(failure.stdout) as { status: string; error_count: number; failures: unknown[] };
    assert.equal(failureOutput.status, 'FAIL');
    assert.ok(failureOutput.error_count > 0);
    assert.equal(failureOutput.error_count, failureOutput.failures.length);
    assert.deepEqual(beforeCli, await fs.readFile(path.join(root, target)));
    assert.notDeepEqual(original, beforeCli);

    const help = runCli(['--help'], root);
    assert.equal(help.status, 0);
    assert.match(help.stdout, /Usage: fcr/);
    const commandHelp = runCli(['validate-artifacts', '--help'], root);
    assert.equal(commandHelp.status, 0);
    const unknown = runCli(['unknown'], root);
    assert.notEqual(unknown.status, 0);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
