import type { CustomerStatus } from "@loyalty-platform/api-contracts";

export interface VerifiedIdentityReference {
  /** Authentication-owned, normalized and verified identity reference. */
  readonly normalized_phone_reference: string;
}

export interface ResolvedCustomer {
  readonly customer_id: string;
  readonly status: CustomerStatus;
  readonly version: number;
}

export interface CustomerIdentityResolutionRepository {
  /** Looks up only by the Authentication-owned normalized identity key. */
  findByVerifiedIdentity(
    identity: VerifiedIdentityReference,
  ): Promise<ResolvedCustomer | null>;
}

export class CustomerIdentityResolutionError extends Error {
  readonly code: "CUSTOMER_IDENTITY_INVALID" | "CUSTOMER_ANONYMIZED";

  constructor(
    code: "CUSTOMER_IDENTITY_INVALID" | "CUSTOMER_ANONYMIZED",
    message: string,
  ) {
    super(message);
    this.name = "CustomerIdentityResolutionError";
    this.code = code;
  }
}

function validateIdentity(identity: VerifiedIdentityReference): void {
  if (
    typeof identity.normalized_phone_reference !== "string"
    || identity.normalized_phone_reference.trim() === ""
  ) {
    throw new CustomerIdentityResolutionError(
      "CUSTOMER_IDENTITY_INVALID",
      "verified identity reference is required",
    );
  }
}

/**
 * Resolve a Customer without accepting raw phone values or creating records.
 * An anonymized identity cannot be used to re-identify or recreate a Customer.
 */
export async function resolveCustomerByVerifiedIdentity(
  identity: VerifiedIdentityReference,
  repository: CustomerIdentityResolutionRepository,
): Promise<ResolvedCustomer | null> {
  validateIdentity(identity);
  const customer = await repository.findByVerifiedIdentity(identity);

  if (customer?.status === "anonymized") {
    throw new CustomerIdentityResolutionError(
      "CUSTOMER_ANONYMIZED",
      "anonymized Customer identity cannot be resolved",
    );
  }

  return customer;
}
