import {
  normalizeCustomerEmail,
  type CustomerProfile,
} from "@loyalty-platform/api-contracts";

export interface CustomerEmailUpdateContext {
  readonly customer_id: string;
}

export interface CustomerEmailUpdateResult {
  readonly profile: CustomerProfile;
  readonly changed: boolean;
}

export interface CustomerEmailRepository {
  /** Must perform an atomic version-guarded update for the authenticated Customer. */
  updateCustomerEmail(
    customerId: string,
    email: string | null,
    expectedVersion: number,
  ): Promise<CustomerEmailUpdateResult>;
}

export interface CustomerEmailUpdatedPublisher {
  publishCustomerEmailUpdated(profile: CustomerProfile): Promise<void>;
}

export class CustomerEmailValidationError extends Error {
  readonly code: "CUSTOMER_CONTEXT_INVALID" | "CUSTOMER_VERSION_INVALID";

  constructor(
    code: "CUSTOMER_CONTEXT_INVALID" | "CUSTOMER_VERSION_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "CustomerEmailValidationError";
    this.code = code;
  }
}

function validateContext(context: CustomerEmailUpdateContext): void {
  if (typeof context.customer_id !== "string" || context.customer_id.trim() === "") {
    throw new CustomerEmailValidationError(
      "CUSTOMER_CONTEXT_INVALID",
      "authenticated Customer context is required",
    );
  }
}

function validateVersion(expectedVersion: number): void {
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new CustomerEmailValidationError(
      "CUSTOMER_VERSION_INVALID",
      "expected version must be a positive integer",
    );
  }
}

/** Update optional Customer email without changing identity or merging Customers. */
export async function updateCustomerEmail(
  context: CustomerEmailUpdateContext,
  email: string | null,
  expectedVersion: number,
  repository: CustomerEmailRepository,
  publisher: CustomerEmailUpdatedPublisher,
): Promise<CustomerEmailUpdateResult> {
  validateContext(context);
  validateVersion(expectedVersion);
  const normalizedEmail = normalizeCustomerEmail(email);
  const result = await repository.updateCustomerEmail(
    context.customer_id,
    normalizedEmail,
    expectedVersion,
  );

  if (result.changed) {
    await publisher.publishCustomerEmailUpdated(result.profile);
  }

  return result;
}
