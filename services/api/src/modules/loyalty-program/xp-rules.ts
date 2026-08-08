export type XPRuleType = "VISIT" | "PURCHASE" | "PURCHASE_AMOUNT_THRESHOLD" | "VISIT_FREQUENCY";

export interface VisitXPCondition { readonly type: "VISIT"; }
export interface PurchaseXPCondition { readonly type: "PURCHASE"; }
export interface PurchaseAmountThresholdXPCondition { readonly type: "PURCHASE_AMOUNT_THRESHOLD"; readonly minimumAmountMinor: bigint; }
export interface VisitFrequencyXPCondition { readonly type: "VISIT_FREQUENCY"; readonly requiredVisitCount: number; readonly windowDays: number; }
export type XPRuleCondition = VisitXPCondition | PurchaseXPCondition | PurchaseAmountThresholdXPCondition | VisitFrequencyXPCondition;

export interface XPRule {
  readonly id: string;
  readonly type: XPRuleType;
  readonly enabled: boolean;
  readonly condition: XPRuleCondition;
  readonly xpAmount: bigint;
}

export interface XPRuleSet {
  readonly programConfigurationVersionId: string;
  readonly currency: string;
  readonly rules: readonly XPRule[];
}

export interface XPActivity {
  readonly sourceActivityId: string;
  readonly type: "VISIT" | "PURCHASE";
  readonly qualifying: boolean;
  readonly amountMinor?: bigint;
  readonly currency?: string;
  readonly visitTimes?: readonly string[];
  readonly evaluationTime?: string;
}

export interface XPAwardDecision {
  readonly sourceActivityId: string;
  readonly ruleId: string;
  readonly programConfigurationVersionId: string;
  readonly xpAmount: bigint;
}

export interface XPEvaluationResult {
  readonly programConfigurationVersionId: string;
  readonly sourceActivityId: string;
  readonly totalXp: bigint;
  readonly awards: readonly XPAwardDecision[];
}

export class XPRuleValidationError extends Error {
  constructor(readonly code: "RULE_ID_INVALID" | "VERSION_ID_INVALID" | "TYPE_INVALID" | "CONDITION_INVALID" | "XP_AMOUNT_INVALID" | "CURRENCY_INVALID" | "CURRENCY_MISMATCH" | "ACTIVITY_INVALID" | "TIMESTAMP_INVALID", message: string) {
    super(message);
    this.name = "XPRuleValidationError";
  }
}

function identifier(value: string, code: "RULE_ID_INVALID" | "VERSION_ID_INVALID" | "ACTIVITY_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new XPRuleValidationError(code, "identifier must not be empty");
  return value.trim();
}
function currency(value: string): string {
  if (typeof value !== "string" || !/^[A-Z]{3}$/u.test(value)) throw new XPRuleValidationError("CURRENCY_INVALID", "currency must be an ISO-style code");
  return value;
}
function timestamp(value: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(new Date(value).getTime()) || new Date(value).toISOString() !== value) throw new XPRuleValidationError("TIMESTAMP_INVALID", "timestamp must be canonical UTC ISO-8601");
  return value;
}

function validateCondition(rule: XPRule): XPRuleCondition {
  const condition = rule.condition as unknown as Record<string, unknown>;
  if (condition === null || typeof condition !== "object" || Array.isArray(condition) || condition.type !== rule.type) throw new XPRuleValidationError("CONDITION_INVALID", "condition type must match rule type");
  if (rule.type === "PURCHASE_AMOUNT_THRESHOLD") {
    if (typeof condition.minimumAmountMinor !== "bigint" || condition.minimumAmountMinor < 0n) throw new XPRuleValidationError("CONDITION_INVALID", "minimum purchase amount must be a non-negative minor-unit integer");
    return { type: "PURCHASE_AMOUNT_THRESHOLD", minimumAmountMinor: condition.minimumAmountMinor };
  }
  if (rule.type === "VISIT_FREQUENCY") {
    if (!Number.isInteger(condition.requiredVisitCount) || (condition.requiredVisitCount as number) < 1 || !Number.isInteger(condition.windowDays) || (condition.windowDays as number) < 1) throw new XPRuleValidationError("CONDITION_INVALID", "visit count and window days must be positive integers");
    return { type: "VISIT_FREQUENCY", requiredVisitCount: condition.requiredVisitCount as number, windowDays: condition.windowDays as number };
  }
  return { type: rule.type } as VisitXPCondition | PurchaseXPCondition;
}

export function validateXPRuleSet(input: XPRuleSet): XPRuleSet {
  const programConfigurationVersionId = identifier(input.programConfigurationVersionId, "VERSION_ID_INVALID");
  const effectiveCurrency = currency(input.currency);
  const ids = new Set<string>();
  const rules = input.rules.map((rule) => {
    const id = identifier(rule.id, "RULE_ID_INVALID");
    if (ids.has(id)) throw new XPRuleValidationError("RULE_ID_INVALID", "XP Rule identifiers must be unique");
    ids.add(id);
    if (!(["VISIT", "PURCHASE", "PURCHASE_AMOUNT_THRESHOLD", "VISIT_FREQUENCY"] as const).includes(rule.type)) throw new XPRuleValidationError("TYPE_INVALID", "XP Rule type is not supported");
    if (typeof rule.enabled !== "boolean") throw new XPRuleValidationError("CONDITION_INVALID", "enabled must be boolean");
    if (typeof rule.xpAmount !== "bigint" || rule.xpAmount < 0n) throw new XPRuleValidationError("XP_AMOUNT_INVALID", "XP amount must be a non-negative integer");
    return { id, type: rule.type, enabled: rule.enabled, condition: validateCondition(rule), xpAmount: rule.xpAmount };
  });
  return { programConfigurationVersionId, currency: effectiveCurrency, rules: rules.map((rule) => ({ ...rule })) };
}

function ruleQualifies(rule: XPRule, activity: XPActivity, effectiveCurrency: string): boolean {
  if (!activity.qualifying) return false;
  if (rule.type === "VISIT" || rule.type === "VISIT_FREQUENCY") {
    if (activity.type !== "VISIT") return false;
  } else if (activity.type !== "PURCHASE") return false;
  if (rule.type === "PURCHASE_AMOUNT_THRESHOLD") {
    if (activity.amountMinor === undefined || typeof activity.amountMinor !== "bigint" || activity.amountMinor < 0n) throw new XPRuleValidationError("ACTIVITY_INVALID", "purchase amount must be a non-negative minor-unit integer");
    if (activity.currency !== effectiveCurrency) throw new XPRuleValidationError("CURRENCY_MISMATCH", "purchase currency does not match the Program currency context");
    const condition = rule.condition as PurchaseAmountThresholdXPCondition;
    return activity.amountMinor >= condition.minimumAmountMinor;
  }
  if (rule.type !== "VISIT_FREQUENCY") return true;
  if (activity.evaluationTime === undefined || activity.visitTimes === undefined) throw new XPRuleValidationError("ACTIVITY_INVALID", "frequency evaluation requires evaluation time and visit history");
  const evaluationTime = Date.parse(timestamp(activity.evaluationTime));
  const condition = rule.condition as VisitFrequencyXPCondition;
  const windowStart = evaluationTime - condition.windowDays * 86_400_000;
  const qualifyingVisits = activity.visitTimes.filter((visitTime) => {
    const visit = Date.parse(timestamp(visitTime));
    return visit >= windowStart && visit <= evaluationTime;
  });
  return qualifyingVisits.length >= condition.requiredVisitCount;
}

export function evaluateXPRules(ruleSet: XPRuleSet, activity: XPActivity): XPEvaluationResult {
  const validated = validateXPRuleSet(ruleSet);
  const sourceActivityId = identifier(activity.sourceActivityId, "ACTIVITY_INVALID");
  if (typeof activity.qualifying !== "boolean") throw new XPRuleValidationError("ACTIVITY_INVALID", "qualifying must be boolean");
  const awards = validated.rules.filter((rule) => rule.enabled && ruleQualifies(rule, { ...activity, sourceActivityId }, validated.currency)).map((rule) => ({ sourceActivityId, ruleId: rule.id, programConfigurationVersionId: validated.programConfigurationVersionId, xpAmount: rule.xpAmount }));
  return { programConfigurationVersionId: validated.programConfigurationVersionId, sourceActivityId, totalXp: awards.reduce((total, award) => total + award.xpAmount, 0n), awards };
}
