import {
  createRewardLedgerTransaction,
  projectRewardAccount,
  type RewardAccountProjection,
  type RewardLedgerTransaction,
} from "../reward/reward-ledger.js";

export const REWARD_TYPES = [
  "FIXED_DISCOUNT",
  "PERCENTAGE_DISCOUNT",
  "FREE_PRODUCT",
  "PARTNER_REWARD",
] as const;
export type RewardType = (typeof REWARD_TYPES)[number];

export const RESERVATION_LIFETIME_MS = 15 * 60 * 1000;
export type ReservationStatus = "RESERVED" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export interface RewardDefinition {
  readonly rewardDefinitionId: string;
  readonly type: RewardType;
  readonly name: string;
  readonly description?: string;
  readonly pointsCost: bigint;
  readonly enabled: boolean;
  readonly eligibleStatusLevelIds: readonly string[];
  readonly requiredBenefitDefinitionIds: readonly string[];
  readonly programConfigurationVersionId: string;
}

export interface RedemptionContext {
  readonly redemptionId: string;
  readonly membershipId: string;
  readonly rewardAccountId: string;
  readonly loyaltyProgramId: string;
  readonly membershipStatus: "ACTIVE" | "SUSPENDED" | "CLOSED";
  readonly loyaltyProgramStatus: "ACTIVE" | "SUSPENDED" | "CLOSED";
  readonly currentStatusLevelId?: string;
  readonly effectiveBenefitDefinitionIds: readonly string[];
  readonly availablePoints: bigint;
  readonly now: string;
  readonly idempotencyKey: string;
}

export interface EligibilityResult {
  readonly eligible: boolean;
  readonly reason?: EligibilityFailureCode;
}

export type EligibilityFailureCode =
  | "INVALID_REWARD"
  | "MEMBERSHIP_NOT_ACTIVE"
  | "PROGRAM_NOT_ACTIVE"
  | "REWARD_DISABLED"
  | "STATUS_NOT_ELIGIBLE"
  | "BENEFIT_NOT_ELIGIBLE"
  | "INSUFFICIENT_AVAILABLE_POINTS";

export interface RedemptionReservation {
  readonly reservationId: string;
  readonly redemptionId: string;
  readonly rewardDefinitionId: string;
  readonly membershipId: string;
  readonly rewardAccountId: string;
  readonly loyaltyProgramId: string;
  readonly programConfigurationVersionId: string;
  readonly pointsCost: bigint;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly status: ReservationStatus;
  readonly idempotencyKey: string;
}

export interface RedemptionOperationResult {
  readonly reservation: RedemptionReservation;
  readonly descriptor?: RewardLedgerTransaction;
}

export type RedemptionFailureCode =
  | EligibilityFailureCode
  | "INVALID_INPUT"
  | "IDEMPOTENCY_CONFLICT"
  | "REDEMPTION_NOT_FOUND"
  | "RESERVATION_NOT_ACTIVE"
  | "RESERVATION_EXPIRED"
  | "INSUFFICIENT_AVAILABLE_POINTS";

export class RedemptionError extends Error {
  constructor(readonly code: RedemptionFailureCode, message: string) {
    super(message);
    this.name = "RedemptionError";
  }
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new RedemptionError("INVALID_INPUT", `${field} must be non-empty`);
  }
  return value.trim();
}

function canonicalUtc(value: unknown, field: string): string {
  const result = requiredText(value, field);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(result) || Number.isNaN(Date.parse(result))) {
    throw new RedemptionError("INVALID_INPUT", `${field} must be canonical UTC`);
  }
  return result;
}

export function validateRewardDefinition(input: RewardDefinition): RewardDefinition {
  const rewardDefinitionId = requiredText(input.rewardDefinitionId, "rewardDefinitionId");
  const name = requiredText(input.name, "name");
  if (!REWARD_TYPES.includes(input.type)) throw new RedemptionError("INVALID_REWARD", "unsupported reward type");
  if (typeof input.pointsCost !== "bigint" || input.pointsCost <= 0n) {
    throw new RedemptionError("INVALID_REWARD", "pointsCost must be a positive whole number");
  }
  if (typeof input.enabled !== "boolean") throw new RedemptionError("INVALID_REWARD", "enabled must be boolean");
  const programConfigurationVersionId = requiredText(input.programConfigurationVersionId, "programConfigurationVersionId");
  const statusIds = [...input.eligibleStatusLevelIds];
  const benefitIds = [...input.requiredBenefitDefinitionIds];
  if (new Set(statusIds).size !== statusIds.length || new Set(benefitIds).size !== benefitIds.length) {
    throw new RedemptionError("INVALID_REWARD", "eligibility references must be unique");
  }
  return Object.freeze({ ...input, rewardDefinitionId, name, programConfigurationVersionId, eligibleStatusLevelIds: Object.freeze(statusIds), requiredBenefitDefinitionIds: Object.freeze(benefitIds) });
}

export function evaluateRewardEligibility(definition: RewardDefinition, context: RedemptionContext): EligibilityResult {
  try {
    validateRewardDefinition(definition);
  } catch (error) {
    if (error instanceof RedemptionError) return { eligible: false, reason: "INVALID_REWARD" };
    throw error;
  }
  if (context.membershipStatus !== "ACTIVE") return { eligible: false, reason: "MEMBERSHIP_NOT_ACTIVE" };
  if (context.loyaltyProgramStatus !== "ACTIVE") return { eligible: false, reason: "PROGRAM_NOT_ACTIVE" };
  if (!definition.enabled) return { eligible: false, reason: "REWARD_DISABLED" };
  if (definition.eligibleStatusLevelIds.length > 0 && (!context.currentStatusLevelId || !definition.eligibleStatusLevelIds.includes(context.currentStatusLevelId))) {
    return { eligible: false, reason: "STATUS_NOT_ELIGIBLE" };
  }
  if (definition.requiredBenefitDefinitionIds.some((id) => !context.effectiveBenefitDefinitionIds.includes(id))) {
    return { eligible: false, reason: "BENEFIT_NOT_ELIGIBLE" };
  }
  if (context.availablePoints < definition.pointsCost) return { eligible: false, reason: "INSUFFICIENT_AVAILABLE_POINTS" };
  return { eligible: true };
}

function sameRequest(definition: RewardDefinition, context: RedemptionContext, reservation: RedemptionReservation): boolean {
  return reservation.rewardDefinitionId === definition.rewardDefinitionId && reservation.membershipId === context.membershipId && reservation.rewardAccountId === context.rewardAccountId && reservation.loyaltyProgramId === context.loyaltyProgramId && reservation.programConfigurationVersionId === definition.programConfigurationVersionId && reservation.pointsCost === definition.pointsCost && reservation.idempotencyKey === context.idempotencyKey;
}

/**
 * In-memory domain adapter. It serializes synchronous decisions in one process;
 * durable/distributed atomicity is intentionally owned by the deferred persistence task.
 */
export class RewardRedemptionService {
  private readonly reservations = new Map<string, RedemptionReservation>();
  private readonly ledger: RewardLedgerTransaction[];

  constructor(initialLedger: readonly RewardLedgerTransaction[] = []) {
    this.ledger = [...initialLedger];
  }

  projection(): RewardAccountProjection {
    return projectRewardAccount(this.ledger);
  }

  history(): readonly RewardLedgerTransaction[] {
    return Object.freeze([...this.ledger]);
  }

  reserve(definition: RewardDefinition, context: RedemptionContext): RedemptionOperationResult {
    const existing = this.reservations.get(context.redemptionId);
    if (existing) {
      if (!sameRequest(definition, context, existing)) throw new RedemptionError("IDEMPOTENCY_CONFLICT", "redemption idempotency conflict");
      return { reservation: existing };
    }
    const eligibility = evaluateRewardEligibility(definition, { ...context, availablePoints: this.projection().available });
    if (!eligibility.eligible) throw new RedemptionError(eligibility.reason ?? "INVALID_REWARD", "reward redemption is not eligible");
    const createdAt = canonicalUtc(context.now, "now");
    const reservation: RedemptionReservation = Object.freeze({ reservationId: `${context.redemptionId}:reservation`, redemptionId: context.redemptionId, rewardDefinitionId: definition.rewardDefinitionId, membershipId: context.membershipId, rewardAccountId: context.rewardAccountId, loyaltyProgramId: context.loyaltyProgramId, programConfigurationVersionId: definition.programConfigurationVersionId, pointsCost: definition.pointsCost, createdAt, expiresAt: new Date(Date.parse(createdAt) + RESERVATION_LIFETIME_MS).toISOString(), status: "RESERVED", idempotencyKey: context.idempotencyKey });
    const descriptor = this.descriptor(reservation, "RESERVED", `${reservation.reservationId}:reserved`, createdAt);
    this.reservations.set(context.redemptionId, reservation);
    this.ledger.push(descriptor);
    return { reservation, descriptor };
  }

  confirm(redemptionId: string, now: string): RedemptionOperationResult {
    const reservation = this.get(redemptionId);
    if (reservation.status === "CONFIRMED") return { reservation };
    if (reservation.status !== "RESERVED") throw new RedemptionError("RESERVATION_NOT_ACTIVE", "reservation is not active");
    const at = canonicalUtc(now, "now");
    if (Date.parse(at) >= Date.parse(reservation.expiresAt)) throw new RedemptionError("RESERVATION_EXPIRED", "reservation has expired");
    const next = Object.freeze({ ...reservation, status: "CONFIRMED" as const });
    const descriptor = this.descriptor(next, "REDEEMED", `${reservation.reservationId}:redeemed`, at);
    this.reservations.set(redemptionId, next);
    this.ledger.push(descriptor);
    return { reservation: next, descriptor };
  }

  cancel(redemptionId: string, now: string): RedemptionOperationResult {
    return this.release(redemptionId, "CANCELLED", now, "reservation has been cancelled");
  }

  expire(redemptionId: string, now: string): RedemptionOperationResult {
    return this.release(redemptionId, "EXPIRED", now, "reservation has expired", true);
  }

  private release(redemptionId: string, status: "CANCELLED" | "EXPIRED", now: string, message: string, requireExpired = false): RedemptionOperationResult {
    const reservation = this.get(redemptionId);
    if (reservation.status === status) return { reservation };
    if (reservation.status !== "RESERVED") throw new RedemptionError("RESERVATION_NOT_ACTIVE", message);
    const at = canonicalUtc(now, "now");
    if (requireExpired && Date.parse(at) < Date.parse(reservation.expiresAt)) throw new RedemptionError("RESERVATION_NOT_ACTIVE", "reservation is not expired");
    const next = Object.freeze({ ...reservation, status });
    const descriptor = this.descriptor(next, "RESERVATION_RELEASED", `${reservation.reservationId}:released`, at);
    this.reservations.set(redemptionId, next);
    this.ledger.push(descriptor);
    return { reservation: next, descriptor };
  }

  private get(redemptionId: string): RedemptionReservation {
    const reservation = this.reservations.get(requiredText(redemptionId, "redemptionId"));
    if (!reservation) throw new RedemptionError("REDEMPTION_NOT_FOUND", "redemption was not found");
    return reservation;
  }

  private descriptor(reservation: RedemptionReservation, type: "RESERVED" | "REDEEMED" | "RESERVATION_RELEASED", id: string, occurredAt: string): RewardLedgerTransaction {
    return createRewardLedgerTransaction({ id, membershipId: reservation.membershipId, rewardAccountId: reservation.rewardAccountId, activityId: reservation.redemptionId, earningDecisionId: reservation.redemptionId, loyaltyProgramId: reservation.loyaltyProgramId, programConfigurationVersionId: reservation.programConfigurationVersionId, type, points: reservation.pointsCost, occurredAt, idempotencyKey: `${reservation.idempotencyKey}:${type}` });
  }
}
