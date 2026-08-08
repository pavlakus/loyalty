export interface NoExpirationPolicy { readonly mode: "NONE"; }
export interface RollingExpirationPolicy { readonly mode: "ROLLING"; readonly days: number; }
export interface FixedCalendarExpirationPolicy { readonly mode: "FIXED_CALENDAR"; readonly month: number; readonly day: number; }
export type PointExpirationPolicy = NoExpirationPolicy | RollingExpirationPolicy | FixedCalendarExpirationPolicy;

export interface PendingAndExpirationConfiguration {
  readonly pendingDays: number;
  readonly expiration: PointExpirationPolicy;
}

export class RewardPolicyValidationError extends Error {
  constructor(readonly code: "PENDING_INVALID" | "MODE_INVALID" | "DURATION_INVALID" | "CALENDAR_INVALID", message: string) {
    super(message);
    this.name = "RewardPolicyValidationError";
  }
}

export function validatePendingAndExpirationConfiguration(value: unknown): PendingAndExpirationConfiguration {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new RewardPolicyValidationError("MODE_INVALID", "policy must be an object");
  const input = value as Record<string, unknown>;
  if (!Number.isInteger(input.pendingDays) || (input.pendingDays as number) < 0) throw new RewardPolicyValidationError("PENDING_INVALID", "Pending Days must be a non-negative integer");
  if (typeof input.expiration !== "object" || input.expiration === null || Array.isArray(input.expiration)) throw new RewardPolicyValidationError("MODE_INVALID", "expiration must be an object");
  const expiration = input.expiration as Record<string, unknown>;
  if (expiration.mode === "NONE") {
    if (Object.keys(expiration).length !== 1) throw new RewardPolicyValidationError("MODE_INVALID", "No Expiration accepts no additional fields");
    return { pendingDays: input.pendingDays as number, expiration: { mode: "NONE" } };
  }
  if (expiration.mode === "ROLLING") {
    if (!Number.isInteger(expiration.days) || (expiration.days as number) < 1) throw new RewardPolicyValidationError("DURATION_INVALID", "Rolling Expiration days must be positive");
    return { pendingDays: input.pendingDays as number, expiration: { mode: "ROLLING", days: expiration.days as number } };
  }
  if (expiration.mode === "FIXED_CALENDAR") {
    if (!Number.isInteger(expiration.month) || (expiration.month as number) < 1 || (expiration.month as number) > 12 || !Number.isInteger(expiration.day) || (expiration.day as number) < 1 || (expiration.day as number) > 31) throw new RewardPolicyValidationError("CALENDAR_INVALID", "Fixed Calendar Expiration requires a valid month and day");
    return { pendingDays: input.pendingDays as number, expiration: { mode: "FIXED_CALENDAR", month: expiration.month as number, day: expiration.day as number } };
  }
  throw new RewardPolicyValidationError("MODE_INVALID", "expiration mode must be NONE, ROLLING, or FIXED_CALENDAR");
}
