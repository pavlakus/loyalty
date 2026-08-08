import type { RewardLedgerTransaction } from "../reward/reward-ledger.js";

export interface ObservationPeriod { readonly from: string; readonly to: string; }
export interface MembershipObservation { readonly id: string; readonly loyaltyProgramId: string; readonly createdAt: string; readonly statusHistory: readonly { readonly status: "ACTIVE" | "SUSPENDED" | "CLOSED"; readonly occurredAt: string }[]; readonly statusLevelHistory: readonly { readonly statusLevelId: string; readonly occurredAt: string }[]; }
export interface ReceiptObservation { readonly id: string; readonly loyaltyProgramId: string; readonly membershipId: string; readonly occurredAt: string; readonly qualifying: boolean; readonly amountMinor: bigint; readonly currency: string; }
export interface RedemptionObservation { readonly id: string; readonly loyaltyProgramId: string; readonly membershipId: string; readonly status: "RESERVED" | "CONFIRMED" | "CANCELLED" | "EXPIRED"; readonly points: bigint; readonly occurredAt: string; readonly programConfigurationVersionId: string; }
export interface AnalyticsInput { readonly period: ObservationPeriod; readonly loyaltyProgramId: string; readonly memberships: readonly MembershipObservation[]; readonly receipts: readonly ReceiptObservation[]; readonly rewardLedger: readonly RewardLedgerTransaction[]; readonly redemptions: readonly RedemptionObservation[]; }
export interface CurrencyAmount { readonly currency: string; readonly amountMinor: bigint; }
export interface BusinessObservationMetrics { readonly membership: { readonly totalMembers: number; readonly activeMembers: number; readonly newMembers: number; readonly suspendedMembers: number; readonly closedMembers: number }; readonly activity: { readonly receiptCount: number; readonly qualifyingReceiptCount: number; readonly qualifyingPurchaseAmount: readonly CurrencyAmount[] }; readonly rewardPoints: { readonly pointsEarned: bigint; readonly pointsRedeemed: bigint; readonly pointsExpired: bigint }; readonly redemption: { readonly redemptionCount: number; readonly redemptionPoints: bigint; readonly uniqueRedeemingMembers: number }; readonly engagement: { readonly activeMembersWithActivity: number; readonly earningMembers: number; readonly redeemingMembers: number }; readonly statusDistribution: readonly { readonly statusLevelId: string; readonly memberCount: number }[]; }

export class AnalyticsValidationError extends Error { constructor(readonly code: "INPUT_INVALID" | "CURRENCY_CONFLICT", message: string) { super(message); this.name = "AnalyticsValidationError"; } }
function text(value: unknown, field: string): string { if (typeof value !== "string" || value.trim() === "") throw new AnalyticsValidationError("INPUT_INVALID", `${field} must be non-empty`); return value.trim(); }
function utc(value: unknown, field: string): string { const result = text(value, field); if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(result) || Number.isNaN(Date.parse(result))) throw new AnalyticsValidationError("INPUT_INVALID", `${field} must be canonical UTC`); return result; }
function within(value: string, period: ObservationPeriod): boolean { return value >= period.from && value < period.to; }
function uniqueById<T extends { readonly id: string }>(values: readonly T[]): readonly T[] { const seen = new Set<string>(); return values.filter((value) => { if (seen.has(value.id)) return false; seen.add(value.id); return true; }); }
function latest<T extends { readonly occurredAt: string }>(values: readonly T[], to: string): T | undefined { return values.filter((value) => value.occurredAt < to).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).at(-1); }
function validatePeriod(period: ObservationPeriod): ObservationPeriod { const from = utc(period.from, "from"); const to = utc(period.to, "to"); if (from >= to) throw new AnalyticsValidationError("INPUT_INVALID", "from must precede to"); return { from, to }; }

export function calculateBusinessObservation(input: AnalyticsInput): BusinessObservationMetrics {
  const period = validatePeriod(input.period);
  const loyaltyProgramId = text(input.loyaltyProgramId, "loyaltyProgramId");
  const memberships = uniqueById(input.memberships.filter((membership) => membership.loyaltyProgramId === loyaltyProgramId));
  const memberById = new Map(memberships.map((membership) => [membership.id, membership]));
  const finalStatus = new Map(memberships.map((membership) => [membership.id, latest(membership.statusHistory, period.to)?.status]));
  const finalStatusLevel = new Map(memberships.map((membership) => [membership.id, latest(membership.statusLevelHistory, period.to)?.statusLevelId]));
  const receipts = uniqueById(input.receipts.filter((receipt) => receipt.loyaltyProgramId === loyaltyProgramId && within(receipt.occurredAt, period)));
  const qualifyingReceipts = receipts.filter((receipt) => receipt.qualifying);
  const currencies = new Map<string, bigint>();
  for (const receipt of qualifyingReceipts) currencies.set(receipt.currency, (currencies.get(receipt.currency) ?? 0n) + receipt.amountMinor);
  const rewardTransactions = uniqueById(input.rewardLedger.filter((transaction) => transaction.loyaltyProgramId === loyaltyProgramId && within(transaction.occurredAt, period)));
  const pointsEarned = rewardTransactions.filter((transaction) => transaction.type === "EARNED" || transaction.type === "PENDING").reduce((total, transaction) => total + transaction.points, 0n);
  const pointsExpired = rewardTransactions.filter((transaction) => transaction.type === "EXPIRED").reduce((total, transaction) => total + transaction.points, 0n);
  const redemptions = uniqueById(input.redemptions.filter((redemption) => redemption.loyaltyProgramId === loyaltyProgramId && redemption.status === "CONFIRMED" && within(redemption.occurredAt, period)));
  const activeIds = new Set(memberships.filter((membership) => finalStatus.get(membership.id) === "ACTIVE").map((membership) => membership.id));
  const qualifyingActivityMembers = new Set(qualifyingReceipts.filter((receipt) => activeIds.has(receipt.membershipId)).map((receipt) => receipt.membershipId));
  const earningMembers = new Set(rewardTransactions.filter((transaction) => (transaction.type === "EARNED" || transaction.type === "PENDING") && transaction.points > 0n && memberById.has(transaction.membershipId)).map((transaction) => transaction.membershipId));
  const redeemingMembers = new Set(redemptions.map((redemption) => redemption.membershipId));
  const distribution = new Map<string, number>();
  for (const level of finalStatusLevel.values()) if (level !== undefined) distribution.set(level, (distribution.get(level) ?? 0) + 1);
  return Object.freeze({
    membership: { totalMembers: memberships.filter((membership) => membership.createdAt < period.to).length, activeMembers: [...finalStatus.values()].filter((status) => status === "ACTIVE").length, newMembers: memberships.filter((membership) => within(membership.createdAt, period)).length, suspendedMembers: [...finalStatus.values()].filter((status) => status === "SUSPENDED").length, closedMembers: [...finalStatus.values()].filter((status) => status === "CLOSED").length },
    activity: { receiptCount: receipts.length, qualifyingReceiptCount: qualifyingReceipts.length, qualifyingPurchaseAmount: Object.freeze([...currencies.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([currency, amountMinor]) => Object.freeze({ currency, amountMinor }))) },
    rewardPoints: { pointsEarned, pointsRedeemed: redemptions.reduce((total, redemption) => total + redemption.points, 0n), pointsExpired },
    redemption: { redemptionCount: redemptions.length, redemptionPoints: redemptions.reduce((total, redemption) => total + redemption.points, 0n), uniqueRedeemingMembers: redeemingMembers.size },
    engagement: { activeMembersWithActivity: qualifyingActivityMembers.size, earningMembers: earningMembers.size, redeemingMembers: redeemingMembers.size },
    statusDistribution: Object.freeze([...distribution.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([statusLevelId, memberCount]) => Object.freeze({ statusLevelId, memberCount }))),
  });
}
