import type { CustomerProfile, CustomerStatus } from "@loyalty-platform/api-contracts";

export type CustomerLifecycleOperation = "suspend" | "reactivate";

export interface CustomerLifecycleContext {
  /** Authentication/application guard-owned Customer identity. */
  readonly customer_id: string;
}

export interface CustomerLifecycleResult {
  readonly profile: CustomerProfile;
  readonly changed: boolean;
}

export interface CustomerLifecycleRepository {
  /** Must atomically enforce the expected version and return the current profile. */
  transitionCustomerLifecycle(
    customerId: string,
    targetStatus: Extract<CustomerStatus, "active" | "suspended">,
    expectedVersion: number,
  ): Promise<CustomerLifecycleResult>;
}

export interface CustomerLifecycleAudit {
  /** Records only the Customer ID, transition and resulting version. */
  recordCustomerLifecycleTransition(
    customerId: string,
    operation: CustomerLifecycleOperation,
    version: number,
  ): Promise<void>;
}

export interface CustomerLifecyclePublisher {
  /** Publishes only after the lifecycle transaction has committed. */
  publishCustomerLifecycleChanged(
    profile: CustomerProfile,
    operation: CustomerLifecycleOperation,
  ): Promise<void>;
}

export class CustomerLifecycleValidationError extends Error {
  readonly code:
    | "CUSTOMER_CONTEXT_INVALID"
    | "CUSTOMER_VERSION_INVALID"
    | "CUSTOMER_LIFECYCLE_OPERATION_INVALID"
    | "CUSTOMER_LIFECYCLE_CONFLICT";

  constructor(
    code: CustomerLifecycleValidationError["code"],
    message: string,
  ) {
    super(message);
    this.name = "CustomerLifecycleValidationError";
    this.code = code;
  }
}

function validateContext(context: CustomerLifecycleContext): void {
  if (typeof context.customer_id !== "string" || context.customer_id.trim() === "") {
    throw new CustomerLifecycleValidationError(
      "CUSTOMER_CONTEXT_INVALID",
      "authenticated Customer context is required",
    );
  }
}

function validateVersion(expectedVersion: number): void {
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new CustomerLifecycleValidationError(
      "CUSTOMER_VERSION_INVALID",
      "expected version must be a positive integer",
    );
  }
}

function targetStatusFor(operation: CustomerLifecycleOperation): Extract<CustomerStatus, "active" | "suspended"> {
  if (operation === "suspend") return "suspended";
  if (operation === "reactivate") return "active";
  throw new CustomerLifecycleValidationError(
    "CUSTOMER_LIFECYCLE_OPERATION_INVALID",
    "lifecycle operation must be suspend or reactivate",
  );
}

/** Performs one version-guarded, idempotent Customer lifecycle operation. */
export async function transitionCustomerLifecycle(
  context: CustomerLifecycleContext,
  operation: CustomerLifecycleOperation,
  expectedVersion: number,
  repository: CustomerLifecycleRepository,
  audit: CustomerLifecycleAudit,
  publisher: CustomerLifecyclePublisher,
): Promise<CustomerLifecycleResult> {
  validateContext(context);
  validateVersion(expectedVersion);
  const targetStatus = targetStatusFor(operation);
  const result = await repository.transitionCustomerLifecycle(
    context.customer_id,
    targetStatus,
    expectedVersion,
  );

  if (result.profile.status !== targetStatus) {
    throw new CustomerLifecycleValidationError(
      "CUSTOMER_LIFECYCLE_CONFLICT",
      "Customer cannot enter the requested lifecycle state",
    );
  }

  if (result.changed) {
    await audit.recordCustomerLifecycleTransition(
      context.customer_id,
      operation,
      result.profile.version,
    );
    await publisher.publishCustomerLifecycleChanged(result.profile, operation);
  }

  return result;
}
