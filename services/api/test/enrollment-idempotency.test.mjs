import assert from "node:assert/strict";
import test from "node:test";
import { EnrollmentIdempotencyError, InMemoryEnrollmentIdempotencyStore } from "../dist/modules/membership/enrollment-idempotency.js";

const input = { customerId: "customer-1", loyaltyProgramId: "program-1", idempotencyKey: "join-1", enrollmentSource: "BRAND_QR", acceptedTermsVersion: "terms-v1", marketingConsent: false };

test("replays the stored result for the same scoped key and request", () => {
  const store = new InMemoryEnrollmentIdempotencyStore();
  let calls = 0;
  const first = store.executeOnce(input, "membership-1", () => { calls += 1; return { membershipId: "membership-1" }; });
  const second = store.executeOnce(input, "membership-1", () => { calls += 1; return { membershipId: "other" }; });
  assert.equal(first.replayed, false);
  assert.equal(second.replayed, true);
  assert.deepEqual(second.result, first.result);
  assert.equal(calls, 1);
});

test("rejects same-key different-request reuse and is explicitly non-production", () => {
  const store = new InMemoryEnrollmentIdempotencyStore();
  store.executeOnce(input, "membership-1", () => "created");
  assert.equal(store.environment, "NON_PRODUCTION");
  assert.throws(() => store.executeOnce({ ...input, marketingConsent: true }, "membership-1", () => "other"), EnrollmentIdempotencyError);
});
