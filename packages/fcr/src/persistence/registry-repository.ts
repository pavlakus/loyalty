import fs from 'node:fs/promises';

import type { RuntimeFrameworkError } from '../artifacts/artifact-types.js';
import { ArtifactLoader } from '../artifacts/artifact-loader.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import { resolveRepositoryRoot } from '../config/repository-paths.js';
import { SchemaValidator } from '../validation/schema-validator.js';
import {
  FRAMEWORK_REGISTRY_FILENAME,
  REGISTRY_DIRECTORY_NAMES,
  RegistryFilesystemPathResolver,
  type RegistryFilesystemPaths,
} from './filesystem-paths.js';

const REGISTRY_REVISION_SCHEMA_PATH = 'docs/ai-engineering-framework/fcr/schemas/registry-revision.schema.json';
const REVISION_ID_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,127}$/;

export interface CurrentRevisionReference {
  readonly revision_id: string;
}

export type RegistryRepositoryFailureKind =
  | 'REPOSITORY_MISSING'
  | 'CURRENT_POINTER_MISSING'
  | 'POINTER_JSON_MALFORMED'
  | 'POINTER_SCHEMA_INVALID'
  | 'REFERENCED_REVISION_MISSING'
  | 'REFERENCED_REVISION_TARGET_NOT_FILE'
  | 'REFERENCED_REVISION_JSON_MALFORMED'
  | 'REFERENCED_REVISION_INVALID'
  | 'REGISTRY_PATH_ESCAPE'
  | 'PERSISTENCE_FAILURE';

export class RegistryRepositoryError extends Error {
  public constructor(
    message: string,
    public readonly frameworkError: RuntimeFrameworkError,
    public readonly failureKind: RegistryRepositoryFailureKind,
    public readonly causeSummary?: string,
  ) {
    super(message);
    this.name = 'RegistryRepositoryError';
  }
}

export class RegistryRepository {
  private readonly pathResolver: RegistryFilesystemPathResolver;

  public constructor(
    repositoryRoot: string,
    private readonly errorService: FrameworkErrorService,
    private readonly schemaValidator?: SchemaValidator,
  ) {
    this.pathResolver = new RegistryFilesystemPathResolver(resolveRepositoryRoot(repositoryRoot));
  }

  public static async create(repositoryRoot: string = process.cwd()): Promise<RegistryRepository> {
    const resolvedRoot = resolveRepositoryRoot(repositoryRoot);
    const errorService = await FrameworkErrorService.fromRepository(resolvedRoot);
    const loader = new ArtifactLoader(resolvedRoot);
    return new RegistryRepository(resolvedRoot, errorService, new SchemaValidator(loader, errorService));
  }

  public get paths(): RegistryFilesystemPaths {
    return this.pathResolver.paths;
  }

  public async bootstrap(): Promise<void> {
    try {
      await this.assertContained(this.paths.registryRoot, 'REGISTRY_PATH_ESCAPE');
      await Promise.all(REGISTRY_DIRECTORY_NAMES.map((directory) => this.assertContained(this.paths[directory], 'REGISTRY_PATH_ESCAPE')));
      await fs.mkdir(this.paths.registryRoot, { recursive: true });
      await Promise.all(REGISTRY_DIRECTORY_NAMES.map((directory) => fs.mkdir(this.paths[directory], { recursive: true })));
    } catch (cause) {
      if (cause instanceof RegistryRepositoryError) throw cause;
      throw this.persistenceError('bootstrap_directories', cause);
    }
  }

  public async currentRevisionExists(): Promise<boolean> {
    try {
      await this.readCurrentRevision();
      return true;
    } catch (error) {
      if (error instanceof RegistryRepositoryError && (
        error.failureKind === 'REPOSITORY_MISSING'
        || error.failureKind === 'CURRENT_POINTER_MISSING'
        || error.failureKind === 'REFERENCED_REVISION_MISSING'
      )) return false;
      throw error;
    }
  }

  public async readCurrentRevision(): Promise<CurrentRevisionReference> {
    const registryPath = this.paths.frameworkRegistry;
    await this.ensureRegistryRoot();
    await this.assertContained(registryPath, 'REGISTRY_PATH_ESCAPE');
    let parsed: unknown;
    try {
      parsed = JSON.parse(await fs.readFile(registryPath, 'utf8')) as unknown;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
        throw this.documentError(this.pathResolver.relativePath(registryPath), 'CURRENT_POINTER_MISSING', cause);
      }
      if (cause instanceof SyntaxError) {
        throw this.validationError(this.pathResolver.relativePath(registryPath), 'POINTER_JSON_MALFORMED');
      }
      throw this.persistenceError('read_current_pointer', cause);
    }

    if (!isCurrentRevisionReference(parsed)) {
      throw this.validationError(this.pathResolver.relativePath(registryPath), 'POINTER_SCHEMA_INVALID');
    }

    let revisionPath: string;
    try {
      revisionPath = this.pathResolver.childPath('revisions', `${parsed.revision_id}.json`);
      await this.assertContained(revisionPath, 'REGISTRY_PATH_ESCAPE');
    } catch (cause) {
      if (cause instanceof RegistryRepositoryError) throw cause;
      throw this.validationError(this.pathResolver.relativePath(registryPath), 'POINTER_SCHEMA_INVALID', cause);
    }
    try {
      const revisionStat = await fs.stat(revisionPath);
      if (!revisionStat.isFile()) {
        throw this.validationError(this.pathResolver.relativePath(revisionPath), 'REFERENCED_REVISION_TARGET_NOT_FILE');
      }
    } catch (cause) {
      if (cause instanceof RegistryRepositoryError) throw cause;
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
        throw this.documentError(this.pathResolver.relativePath(revisionPath), 'REFERENCED_REVISION_MISSING', cause);
      }
      throw this.persistenceError('read_current_revision', cause);
    }

    let revision: unknown;
    try {
      revision = JSON.parse(await fs.readFile(revisionPath, 'utf8')) as unknown;
    } catch (cause) {
      if (cause instanceof SyntaxError) {
        throw this.validationError(this.pathResolver.relativePath(revisionPath), 'REFERENCED_REVISION_JSON_MALFORMED');
      }
      throw this.persistenceError('read_current_revision', cause);
    }
    const validation = await (this.schemaValidator ?? this.createSchemaValidator()).validateRecord(REGISTRY_REVISION_SCHEMA_PATH, revision);
    if (!validation.valid) {
      const error = this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', {
        path: this.pathResolver.relativePath(revisionPath),
        schema_path: REGISTRY_REVISION_SCHEMA_PATH,
        issues: validation.issues,
      });
      throw this.repositoryError(
        `current revision is invalid: ${this.pathResolver.relativePath(revisionPath)}`,
        error,
        'REFERENCED_REVISION_INVALID',
      );
    }
    return Object.freeze({ revision_id: parsed.revision_id });
  }

  private async ensureRegistryRoot(): Promise<void> {
    await this.assertContained(this.paths.registryRoot, 'REGISTRY_PATH_ESCAPE');
    try {
      const stat = await fs.stat(this.paths.registryRoot);
      if (!stat.isDirectory()) throw this.validationError(this.pathResolver.relativePath(this.paths.registryRoot), 'REPOSITORY_MISSING');
    } catch (cause) {
      if (cause instanceof RegistryRepositoryError) throw cause;
      if ((cause as NodeJS.ErrnoException).code === 'ENOENT') {
        throw this.documentError(this.pathResolver.relativePath(this.paths.registryRoot), 'REPOSITORY_MISSING', cause);
      }
      throw this.persistenceError('read_registry_root', cause);
    }
  }

  private async assertContained(filePath: string, kind: RegistryRepositoryFailureKind): Promise<void> {
    try {
      await this.pathResolver.assertContainedFilesystemPath(filePath);
    } catch (cause) {
      throw this.repositoryError(
        `registry path is not repository-contained: ${this.pathResolver.relativePath(this.paths.registryRoot)}`,
        this.errorService.createDiagnostic('REGISTRY_PATH_NORMALIZATION_FAILED', { path: this.pathResolver.relativePath(this.paths.registryRoot) }),
        kind,
        cause,
      );
    }
  }

  private documentError(relativePath: string, kind: RegistryRepositoryFailureKind, cause?: unknown): RegistryRepositoryError {
    return this.repositoryError(
      `registry document is missing or unreadable: ${relativePath}`,
      this.errorService.createDiagnostic('REGISTRY_DOCUMENT_MISSING', { path: relativePath }),
      kind,
      cause,
    );
  }

  private validationError(relativePath: string, kind: RegistryRepositoryFailureKind, cause?: unknown): RegistryRepositoryError {
    return this.repositoryError(
      `current revision reference is invalid: ${relativePath}`,
      this.errorService.createDiagnostic('REGISTRY_VALIDATION_FAILED', { path: relativePath }),
      kind,
      cause,
    );
  }

  private persistenceError(step: string, cause: unknown): RegistryRepositoryError {
    return this.repositoryError(
      `registry persistence failed during ${step}`,
      this.errorService.createDiagnostic('REGISTRY_PERSISTENCE_FAILED', { journal_step: step }),
      'PERSISTENCE_FAILURE',
      cause,
    );
  }

  private repositoryError(message: string, frameworkError: RuntimeFrameworkError, failureKind: RegistryRepositoryFailureKind, cause?: unknown): RegistryRepositoryError {
    return new RegistryRepositoryError(message, frameworkError, failureKind, cause instanceof Error ? cause.message : undefined);
  }

  private createSchemaValidator(): SchemaValidator {
    const loader = new ArtifactLoader(this.paths.repositoryRoot);
    return new SchemaValidator(loader, this.errorService);
  }
}

function isCurrentRevisionReference(value: unknown): value is CurrentRevisionReference {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).length === 1 && typeof record.revision_id === 'string' && REVISION_ID_PATTERN.test(record.revision_id);
}
