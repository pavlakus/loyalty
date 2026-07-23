import { ArtifactLoader } from './artifacts/artifact-loader.js';
import type { DeepReadonly, TaskRecord, ValidationResult } from './artifacts/artifact-types.js';
import { resolveRepositoryRoot } from './config/repository-paths.js';
import { FrameworkErrorService } from './errors/framework-error-service.js';
import { CanonicalJsonService } from './canonical/canonical-json-service.js';
import { SchemaValidator } from './validation/schema-validator.js';

export { ArtifactLoader, FcrRuntimeError } from './artifacts/artifact-loader.js';
export { CanonicalJsonService } from './canonical/canonical-json-service.js';
export { FrameworkErrorService } from './errors/framework-error-service.js';
export { SchemaValidator } from './validation/schema-validator.js';
export { RegistryRepository, RegistryRepositoryError } from './persistence/registry-repository.js';
export { RegistryFilesystemPathResolver } from './persistence/filesystem-paths.js';
export { TransactionService, TransactionServiceError } from './transactions/transaction-service.js';
export type { CreateTransactionInput, StagedArtifact, TransactionFailureKind } from './transactions/transaction-service.js';
export type { CurrentRevisionReference } from './persistence/registry-repository.js';
export type { RegistryDirectoryName, RegistryFilesystemPaths } from './persistence/filesystem-paths.js';
export type * from './artifacts/artifact-types.js';
export type * from './errors/framework-error-types.js';
export type * from './runtime/state-models.js';

export async function validateTaskRecord(input: unknown, repositoryRoot: string = resolveRepositoryRoot()): Promise<ValidationResult<DeepReadonly<TaskRecord>>> {
  const loader = new ArtifactLoader(repositoryRoot);
  const errorService = await FrameworkErrorService.fromRepository(loader.repositoryRoot);
  const validator = new SchemaValidator(loader, errorService);
  return validator.validateTaskRecord(input);
}

export async function createFcrRuntime(repositoryRoot: string = resolveRepositoryRoot()): Promise<{ loader: ArtifactLoader; validator: SchemaValidator; errors: FrameworkErrorService; canonicalJson: CanonicalJsonService }> {
  const loader = new ArtifactLoader(repositoryRoot);
  const errors = await FrameworkErrorService.fromRepository(loader.repositoryRoot);
  return { loader, validator: new SchemaValidator(loader, errors), errors, canonicalJson: new CanonicalJsonService() };
}
