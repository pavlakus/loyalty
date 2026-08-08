export const REWARD_DEFINITION_TYPES = ["FIXED_DISCOUNT", "PERCENTAGE_DISCOUNT", "FREE_PRODUCT", "PARTNER_REWARD"] as const;
export type RewardDefinitionType = (typeof REWARD_DEFINITION_TYPES)[number];

export interface RewardDefinitionContract {
  readonly rewardDefinitionId: string;
  readonly type: RewardDefinitionType;
  readonly name: string;
  readonly description?: string;
  readonly pointsCost: number;
  readonly enabled: boolean;
  readonly eligibleStatusLevelIds: readonly string[];
  readonly requiredBenefitDefinitionIds: readonly string[];
  readonly programConfigurationVersionId: string;
}

export interface ReserveRewardPointsRequest {
  readonly membershipToken: string;
  readonly rewardDefinitionId: string;
  readonly receiptContextId: string;
  readonly idempotencyKey: string;
}

export interface RedemptionLifecycleRequest {
  readonly idempotencyKey: string;
}

export interface RedemptionReservationResponse {
  readonly reservationId: string;
  readonly redemptionId: string;
  readonly rewardDefinitionId: string;
  readonly pointsCost: number;
  readonly status: "RESERVED" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  readonly createdAt: string;
  readonly expiresAt: string;
}

export class RedemptionContractValidationError extends Error {
  constructor(readonly field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "RedemptionContractValidationError";
  }
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new RedemptionContractValidationError(field, "must be an object");
  return value as Record<string, unknown>;
}

function exact(input: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of Object.keys(input)) if (!fields.includes(field)) throw new RedemptionContractValidationError(field, "is not allowed");
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new RedemptionContractValidationError(field, "must be non-empty");
  return value.trim();
}

function ids(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) throw new RedemptionContractValidationError(field, "must contain non-empty identifiers");
  const result = value.map((item) => (item as string).trim());
  if (new Set(result).size !== result.length) throw new RedemptionContractValidationError(field, "must not contain duplicates");
  return result;
}

function timestamp(value: unknown, field: string): string {
  const result = text(value, field);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(result) || Number.isNaN(Date.parse(result))) throw new RedemptionContractValidationError(field, "must be canonical UTC");
  return result;
}

export function validateRewardDefinitionContract(value: unknown): RewardDefinitionContract {
  const input = record(value, "rewardDefinition");
  exact(input, ["rewardDefinitionId", "type", "name", "description", "pointsCost", "enabled", "eligibleStatusLevelIds", "requiredBenefitDefinitionIds", "programConfigurationVersionId"]);
  const type = text(input.type, "type");
  if (!REWARD_DEFINITION_TYPES.includes(type as RewardDefinitionType)) throw new RedemptionContractValidationError("type", "is not an approved Reward type");
  if (!Number.isSafeInteger(input.pointsCost) || (input.pointsCost as number) <= 0) throw new RedemptionContractValidationError("pointsCost", "must be a positive whole number");
  if (typeof input.enabled !== "boolean") throw new RedemptionContractValidationError("enabled", "must be boolean");
  return Object.freeze({ rewardDefinitionId: text(input.rewardDefinitionId, "rewardDefinitionId"), type: type as RewardDefinitionType, name: text(input.name, "name"), ...(input.description === undefined ? {} : { description: text(input.description, "description") }), pointsCost: input.pointsCost as number, enabled: input.enabled, eligibleStatusLevelIds: ids(input.eligibleStatusLevelIds, "eligibleStatusLevelIds"), requiredBenefitDefinitionIds: ids(input.requiredBenefitDefinitionIds, "requiredBenefitDefinitionIds"), programConfigurationVersionId: text(input.programConfigurationVersionId, "programConfigurationVersionId") });
}

export function validateReserveRewardPointsRequest(value: unknown): ReserveRewardPointsRequest {
  const input = record(value, "request");
  exact(input, ["membershipToken", "rewardDefinitionId", "receiptContextId", "idempotencyKey"]);
  return { membershipToken: text(input.membershipToken, "membershipToken"), rewardDefinitionId: text(input.rewardDefinitionId, "rewardDefinitionId"), receiptContextId: text(input.receiptContextId, "receiptContextId"), idempotencyKey: text(input.idempotencyKey, "idempotencyKey") };
}

export function validateRedemptionLifecycleRequest(value: unknown): RedemptionLifecycleRequest {
  const input = record(value, "request");
  exact(input, ["idempotencyKey"]);
  return { idempotencyKey: text(input.idempotencyKey, "idempotencyKey") };
}

export function validateRedemptionReservationResponse(value: unknown): RedemptionReservationResponse {
  const input = record(value, "response");
  exact(input, ["reservationId", "redemptionId", "rewardDefinitionId", "pointsCost", "status", "createdAt", "expiresAt"]);
  if (!Number.isSafeInteger(input.pointsCost) || (input.pointsCost as number) <= 0) throw new RedemptionContractValidationError("pointsCost", "must be a positive whole number");
  if (!["RESERVED", "CONFIRMED", "CANCELLED", "EXPIRED"].includes(input.status as string)) throw new RedemptionContractValidationError("status", "is not an approved reservation state");
  return Object.freeze({ reservationId: text(input.reservationId, "reservationId"), redemptionId: text(input.redemptionId, "redemptionId"), rewardDefinitionId: text(input.rewardDefinitionId, "rewardDefinitionId"), pointsCost: input.pointsCost as number, status: input.status as RedemptionReservationResponse["status"], createdAt: timestamp(input.createdAt, "createdAt"), expiresAt: timestamp(input.expiresAt, "expiresAt") });
}
