import assert from "node:assert/strict";
import test from "node:test";
import { LOYALTY_PROGRAM_EVENT_TYPES, validateLoyaltyProgramEventPayload } from "../dist/index.js";

test("exposes only approved Program lifecycle events", () => {
  assert.deepEqual(LOYALTY_PROGRAM_EVENT_TYPES, ["LoyaltyProgramCreated", "LoyaltyProgramActivated", "LoyaltyProgramDeactivated"]);
});

test("validates deactivation status and creation status", () => {
  assert.deepEqual(validateLoyaltyProgramEventPayload("LoyaltyProgramDeactivated", { program_id: "program-1", brand_id: "brand-1", status: "SUSPENDED" }), { program_id: "program-1", brand_id: "brand-1", status: "SUSPENDED" });
  assert.throws(() => validateLoyaltyProgramEventPayload("LoyaltyProgramCreated", { program_id: "program-1", brand_id: "brand-1", status: "ACTIVE" }));
});
