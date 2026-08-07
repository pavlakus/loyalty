import assert from "node:assert/strict";
import test from "node:test";

import { NonProductionInMemoryOtpRateLimitStore, checkOtpRequestRateLimit, OtpRateLimitConfigurationError } from "../dist/modules/authentication/otp-rate-limiter.js";

const dimensions = { normalizedPhone: "+381601234567", ipAddress: "192.0.2.1", deviceOrClient: "device-1", deploymentOrBusiness: "local" };

test("enforces one-process atomic bucket consumption across all dimensions", () => {
  const store = new NonProductionInMemoryOtpRateLimitStore("development");
  assert.equal(checkOtpRequestRateLimit(dimensions, { limit: 1, windowMs: 60_000 }, store, 1_000).allowed, true);
  assert.equal(checkOtpRequestRateLimit(dimensions, { limit: 1, windowMs: 60_000 }, store, 1_001).allowed, false);
});

test("resets expired windows and isolates effective buckets", () => {
  const store = new NonProductionInMemoryOtpRateLimitStore("test");
  assert.equal(checkOtpRequestRateLimit(dimensions, { limit: 1, windowMs: 1000 }, store, 0).allowed, true);
  assert.equal(checkOtpRequestRateLimit({ ...dimensions, ipAddress: "192.0.2.2" }, { limit: 1, windowMs: 1000 }, store, 1).allowed, true);
  assert.equal(checkOtpRequestRateLimit(dimensions, { limit: 1, windowMs: 1000 }, store, 1000).allowed, true);
});

test("refuses the in-memory adapter in production", () => {
  assert.throws(() => new NonProductionInMemoryOtpRateLimitStore("production"), OtpRateLimitConfigurationError);
});
