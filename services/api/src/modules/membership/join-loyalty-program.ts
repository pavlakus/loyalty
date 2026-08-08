import { MembershipAggregate, type MembershipLifecycleEvent, type MembershipSnapshot } from "./membership-aggregate.js";

export interface AuthenticatedCustomerContext {
  readonly customerId: string;
}

export interface JoinLoyaltyProgramInput {
  readonly membershipId: string;
  readonly customerId: string;
  readonly loyaltyProgramId: string;
  readonly brandId: string;
  readonly loyaltyProgramStatus: "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  readonly brandStatus: "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  readonly enrollmentSource: string;
  readonly acceptedTermsVersion: string;
  readonly marketingConsent: boolean;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly existingMemberships?: readonly MembershipSnapshot[];
}

export interface JoinLoyaltyProgramResult {
  readonly membership: MembershipSnapshot;
  readonly event: MembershipLifecycleEvent;
  readonly idempotencyKey: string;
}

export class JoinLoyaltyProgramError extends Error {
  constructor(readonly code: "AUTHENTICATION_REQUIRED" | "CUSTOMER_CONTEXT_MISMATCH" | "TERMS_NOT_ACCEPTED" | "MEMBERSHIP_NOT_ALLOWED" | "IDEMPOTENCY_KEY_INVALID" | "ENROLLMENT_SOURCE_INVALID", message: string) {
    super(message);
    this.name = "JoinLoyaltyProgramError";
  }
}

function nonEmpty(value: unknown, code: JoinLoyaltyProgramError["code"], message: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new JoinLoyaltyProgramError(code, message);
  return value.trim();
}

export function joinLoyaltyProgram(context: AuthenticatedCustomerContext | null, input: JoinLoyaltyProgramInput, eligible: boolean): JoinLoyaltyProgramResult {
  if (context === null) throw new JoinLoyaltyProgramError("AUTHENTICATION_REQUIRED", "an authenticated Customer context is required");
  const contextCustomerId = nonEmpty(context.customerId, "AUTHENTICATION_REQUIRED", "authenticated Customer context is invalid");
  const customerId = nonEmpty(input.customerId, "CUSTOMER_CONTEXT_MISMATCH", "Customer identity is invalid");
  if (contextCustomerId !== customerId) throw new JoinLoyaltyProgramError("CUSTOMER_CONTEXT_MISMATCH", "Customer may join only for the authenticated identity");
  nonEmpty(input.enrollmentSource, "ENROLLMENT_SOURCE_INVALID", "enrollment source is required");
  nonEmpty(input.idempotencyKey, "IDEMPOTENCY_KEY_INVALID", "idempotency key is required");
  nonEmpty(input.acceptedTermsVersion, "TERMS_NOT_ACCEPTED", "accepted terms version is required");
  if (typeof input.marketingConsent !== "boolean") throw new JoinLoyaltyProgramError("MEMBERSHIP_NOT_ALLOWED", "marketing consent value is invalid");
  if (!eligible) throw new JoinLoyaltyProgramError("MEMBERSHIP_NOT_ALLOWED", "Customer is not eligible to join this Loyalty Program");
  const created = MembershipAggregate.create({ ...input, id: input.membershipId });
  return { membership: created.membership.snapshot, event: created.event, idempotencyKey: input.idempotencyKey.trim() };
}
