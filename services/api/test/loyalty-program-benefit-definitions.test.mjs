import assert from "node:assert/strict";
import test from "node:test";
import { BenefitDefinitionValidationError, validateBenefitDefinitions } from "../dist/modules/loyalty-program/benefit-definitions.js";

const base = { benefitDefinitionId: "benefit-1", type: "REWARD_POINT_MULTIPLIER", displayName: "Points multiplier", description: null, enabled: true, configuration: { multiplier: "1.25" }, programConfigurationVersionId: "program-1:4" };

test("validates all approved typed Benefit Definitions", () => {
  const definitions = validateBenefitDefinitions([base, { ...base, benefitDefinitionId: "benefit-2", type: "POINT_EXPIRATION_EXTENSION", configuration: { extensionDays: 30 } }, { ...base, benefitDefinitionId: "benefit-3", type: "REDEMPTION_LIMIT_OVERRIDE", configuration: { maxRedemptionIncreasePercent: "10" } }, { ...base, benefitDefinitionId: "benefit-4", type: "PROMOTION_ACCESS", configuration: { promotionKey: "off-peak" } }]);
  assert.equal(definitions.length, 4);
  assert.equal(definitions[0].configuration.multiplier, "1.25");
});

test("rejects invalid type-specific configuration and duplicate identifiers", () => {
  assert.throws(() => validateBenefitDefinitions([{ ...base, configuration: { multiplier: "0.9" } }]), BenefitDefinitionValidationError);
  assert.throws(() => validateBenefitDefinitions([{ ...base, type: "POINT_EXPIRATION_EXTENSION", configuration: { extensionDays: 0 } }]), BenefitDefinitionValidationError);
  assert.throws(() => validateBenefitDefinitions([base, base]), /unique/);
  assert.throws(() => validateBenefitDefinitions([{ ...base, type: "PROMOTION_ACCESS", configuration: { promotionKey: "" } }]), BenefitDefinitionValidationError);
});
