import assert from "node:assert/strict";
import test from "node:test";

import { requestPhoneVerification, NonProductionInMemoryOtpChallengeStore } from "../dist/modules/authentication/request-phone-verification.js";
import { NonProductionInMemoryOtpRateLimitStore } from "../dist/modules/authentication/otp-rate-limiter.js";

test("rate-limits before creating or delivering a challenge", async () => {
  const rate = new NonProductionInMemoryOtpRateLimitStore("test");
  const challenges = new NonProductionInMemoryOtpChallengeStore("test");
  let delivered = 0;
  const input = { phoneInput: "+381601234567", ipAddress: "192.0.2.1", deviceOrClient: "device-1", deploymentOrBusiness: "local", correlationId: "corr-1" };
  const config = { otpLength: 6, challengeTtlMs: 300_000, rateLimit: { limit: 1, windowMs: 60_000 }, now: () => 1000 };
  const provider = { async deliver(request) { delivered += 1; assert.match(request.otpCode, /^\d{6}$/u); } };
  const first = await requestPhoneVerification(input, config, rate, challenges, provider);
  assert.equal(delivered, 1);
  assert.equal(challenges.challenges.size, 1);
  await assert.rejects(() => requestPhoneVerification(input, config, rate, challenges, provider), /rate limit/);
  assert.equal(delivered, 1);
  assert.equal(first.expiresAt, 301000);
});

test("does not deliver when challenge persistence fails", async () => {
  let delivered = false;
  await assert.rejects(
    () => requestPhoneVerification(
      { phoneInput: "+381601234567", ipAddress: "192.0.2.1", deviceOrClient: "device-1", deploymentOrBusiness: "local", correlationId: "corr-1" },
      { otpLength: 6, challengeTtlMs: 300_000, rateLimit: { limit: 1, windowMs: 60_000 }, now: () => 1000 },
      new NonProductionInMemoryOtpRateLimitStore("test"),
      { async create() { throw new Error("store unavailable"); } },
      { async deliver() { delivered = true; } },
    ),
  );
  assert.equal(delivered, false);
});
