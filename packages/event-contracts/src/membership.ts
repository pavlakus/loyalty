import { EventContractValidationError } from "./event-errors.js";

export const MEMBERSHIP_EVENT_TYPES = [
  "LoyaltyProgramJoinRequested",
  "MembershipCreated",
  "MembershipActivated",
  "MembershipSuspended",
  "MembershipClosed",
  "CustomerJoinedLoyaltyProgram",
] as const;
export type MembershipEventType = (typeof MEMBERSHIP_EVENT_TYPES)[number];

export interface MembershipEventPayload {
  readonly membership_id?: string;
  readonly customer_id: string;
  readonly loyalty_program_id: string;
  readonly brand_id?: string;
  readonly enrollment_source?: string;
  readonly accepted_terms_version?: string;
  readonly marketing_consent?: boolean;
  readonly status?: "ACTIVE" | "SUSPENDED" | "CLOSED";
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new EventContractValidationError("payload", "must be an object");
  return value as Record<string, unknown>;
}
function id(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new EventContractValidationError(field, "must be a non-empty identifier");
  return value;
}
function fields(value: Record<string, unknown>, allowed: readonly string[]): void {
  for (const field of Object.keys(value)) if (!allowed.includes(field)) throw new EventContractValidationError(field, "is not an allowed Membership event field");
}

export function validateMembershipEventPayload(eventType: MembershipEventType, value: unknown): MembershipEventPayload {
  const payload = record(value);
  id(payload.customer_id, "customer_id");
  id(payload.loyalty_program_id, "loyalty_program_id");
  if (eventType === "LoyaltyProgramJoinRequested") {
    fields(payload, ["customer_id", "loyalty_program_id", "enrollment_source", "accepted_terms_version", "marketing_consent"]);
    id(payload.enrollment_source, "enrollment_source");
    id(payload.accepted_terms_version, "accepted_terms_version");
    if (typeof payload.marketing_consent !== "boolean") throw new EventContractValidationError("marketing_consent", "must be boolean");
    return payload as unknown as MembershipEventPayload;
  }
  fields(payload, ["membership_id", "customer_id", "loyalty_program_id", "brand_id", "status"]);
  id(payload.membership_id, "membership_id");
  id(payload.brand_id, "brand_id");
  if (payload.status !== "ACTIVE" && payload.status !== "SUSPENDED" && payload.status !== "CLOSED") throw new EventContractValidationError("status", "must be an approved Membership status");
  if (eventType === "MembershipCreated" && payload.status !== "ACTIVE") throw new EventContractValidationError("status", "created Memberships must be ACTIVE");
  if (eventType === "MembershipActivated" && payload.status !== "ACTIVE") throw new EventContractValidationError("status", "activated Memberships must be ACTIVE");
  if (eventType === "MembershipSuspended" && payload.status !== "SUSPENDED") throw new EventContractValidationError("status", "suspended Memberships must be SUSPENDED");
  if (eventType === "MembershipClosed" && payload.status !== "CLOSED") throw new EventContractValidationError("status", "closed Memberships must be CLOSED");
  return payload as unknown as MembershipEventPayload;
}
