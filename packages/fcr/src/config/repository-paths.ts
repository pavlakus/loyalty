import fs from 'node:fs';
import path from 'node:path';

export const FCR_INDEX_RELATIVE_PATH = 'docs/ai-engineering-framework/fcr/registry.json';
export const FCR_ROOT_RELATIVE_PATH = 'docs/ai-engineering-framework/fcr';

export function resolveRepositoryRoot(startPath: string = process.cwd()): string {
  let current = path.resolve(startPath);
  while (true) {
    if (path.basename(current) === '.git' || path.basename(current) === 'node_modules') {
      current = path.dirname(current);
      continue;
    }
    const packagePath = path.join(current, 'package.json');
    const gitPath = path.join(current, '.git');
    if (fs.existsSync(packagePath) && fs.existsSync(gitPath)) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error('repository root could not be resolved');
    current = parent;
  }
}

export function normalizeRepositoryRelativePath(relativePath: string): string {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    throw new Error(`repository-relative path required: ${relativePath}`);
  }
  const portablePath = relativePath.replaceAll(path.sep, '/');
  if (portablePath.split('/').some((segment) => segment === '.' || segment === '..')) {
    throw new Error(`repository path traversal is not allowed: ${relativePath}`);
  }
  const normalized = path.posix.normalize(portablePath);
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../') || normalized.startsWith('/')) {
    throw new Error(`repository path escapes repository root: ${relativePath}`);
  }
  return normalized;
}

export function resolveRepositoryRelativePath(repositoryRoot: string, relativePath: string): string {
  const normalized = normalizeRepositoryRelativePath(relativePath);
  const root = path.resolve(repositoryRoot);
  const candidate = path.resolve(root, normalized);
  const relative = path.relative(root, candidate);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`repository path escapes repository root: ${relativePath}`);
  }
  return candidate;
}
