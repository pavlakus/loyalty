import type { ValidationIssue, ValidationResult } from '../artifacts/artifact-types.js';

export type { ValidationIssue, ValidationResult };

export interface SchemaDescriptor {
  $id: string;
  $schema: string;
  title: string;
  type: string;
}
