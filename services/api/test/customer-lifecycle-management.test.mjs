import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerLifecycleValidationError,
  transitionCustomerLifecycle,
} from "../dist/modules/customer/lifecycle-management.js";

const profile = {
  customer_id: "customer-1",
  verified_phone: "verified-ref",
  first_name: "Ada",
  last_name: null,
  email: null,
  preferred_language: "en",
  birth_date: null,
  status: "suspended",
  version: 3,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

test("suspends an authenticated Customer with atomic version input", async () => {
  const calls = [];
  const result = await transitionCustomerLifecycle(
    { customer_id: "customer-1" },
    "suspend",
    2,
    {
      async transitionCustomerLifecycle(customerId, targetStatus, expectedVersion) {
        calls.push([customerId, targetStatus, expectedVersion]);
        return { profile, changed: true };
      },
    },
    { async recordCustomerLifecycleTransition(...args) { calls.push(["audit", ...args]); } },
    { async publishCustomerLifecycleChanged(...args) { calls.push(["event", ...args]); } },
  );

  assert.equal(result.changed, true);
  assert.deepEqual(calls[0], ["customer-1", "suspended", 2]);
  assert.deepEqual(calls[1], ["audit", "customer-1", "suspend", 3]);
  assert.equal(calls[2][0], "event");
});

test("reactivation is idempotent when the repository returns an unchanged active profile", async () => {
  let audited = false;
  let published = false;
  const activeProfile = { ...profile, status: "active" };
  const result = await transitionCustomerLifecycle(
    { customer_id: "customer-1" },
    "reactivate",
    3,
    { async transitionCustomerLifecycle() { return { profile: activeProfile, changed: false }; } },
    { async recordCustomerLifecycleTransition() { audited = true; } },
    { async publishCustomerLifecycleChanged() { published = true; } },
  );

  assert.equal(result.changed, false);
  assert.equal(audited, false);
  assert.equal(published, false);
});

test("rejects invalid context, operation and version before repository access", async () => {
  let called = false;
  const repository = { async transitionCustomerLifecycle() { called = true; return { profile, changed: false }; } };
  const audit = { async recordCustomerLifecycleTransition() {} };
  const publisher = { async publishCustomerLifecycleChanged() {} };

  await assert.rejects(
    () => transitionCustomerLifecycle({ customer_id: "" }, "suspend", 1, repository, audit, publisher),
    (error) => error instanceof CustomerLifecycleValidationError && error.code === "CUSTOMER_CONTEXT_INVALID",
  );
  await assert.rejects(
    () => transitionCustomerLifecycle({ customer_id: "customer-1" }, "pause", 1, repository, audit, publisher),
    (error) => error instanceof CustomerLifecycleValidationError && error.code === "CUSTOMER_LIFECYCLE_OPERATION_INVALID",
  );
  await assert.rejects(
    () => transitionCustomerLifecycle({ customer_id: "customer-1" }, "suspend", 0, repository, audit, publisher),
    (error) => error instanceof CustomerLifecycleValidationError && error.code === "CUSTOMER_VERSION_INVALID",
  );
  assert.equal(called, false);
});

test("rejects terminal or disallowed state returned by the repository", async () => {
  const closedProfile = { ...profile, status: "closed" };
  await assert.rejects(
    () => transitionCustomerLifecycle(
      { customer_id: "customer-1" },
      "suspend",
      3,
      { async transitionCustomerLifecycle() { return { profile: closedProfile, changed: false }; } },
      { async recordCustomerLifecycleTransition() {} },
      { async publishCustomerLifecycleChanged() {} },
    ),
    (error) => error instanceof CustomerLifecycleValidationError && error.code === "CUSTOMER_LIFECYCLE_CONFLICT",
  );
});
