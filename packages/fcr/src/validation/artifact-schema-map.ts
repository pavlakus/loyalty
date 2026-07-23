import path from 'node:path';
import type { ArtifactCategory, IndexedArtifact } from '../artifacts/artifact-types.js';

export type ArtifactPlan =
  | { readonly kind: 'SCHEMA'; readonly normative: false }
  | { readonly kind: 'RECORD'; readonly normative: true; readonly schemaPath: string; readonly selector: 'whole' | 'transitions' | 'errors' }
  | { readonly kind: 'NON_NORMATIVE'; readonly normative: false; readonly reason: string };

const ROOT = 'docs/ai-engineering-framework/fcr';
const SCHEMA_ROOT = `${ROOT}/schemas`;

/**
 * This is the single runtime mapping from indexed registry categories to the
 * canonical schemas.  The registry and Document 84 define the singleton
 * filenames; all other mappings are category-driven and closed.
 */
export function planForArtifact(artifact: IndexedArtifact): ArtifactPlan {
  const relative = artifact.repositoryRelativePath;
  const basename = path.posix.basename(relative);

  if (artifact.category === 'schemas') return { kind: 'SCHEMA', normative: false };
  if (artifact.category === 'examples') {
    return { kind: 'NON_NORMATIVE', normative: false, reason: 'registry examples are explanatory and are not normative records' };
  }

  if (artifact.category === 'contracts') {
    if (basename.endsWith('.schema.json')) return { kind: 'SCHEMA', normative: false };
    if (basename.endsWith('.contract.json')) return record(`${SCHEMA_ROOT}/contract-record.schema.json`);
    throw new Error(`unmapped contract artifact: ${relative}`);
  }

  if (artifact.category === 'authority_tables') return record(`${SCHEMA_ROOT}/authority-record.schema.json`);
  if (artifact.category === 'bootstrap_contracts') return record(`${SCHEMA_ROOT}/bootstrap-record.schema.json`);
  if (artifact.category === 'context_contracts') {
    if (basename.endsWith('.schema.json')) return { kind: 'SCHEMA', normative: false };
    return record(`${SCHEMA_ROOT}/context-record.schema.json`);
  }

  if (artifact.category === 'predicates') {
    return basename === 'evidence-evaluation-algorithm.json'
      ? record(`${SCHEMA_ROOT}/evidence-evaluation-algorithm.schema.json`)
      : record(`${SCHEMA_ROOT}/evidence-predicate.schema.json`);
  }

  if (artifact.category === 'transition_tables') {
    return basename === 'precondition-record-current.json'
      ? record(`${SCHEMA_ROOT}/precondition-record-current.schema.json`)
      : record(`${SCHEMA_ROOT}/transition-rule.schema.json`, 'transitions');
  }

  if (artifact.category === 'error_catalogs') {
    return record(`${SCHEMA_ROOT}/framework-error-catalog.schema.json`, 'errors');
  }

  throw new Error(`unmapped artifact category: ${artifact.category}`);
}

export function registryIndexSchemaPath(): string {
  return `${SCHEMA_ROOT}/registry-index.schema.json`;
}

function record(schemaPath: string, selector: 'whole' | 'transitions' | 'errors' = 'whole'): ArtifactPlan {
  return { kind: 'RECORD', normative: true, schemaPath, selector };
}

export const NORMATIVE_CATEGORIES: readonly ArtifactCategory[] = Object.freeze([
  'contracts',
  'predicates',
  'transition_tables',
  'authority_tables',
  'error_catalogs',
  'bootstrap_contracts',
  'context_contracts',
]);
