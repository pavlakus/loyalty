export interface VerifiedCustomerIdentity {
  /** Authentication-owned, normalized and already-verified identity reference. */
  readonly normalized_phone_reference: string;
}

export interface ResolvedCustomerReference {
  readonly customer_id: string;
  readonly status: "active" | "suspended" | "anonymized" | "closed";
  readonly version: number;
}

export interface CustomerResolutionPort<TRegistrationInput> {
  /** Query owned by Customer; it must not accept raw or unverified phone input. */
  findByVerifiedIdentity(identity: VerifiedCustomerIdentity): Promise<ResolvedCustomerReference | null>;
  /** Atomic Customer-owned resolve-or-create command keyed by verified identity. */
  registerVerifiedCustomer(identity: VerifiedCustomerIdentity, input: TRegistrationInput): Promise<ResolvedCustomerReference>;
}

export class CustomerResolutionError extends Error {
  readonly code: "CUSTOMER_IDENTITY_INVALID" | "CUSTOMER_ANONYMIZED";

  constructor(code: CustomerResolutionError["code"], message: string) {
    super(message);
    this.name = "CustomerResolutionError";
    this.code = code;
  }
}

function validateIdentity(identity: VerifiedCustomerIdentity): void {
  if (
    typeof identity.normalized_phone_reference !== "string"
    || identity.normalized_phone_reference.trim() === ""
  ) {
    throw new CustomerResolutionError("CUSTOMER_IDENTITY_INVALID", "verified identity reference is required");
  }
}

/** Resolve an existing global Customer or invoke the Customer-owned atomic registration command. */
export async function resolveOrRegisterCustomer<TRegistrationInput>(
  identity: VerifiedCustomerIdentity,
  registrationInput: TRegistrationInput,
  port: CustomerResolutionPort<TRegistrationInput>,
): Promise<{ readonly customer: ResolvedCustomerReference; readonly created: boolean }> {
  validateIdentity(identity);
  const existing = await port.findByVerifiedIdentity(identity);
  if (existing) {
    if (existing.status === "anonymized") {
      throw new CustomerResolutionError("CUSTOMER_ANONYMIZED", "anonymized Customer identity cannot be resolved");
    }
    return { customer: existing, created: false };
  }

  const customer = await port.registerVerifiedCustomer(identity, registrationInput);
  if (customer.status === "anonymized") {
    throw new CustomerResolutionError("CUSTOMER_ANONYMIZED", "anonymized Customer identity cannot be resolved");
  }
  return { customer, created: true };
}
