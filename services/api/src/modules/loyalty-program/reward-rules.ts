export interface RewardRule {
  readonly id: string;
  readonly minimumAmountMinor: bigint;
  readonly maximumAmountMinor?: bigint;
  readonly amountIntervalMinor: bigint;
  readonly pointsGranted: bigint;
}

export interface RewardRuleSet {
  readonly programConfigurationVersionId: string;
  readonly currency: string;
  readonly rules: readonly RewardRule[];
}

export interface RewardEvaluationInput {
  readonly amountMinor: bigint;
  readonly currency: string;
}

export interface RewardEvaluationResult {
  readonly programConfigurationVersionId: string;
  readonly currency: string;
  readonly ruleId: string | null;
  readonly pointsAwarded: bigint;
}

export class RewardRuleValidationError extends Error {
  constructor(readonly code: "RULE_ID_INVALID" | "VERSION_ID_INVALID" | "CURRENCY_INVALID" | "AMOUNT_INVALID" | "POINTS_INVALID" | "RANGE_INVALID" | "RANGE_OVERLAP" | "CURRENCY_MISMATCH", message: string) {
    super(message);
    this.name = "RewardRuleValidationError";
  }
}

function nonEmpty(value: string, code: "RULE_ID_INVALID" | "VERSION_ID_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new RewardRuleValidationError(code, "identifier must not be empty");
  return value.trim();
}

function currency(value: string): string {
  if (typeof value !== "string" || !/^[A-Z]{3}$/u.test(value)) throw new RewardRuleValidationError("CURRENCY_INVALID", "currency context must be an ISO-style code");
  return value;
}

function validateRule(rule: RewardRule): RewardRule {
  const id = nonEmpty(rule.id, "RULE_ID_INVALID");
  if (typeof rule.minimumAmountMinor !== "bigint" || rule.minimumAmountMinor < 0n) throw new RewardRuleValidationError("AMOUNT_INVALID", "minimum amount must be a non-negative minor-unit integer");
  if (rule.maximumAmountMinor !== undefined && (typeof rule.maximumAmountMinor !== "bigint" || rule.maximumAmountMinor <= rule.minimumAmountMinor)) throw new RewardRuleValidationError("RANGE_INVALID", "maximum amount must be greater than the inclusive minimum");
  if (typeof rule.amountIntervalMinor !== "bigint" || rule.amountIntervalMinor <= 0n) throw new RewardRuleValidationError("AMOUNT_INVALID", "amount interval must be a positive minor-unit integer");
  if (typeof rule.pointsGranted !== "bigint" || rule.pointsGranted <= 0n) throw new RewardRuleValidationError("POINTS_INVALID", "points granted must be a positive integer");
  return { ...rule, id };
}

export function validateRewardRuleSet(input: RewardRuleSet): RewardRuleSet {
  const programConfigurationVersionId = nonEmpty(input.programConfigurationVersionId, "VERSION_ID_INVALID");
  const effectiveCurrency = currency(input.currency);
  const rules = input.rules.map(validateRule).sort((left, right) => left.minimumAmountMinor < right.minimumAmountMinor ? -1 : 1);
  const ids = new Set<string>();
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    if (ids.has(rule.id)) throw new RewardRuleValidationError("RANGE_INVALID", "rule identifiers must be unique");
    ids.add(rule.id);
    const previous = rules[index - 1];
    if (previous !== undefined && (previous.maximumAmountMinor === undefined || previous.maximumAmountMinor > rule.minimumAmountMinor)) throw new RewardRuleValidationError("RANGE_OVERLAP", "Reward Rule ranges must not overlap");
  }
  return { programConfigurationVersionId, currency: effectiveCurrency, rules: rules.map((rule) => ({ ...rule })) };
}

export function evaluateRewardRules(ruleSet: RewardRuleSet, input: RewardEvaluationInput): RewardEvaluationResult {
  const validated = validateRewardRuleSet(ruleSet);
  if (typeof input.amountMinor !== "bigint" || input.amountMinor < 0n) throw new RewardRuleValidationError("AMOUNT_INVALID", "activity amount must be a non-negative minor-unit integer");
  if (input.currency !== validated.currency) throw new RewardRuleValidationError("CURRENCY_MISMATCH", "activity currency does not match the Program currency context");
  const rule = validated.rules.find((candidate) => input.amountMinor >= candidate.minimumAmountMinor && (candidate.maximumAmountMinor === undefined || input.amountMinor < candidate.maximumAmountMinor)) ?? null;
  if (rule === null) return { programConfigurationVersionId: validated.programConfigurationVersionId, currency: validated.currency, ruleId: null, pointsAwarded: 0n };
  return { programConfigurationVersionId: validated.programConfigurationVersionId, currency: validated.currency, ruleId: rule.id, pointsAwarded: (input.amountMinor / rule.amountIntervalMinor) * rule.pointsGranted };
}
