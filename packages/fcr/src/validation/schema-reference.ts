import path from 'node:path';

export interface SchemaWithIdentity {
  readonly $id: string;
  readonly $schema: string;
  readonly [key: string]: unknown;
}

/**
 * Resolves only repository-local file references. Fragment-only references
 * deliberately remain relative to the schema document currently being
 * compiled, as required by JSON Schema.
 */
export function normalizeLocalSchemaReferences(
  schema: SchemaWithIdentity,
  sourcePath: string,
  repositoryRoot: string,
  schemaIdsByPath: ReadonlyMap<string, string>,
): SchemaWithIdentity {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    const object = value as Record<string, unknown>;
    if (typeof object.$ref === 'string') {
      const reference = object.$ref;
      if (reference.startsWith('#')) return { ...object };
      if (/^[a-z][a-z0-9+.-]*:/i.test(reference)) throw new Error(`remote schema reference is not permitted: ${reference}`);
      const hash = reference.indexOf('#');
      const relativeTarget = hash === -1 ? reference : reference.slice(0, hash);
      const fragment = hash === -1 ? '' : reference.slice(hash);
      if (path.isAbsolute(relativeTarget)) throw new Error(`absolute schema reference is not permitted: ${reference}`);
      const targetPath = path.resolve(repositoryRoot, path.dirname(sourcePath), relativeTarget);
      const targetId = schemaIdsByPath.get(targetPath);
      if (!targetId) throw new Error(`unresolved schema reference: ${reference}`);
      return { ...object, $ref: `${targetId}${fragment}` };
    }
    return Object.fromEntries(Object.entries(object).map(([key, child]) => [key, visit(child)]));
  };
  return visit(schema) as SchemaWithIdentity;
}
