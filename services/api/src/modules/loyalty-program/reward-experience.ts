export interface StandardRewardExperience { readonly mode: "STANDARD"; }
export interface SurpriseRewardExperience {
  readonly mode: "SURPRISE";
  readonly maximumUnopenedOpportunities: number;
  readonly rewardPoolIds: readonly string[];
  readonly probabilitiesBasisPoints: Readonly<Record<string, number>>;
  readonly expirationDays: number;
}
export type RewardExperienceConfiguration = StandardRewardExperience | SurpriseRewardExperience;

export class RewardExperienceValidationError extends Error {
  constructor(readonly code: "MODE_INVALID" | "FIELD_INVALID" | "POOL_INVALID" | "PROBABILITY_INVALID" | "EXPIRATION_INVALID", message: string) {
    super(message);
    this.name = "RewardExperienceValidationError";
  }
}

function ensureFields(value: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of Object.keys(value)) if (!fields.includes(field)) throw new RewardExperienceValidationError("FIELD_INVALID", `${field} is not allowed for this experience mode`);
}
function identifier(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new RewardExperienceValidationError("POOL_INVALID", "Reward Pool identifiers must be non-empty");
  return value.trim();
}

export function validateRewardExperience(value: unknown): RewardExperienceConfiguration {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new RewardExperienceValidationError("MODE_INVALID", "experience must be an object");
  const input = value as Record<string, unknown>;
  if (input.mode === "STANDARD") {
    ensureFields(input, ["mode"]);
    return { mode: "STANDARD" };
  }
  if (input.mode !== "SURPRISE") throw new RewardExperienceValidationError("MODE_INVALID", "experience mode must be STANDARD or SURPRISE");
  ensureFields(input, ["mode", "maximumUnopenedOpportunities", "rewardPoolIds", "probabilitiesBasisPoints", "expirationDays"]);
  if (!Number.isInteger(input.maximumUnopenedOpportunities) || (input.maximumUnopenedOpportunities as number) < 1) throw new RewardExperienceValidationError("FIELD_INVALID", "maximum unopened opportunities must be positive");
  if (!Array.isArray(input.rewardPoolIds) || input.rewardPoolIds.length === 0) throw new RewardExperienceValidationError("POOL_INVALID", "Surprise experience requires Reward Pools");
  const rewardPoolIds = input.rewardPoolIds.map(identifier);
  if (new Set(rewardPoolIds).size !== rewardPoolIds.length) throw new RewardExperienceValidationError("POOL_INVALID", "Reward Pool identifiers must be unique");
  if (typeof input.probabilitiesBasisPoints !== "object" || input.probabilitiesBasisPoints === null || Array.isArray(input.probabilitiesBasisPoints)) throw new RewardExperienceValidationError("PROBABILITY_INVALID", "probabilities must be an object");
  const probabilitiesBasisPoints = input.probabilitiesBasisPoints as Record<string, unknown>;
  const probabilityKeys = Object.keys(probabilitiesBasisPoints);
  if (probabilityKeys.some((key) => !rewardPoolIds.includes(key)) || probabilityKeys.length !== rewardPoolIds.length) throw new RewardExperienceValidationError("PROBABILITY_INVALID", "probabilities must cover exactly the configured Reward Pools");
  const total = probabilityKeys.reduce((sum, key) => {
    const probability = probabilitiesBasisPoints[key];
    if (!Number.isInteger(probability) || (probability as number) < 0) throw new RewardExperienceValidationError("PROBABILITY_INVALID", "probabilities must be non-negative integer basis points");
    return sum + (probability as number);
  }, 0);
  if (total !== 10000) throw new RewardExperienceValidationError("PROBABILITY_INVALID", "probabilities must total 10000 basis points");
  if (!Number.isInteger(input.expirationDays) || (input.expirationDays as number) < 1) throw new RewardExperienceValidationError("EXPIRATION_INVALID", "expiration must be a positive number of days");
  return { mode: "SURPRISE", maximumUnopenedOpportunities: input.maximumUnopenedOpportunities as number, rewardPoolIds, probabilitiesBasisPoints: Object.fromEntries(probabilityKeys.map((key) => [key, probabilitiesBasisPoints[key] as number])), expirationDays: input.expirationDays as number };
}
