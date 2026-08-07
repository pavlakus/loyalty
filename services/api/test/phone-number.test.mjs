import assert from "node:assert/strict";
import test from "node:test";

import { normalizePhoneNumber, PhoneNumberValidationError } from "../dist/modules/authentication/phone-number.js";

test("normalizes international formatting to E.164", () => {
  assert.deepEqual(normalizePhoneNumber({ input: "+381 (60) 123-4567" }), { e164: "+381601234567" });
});

test("accepts national input only with explicit region context", () => {
  assert.deepEqual(normalizePhoneNumber({ input: "060 123 4567", region: "RS" }), { e164: "+381601234567" });
  assert.throws(() => normalizePhoneNumber({ input: "060 123 4567" }), PhoneNumberValidationError);
});

test("rejects unsupported input without exposing raw phone data", () => {
  assert.throws(() => normalizePhoneNumber({ input: "1-800-FLOWERS" }), (error) => {
    assert.equal(error.code, "PHONE_NUMBER_INVALID");
    assert.equal(error.message.includes("FLOWERS"), false);
    return true;
  });
  assert.throws(() => normalizePhoneNumber({ input: "+999 123" }), PhoneNumberValidationError);
});
