#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { createFcrRuntime } from './index.js';
import { resolveRepositoryRoot } from './config/repository-paths.js';
import type { RuntimeFrameworkError } from './artifacts/artifact-types.js';

const args = process.argv.slice(2).filter((argument) => argument !== '--');
const json = args.includes('--json');
const help = args.includes('--help') || args.includes('-h');
const command = args.find((argument) => !argument.startsWith('-'));

if (help) {
  writeHelp();
  process.exitCode = 0;
} else if (command !== 'validate-artifacts') {
  writeFailure('REGISTRY_VALIDATION_FAILED', 'usage: fcr validate-artifacts [--json]', 2, json);
} else {
  const started = performance.now();
  try {
    const runtime = await createFcrRuntime(resolveRepositoryRoot());
    const result = await runtime.validator.validateCompleteArtifactSet();
    const summary = result.value;
    const failures = [...(result.errors ?? (result.error ? [result.error] : []))];
    const output = {
      status: result.valid ? 'PASS' : 'FAIL',
      validator: { name: 'AJV', contract_version: 'Draft 2020-12', implementation_version: '8.20.0' },
      registry_path: 'docs/ai-engineering-framework/fcr/registry.json',
      artifact_count: summary?.artifactCount ?? runtime.validator.load?.artifacts.length ?? 0,
      schema_count: summary?.schemaCount ?? 0,
      normative_record_count: summary?.normativeRecordCount ?? 0,
      validated_record_count: summary?.validatedRecordCount ?? 0,
      failed_record_count: summary?.failedRecordCount ?? failures.length,
      skipped_non_normative_count: summary?.skippedNonNormativeCount ?? 0,
      error_count: failures.length,
      duration_ms: Math.round(performance.now() - started),
      failures,
    };
    writeOutput(output, result.valid ? 0 : 1, json);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : 'REGISTRY_VALIDATION_FAILED';
    const message = error instanceof Error ? error.message : 'FCR artifact validation failed';
    const issues = error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues) ? error.issues : undefined;
    writeFailure(code, message, 1, json, issues);
  }
}

function writeHelp(): void {
  process.stdout.write('Usage: fcr <command> [options]\n\nCommands:\n  validate-artifacts [--json]  Validate the indexed FCR artifact tree\n  --help                       Show this help\n');
}

function writeFailure(code: string, message: string, exitCode: number, asJson: boolean, issues?: readonly unknown[]): void {
  const output = { status: 'FAIL', error: { code, message, ...(issues && issues.length > 0 ? { issues } : {}) } };
  writeOutput(output, exitCode, asJson);
}

function writeOutput(value: unknown, exitCode: number, asJson: boolean): void {
  if (asJson || exitCode === 0) process.stdout.write(`${JSON.stringify(value)}\n`);
  else process.stderr.write(`${JSON.stringify(value)}\n`);
  process.exitCode = exitCode;
}
