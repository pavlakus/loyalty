import type { CustomerProfile } from "@loyalty-platform/api-contracts";

export interface AuthenticatedCustomerContext {
  /** Resolved by authentication/application guards, never accepted from a query parameter. */
  readonly customer_id: string;
}

export interface CurrentCustomerProfileRepository {
  /** Returns the privacy-safe profile for the authenticated Customer only. */
  findCurrentCustomerProfile(customerId: string): Promise<CustomerProfile | null>;
}

export class CustomerProfileQueryError extends Error {
  readonly code: "CUSTOMER_CONTEXT_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "CustomerProfileQueryError";
    this.code = "CUSTOMER_CONTEXT_INVALID";
  }
}

function validateContext(context: AuthenticatedCustomerContext): void {
  if (typeof context.customer_id !== "string" || context.customer_id.trim() === "") {
    throw new CustomerProfileQueryError("authenticated Customer context is required");
  }
}

/** Query the current authenticated Customer without accepting client identity or tenant selectors. */
export async function getCurrentCustomerProfile(
  context: AuthenticatedCustomerContext,
  repository: CurrentCustomerProfileRepository,
): Promise<CustomerProfile | null> {
  validateContext(context);
  return repository.findCurrentCustomerProfile(context.customer_id);
}
