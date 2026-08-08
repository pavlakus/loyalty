import assert from "node:assert/strict";
import test from "node:test";
import { evaluateXPRules, XPRuleValidationError, validateXPRuleSet } from "../dist/modules/loyalty-program/xp-rules.js";

const rules = {
  programConfigurationVersionId: "program-1:3",
  currency: "EUR",
  rules: [
    { id: "visit", type: "VISIT", enabled: true, condition: { type: "VISIT" }, xpAmount: 10n },
    { id: "threshold", type: "PURCHASE_AMOUNT_THRESHOLD", enabled: true, condition: { type: "PURCHASE_AMOUNT_THRESHOLD", minimumAmountMinor: 5000n }, xpAmount: 20n },
    { id: "disabled", type: "PURCHASE", enabled: false, condition: { type: "PURCHASE" }, xpAmount: 100n },
  ],
};

test("evaluates enabled rules additively and binds decisions to source/version", () => {
  const result = evaluateXPRules(rules, { sourceActivityId: "activity-1", type: "PURCHASE", qualifying: true, amountMinor: 6000n, currency: "EUR" });
  assert.equal(result.totalXp, 20n);
  assert.deepEqual(result.awards.map(({ ruleId }) => ruleId), ["threshold"]);
  assert.equal(result.programConfigurationVersionId, "program-1:3");
});

test("evaluates inclusive rolling visit windows and rejects invalid rules", () => {
  const frequency = { programConfigurationVersionId: "program-1:3", currency: "EUR", rules: [{ id: "frequency", type: "VISIT_FREQUENCY", enabled: true, condition: { type: "VISIT_FREQUENCY", requiredVisitCount: 3, windowDays: 30 }, xpAmount: 30n }] };
  const result = evaluateXPRules(frequency, { sourceActivityId: "visit-3", type: "VISIT", qualifying: true, evaluationTime: "2026-08-08T10:00:00.000Z", visitTimes: ["2026-07-09T10:00:00.000Z", "2026-07-20T10:00:00.000Z", "2026-08-08T10:00:00.000Z"] });
  assert.equal(result.totalXp, 30n);
  assert.throws(() => validateXPRuleSet({ ...rules, rules: [{ ...rules.rules[0], xpAmount: -1n }] }), XPRuleValidationError);
  assert.throws(() => evaluateXPRules(rules, { sourceActivityId: "activity-2", type: "PURCHASE", qualifying: true, amountMinor: 6000n, currency: "RSD" }), XPRuleValidationError);
});
