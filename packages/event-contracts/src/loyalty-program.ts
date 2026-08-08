import { EventContractValidationError } from "./event-errors.js";

export const LOYALTY_PROGRAM_EVENT_TYPES = ["LoyaltyProgramCreated", "LoyaltyProgramActivated", "LoyaltyProgramDeactivated"] as const;
export type LoyaltyProgramEventType = (typeof LOYALTY_PROGRAM_EVENT_TYPES)[number];
export type LoyaltyProgramEventStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
export interface LoyaltyProgramEventPayload { readonly program_id: string; readonly brand_id: string; readonly status: LoyaltyProgramEventStatus; }

export function validateLoyaltyProgramEventPayload(eventType: LoyaltyProgramEventType, value: unknown): LoyaltyProgramEventPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new EventContractValidationError("payload", "must be an object");
  const payload = value as Record<string, unknown>;
  if (Object.keys(payload).some((field) => !["program_id", "brand_id", "status"].includes(field))) throw new EventContractValidationError("payload", "contains an unsupported field");
  for (const field of ["program_id", "brand_id"] as const) if (typeof payload[field] !== "string" || payload[field].trim() === "") throw new EventContractValidationError(field, "must be a non-empty identifier");
  const status = payload.status;
  if (status !== "DRAFT" && status !== "ACTIVE" && status !== "SUSPENDED" && status !== "CLOSED") throw new EventContractValidationError("status", "must be an approved Program status");
  if (eventType === "LoyaltyProgramCreated" && status !== "DRAFT") throw new EventContractValidationError("status", "created Programs must be DRAFT");
  if (eventType === "LoyaltyProgramActivated" && status !== "ACTIVE") throw new EventContractValidationError("status", "activated Programs must be ACTIVE");
  if (eventType === "LoyaltyProgramDeactivated" && status !== "SUSPENDED" && status !== "CLOSED") throw new EventContractValidationError("status", "deactivated Programs must be SUSPENDED or CLOSED");
  return { program_id: payload.program_id as string, brand_id: payload.brand_id as string, status };
}
