import assert from "node:assert/strict";
import test from "node:test";

import {
  CUSTOMER_EVENT_TYPES,
  validateCustomerEventPayload,
} from "../dist/index.js";

test("allows only the approved Customer event catalog", () => {
  assert.deepEqual(CUSTOMER_EVENT_TYPES, ["CustomerRegistered", "CustomerProfileUpdated", "CustomerAnonymized"]);
});

test("preserves privacy-minimized event payloads", () => {
  const payload = { customer_id: "customer-1", version: 4, anonymized_at: "2026-08-07T10:00:00.000Z" };
  assert.deepEqual(validateCustomerEventPayload("CustomerAnonymized", payload), payload);
  assert.throws(() => validateCustomerEventPayload("CustomerAnonymized", { ...payload, email: "ada@example.com" }));
});
