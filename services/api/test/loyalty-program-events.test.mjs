import assert from "node:assert/strict";
import test from "node:test";
import { appendProgramAuditRecord, createProgramAuditRecord } from "../dist/modules/loyalty-program/audit/program-audit.js";
import { ProgramEventValidationError, createProgramEvent } from "../dist/modules/loyalty-program/events/program-events.js";

const input = {
  event_id: "event-1", event_type: "LoyaltyProgramActivated", execution_id: "exec-1", root_event_id: "event-1",
  parent_event_id: null, business_id: "business-1", brand_id: "brand-1", loyalty_program_id: "program-1",
  occurred_at: "2026-08-08T10:00:00.000Z", idempotency_key: "program-1:activate:1", correlation_id: "corr-1", causation_id: null,
  actor_id: "user-1", application: { status: "SUCCEEDED", operation_id: "op-1" }, payload: { program_id: "program-1", brand_id: "brand-1", status: "ACTIVE" },
};

test("creates versioned privacy-safe Program event with tenant and causation context", () => {
  const event = createProgramEvent(input);
  assert.equal(event.event_version, 1);
  assert.equal(event.loyalty_program_id, "program-1");
  assert.equal(event.payload.status, "ACTIVE");
});

test("requires successful application and matching ownership", () => {
  assert.throws(() => createProgramEvent({ ...input, application: { status: "FAILED", operation_id: "op-1" } }), ProgramEventValidationError);
  assert.throws(() => createProgramEvent({ ...input, payload: { ...input.payload, program_id: "program-2" } }), ProgramEventValidationError);
});

test("appends audit records immutably and rejects duplicate event identity", () => {
  const event = createProgramEvent(input);
  const record = createProgramAuditRecord(event, "audit-1");
  const history = appendProgramAuditRecord([], record);
  assert.equal(history.length, 1);
  assert.throws(() => appendProgramAuditRecord(history, record), ProgramEventValidationError);
  assert.equal(history.length, 1);
});
