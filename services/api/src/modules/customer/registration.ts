import {
  validateAndNormalizeCustomerProfileUpdateRequest,
  type CustomerProfileUpdateRequest,
} from "@loyalty-platform/api-contracts";

export interface VerifiedCustomerIdentity {
  /** Authentication-owned, normalized and already-verified identity reference. */
  readonly normalized_phone_reference: string;
}

export interface CustomerRegistrationInput {
  readonly verified_identity: VerifiedCustomerIdentity;
  readonly profile: CustomerProfileUpdateRequest;
}

export interface RegisteredCustomer {
  readonly customer_id: string;
  readonly version: number;
}

export interface CustomerRegistrationResult {
  readonly customer: RegisteredCustomer;
  readonly created: boolean;
}

export interface CustomerRegistrationRepository {
  /**
   * Atomically resolve or create by normalized verified identity.
   * Implementations must protect this operation with a unique identity key
   * and transaction/conditional-write semantics.
   */
  createOrResolveCustomer(
    identity: VerifiedCustomerIdentity,
    profile: CustomerProfileUpdateRequest,
  ): Promise<CustomerRegistrationResult>;
}

export interface CustomerRegisteredPublisher {
  /** Publishes only after the repository transaction has committed. */
  publishCustomerRegistered(customer: RegisteredCustomer): Promise<void>;
}

export class CustomerRegistrationValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "CustomerRegistrationValidationError";
    this.field = field;
  }
}

function validateVerifiedIdentity(identity: VerifiedCustomerIdentity): void {
  if (
    typeof identity.normalized_phone_reference !== "string"
    || identity.normalized_phone_reference.trim() === ""
  ) {
    throw new CustomerRegistrationValidationError(
      "normalized_phone_reference",
      "must be a non-empty verified identity reference",
    );
  }
}

/**
 * Register exactly one global Customer for a verified identity.
 * Duplicate calls resolve the existing Customer and produce no duplicate event.
 */
export async function registerCustomer(
  input: CustomerRegistrationInput,
  repository: CustomerRegistrationRepository,
  publisher: CustomerRegisteredPublisher,
): Promise<CustomerRegistrationResult> {
  validateVerifiedIdentity(input.verified_identity);
  const profile = validateAndNormalizeCustomerProfileUpdateRequest(input.profile);
  const result = await repository.createOrResolveCustomer(input.verified_identity, profile);

  if (result.created) {
    await publisher.publishCustomerRegistered(result.customer);
  }

  return result;
}
