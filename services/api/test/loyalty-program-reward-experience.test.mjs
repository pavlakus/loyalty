import assert from "node:assert/strict";
import test from "node:test";
import { RewardExperienceValidationError, validateRewardExperience } from "../dist/modules/loyalty-program/reward-experience.js";

test("validates Standard and Surprise experience configuration", () => {
  assert.deepEqual(validateRewardExperience({ mode: "STANDARD" }), { mode: "STANDARD" });
  assert.deepEqual(validateRewardExperience({ mode: "SURPRISE", maximumUnopenedOpportunities: 3, rewardPoolIds: ["pool-a", "pool-b"], probabilitiesBasisPoints: { "pool-a": 7500, "pool-b": 2500 }, expirationDays: 7 }).mode, "SURPRISE");
});

test("rejects invalid pool coverage and probability totals", () => {
  assert.throws(() => validateRewardExperience({ mode: "SURPRISE", maximumUnopenedOpportunities: 3, rewardPoolIds: ["pool-a"], probabilitiesBasisPoints: { "pool-a": 9000 }, expirationDays: 7 }), RewardExperienceValidationError);
  assert.throws(() => validateRewardExperience({ mode: "STANDARD", rewardPoolIds: [] }), RewardExperienceValidationError);
});
