import type {
  DependencyType,
  DependencyRef,
  Id,
  Timestamp,
} from '../artifacts/artifact-types.js';

/**
 * A non-authoritative observation of a canonical dependency. The mapped type
 * derives both the dependency and observed-state vocabulary from DependencyRef
 * so states cannot cross dependency-type boundaries.
 */
export type DependencyObservation = {
  [T in DependencyType]: {
    readonly dependency: Extract<DependencyRef, { readonly dependency_type: T }>;
    readonly observedState: Extract<DependencyRef, { readonly dependency_type: T }>['required_state'];
  }
}[DependencyType];

/**
 * Execution state uses the canonical implementation-status vocabulary. Each
 * variant contains only data meaningful for that status.
 */
export type TaskExecutionState =
  | {
      readonly status: 'NOT_STARTED';
    }
  | {
      readonly status: 'IN_PROGRESS';
      readonly startedAt: Timestamp;
    }
  | {
      readonly status: 'COMPLETE';
      readonly completedAt: Timestamp;
      readonly completionEvidenceIds: ReadonlyArray<Id>;
    }
  | {
      readonly status: 'BLOCKED';
      readonly blockingDependencyIds: ReadonlyArray<Id>;
    }
  | {
      readonly status: 'CANCELLED';
      readonly cancellationReason: string;
    };

/**
 * Non-authoritative derived readiness view. READY and BLOCKED remain lifecycle
 * vocabulary; this type does not define or execute lifecycle transitions.
 */
export type TaskReadinessState =
  | {
      readonly status: 'READY';
    }
  | {
      readonly status: 'BLOCKED';
      readonly blockingDependencyIds: ReadonlyArray<Id>;
    };
