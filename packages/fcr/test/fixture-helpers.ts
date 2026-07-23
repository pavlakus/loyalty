import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function copyFcrFixture(repositoryRoot: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcr-fixture-'));
  await fs.mkdir(path.join(root, '.git'));
  await fs.writeFile(path.join(root, 'package.json'), '{}');
  await fs.cp(path.join(repositoryRoot, 'docs/ai-engineering-framework/fcr'), path.join(root, 'docs/ai-engineering-framework/fcr'), { recursive: true });
  return root;
}

export async function readJson<T>(root: string, relativePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8')) as T;
}

export async function writeJson(root: string, relativePath: string, value: unknown): Promise<void> {
  await fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value)}\n`, 'utf8');
}
