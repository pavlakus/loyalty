export type StrategyObjective = "RETENTION" | "GROWTH" | "RECOVERY" | "LAUNCH";
export type StrategyDecision = "ACCEPT" | "MODIFY" | "REPLACE";

export interface StrategySelectionInput {
  readonly objectives: readonly StrategyObjective[];
  readonly industry: string;
  readonly averageTransactionValueMinor?: bigint;
  readonly approximateDailyCustomers?: number;
  readonly preferredRewardModel?: string;
  readonly locations?: number;
  readonly estimatedGrossMarginPercent?: string;
}

export interface StrategyRecommendation {
  readonly recommendationId: string;
  readonly explanation: string;
  readonly configurationSections: readonly string[];
}

export interface StrategySelectionResult {
  readonly selection: StrategySelectionInput;
  readonly recommendation: StrategyRecommendation;
}

export class StrategyValidationError extends Error {
  constructor(readonly code: "OBJECTIVE_INVALID" | "SELECTION_INVALID" | "VALUE_INVALID" | "RECOMMENDATION_INVALID", message: string) {
    super(message);
    this.name = "StrategyValidationError";
  }
}

function id(value: unknown, code: "SELECTION_INVALID" | "RECOMMENDATION_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new StrategyValidationError(code, "value must be non-empty");
  return value.trim();
}

export function validateStrategySelection(input: StrategySelectionInput): StrategySelectionInput {
  if (!Array.isArray(input.objectives) || input.objectives.length === 0 || input.objectives.some((objective) => !["RETENTION", "GROWTH", "RECOVERY", "LAUNCH"].includes(objective))) throw new StrategyValidationError("OBJECTIVE_INVALID", "at least one approved strategy objective is required");
  if (new Set(input.objectives).size !== input.objectives.length) throw new StrategyValidationError("OBJECTIVE_INVALID", "strategy objectives must be unique");
  if (typeof input.industry !== "string" || input.industry.trim() === "") throw new StrategyValidationError("SELECTION_INVALID", "industry must be non-empty");
  if (input.averageTransactionValueMinor !== undefined && (typeof input.averageTransactionValueMinor !== "bigint" || input.averageTransactionValueMinor < 0n)) throw new StrategyValidationError("VALUE_INVALID", "average transaction value must be a non-negative minor-unit integer");
  if (input.approximateDailyCustomers !== undefined && (!Number.isInteger(input.approximateDailyCustomers) || input.approximateDailyCustomers < 0)) throw new StrategyValidationError("VALUE_INVALID", "daily customers must be a non-negative integer");
  if (input.locations !== undefined && (!Number.isInteger(input.locations) || input.locations < 1)) throw new StrategyValidationError("VALUE_INVALID", "locations must be positive");
  return { ...input, objectives: [...input.objectives], industry: input.industry.trim() };
}

export function validateStrategyRecommendation(recommendation: StrategyRecommendation): StrategyRecommendation {
  const recommendationId = id(recommendation.recommendationId, "RECOMMENDATION_INVALID");
  if (typeof recommendation.explanation !== "string" || recommendation.explanation.trim() === "") throw new StrategyValidationError("RECOMMENDATION_INVALID", "recommendation explanation must be non-empty");
  if (!Array.isArray(recommendation.configurationSections) || recommendation.configurationSections.some((section) => typeof section !== "string" || section.trim() === "")) throw new StrategyValidationError("RECOMMENDATION_INVALID", "configuration sections must be named");
  return { recommendationId, explanation: recommendation.explanation.trim(), configurationSections: [...recommendation.configurationSections] };
}

export function createStrategySelectionResult(selection: StrategySelectionInput, recommendation: StrategyRecommendation): StrategySelectionResult {
  return { selection: validateStrategySelection(selection), recommendation: validateStrategyRecommendation(recommendation) };
}
