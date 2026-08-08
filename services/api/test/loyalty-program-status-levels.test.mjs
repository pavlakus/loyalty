import assert from "node:assert/strict";
import test from "node:test";
import { StatusLevelConfigurationError, validateStatusLevelConfiguration } from "../dist/modules/loyalty-program/status-levels.js";

test("validates ordered XP/visit Status Levels and Benefit references", () => {
  const result = validateStatusLevelConfiguration({ levels: [{ id: "bronze", name: "Bronze", rank: 1, minimumXp: 0n, minimumVisits: 0, benefitDefinitionIds: [] }, { id: "silver", name: "Silver", rank: 2, minimumXp: 3000n, minimumVisits: 20, benefitDefinitionIds: ["benefit-1"] }], maximumDowngradePerYear: 1 });
  assert.deepEqual(result.levels.map(({ id }) => id), ["bronze", "silver"]);
});

test("rejects duplicate levels and descending qualification thresholds", () => {
  const base = { levels: [{ id: "bronze", name: "Bronze", rank: 1, minimumXp: 0n, minimumVisits: 0, benefitDefinitionIds: [] }, { id: "silver", name: "Silver", rank: 2, minimumXp: 3000n, minimumVisits: 20, benefitDefinitionIds: [] }] };
  assert.throws(() => validateStatusLevelConfiguration({ ...base, levels: [{ ...base.levels[0], id: "same" }, { ...base.levels[1], id: "same" }] }), StatusLevelConfigurationError);
  assert.throws(() => validateStatusLevelConfiguration({ ...base, levels: [{ ...base.levels[0], minimumXp: 4000n }, base.levels[1]] }), /cannot lower/);
});
