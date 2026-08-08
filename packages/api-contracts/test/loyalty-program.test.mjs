import assert from "node:assert/strict";
import test from "node:test";
import { LoyaltyProgramContractValidationError, validateCreateLoyaltyProgramRequest, validateLoyaltyProgramLifecycleCommand, validateLoyaltyProgramResponse } from "../dist/index.js";

test("validates aggregate-only create and response contracts", () => {
  assert.deepEqual(validateCreateLoyaltyProgramRequest({ brandId: "brand-1" }), { brandId: "brand-1" });
  assert.throws(() => validateCreateLoyaltyProgramRequest({ brandId: "brand-1", status: "ACTIVE" }), LoyaltyProgramContractValidationError);
  const response = { id: "program-1", brandId: "brand-1", status: "DRAFT", createdAt: "2026-08-08T10:00:00.000Z", updatedAt: "2026-08-08T10:00:00.000Z" };
  assert.deepEqual(validateLoyaltyProgramResponse(response), response);
  assert.throws(() => validateLoyaltyProgramResponse({ ...response, rewardRules: {} }), LoyaltyProgramContractValidationError);
});

test("requires explicit lifecycle intent", () => {
  assert.equal(validateLoyaltyProgramLifecycleCommand("reactivate"), "reactivate");
  assert.throws(() => validateLoyaltyProgramLifecycleCommand("SUSPENDED"), LoyaltyProgramContractValidationError);
});
