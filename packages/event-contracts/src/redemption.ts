import { EventContractValidationError } from "./event-errors.js";

export const REDEMPTION_EVENT_TYPES = ["RewardPointsReserved", "RewardReservationReleased", "RewardPointsRedeemed"] as const;
export type RedemptionEventType = (typeof REDEMPTION_EVENT_TYPES)[number];
export interface RedemptionEventPayload { readonly redemption_id: string; readonly reservation_id: string; readonly membership_id: string; readonly reward_account_id: string; readonly reward_definition_id: string; readonly loyalty_program_id: string; readonly program_configuration_version_id: string; readonly points: number; readonly occurred_at: string; readonly idempotency_key: string; }

function id(value: unknown, field: string): string { if (typeof value !== "string" || value.trim() === "") throw new EventContractValidationError(field, "must be non-empty"); return value.trim(); }
function timestamp(value: string): void { if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(Date.parse(value))) throw new EventContractValidationError("occurred_at", "must be canonical UTC"); }

export function validateRedemptionEventPayload(type: RedemptionEventType, value: unknown): RedemptionEventPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new EventContractValidationError("payload", "must be an object");
  const payload = value as Record<string, unknown>;
  const allowed = ["redemption_id", "reservation_id", "membership_id", "reward_account_id", "reward_definition_id", "loyalty_program_id", "program_configuration_version_id", "points", "occurred_at", "idempotency_key"];
  for (const field of Object.keys(payload)) if (!allowed.includes(field)) throw new EventContractValidationError(field, "is not allowed");
  for (const field of allowed.filter((field) => field !== "points" && field !== "occurred_at") as string[]) id(payload[field], field);
  if (!Number.isSafeInteger(payload.points) || (payload.points as number) <= 0) throw new EventContractValidationError("points", "must be a positive whole number");
  if (typeof payload.occurred_at !== "string") throw new EventContractValidationError("occurred_at", "must be canonical UTC");
  timestamp(payload.occurred_at);
  return payload as unknown as RedemptionEventPayload;
}
