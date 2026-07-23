import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, { mock } from 'node:test';

import { ArtifactLoader } from '../src/artifacts/artifact-loader.js';
import { CanonicalJsonService } from '../src/canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../src/errors/framework-error-service.js';
import { RegistryRepository, RegistryRepositoryError } from '../src/persistence/registry-repository.js';
import { SchemaValidator } from '../src/validation/schema-validator.js';
import {
  TRANSACTION_RECORD_SCHEMA_PATH,
  TransactionService,
  TransactionServiceError,
  type CreateTransactionInput,
} from '../src/transactions/transaction-service.js';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const validContract = {
  schema_version: '1.0.0',
  contract_id: 'FCR-READ_DEPENDENCY_STATUS',
  contract_version: '1.0.0',
  operation_id: 'read-dependency-status',
  caller: 'Dispatcher',
  callee: 'FCR',
  request_schema: 'docs/ai-engineering-framework/fcr/contracts/read-dependency-status.request.schema.json',
  success_schema: 'docs/ai-engineering-framework/fcr/contracts/read-dependency-status.success.schema.json',
  failure_schema: 'docs/ai-engineering-framework/fcr/contracts/read-dependency-status.failure.schema.json',
  allowed_reads: ['committed registry snapshot'],
  allowed_writes: ['transaction candidate or audit record'],
  forbidden_writes: ['task identity', 'scope', 'dependencies', 'lifecycle'],
  timeout_seconds: 120,
  retry_policy: { type: 'same-idempotency-key', max_attempts: 3 },
  idempotency_policy: 'same key and same request returns stored result; same key with different request fails',
  evidence_path: 'implementation/workflow-state/evidence/registry/read-dependency-status.json',
  error_mapping: ['REGISTRY_VALIDATION_FAILED', 'REGISTRY_PERSISTENCE_FAILED'],
  compatibility_policy: 'major mismatch blocks; minor optional additions only',
};

const input: CreateTransactionInput = {
  request_id: 'REQUEST-001',
  idempotency_key: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  repository_id: 'REPOSITORY',
  repository_revision: 'COMMIT-001',
  owner: 'FCR',
  recovery_operation: 'NONE',
};

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007b-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}', 'utf8');
  return root;
}

async function createService(root: string): Promise<{ readonly service: TransactionService; readonly repository: RegistryRepository }> {
  const errors = await FrameworkErrorService.fromRepository(repositoryRoot);
  const validator = new SchemaValidator(new ArtifactLoader(repositoryRoot), errors);
  const repository = new RegistryRepository(root, errors, validator);
  return { service: new TransactionService(repository, errors, validator), repository };
}

test('creates, persists, loads and detects a NEW transaction', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    const transaction = await service.createTransaction({ ...input, transaction_id: 'TX-CREATE-001' });
    assert.equal(transaction.transaction_id, 'TX-CREATE-001');
    assert.equal(transaction.state, 'NEW');
    assert.equal(await service.transactionExists('TX-CREATE-001'), true);
    assert.deepEqual(await service.loadTransaction('TX-CREATE-001'), transaction);
    assert.equal((await fs.stat(path.join(repository.paths.staging, 'TX-CREATE-001'))).isDirectory(), true);
    assert.equal((await fs.stat(path.join(repository.paths.transactions, 'TX-CREATE-001.json'))).isFile(), true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects duplicate transaction identifiers without overwriting the original', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-DUPLICATE' });
    const original = await fs.readFile(path.join(repository.paths.transactions, 'TX-DUPLICATE.json'), 'utf8');
    await assert.rejects(() => service.createTransaction({ ...input, transaction_id: 'TX-DUPLICATE', request_id: 'REQUEST-002' }), (error: unknown) => {
      return error instanceof TransactionServiceError && error.failureKind === 'DUPLICATE_TRANSACTION' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
    assert.equal(await fs.readFile(path.join(repository.paths.transactions, 'TX-DUPLICATE.json'), 'utf8'), original);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects a persisted transaction that fails the canonical schema', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await repository.bootstrap();
    await fs.writeFile(path.join(repository.paths.transactions, 'TX-INVALID.json'), JSON.stringify({ schema_version: '1.0.0', transaction_id: 'TX-INVALID' }), 'utf8');
    await assert.rejects(() => service.loadTransaction('TX-INVALID'), (error: unknown) => {
      return error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_INVALID' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('creates a staging area and stages a schema-valid canonical artifact', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-STAGE-001' });
    const stagingRoot = await service.createStagingArea('TX-STAGE-001');
    assert.equal((await fs.stat(stagingRoot)).isDirectory(), true);
    const staged = await service.stageArtifact('TX-STAGE-001', 'contracts/read-dependency-status.contract.json', 'contracts', validContract);
    const stagedFile = path.join(root, staged.staging_path);
    const stored = await fs.readFile(stagedFile, 'utf8');
    assert.equal(stored, `${new CanonicalJsonService().canonicalize(validContract)}\n`);
    assert.equal(staged.content_hash, new CanonicalJsonService().sha256(validContract));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects an invalid staged artifact before creating a staged file', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-STAGE-INVALID' });
    await assert.rejects(() => service.stageArtifact('TX-STAGE-INVALID', 'contracts/invalid.contract.json', 'contracts', {}), (error: unknown) => {
      return error instanceof TransactionServiceError && error.failureKind === 'ARTIFACT_INVALID' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
    await assert.rejects(() => service.stageArtifact('TX-STAGE-INVALID', 'contracts/extra.contract.json', 'contracts', { ...validContract, undocumented: true }), (error: unknown) => {
      return error instanceof TransactionServiceError && error.failureKind === 'ARTIFACT_INVALID' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
    await assert.rejects(() => fs.stat(path.join(root, 'implementation/workflow-state/registry/staging/TX-STAGE-INVALID/fixtures/invalid.json')));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects staging outside the transaction staging area', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-STAGE-ESCAPE' });
    await assert.rejects(() => service.stageArtifact('TX-STAGE-ESCAPE', '../escape.contract.json', 'contracts', validContract), (error: unknown) => {
      return error instanceof TransactionServiceError && error.failureKind === 'STAGING_PATH_ESCAPE' && error.frameworkError.code === 'REGISTRY_PATH_NORMALIZATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('does not permit transaction states beyond NEW in this slice', async () => {
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    const transaction = await service.createTransaction({ ...input, transaction_id: 'TX-STATE-001' });
    await fs.writeFile(path.join(repository.paths.transactions, 'TX-STATE-001.json'), JSON.stringify({ ...transaction, state: 'STAGED' }), 'utf8');
    await assert.rejects(() => service.loadTransaction('TX-STATE-001'), (error: unknown) => {
      return error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_STATE_UNSUPPORTED' && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED';
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects transaction identifiers before repository filesystem access', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    for (const transactionId of ['', '   ', '.', '..', '../outside', 'a/b', 'a\\b', '/absolute', 'invalid%id']) {
      await assert.rejects(
        () => service.createTransaction({ ...input, transaction_id: transactionId }),
        (error: unknown) => error instanceof TransactionServiceError
          && error.failureKind === 'TRANSACTION_INVALID'
          && error.frameworkError.code === 'REGISTRY_VALIDATION_FAILED',
      );
    }
    assert.equal(await fs.stat(path.join(root, 'implementation/workflow-state/registry')).then(() => true).catch(() => false), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('generated transaction identifiers satisfy the canonical identifier contract', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    const transaction = await service.createTransaction(input);
    assert.match(transaction.transaction_id, /^[A-Z0-9][A-Z0-9._-]{0,127}$/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('returns absence only for a missing transaction and rejects staging before creation', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await assert.rejects(() => service.loadTransaction('TX-MISSING'), (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_MISSING');
    assert.equal(await service.transactionExists('TX-MISSING'), false);
    await assert.rejects(() => service.stageArtifact('TX-MISSING', 'contracts/missing.contract.json', 'contracts', validContract), (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'TRANSACTION_MISSING');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects a schema/category mismatch without accepting caller-selected schemas', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-MAP-001' });
    await assert.rejects(
      () => service.stageArtifact('TX-MAP-001', 'contracts/read-dependency-status.contract.json', 'authority_tables', validContract),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'ARTIFACT_INVALID',
    );
    await assert.rejects(
      () => service.stageArtifact('TX-MAP-001', 'contracts/unknown.json', 'not-a-category' as never, validContract),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'ARTIFACT_INVALID',
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects staging-root symlink escapes before external mutation', async (t) => {
  const root = await createFixture();
  const external = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007b-external-'));
  try {
    const { service, repository } = await createService(root);
    await repository.bootstrap();
    await fs.rm(repository.paths.staging, { recursive: true, force: true });
    try {
      await fs.symlink(external, repository.paths.staging, 'dir');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM' || (error as NodeJS.ErrnoException).code === 'EACCES') return t.skip('symlink creation is unavailable');
      throw error;
    }
    await assert.rejects(
      () => service.createTransaction({ ...input, transaction_id: 'TX-SYMLINK-ROOT' }),
      (error: unknown) => (error instanceof TransactionServiceError && error.failureKind === 'STAGING_PATH_ESCAPE')
        || (error instanceof RegistryRepositoryError && error.frameworkError.code === 'REGISTRY_PATH_NORMALIZATION_FAILED'),
    );
    assert.deepEqual(await fs.readdir(external), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(external, { recursive: true, force: true });
  }
});

test('rejects a transaction staging child symlink escape', async (t) => {
  const root = await createFixture();
  const external = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-v2-007b-child-external-'));
  try {
    const { service, repository } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-SYMLINK-CHILD' });
    const child = path.join(repository.paths.staging, 'TX-SYMLINK-CHILD');
    await fs.rm(child, { recursive: true, force: true });
    try {
      await fs.symlink(external, child, 'dir');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM' || (error as NodeJS.ErrnoException).code === 'EACCES') return t.skip('symlink creation is unavailable');
      throw error;
    }
    await assert.rejects(() => service.createStagingArea('TX-SYMLINK-CHILD'), (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'STAGING_PATH_ESCAPE');
    assert.deepEqual(await fs.readdir(external), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(external, { recursive: true, force: true });
  }
});

test('does not overwrite an existing staged artifact', async () => {
  const root = await createFixture();
  try {
    const { service } = await createService(root);
    await service.createTransaction({ ...input, transaction_id: 'TX-STAGE-DUPLICATE' });
    await service.stageArtifact('TX-STAGE-DUPLICATE', 'contracts/read-dependency-status.contract.json', 'contracts', validContract);
    await assert.rejects(
      () => service.stageArtifact('TX-STAGE-DUPLICATE', 'contracts/read-dependency-status.contract.json', 'contracts', validContract),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'STAGING_FAILED',
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('removes newly created staging when transaction persistence fails', async (t) => {
  if (process.platform === 'win32') return t.skip('permission-based filesystem failure is not portable to Windows');
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await repository.bootstrap();
    await fs.chmod(repository.paths.transactions, 0o555);
    await assert.rejects(
      () => service.createTransaction({ ...input, transaction_id: 'TX-PERSISTENCE-FAIL' }),
      (error: unknown) => error instanceof TransactionServiceError
        && error.failureKind === 'PERSISTENCE_FAILURE'
        && error.frameworkError.code === 'REGISTRY_ARTIFACT_PERSISTENCE_FAILED',
    );
    await assert.rejects(fs.stat(path.join(repository.paths.staging, 'TX-PERSISTENCE-FAIL')));
    await assert.rejects(fs.stat(path.join(repository.paths.transactions, 'TX-PERSISTENCE-FAIL.json')));
  } catch (error) {
    if (error instanceof Error && /permission|denied|read-only/i.test(error.message)) return t.skip('filesystem permissions cannot force the failure on this platform');
    throw error;
  } finally {
    const transactions = path.join(root, 'implementation/workflow-state/registry/transactions');
    await fs.chmod(transactions, 0o755).catch(() => undefined);
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('preserves pre-existing staging when transaction creation fails', async (t) => {
  if (process.platform === 'win32') return t.skip('permission-based filesystem failure is not portable to Windows');
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await repository.bootstrap();
    const stagingPath = path.join(repository.paths.staging, 'TX-PREEXISTING-STAGING');
    await fs.mkdir(stagingPath);
    await fs.writeFile(path.join(stagingPath, 'existing.marker'), 'preserve', 'utf8');
    await fs.chmod(repository.paths.transactions, 0o555);
    await assert.rejects(
      () => service.createTransaction({ ...input, transaction_id: 'TX-PREEXISTING-STAGING' }),
      (error: unknown) => error instanceof TransactionServiceError && error.failureKind === 'PERSISTENCE_FAILURE',
    );
    assert.equal(await fs.readFile(path.join(stagingPath, 'existing.marker'), 'utf8'), 'preserve');
    await assert.rejects(fs.stat(path.join(repository.paths.transactions, 'TX-PREEXISTING-STAGING.json')));
  } catch (error) {
    if (error instanceof Error && /permission|denied|read-only/i.test(error.message)) return t.skip('filesystem permissions cannot force the failure on this platform');
    throw error;
  } finally {
    const transactions = path.join(root, 'implementation/workflow-state/registry/transactions');
    await fs.chmod(transactions, 0o755).catch(() => undefined);
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('preserves the original persistence error when cleanup also fails', async (t) => {
  if (process.platform === 'win32') return t.skip('permission-based filesystem failure is not portable to Windows');
  const root = await createFixture();
  try {
    const { service, repository } = await createService(root);
    await repository.bootstrap();
    await fs.writeFile(path.join(root, 'unrelated.marker'), 'unchanged', 'utf8');
    await fs.chmod(repository.paths.transactions, 0o555);

    let originalFailure: TransactionServiceError | undefined;
    await assert.rejects(
      () => service.createTransaction({ ...input, transaction_id: 'TX-CLEANUP-FAIL' }),
      (error: unknown) => {
        originalFailure = error as TransactionServiceError;
        return error instanceof TransactionServiceError
          && error.failureKind === 'PERSISTENCE_FAILURE'
          && error.frameworkError.code === 'REGISTRY_ARTIFACT_PERSISTENCE_FAILED';
      },
    );

    const cleanupFailure = new Error('forced cleanup failure for regression test');
    const rmdirMock = mock.method(fs, 'rmdir', async () => { throw cleanupFailure; });
    try {
      await assert.rejects(
        () => service.createTransaction({ ...input, transaction_id: 'TX-CLEANUP-FAIL' }),
        (error: unknown) => {
          assert.ok(error instanceof TransactionServiceError);
          assert.equal(error.failureKind, originalFailure?.failureKind);
          assert.equal(error.frameworkError.code, originalFailure?.frameworkError.code);
          assert.deepEqual(error.frameworkError.machine_metadata, originalFailure?.frameworkError.machine_metadata);
          assert.equal(error.causeSummary, originalFailure?.causeSummary);
          const diagnostic = Object.getOwnPropertyDescriptor(error, 'cleanupFailureSummary');
          assert.equal(diagnostic?.enumerable, false);
          assert.equal(diagnostic?.value, cleanupFailure.message);
          return true;
        },
      );
    } finally {
      rmdirMock.mock.restore();
    }

    assert.equal(await fs.readFile(path.join(root, 'unrelated.marker'), 'utf8'), 'unchanged');
    assert.equal((await fs.stat(path.join(repository.paths.staging, 'TX-CLEANUP-FAIL'))).isDirectory(), true);
    await assert.rejects(fs.stat(path.join(repository.paths.transactions, 'TX-CLEANUP-FAIL.json')));
  } catch (error) {
    throw error;
  } finally {
    const transactions = path.join(root, 'implementation/workflow-state/registry/transactions');
    await fs.chmod(transactions, 0o755).catch(() => undefined);
    await fs.rm(root, { recursive: true, force: true });
  }
});
