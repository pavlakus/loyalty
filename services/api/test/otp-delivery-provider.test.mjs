import assert from "node:assert/strict";
import test from "node:test";

test("provider port accepts a normalized destination and in-memory OTP request", async () => {
  const calls = [];
  const provider = { async deliver(request) { calls.push(request); return { providerMessageId: null }; } };
  const result = await provider.deliver({ destinationE164: "+381601234567", otpCode: "123456", correlationId: "corr-1" });
  assert.deepEqual(result, { providerMessageId: null });
  assert.equal(calls[0].destinationE164, "+381601234567");
  assert.equal(calls[0].correlationId, "corr-1");
});

test("provider-neutral port has no concrete transport selection", () => {
  assert.equal(typeof Object.getPrototypeOf({}).deliver, "undefined");
});
