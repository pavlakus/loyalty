import assert from "node:assert/strict";
import test from "node:test";
import { createConfigurationVersion, LoyaltyProgramConfigurationVersionError, selectEffectiveConfigurationVersion, validateConfigurationHistory } from "../dist/modules/loyalty-program/configuration-version.js";

const configuration = { programId: "program-1", sections: [{ section: "REWARD_RULES", value: {} }] };
const first = createConfigurationVersion({ version: 1, programId: "program-1", effectiveFrom: "2026-08-08T10:00:00.000Z", configuration });
const second = createConfigurationVersion({ version: 2, programId: "program-1", effectiveFrom: "2026-09-01T10:00:00.000Z", configuration });

test("creates immutable version identity and selects the effective version", () => {
  assert.equal(first.versionKey, "program-1:1");
  assert.equal(selectEffectiveConfigurationVersion([second, first], "2026-08-20T10:00:00.000Z").version, 1);
  assert.equal(selectEffectiveConfigurationVersion([first], "2026-08-01T10:00:00.000Z"), null);
});

test("rejects mismatched and non-monotonic configuration history", () => {
  assert.throws(() => createConfigurationVersion({ version: 0, programId: "program-1", effectiveFrom: first.effectiveFrom, configuration }), LoyaltyProgramConfigurationVersionError);
  assert.throws(() => createConfigurationVersion({ version: 1, programId: "program-2", effectiveFrom: first.effectiveFrom, configuration }), LoyaltyProgramConfigurationVersionError);
  assert.throws(() => validateConfigurationHistory([second, { ...first, version: 3 }]), /increasing/);
});
