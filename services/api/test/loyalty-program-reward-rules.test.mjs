import assert from "node:assert/strict";
import test from "node:test";
import { evaluateRewardRules, RewardRuleValidationError, validateRewardRuleSet } from "../dist/modules/loyalty-program/reward-rules.js";

const ruleSet = {
  programConfigurationVersionId: "program-1:2",
  currency: "EUR",
  rules: [{ id: "standard", minimumAmountMinor: 1000n, maximumAmountMinor: 5000n, amountIntervalMinor: 1000n, pointsGranted: 5n }],
};

test("evaluates minor-unit rules deterministically with floor integer arithmetic", () => {
  assert.deepEqual(evaluateRewardRules(ruleSet, { amountMinor: 2100n, currency: "EUR" }), { programConfigurationVersionId: "program-1:2", currency: "EUR", ruleId: "standard", pointsAwarded: 10n });
  assert.equal(evaluateRewardRules(ruleSet, { amountMinor: 999n, currency: "EUR" }).pointsAwarded, 0n);
  assert.equal(evaluateRewardRules(ruleSet, { amountMinor: 5000n, currency: "EUR" }).pointsAwarded, 0n);
});

test("rejects overlapping ranges, currency mismatch, and fractional inputs", () => {
  assert.throws(() => validateRewardRuleSet({ ...ruleSet, rules: [...ruleSet.rules, { ...ruleSet.rules[0], id: "overlap", minimumAmountMinor: 4000n }] }), /overlap/);
  assert.throws(() => evaluateRewardRules(ruleSet, { amountMinor: 1000n, currency: "RSD" }), RewardRuleValidationError);
  assert.throws(() => evaluateRewardRules(ruleSet, { amountMinor: 1000, currency: "EUR" }), RewardRuleValidationError);
});
