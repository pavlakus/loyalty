import assert from "node:assert/strict";
import test from "node:test";

import {
  CUSTOMER_EVENT_TYPES,
  EventContractValidationError,
  validateCustomerEventPayload,
} from "../dist/index.js";

test("exposes only the approved Customer event catalog", () => {
  assert.deepEqual(CUSTOMER_EVENT_TYPES, [
    "CustomerRegistered",
    "CustomerProfileUpdated",
    "CustomerAnonymized",
  ]);
});

test("validates privacy-minimized Customer event payloads", () => {
  assert.deepEqual(
    validateCustomerEventPayload("CustomerProfileUpdated", {
      customer_id: "customer-1",
      version: 2,
      changed_fields: ["preferred_language"],
    }),
    { customer_id: "customer-1", version: 2, changed_fields: ["preferred_language"] },
  );
  assert.throws(
    () => validateCustomerEventPayload("CustomerAnonymized", {
      customer_id: "customer-1",
      version: 3,
      anonymized_at: "not-a-timestamp",
    }),
    EventContractValidationError,
  );
});
