import assert from "node:assert/strict";
import test from "node:test";

import {
  EventContractValidationError,
  validateEventEnvelope,
} from "../dist/index.js";

const validEnvelope = {
  event_id: "event-1",
  event_type: "PlatformEvent",
  event_version: 1,
  execution_id: "execution-1",
  parent_event_id: null,
  root_event_id: "event-1",
  business_id: "business-1",
  brand_id: null,
  loyalty_program_id: null,
  membership_id: null,
  occurred_at: "2026-01-01T00:00:00.000Z",
  idempotency_key: "idempotency-1",
  correlation_id: "correlation-1",
  causation_id: null,
  payload: { source: "test" },
};

test("validates and preserves the generic event envelope", () => {
  assert.deepEqual(validateEventEnvelope(validEnvelope), validEnvelope);
});

test("rejects unsupported versions and malformed required fields", () => {
  assert.throws(() => validateEventEnvelope({ ...validEnvelope, event_version: 0 }), EventContractValidationError);
  assert.throws(() => validateEventEnvelope({ ...validEnvelope, correlation_id: "" }), EventContractValidationError);
  assert.throws(() => validateEventEnvelope({ ...validEnvelope, occurred_at: "not-a-timestamp" }), EventContractValidationError);
  assert.throws(() => validateEventEnvelope({ ...validEnvelope, payload: undefined }), undefined);
});

test("does not mutate the caller envelope", () => {
  const input = structuredClone(validEnvelope);
  validateEventEnvelope(input);
  assert.deepEqual(input, validEnvelope);
});
