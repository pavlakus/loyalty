import fs from 'node:fs/promises';
import path from 'node:path';

import { CanonicalJsonService } from '../canonical/canonical-json-service.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import type { SchemaValidator } from '../validation/schema-validator.js';
import type { TransactionService } from '../transactions/transaction-service.js';
import { constructAcquiredLockRecord } from './lock-record.js';
import { RegistryLockPathResolver } from './lock-paths.js';
import { validateRegistryLockAcquisitionTransaction } from './lock-prerequisites.js';
import type { AcquireRegistryLockInput, LockRecord } from './lock-types.js';

export class RegistryLockAcquisitionError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: ReturnType<FrameworkErrorService['createDiagnostic']>,
    public readonly causeSummary?: string,
  ) {
    super(frameworkError.message);
    this.name = 'RegistryLockAcquisitionError';
  }
}

export class RegistryLockAcquisitionService {
  private readonly paths: RegistryLockPathResolver;

  public constructor(
    private readonly transactionService: TransactionService,
    private readonly schemaValidator: SchemaValidator,
    private readonly errorService: FrameworkErrorService,
    repositoryRoot: string,
    private readonly canonicalJson: CanonicalJsonService = new CanonicalJsonService(),
  ) {
    this.paths = new RegistryLockPathResolver(repositoryRoot);
  }

  public async acquireRegistryWriteLock(input: AcquireRegistryLockInput): Promise<Readonly<LockRecord>> {
    const transaction = await validateRegistryLockAcquisitionTransaction(this.transactionService, input.ownerTransactionId, this.errorService);
    const acquiredAt = new Date().toISOString();
    const record = await constructAcquiredLockRecord({
      ownerTransactionId: transaction.transaction_id,
      ownerIdentity: input.ownerIdentity,
      acquiredAt,
    }, this.schemaValidator);
    const lockPath = this.paths.resolveRegistryWriteLockPath();

    try {
      await this.paths.assertContainedPath(lockPath);
      await fs.mkdir(path.dirname(lockPath), { recursive: true });
      await this.paths.assertContainedPath(lockPath);
      const bytes = Buffer.concat([
        Buffer.from(this.canonicalJson.canonicalBytes(record)),
        Buffer.from('\n', 'utf8'),
      ]);
      await fs.writeFile(lockPath, bytes, { flag: 'wx' });
      return record;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new RegistryLockAcquisitionError(
          'registry-write lock already exists',
          this.errorService.createOccurrence('REGISTRY_LOCK_CONFLICT', {
            transaction_id: input.ownerTransactionId,
            request_id: 'UNAVAILABLE',
            task_id: 'UNAVAILABLE',
            module_id: 'FCR',
            repository_id: 'UNAVAILABLE',
            repository_revision: 'UNAVAILABLE',
            registry_revision: 'UNAVAILABLE',
            failure_phase: 'VALIDATION',
            source_ids: 'REGISTRY_WRITE',
            validator_name: 'FCR',
            validator_version: 'V2-007C',
            recovery_id: 'NONE',
            lock_id: 'REGISTRY_WRITE',
            observed_heartbeat: 'UNAVAILABLE',
          }),
          cause instanceof Error ? cause.message : undefined,
        );
      }
      if (cause instanceof RegistryLockAcquisitionError) throw cause;
      throw new RegistryLockAcquisitionError(
        'registry-write lock persistence failed',
        this.errorService.createDiagnostic('REGISTRY_PERSISTENCE_FAILED', { journal_step: 'acquire_registry_write_lock' }),
        cause instanceof Error ? cause.message : undefined,
      );
    }
  }
}
