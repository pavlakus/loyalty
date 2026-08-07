import assert from "node:assert/strict";
import test from "node:test";

import { anonymizeCustomer } from "../dist/modules/customer/anonymization-command.js";
import { recordCustomerAudit } from "../dist/modules/customer/audit-records.js";
import { resolveCustomerByVerifiedIdentity, CustomerIdentityResolutionError } from "../dist/modules/customer/identity-resolution.js";
import { incrementCustomerMetric, logCustomerOperation } from "../dist/modules/customer/observability.js";

const anonymizedProfile = {
  customer_id: "customer-1",
  status: "anonymized",
  version: 4,
  verified_phone: "anonymized-customer-1",
};

test("anonymization emits only the terminal profile and classified side effects", async () => {
  const calls = [];
  const result = await anonymizeCustomer(
    { actor_id: "actor-1", customer_id: "customer-1" },
    "customer-request",
    3,
    { async anonymizeCustomer() { return { profile: anonymizedProfile, changed: true, anonymized_at: "2026-08-07T10:00:00.000Z" }; } },
    { async recordCustomerAnonymization(...args) { calls.push(["audit", ...args]); } },
    { async publishCustomerAnonymized(...args) { calls.push(["event", ...args]); } },
  );

  assert.equal(result.profile.status, "anonymized");
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], "audit");
  assert.equal(calls[0].includes("customer@example.com"), false);
  assert.equal(calls[1][0], "event");
  assert.equal(calls[1][1].status, "anonymized");
});

test("anonymized identity cannot be resolved or recreated", async () => {
  await assert.rejects(
    () => resolveCustomerByVerifiedIdentity(
      { normalized_phone_reference: "phone-ref-1" },
      { async findByVerifiedIdentity() { return anonymizedProfile; } },
    ),
    (error) => error instanceof CustomerIdentityResolutionError && error.code === "CUSTOMER_ANONYMIZED",
  );
});

test("audit and observability boundaries exclude personal and secret payloads", async () => {
  let auditRecord;
  await recordCustomerAudit({
    actor_id: "actor-1",
    actor_role: "customer",
    business_id: null,
    action: "CustomerAnonymized",
    target_entity: "customer-1",
    reason: "customer-request",
    occurred_at: "2026-08-07T10:00:00.000Z",
    request_id: "request-1",
    email: "customer@example.com",
  }, { async appendCustomerAuditRecord(record) { auditRecord = record; } });
  assert.deepEqual(Object.keys(auditRecord).sort(), ["action", "actor_id", "actor_role", "business_id", "occurred_at", "reason", "request_id", "target_entity"]);

  let logRecord;
  logCustomerOperation({ event: "customer_anonymized", outcome: "success", correlation_id: "corr-1", customer_id: "customer-1", duration_ms: null, error_code: null }, { write(record) { logRecord = record; } });
  assert.deepEqual(Object.keys(logRecord).sort(), ["correlation_id", "customer_id", "duration_ms", "error_code", "event", "outcome"]);
  assert.throws(() => incrementCustomerMetric("customer_anonymization_success_total", { email: "customer@example.com" }, { increment() {}, observe() {} }));
});
