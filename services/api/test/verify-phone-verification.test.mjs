import assert from "node:assert/strict";
import test from "node:test";

import { hashOtp } from "../dist/modules/authentication/otp-security.js";
import { NonProductionInMemoryOtpChallengeStore } from "../dist/modules/authentication/request-phone-verification.js";
import { PhoneVerificationError, verifyPhoneVerification } from "../dist/modules/authentication/verify-phone-verification.js";

async function seededStore(code = "123456", expiresAt = 10_000) {
  const store = new NonProductionInMemoryOtpChallengeStore("test");
  await store.create({ id: "challenge-1", phoneE164: "+381601234567", hash: await hashOtp(code), expiresAt });
  await store.markSent("challenge-1");
  return store;
}

test("verifies a valid code once and rejects reuse", async () => {
  const store = await seededStore();
  const config = { maximumAttempts: 3, now: () => 1_000 };
  assert.deepEqual(await verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, config, store), { challengeId: "challenge-1" });
  await assert.rejects(
    () => verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, config, store),
    (error) => error instanceof PhoneVerificationError && error.code === "OTP_CODE_ALREADY_USED",
  );
});

test("does not verify a challenge before delivery is marked sent", async () => {
  const store = new NonProductionInMemoryOtpChallengeStore("test");
  await store.create({ id: "challenge-1", phoneE164: "+381601234567", hash: await hashOtp("123456"), expiresAt: 10_000 });
  await assert.rejects(
    () => verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, { maximumAttempts: 3, now: () => 1_000 }, store),
    (error) => error instanceof PhoneVerificationError && error.code === "OTP_CHALLENGE_NOT_FOUND",
  );
});

test("expires challenges and locks after the bounded failed-attempt limit", async () => {
  const expired = await seededStore("123456", 100);
  await assert.rejects(() => verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, { maximumAttempts: 3, now: () => 100 }, expired), /OTP_CODE_EXPIRED/);

  const locked = await seededStore();
  const config = { maximumAttempts: 2, now: () => 1_000 };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await assert.rejects(
      () => verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "000000" }, config, locked),
      (error) => error instanceof PhoneVerificationError && error.code === (attempt === 1 ? "OTP_ATTEMPT_LIMIT_EXCEEDED" : "OTP_CODE_INVALID"),
    );
  }
  await assert.rejects(() => verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, config, locked), /OTP_ATTEMPT_LIMIT_EXCEEDED/);
});

test("serializes concurrent verification attempts", async () => {
  const store = await seededStore();
  const config = { maximumAttempts: 1, now: () => 1_000 };
  const results = await Promise.allSettled([
    verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, config, store),
    verifyPhoneVerification({ challengeId: "challenge-1", otpCode: "123456" }, config, store),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
});
