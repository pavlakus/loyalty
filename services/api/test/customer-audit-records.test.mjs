import assert from "node:assert/strict";
import test from "node:test";

import { CustomerAuditValidationError, recordCustomerAudit } from "../dist/modules/customer/audit-records.js";

const input = {
  actor_id: "actor-1",
  actor_role: "customer",
  business_id: null,
  action: "CustomerAnonymized",
  target_entity: "customer-1",
  reason: "customer-request",
  occurred_at: "2026-08-07T10:00:00.000Z",
  request_id: "request-1",
};

test("appends the canonical audit fields without personal payload", async () => {
  let received;
  const record = await recordCustomerAudit(input, { async appendCustomerAuditRecord(value) { received = value; } });
  assert.deepEqual(record, input);
  assert.deepEqual(received, input);
});

test("normalizes safe fields and preserves nullable Business context", async () => {
  const record = await recordCustomerAudit({ ...input, actor_id: " actor-1 ", business_id: " business-1 " }, { async appendCustomerAuditRecord() {} });
  assert.equal(record.actor_id, "actor-1");
  assert.equal(record.business_id, "business-1");
});

test("rejects unsafe or non-canonical audit input before append", async () => {
  let called = false;
  await assert.rejects(
    () => recordCustomerAudit({ ...input, reason: "" }, { async appendCustomerAuditRecord() { called = true; } }),
    (error) => error instanceof CustomerAuditValidationError,
  );
  await assert.rejects(
    () => recordCustomerAudit({ ...input, occurred_at: "2026-08-07" }, { async appendCustomerAuditRecord() { called = true; } }),
    (error) => error instanceof CustomerAuditValidationError,
  );
  assert.equal(called, false);
});
