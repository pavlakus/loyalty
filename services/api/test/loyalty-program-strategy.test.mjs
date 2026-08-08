import assert from "node:assert/strict";
import test from "node:test";
import { createStrategySelectionResult, StrategyValidationError, validateStrategySelection } from "../dist/modules/loyalty-program/strategy.js";

test("validates provider-neutral strategy selection and explainable recommendation", () => {
  const result = createStrategySelectionResult({ objectives: ["RETENTION"], industry: "Coffee Shop", averageTransactionValueMinor: 1000n, approximateDailyCustomers: 50, locations: 1 }, { recommendationId: "recommendation-1", explanation: "Visit frequency supports retention.", configurationSections: ["REWARD_RULES", "XP_RULES"] });
  assert.equal(result.recommendation.recommendationId, "recommendation-1");
});

test("rejects invalid objectives and values without selecting an algorithm", () => {
  assert.throws(() => validateStrategySelection({ objectives: [], industry: "Retail" }), StrategyValidationError);
  assert.throws(() => validateStrategySelection({ objectives: ["RETENTION", "RETENTION"], industry: "Retail" }), StrategyValidationError);
  assert.throws(() => validateStrategySelection({ objectives: ["GROWTH"], industry: "Retail", averageTransactionValueMinor: -1n }), StrategyValidationError);
});
