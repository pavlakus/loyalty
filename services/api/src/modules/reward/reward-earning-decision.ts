import { evaluateRewardRules, type RewardRuleSet } from "../loyalty-program/reward-rules.js";

export interface RewardEarningInput { readonly activityId: string; readonly membershipId: string; readonly amountMinor: bigint; readonly currency: string; }
export interface RewardEarningDecision { readonly activityId: string; readonly membershipId: string; readonly programConfigurationVersionId: string; readonly ruleId: string | null; readonly pointsAwarded: bigint; readonly currency: string; }
export class RewardEarningDecisionError extends Error { constructor(readonly code: "INPUT_INVALID", message: string) { super(message); this.name = "RewardEarningDecisionError"; } }
function id(value: unknown, field: string): string { if (typeof value !== "string" || value.trim() === "") throw new RewardEarningDecisionError("INPUT_INVALID", `${field} must be non-empty`); return value.trim(); }
export function evaluateRewardEarning(ruleSet: RewardRuleSet, input: RewardEarningInput): RewardEarningDecision { const activityId = id(input.activityId, "activityId"); const membershipId = id(input.membershipId, "membershipId"); const result = evaluateRewardRules(ruleSet, { amountMinor: input.amountMinor, currency: input.currency }); return { activityId, membershipId, ...result }; }
