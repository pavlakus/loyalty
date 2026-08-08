import assert from "node:assert/strict";
import test from "node:test";
import { createRewardLedgerTransaction } from "../dist/modules/reward/reward-ledger.js";
import { RedemptionError, RewardRedemptionService, evaluateRewardEligibility, validateRewardDefinition } from "../dist/modules/redemption/reward-redemption.js";

const definition = { rewardDefinitionId: "reward-1", type: "FIXED_DISCOUNT", name: "Coffee", pointsCost: 400n, enabled: true, eligibleStatusLevelIds: [], requiredBenefitDefinitionIds: [], programConfigurationVersionId: "program-version-1" };
const context = (overrides = {}) => ({ redemptionId: "redemption-1", membershipId: "membership-1", rewardAccountId: "account-1", loyaltyProgramId: "program-1", membershipStatus: "ACTIVE", loyaltyProgramStatus: "ACTIVE", effectiveBenefitDefinitionIds: [], availablePoints: 1000n, now: "2026-08-08T10:00:00.000Z", idempotencyKey: "request-1", ...overrides });
const earned = createRewardLedgerTransaction({ id: "earned-1", membershipId: "membership-1", rewardAccountId: "account-1", activityId: "receipt-1", earningDecisionId: "decision-1", loyaltyProgramId: "program-1", programConfigurationVersionId: "program-version-1", type: "EARNED", points: 1000n, occurredAt: "2026-08-08T09:00:00.000Z", idempotencyKey: "earned-1" });

test("executes eligibility, reservation, and confirmation without mutating earning history", () => {
  const service = new RewardRedemptionService([earned]);
  assert.deepEqual(evaluateRewardEligibility(definition, context()), { eligible: true });
  service.reserve(definition, context());
  assert.deepEqual(service.projection(), { available: 600n, pending: 0n, reserved: 400n, redeemed: 0n, expired: 0n, reversed: 0n, total: 1000n });
  service.confirm("redemption-1", "2026-08-08T10:01:00.000Z");
  assert.deepEqual(service.projection(), { available: 600n, pending: 0n, reserved: 0n, redeemed: 400n, expired: 0n, reversed: 0n, total: 600n });
  assert.equal(service.history()[0].type, "EARNED");
  assert.equal(service.history()[0].points, 1000n);
});

test("cancellation and expiration release reserved points exactly once", () => {
  const cancelled = new RewardRedemptionService([earned]);
  cancelled.reserve(definition, context());
  cancelled.cancel("redemption-1", "2026-08-08T10:01:00.000Z");
  assert.equal(cancelled.projection().available, 1000n);
  assert.equal(cancelled.projection().reserved, 0n);
  const expired = new RewardRedemptionService([earned]);
  expired.reserve(definition, context());
  expired.expire("redemption-1", "2026-08-08T10:15:00.000Z");
  assert.equal(expired.projection().available, 1000n);
  assert.equal(expired.projection().reserved, 0n);
  const historyLength = expired.history().length;
  expired.expire("redemption-1", "2026-08-08T10:16:00.000Z");
  assert.equal(expired.history().length, historyLength);
});

test("same request is idempotent and a changed request conflicts", () => {
  const service = new RewardRedemptionService([earned]);
  const first = service.reserve(definition, context());
  const replay = service.reserve(definition, context());
  assert.equal(replay.descriptor, undefined);
  assert.equal(service.history().length, 2);
  assert.throws(() => service.reserve({ ...definition, pointsCost: 500n }, context()), (error) => error instanceof RedemptionError && error.code === "IDEMPOTENCY_CONFLICT");
  service.confirm("redemption-1", "2026-08-08T10:01:00.000Z");
  service.confirm("redemption-1", "2026-08-08T10:02:00.000Z");
  assert.equal(service.history().length, 3);
  assert.equal(first.reservation.programConfigurationVersionId, "program-version-1");
});

test("eligibility rejects unavailable state, and two concurrent 700-point attempts cannot both succeed", () => {
  assert.equal(evaluateRewardEligibility(definition, context({ availablePoints: 399n })).reason, "INSUFFICIENT_AVAILABLE_POINTS");
  assert.equal(evaluateRewardEligibility(definition, context({ membershipStatus: "SUSPENDED" })).reason, "MEMBERSHIP_NOT_ACTIVE");
  assert.equal(evaluateRewardEligibility(definition, context({ loyaltyProgramStatus: "SUSPENDED" })).reason, "PROGRAM_NOT_ACTIVE");
  assert.equal(evaluateRewardEligibility({ ...definition, enabled: false }, context()).reason, "REWARD_DISABLED");
  assert.equal(evaluateRewardEligibility({ ...definition, eligibleStatusLevelIds: ["gold"] }, context()).reason, "STATUS_NOT_ELIGIBLE");
  assert.equal(evaluateRewardEligibility({ ...definition, requiredBenefitDefinitionIds: ["benefit-1"] }, context()).reason, "BENEFIT_NOT_ELIGIBLE");
  const expensive = { ...definition, pointsCost: 700n };
  const service = new RewardRedemptionService([earned]);
  assert.doesNotThrow(() => service.reserve(expensive, context({ redemptionId: "redemption-a", idempotencyKey: "request-a" })));
  assert.throws(() => service.reserve(expensive, context({ redemptionId: "redemption-b", idempotencyKey: "request-b" })), (error) => error instanceof RedemptionError && error.code === "INSUFFICIENT_AVAILABLE_POINTS");
});

test("reward definitions reject non-positive point costs", () => {
  assert.throws(() => validateRewardDefinition({ ...definition, pointsCost: 0n }), (error) => error instanceof RedemptionError && error.code === "INVALID_REWARD");
});
