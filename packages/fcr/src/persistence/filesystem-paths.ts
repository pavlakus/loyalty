import fs from 'node:fs/promises';
import path from 'node:path';

import {
  normalizeRepositoryRelativePath,
  resolveRepositoryRelativePath,
  resolveRepositoryRoot,
} from '../config/repository-paths.js';

export const REGISTRY_ROOT_RELATIVE_PATH = 'implementation/workflow-state/registry';
export const FRAMEWORK_REGISTRY_FILENAME = 'framework-registry.json';
export const REGISTRY_DIRECTORY_NAMES = [
  'revisions',
  'transactions',
  'locks',
  'projections',
  'staging',
] as const;

export type RegistryDirectoryName = (typeof REGISTRY_DIRECTORY_NAMES)[number];

export interface RegistryFilesystemPaths {
  readonly repositoryRoot: string;
  readonly registryRoot: string;
  readonly frameworkRegistry: string;
  readonly revisions: string;
  readonly transactions: string;
  readonly locks: string;
  readonly projections: string;
  readonly staging: string;
}

export class RegistryFilesystemPathResolver {
  public readonly paths: RegistryFilesystemPaths;

  public constructor(repositoryRoot: string) {
    const resolvedRepositoryRoot = resolveRepositoryRoot(repositoryRoot);
    const registryRoot = resolveRepositoryRelativePath(resolvedRepositoryRoot, REGISTRY_ROOT_RELATIVE_PATH);
    const directories = Object.fromEntries(
      REGISTRY_DIRECTORY_NAMES.map((name) => [name, path.join(registryRoot, name)]),
    ) as Record<RegistryDirectoryName, string>;

    this.paths = Object.freeze({
      repositoryRoot: resolvedRepositoryRoot,
      registryRoot,
      frameworkRegistry: path.join(registryRoot, FRAMEWORK_REGISTRY_FILENAME),
      ...directories,
    });
  }

  public relativePath(absolutePath: string): string {
    const relative = path.relative(this.paths.repositoryRoot, path.resolve(absolutePath));
    if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('registry path is outside the repository');
    }
    return normalizeRepositoryRelativePath(relative);
  }

  public childPath(directory: RegistryDirectoryName, identifier: string): string {
    if (!identifier || identifier === '.' || identifier === '..' || identifier.includes('/') || identifier.includes('\\')) {
      throw new Error('registry child identifier must be a single path segment');
    }
    const candidate = path.resolve(this.paths[directory], identifier);
    const relative = path.relative(this.paths[directory], candidate);
    if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('registry child path escapes its directory');
    }
    return candidate;
  }

  /**
   * Checks the lexical path and the nearest existing filesystem ancestor.
   * Missing descendants are allowed for bootstrap, but an existing symlink
   * anywhere in the path must resolve inside the real repository root.
   */
  public async assertContainedFilesystemPath(absolutePath: string): Promise<void> {
    const candidate = path.resolve(absolutePath);
    const lexicalRelative = path.relative(this.paths.repositoryRoot, candidate);
    if (lexicalRelative !== '' && (lexicalRelative.startsWith('..') || path.isAbsolute(lexicalRelative))) {
      throw new Error('registry path escapes repository root');
    }

    const realRepositoryRoot = await fs.realpath(this.paths.repositoryRoot);
    let probe = candidate;
    while (true) {
      try {
        const realProbe = await fs.realpath(probe);
        const realRelative = path.relative(realRepositoryRoot, realProbe);
        if (realRelative !== '' && (realRelative.startsWith('..') || path.isAbsolute(realRelative))) {
          throw new Error('registry path resolves outside repository root');
        }
        return;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        const parent = path.dirname(probe);
        if (parent === probe) throw error;
        probe = parent;
      }
    }
  }
}
