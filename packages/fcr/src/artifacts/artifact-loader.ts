import fs from 'node:fs/promises';
import path from 'node:path';
import {
  FCR_INDEX_RELATIVE_PATH,
  FCR_ROOT_RELATIVE_PATH,
  normalizeRepositoryRelativePath,
  resolveRepositoryRelativePath,
  resolveRepositoryRoot,
} from '../config/repository-paths.js';
import type {
  ArtifactCategory,
  ArtifactLoadResult,
  FrameworkErrorDefinition,
  IndexedArtifact,
  JsonObject,
  RegistryIndex,
  ValidationIssue,
} from './artifact-types.js';
import { FrameworkErrorService } from '../errors/framework-error-service.js';
import { assertJsonDomain, freezeJson } from '../runtime/json-values.js';
import { RegistryBootstrapError, validateRegistryBeforeConsumption } from '../validation/registry-bootstrap-validator.js';

export class FcrRuntimeError extends Error {
  public constructor(
    public readonly frameworkError: ReturnType<FrameworkErrorService['create']>,
    public readonly issues: readonly ValidationIssue[] = [],
  ) {
    super(frameworkError.message);
    this.name = 'FcrRuntimeError';
  }
}

export class ArtifactLoader {
  public readonly repositoryRoot: string;
  private readonly errorServicePromise: Promise<FrameworkErrorService>;

  public constructor(repositoryRoot: string = resolveRepositoryRoot()) {
    this.repositoryRoot = path.resolve(repositoryRoot);
    this.errorServicePromise = FrameworkErrorService.fromRepository(this.repositoryRoot);
  }

  public async load(): Promise<ArtifactLoadResult> {
    const errorService = await this.errorServicePromise;
    const realRepositoryRoot = await fs.realpath(this.repositoryRoot);
    const fcrRootPath = resolveRepositoryRelativePath(this.repositoryRoot, FCR_ROOT_RELATIVE_PATH);
    let realFcrRoot: string;
    try { realFcrRoot = await fs.realpath(fcrRootPath); }
    catch { throw this.runtimeError(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: FCR_ROOT_RELATIVE_PATH }); }
    if (!isContained(realRepositoryRoot, realFcrRoot)) {
      throw this.runtimeError(errorService, 'REGISTRY_PATH_NORMALIZATION_FAILED', { path: FCR_ROOT_RELATIVE_PATH });
    }
    const realIndexPath = await this.resolveIndexedPath(errorService, FCR_INDEX_RELATIVE_PATH, fcrRootPath, realFcrRoot, realRepositoryRoot);
    if (!realIndexPath) throw this.runtimeError(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: FCR_INDEX_RELATIVE_PATH });
    let index: RegistryIndex;
    try {
      index = await validateRegistryBeforeConsumption(realRepositoryRoot, realFcrRoot, errorService);
    } catch (cause) {
      if (cause instanceof RegistryBootstrapError) throw new FcrRuntimeError(cause.frameworkError, cause.issues);
      throw this.runtimeError(errorService, 'REGISTRY_SCHEMA_INVALID', { path: FCR_INDEX_RELATIVE_PATH });
    }

    const references = collectReferences(index);
    const normalizedReferences: ArtifactReference[] = [];
    const pathIssues: ReturnType<FrameworkErrorService['create']>[] = [];
    for (const reference of references) {
      try {
        normalizedReferences.push({ ...reference, path: normalizeFcrArtifactPath(reference.path) });
      } catch {
        pathIssues.push(this.runtimeError(errorService, 'REGISTRY_PATH_NORMALIZATION_FAILED', { path: reference.path }).frameworkError);
      }
    }
    const duplicatePaths = duplicates(normalizedReferences.map((reference) => reference.path));
    if (duplicatePaths.length > 0) {
      throw this.runtimeError(errorService, 'REGISTRY_VALIDATION_FAILED', { duplicate_paths: duplicatePaths });
    }

    const artifacts: IndexedArtifact[] = [];
    const issues: ReturnType<FrameworkErrorService['create']>[] = [...pathIssues];
    const logicalIds = new Map<string, string>();
    for (const reference of normalizedReferences) {
      const realPath = await this.resolveIndexedPath(errorService, reference.path, fcrRootPath, realFcrRoot, realRepositoryRoot, issues);
      if (!realPath) {
        continue;
      }
      let raw: unknown;
      let fileBytes: Buffer;
      try {
        fileBytes = await fs.readFile(realPath);
        raw = JSON.parse(fileBytes.toString('utf8'));
        assertJsonDomain(raw);
      } catch {
        issues.push(this.runtimeError(errorService, 'REGISTRY_SCHEMA_INVALID', { path: reference.path }).frameworkError);
        continue;
      }
      const frozenRaw = freezeJson(raw);
      const categoryIssue = categoryShapeIssue(reference.category, reference.path, frozenRaw);
      if (categoryIssue) issues.push(this.runtimeError(errorService, 'REGISTRY_VALIDATION_FAILED', { source: reference.path, reason: categoryIssue }).frameworkError);
      const logicalId = logicalArtifactId(frozenRaw, reference.category);
      if (logicalId) {
        const previous = logicalIds.get(logicalId);
        if (previous) issues.push(this.runtimeError(errorService, 'REGISTRY_VALIDATION_FAILED', { logical_id: logicalId, first_path: previous, duplicate_path: reference.path }).frameworkError);
        else logicalIds.set(logicalId, reference.path);
      }
      artifacts.push(Object.freeze({ repositoryRelativePath: reference.path, absolutePath: realPath, category: reference.category, raw: frozenRaw, byteLength: fileBytes.byteLength }));
    }

    const indexed = new Set(normalizedReferences.map((reference) => reference.path));
    indexed.add(FCR_INDEX_RELATIVE_PATH);
    for (const file of await jsonFilesUnder(realFcrRoot)) {
      const relative = path.relative(realRepositoryRoot, file).split(path.sep).join('/');
      if (!indexed.has(relative)) issues.push(this.runtimeError(errorService, 'REGISTRY_VALIDATION_FAILED', { unindexed_path: relative }).frameworkError);
    }
    const orderedArtifacts = Object.freeze([...artifacts].sort((left, right) => left.repositoryRelativePath < right.repositoryRelativePath ? -1 : left.repositoryRelativePath > right.repositoryRelativePath ? 1 : 0));
    return Object.freeze({ index: freezeRegistryIndex(index), artifacts: orderedArtifacts, issues: Object.freeze(issues) });
  }

  private async resolveIndexedPath(
    errorService: FrameworkErrorService,
    relativePath: string,
    lexicalFcrRoot: string,
    realFcrRoot: string,
    realRepositoryRoot: string,
    issues?: ReturnType<FrameworkErrorService['create']>[],
  ): Promise<string | undefined> {
    let lexicalPath: string;
    try { lexicalPath = resolveRepositoryRelativePath(this.repositoryRoot, relativePath); }
    catch {
      const error = this.runtimeError(errorService, 'REGISTRY_PATH_NORMALIZATION_FAILED', { path: relativePath });
      if (issues) { issues.push(error.frameworkError); return undefined as never; }
      throw error;
    }
    if (!isContained(lexicalFcrRoot, lexicalPath) || !isContained(this.repositoryRoot, lexicalPath)) {
      const error = this.runtimeError(errorService, 'REGISTRY_PATH_NORMALIZATION_FAILED', { path: relativePath });
      if (issues) { issues.push(error.frameworkError); return undefined as never; }
      throw error;
    }
    let realPath: string;
    try { realPath = await fs.realpath(lexicalPath); }
    catch {
      const error = this.runtimeError(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: relativePath });
      if (issues) { issues.push(error.frameworkError); return undefined as never; }
      throw error;
    }
    if (!isContained(realFcrRoot, realPath) || !isContained(realRepositoryRoot, realPath)) {
      const error = this.runtimeError(errorService, 'REGISTRY_PATH_NORMALIZATION_FAILED', { path: relativePath });
      if (issues) { issues.push(error.frameworkError); return undefined as never; }
      throw error;
    }
    let stat;
    try { stat = await fs.stat(realPath); }
    catch {
      const error = this.runtimeError(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: relativePath });
      if (issues) { issues.push(error.frameworkError); return undefined; }
      throw error;
    }
    if (!stat.isFile()) {
      const error = this.runtimeError(errorService, 'REGISTRY_DOCUMENT_MISSING', { path: relativePath });
      if (issues) { issues.push(error.frameworkError); return undefined; }
      throw error;
    }
    return realPath;
  }

  private runtimeError(errorService: FrameworkErrorService, code: string, metadata: JsonObject): FcrRuntimeError {
    return new FcrRuntimeError(errorService.createDiagnostic(code, metadata));
  }
}

interface ArtifactReference { path: string; category: ArtifactCategory; }

function collectReferences(index: RegistryIndex): ArtifactReference[] {
  const categories: ArtifactCategory[] = ['schemas', 'contracts', 'predicates', 'transition_tables', 'authority_tables', 'error_catalogs', 'bootstrap_contracts', 'context_contracts', 'examples'];
  return categories.flatMap((category) => index[category].map((reference) => ({ path: reference, category })));
}

function normalizeFcrArtifactPath(relativePath: string): string {
  const normalized = normalizeRepositoryRelativePath(relativePath);
  const prefix = `${FCR_ROOT_RELATIVE_PATH}/`;
  if (!normalized.startsWith(prefix)) throw new Error('artifact path is outside the FCR root');
  return normalized;
}

function freezeRegistryIndex(index: RegistryIndex): RegistryIndex {
  return Object.freeze({
    ...index,
    schemas: Object.freeze([...index.schemas]),
    contracts: Object.freeze([...index.contracts]),
    predicates: Object.freeze([...index.predicates]),
    transition_tables: Object.freeze([...index.transition_tables]),
    authority_tables: Object.freeze([...index.authority_tables]),
    error_catalogs: Object.freeze([...index.error_catalogs]),
    bootstrap_contracts: Object.freeze([...index.bootstrap_contracts]),
    context_contracts: Object.freeze([...index.context_contracts]),
    examples: Object.freeze([...index.examples]),
  });
}

function logicalArtifactId(value: unknown, category: ArtifactCategory): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  for (const key of ['$id', 'operation_id', 'predicate_id', 'transition_id', 'precondition_id', 'algorithm_id', 'code']) {
    if (key === 'operation_id' && category !== 'contracts') continue;
    if (typeof record[key] === 'string') return `${key}:${record[key]}`;
  }
  return undefined;
}

function categoryShapeIssue(category: ArtifactCategory, relativePath: string, value: unknown): string | undefined {
  const record = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
  if (!record) return `artifact is not an object for category ${category}`;
  if (category === 'schemas' && (typeof record.$id !== 'string' || typeof record.$schema !== 'string')) return 'schema category requires $id and $schema';
  if (category === 'contracts' && relativePath.endsWith('.contract.json') && typeof record.operation_id !== 'string') return 'contract category requires operation_id';
  if (category === 'predicates' && typeof record.predicate_id !== 'string' && typeof record.algorithm_id !== 'string') return 'predicate category requires predicate_id or algorithm_id';
  if (category === 'transition_tables' && typeof record.precondition_id !== 'string' && !Array.isArray(record.transitions)) return 'transition category requires precondition_id or transitions';
  if (category === 'error_catalogs' && !Array.isArray(record.errors)) return 'error catalog category requires errors';
  return undefined;
}

function duplicates(values: readonly string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function isContained(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function jsonFilesUnder(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await jsonFilesUnder(absolute));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(absolute);
  }
  return files;
}

export { FCR_INDEX_RELATIVE_PATH };
