import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerProfileUpdateValidationError,
  updateCustomerProfile,
} from "../dist/modules/customer/profile-update.js";

const profile = {
  customer_id: "customer-1",
  verified_phone: "verified-ref",
  first_name: "Ada",
  last_name: null,
  email: null,
  preferred_language: "en",
  birth_date: null,
  status: "active",
  version: 2,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

test("updates the authenticated Customer with the expected version", async () => {
  let event;
  const result = await updateCustomerProfile(
    { customer_id: "customer-1" },
    { first_name: "Ada" },
    1,
    {
      async updateCustomerProfile(customerId, request, expectedVersion) {
        assert.equal(customerId, "customer-1");
        assert.deepEqual(request, { first_name: "Ada" });
        assert.equal(expectedVersion, 1);
        return { profile, changed: true, changed_fields: ["first_name"] };
      },
    },
    { async publishCustomerProfileUpdated(receivedProfile, fields) { event = [receivedProfile, fields]; } },
  );

  assert.equal(result.changed, true);
  assert.deepEqual(event, [profile, ["first_name"]]);
});

test("does not publish an event for an idempotent no-op", async () => {
  let published = false;
  await updateCustomerProfile(
    { customer_id: "customer-1" },
    {},
    2,
    { async updateCustomerProfile() { return { profile, changed: false, changed_fields: [] }; } },
    { async publishCustomerProfileUpdated() { published = true; } },
  );
  assert.equal(published, false);
});

test("rejects invalid context and version before repository access", async () => {
  let called = false;
  await assert.rejects(
    () => updateCustomerProfile(
      { customer_id: "" },
      {},
      0,
      { async updateCustomerProfile() { called = true; return { profile, changed: false, changed_fields: [] }; } },
      { async publishCustomerProfileUpdated() {} },
    ),
    (error) => error instanceof CustomerProfileUpdateValidationError
      && error.code === "CUSTOMER_CONTEXT_INVALID",
  );
  assert.equal(called, false);
});

test("rejects a non-integer expected version", async () => {
  await assert.rejects(
    () => updateCustomerProfile(
      { customer_id: "customer-1" },
      {},
      1.5,
      { async updateCustomerProfile() { return { profile, changed: false, changed_fields: [] }; } },
      { async publishCustomerProfileUpdated() {} },
    ),
    (error) => error instanceof CustomerProfileUpdateValidationError
      && error.code === "CUSTOMER_VERSION_INVALID",
  );
});
