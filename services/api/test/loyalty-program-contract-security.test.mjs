import assert from "node:assert/strict";
import test from "node:test";
import { validateCreateLoyaltyProgramRequest, validateLoyaltyProgramLifecycleCommand, validateLoyaltyProgramResponse, LoyaltyProgramContractValidationError } from "@loyalty-platform/api-contracts";
import { appendProgramAuditRecord, createProgramAuditRecord } from "../dist/modules/loyalty-program/audit/program-audit.js";
import { createProgramEvent } from "../dist/modules/loyalty-program/events/program-events.js";

test("Program API contract rejects client lifecycle/configuration injection", () => {
  assert.deepEqual(validateCreateLoyaltyProgramRequest({ brandId: "brand-1" }), { brandId: "brand-1" });
  assert.throws(() => validateCreateLoyaltyProgramRequest({ brandId: "brand-1", status: "ACTIVE" }), LoyaltyProgramContractValidationError);
  assert.throws(() => validateCreateLoyaltyProgramRequest({ brandId: "brand-1", rewardRules: {} }), LoyaltyProgramContractValidationError);
  assert.equal(validateLoyaltyProgramLifecycleCommand("activate"), "activate");
  assert.throws(() => validateLoyaltyProgramLifecycleCommand("ACTIVE"), LoyaltyProgramContractValidationError);
});

test("Program response and event contracts exclude Customer state and sensitive fields", () => {
  const response = { id: "program-1", brandId: "brand-1", status: "DRAFT", createdAt: "2026-08-08T10:00:00.000Z", updatedAt: "2026-08-08T10:00:00.000Z" };
  assert.deepEqual(validateLoyaltyProgramResponse(response), response);
  assert.throws(() => validateLoyaltyProgramResponse({ ...response, customerId: "customer-1" }), LoyaltyProgramContractValidationError);
  const event = createProgramEvent({
    event_id: "event-1", event_type: "LoyaltyProgramCreated", execution_id: "exec-1", root_event_id: "event-1", parent_event_id: null,
    business_id: "business-1", brand_id: "brand-1", loyalty_program_id: "program-1", occurred_at: "2026-08-08T10:00:00.000Z",
    idempotency_key: "program-1:create:1", correlation_id: "corr-1", causation_id: null, actor_id: null,
    application: { status: "SUCCEEDED", operation_id: "op-1" }, payload: { program_id: "program-1", brand_id: "brand-1", status: "DRAFT" },
  });
  const record = createProgramAuditRecord(event, "audit-1");
  assert.equal(Object.hasOwn(record, "customer_id"), false);
  assert.deepEqual(appendProgramAuditRecord([], record), [record]);
});
