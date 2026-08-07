import type { CustomerProfile } from "@loyalty-platform/api-contracts";

export interface CustomerAnonymizationContext {
  /** Authentication/application guard-owned actor and Customer identities. */
  readonly actor_id: string;
  readonly customer_id: string;
}

export interface CustomerAnonymizationResult {
  readonly profile: CustomerProfile;
  readonly changed: boolean;
  readonly anonymized_at: string;
}

export interface CustomerAnonymizationRepository {
  /** Must atomically anonymize direct data under the expected aggregate version. */
  anonymizeCustomer(
    customerId: string,
    reasonCode: string,
    expectedVersion: number,
  ): Promise<CustomerAnonymizationResult>;
}

export interface CustomerAnonymizationAudit {
  /** Records classification and identifiers only; never before/after personal values. */
  recordCustomerAnonymization(
    actorId: string,
    customerId: string,
    reasonCode: string,
    anonymizedAt: string,
    version: number,
  ): Promise<void>;
}

export interface CustomerAnonymizedPublisher {
  /** Publishes only after the anonymization transaction has committed. */
  publishCustomerAnonymized(
    profile: CustomerProfile,
    anonymizedAt: string,
  ): Promise<void>;
}

export class CustomerAnonymizationValidationError extends Error {
  readonly code:
    | "CUSTOMER_CONTEXT_INVALID"
    | "CUSTOMER_REASON_INVALID"
    | "CUSTOMER_VERSION_INVALID"
    | "CUSTOMER_ANONYMIZATION_CONFLICT";

  constructor(
    code: CustomerAnonymizationValidationError["code"],
    message: string,
  ) {
    super(message);
    this.name = "CustomerAnonymizationValidationError";
    this.code = code;
  }
}

function validateContext(context: CustomerAnonymizationContext): void {
  if (
    typeof context.actor_id !== "string"
    || context.actor_id.trim() === ""
    || typeof context.customer_id !== "string"
    || context.customer_id.trim() === ""
  ) {
    throw new CustomerAnonymizationValidationError(
      "CUSTOMER_CONTEXT_INVALID",
      "authenticated actor and Customer context are required",
    );
  }
}

function validateReason(reasonCode: string): void {
  if (
    typeof reasonCode !== "string"
    || reasonCode.trim() === ""
    || reasonCode.length > 100
    || /[\u0000-\u001f\u007f]/u.test(reasonCode)
  ) {
    throw new CustomerAnonymizationValidationError(
      "CUSTOMER_REASON_INVALID",
      "an anonymization reason classification is required",
    );
  }
}

function validateVersion(expectedVersion: number): void {
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new CustomerAnonymizationValidationError(
      "CUSTOMER_VERSION_INVALID",
      "expected version must be a positive integer",
    );
  }
}

/** Performs one authenticated, idempotent Customer anonymization request. */
export async function anonymizeCustomer(
  context: CustomerAnonymizationContext,
  reasonCode: string,
  expectedVersion: number,
  repository: CustomerAnonymizationRepository,
  audit: CustomerAnonymizationAudit,
  publisher: CustomerAnonymizedPublisher,
): Promise<CustomerAnonymizationResult> {
  validateContext(context);
  validateReason(reasonCode);
  validateVersion(expectedVersion);

  const result = await repository.anonymizeCustomer(
    context.customer_id,
    reasonCode.trim(),
    expectedVersion,
  );

  if (result.profile.status !== "anonymized") {
    throw new CustomerAnonymizationValidationError(
      "CUSTOMER_ANONYMIZATION_CONFLICT",
      "Customer anonymization did not reach the terminal anonymized state",
    );
  }

  if (result.changed) {
    await audit.recordCustomerAnonymization(
      context.actor_id,
      context.customer_id,
      reasonCode.trim(),
      result.anonymized_at,
      result.profile.version,
    );
    await publisher.publishCustomerAnonymized(result.profile, result.anonymized_at);
  }

  return result;
}
