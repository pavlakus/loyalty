import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerObservabilityValidationError,
  incrementCustomerMetric,
  logCustomerOperation,
  observeCustomerMetric,
} from "../dist/modules/customer/observability.js";

test("writes only the fixed privacy-safe structured Customer log shape", () => {
  let received;
  logCustomerOperation({ event: "profile_update", outcome: "success", correlation_id: "corr-1", customer_id: "customer-1", duration_ms: 12, error_code: null }, { write(value) { received = value; } });
  assert.deepEqual(received, { event: "profile_update", outcome: "success", correlation_id: "corr-1", customer_id: "customer-1", duration_ms: 12, error_code: null });
});

test("rejects identifier-bearing metric labels and invalid measurements", () => {
  const metrics = { increment() {}, observe() {} };
  assert.throws(() => incrementCustomerMetric("customer_registrations_total", { customer_id: "customer-1" }, metrics), CustomerObservabilityValidationError);
  assert.throws(() => observeCustomerMetric("customer_anonymization_duration_ms", -1, metrics), CustomerObservabilityValidationError);
});

test("accepts approved aggregate labels and duration metrics", () => {
  const calls = [];
  const metrics = { increment(...args) { calls.push(["increment", ...args]); }, observe(...args) { calls.push(["observe", ...args]); } };
  incrementCustomerMetric("customer_profile_update_success_total", { outcome: "success" }, metrics);
  observeCustomerMetric("customer_registration_latency_ms", 25, metrics);
  assert.equal(calls.length, 2);
});
