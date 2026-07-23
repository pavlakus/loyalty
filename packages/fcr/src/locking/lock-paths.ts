import path from 'node:path';

import { RegistryFilesystemPathResolver } from '../persistence/filesystem-paths.js';
import {
  REGISTRY_WRITE_LOCK_FILENAME,
  REGISTRY_WRITE_NAMESPACE,
} from './lock-types.js';

const TRANSITION_ID_PATTERN = /^REL_[A-F0-9]{64}$/;

export class RegistryLockPathResolver {
  private readonly registryPaths: RegistryFilesystemPathResolver;

  public constructor(repositoryRoot: string) {
    this.registryPaths = new RegistryFilesystemPathResolver(repositoryRoot);
  }

  public resolveRegistryWriteLockPath(): string {
    return this.registryPaths.childPath('locks', REGISTRY_WRITE_LOCK_FILENAME);
  }

  public resolveRegistryWriteTransitionDirectory(): string {
    return this.resolveContainedChild(
      this.registryPaths.paths.registryRoot,
      'lock-transitions',
      REGISTRY_WRITE_NAMESPACE,
    );
  }

  public resolveRegistryWriteTransitionPath(transitionId: string): string {
    if (!TRANSITION_ID_PATTERN.test(transitionId)) {
      throw new Error('transition identifier must match the canonical release-transition format');
    }
    const directory = this.resolveRegistryWriteTransitionDirectory();
    return this.resolveContainedChild(directory, `${transitionId}.json`);
  }

  public async assertContainedPath(absolutePath: string): Promise<void> {
    await this.registryPaths.assertContainedFilesystemPath(absolutePath);
  }

  private resolveContainedChild(parent: string, ...segments: string[]): string {
    const candidate = path.resolve(parent, ...segments);
    const relative = path.relative(parent, candidate);
    if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('lock path escapes its canonical directory');
    }
    return candidate;
  }
}

