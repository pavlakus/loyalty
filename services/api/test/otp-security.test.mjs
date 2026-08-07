import assert from "node:assert/strict";
import test from "node:test";

import { generateOtp, hashOtp, verifyOtp, OtpSecurityValidationError } from "../dist/modules/authentication/otp-security.js";

test("generates numeric OTPs with requested length", () => {
  const code = generateOtp(6);
  assert.match(code, /^\d{6}$/u);
});

test("hashes with a salt and verifies without storing the raw code", async () => {
  const code = generateOtp(6);
  const hash = await hashOtp(code);
  assert.notEqual(hash.digest, code);
  assert.equal(await verifyOtp(code, hash), true);
  assert.equal(await verifyOtp("000000", hash), false);
});

test("rejects unsafe OTP lengths and raw non-numeric values", async () => {
  assert.throws(() => generateOtp(3), OtpSecurityValidationError);
  await assert.rejects(() => hashOtp("12AB56"), OtpSecurityValidationError);
});
