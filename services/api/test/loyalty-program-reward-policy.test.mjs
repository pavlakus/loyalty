import assert from "node:assert/strict";
import test from "node:test";
import { RewardPolicyValidationError, validatePendingAndExpirationConfiguration } from "../dist/modules/loyalty-program/reward-policy.js";

test("validates all approved Pending and expiration policies", () => {
  assert.deepEqual(validatePendingAndExpirationConfiguration({ pendingDays: 15, expiration: { mode: "NONE" } }).expiration, { mode: "NONE" });
  assert.deepEqual(validatePendingAndExpirationConfiguration({ pendingDays: 0, expiration: { mode: "ROLLING", days: 365 } }).expiration, { mode: "ROLLING", days: 365 });
  assert.deepEqual(validatePendingAndExpirationConfiguration({ pendingDays: 30, expiration: { mode: "FIXED_CALENDAR", month: 12, day: 31 } }).expiration, { mode: "FIXED_CALENDAR", month: 12, day: 31 });
});

test("rejects invalid Pending and expiration policies", () => {
  assert.throws(() => validatePendingAndExpirationConfiguration({ pendingDays: -1, expiration: { mode: "NONE" } }), RewardPolicyValidationError);
  assert.throws(() => validatePendingAndExpirationConfiguration({ pendingDays: 1, expiration: { mode: "ROLLING", days: 0 } }), RewardPolicyValidationError);
  assert.throws(() => validatePendingAndExpirationConfiguration({ pendingDays: 1, expiration: { mode: "UNKNOWN" } }), RewardPolicyValidationError);
});
