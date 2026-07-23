import type { EvidenceRef, JsonValue } from '../artifacts/artifact-types.js';

export interface ErrorContext {
  readonly correlationId?: string;
  readonly taskId?: string;
  readonly transactionId?: string;
  readonly repositoryRelativePath?: string;
}

export interface FrameworkErrorOptions {
  readonly metadata?: JsonValue;
  readonly evidence?: readonly EvidenceRef[];
  readonly context?: ErrorContext;
}
