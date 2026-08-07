import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerAnonymizationValidationError,
  anonymizeCustomer,
} from "../dist/modules/customer/anonymization-command.js";

const profile = {
  customer_id: "customer-1",
  verified_phone: "anonymized-customer-1",
  first_name: null,
  last_name: null,
  email: null,
  preferred_language: null,
  birth_date: null,
  status: "anonymized",
  version: 4,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

test("anonymizes through the authenticated context and publishes after audit", async () => {
  const calls = [];
  const result = await anonymizeCustomer(
    { actor_id: "actor-1", customer_id: "customer-1" },
    "customer-request",
    3,
    {
      async anonymizeCustomer(customerId, reasonCode, expectedVersion) {
        calls.push([customerId, reasonCode, expectedVersion]);
        return { profile, changed: true, anonymized_at: "2026-08-07T10:00:00.000Z" };
      },
    },
    { async recordCustomerAnonymization(...args) { calls.push(["audit", ...args]); } },
    { async publishCustomerAnonymized(...args) { calls.push(["event", ...args]); } },
  );

  assert.equal(result.changed, true);
  assert.deepEqual(calls[0], ["customer-1", "customer-request", 3]);
  assert.deepEqual(calls[1], ["audit", "actor-1", "customer-1", "customer-request", "2026-08-07T10:00:00.000Z", 4]);
  assert.equal(calls[2][0], "event");
});

test("repeated anonymization returns the terminal result without duplicate side effects", async () => {
  let audited = false;
  let published = false;
  const result = await anonymizeCustomer(
    { actor_id: "actor-1", customer_id: "customer-1" },
    "customer-request",
    4,
    { async anonymizeCustomer() { return { profile, changed: false, anonymized_at: "2026-08-07T10:00:00.000Z" }; } },
    { async recordCustomerAnonymization() { audited = true; } },
    { async publishCustomerAnonymized() { published = true; } },
  );

  assert.equal(result.changed, false);
  assert.equal(audited, false);
  assert.equal(published, false);
});

test("rejects invalid context, reason and version before repository access", async () => {
  let called = false;
  const repository = { async anonymizeCustomer() { called = true; return { profile, changed: false, anonymized_at: "2026-08-07T10:00:00.000Z" }; } };
  const audit = { async recordCustomerAnonymization() {} };
  const publisher = { async publishCustomerAnonymized() {} };

  await assert.rejects(
    () => anonymizeCustomer({ actor_id: "", customer_id: "customer-1" }, "request", 3, repository, audit, publisher),
    (error) => error instanceof CustomerAnonymizationValidationError && error.code === "CUSTOMER_CONTEXT_INVALID",
  );
  await assert.rejects(
    () => anonymizeCustomer({ actor_id: "actor-1", customer_id: "customer-1" }, "", 3, repository, audit, publisher),
    (error) => error instanceof CustomerAnonymizationValidationError && error.code === "CUSTOMER_REASON_INVALID",
  );
  await assert.rejects(
    () => anonymizeCustomer({ actor_id: "actor-1", customer_id: "customer-1" }, "request", 0, repository, audit, publisher),
    (error) => error instanceof CustomerAnonymizationValidationError && error.code === "CUSTOMER_VERSION_INVALID",
  );
  assert.equal(called, false);
});

test("rejects a repository result that is not terminal anonymized", async () => {
  const activeProfile = { ...profile, status: "active" };
  await assert.rejects(
    () => anonymizeCustomer(
      { actor_id: "actor-1", customer_id: "customer-1" },
      "customer-request",
      3,
      { async anonymizeCustomer() { return { profile: activeProfile, changed: false, anonymized_at: "2026-08-07T10:00:00.000Z" }; } },
      { async recordCustomerAnonymization() {} },
      { async publishCustomerAnonymized() {} },
    ),
    (error) => error instanceof CustomerAnonymizationValidationError && error.code === "CUSTOMER_ANONYMIZATION_CONFLICT",
  );
});
