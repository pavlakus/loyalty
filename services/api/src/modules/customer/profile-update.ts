import {
  validateAndNormalizeCustomerProfileUpdateRequest,
  type CustomerProfile,
  type CustomerProfileUpdateRequest,
} from "@loyalty-platform/api-contracts";

export interface CustomerProfileUpdateContext {
  /** Authentication/application guard-owned Customer identity. */
  readonly customer_id: string;
}

export interface CustomerProfileUpdateResult {
  readonly profile: CustomerProfile;
  readonly changed: boolean;
  readonly changed_fields: readonly string[];
}

export interface CustomerProfileUpdateRepository {
  /** Must perform an atomic version-guarded update for the authenticated Customer. */
  updateCustomerProfile(
    customerId: string,
    request: CustomerProfileUpdateRequest,
    expectedVersion: number,
  ): Promise<CustomerProfileUpdateResult>;
}

export interface CustomerProfileUpdatedPublisher {
  /** Publishes only after the update transaction has committed. */
  publishCustomerProfileUpdated(
    profile: CustomerProfile,
    changedFields: readonly string[],
  ): Promise<void>;
}

export class CustomerProfileUpdateValidationError extends Error {
  readonly code: "CUSTOMER_CONTEXT_INVALID" | "CUSTOMER_VERSION_INVALID";

  constructor(
    code: "CUSTOMER_CONTEXT_INVALID" | "CUSTOMER_VERSION_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "CustomerProfileUpdateValidationError";
    this.code = code;
  }
}

function validateContext(context: CustomerProfileUpdateContext): void {
  if (typeof context.customer_id !== "string" || context.customer_id.trim() === "") {
    throw new CustomerProfileUpdateValidationError(
      "CUSTOMER_CONTEXT_INVALID",
      "authenticated Customer context is required",
    );
  }
}

function validateVersion(expectedVersion: number): void {
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new CustomerProfileUpdateValidationError(
      "CUSTOMER_VERSION_INVALID",
      "expected version must be a positive integer",
    );
  }
}

/** Version-guarded Customer profile update with post-commit event publication. */
export async function updateCustomerProfile(
  context: CustomerProfileUpdateContext,
  request: CustomerProfileUpdateRequest,
  expectedVersion: number,
  repository: CustomerProfileUpdateRepository,
  publisher: CustomerProfileUpdatedPublisher,
): Promise<CustomerProfileUpdateResult> {
  validateContext(context);
  validateVersion(expectedVersion);
  const normalizedRequest = validateAndNormalizeCustomerProfileUpdateRequest(request);
  const result = await repository.updateCustomerProfile(
    context.customer_id,
    normalizedRequest,
    expectedVersion,
  );

  if (result.changed) {
    await publisher.publishCustomerProfileUpdated(result.profile, result.changed_fields);
  }

  return result;
}
