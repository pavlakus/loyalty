import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerProfileQueryError,
  getCurrentCustomerProfile,
} from "../dist/modules/customer/current-profile-query.js";

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

test("queries only the authenticated Customer context", async () => {
  let requestedId;
  const result = await getCurrentCustomerProfile(
    { customer_id: "customer-1" },
    { async findCurrentCustomerProfile(customerId) { requestedId = customerId; return profile; } },
  );
  assert.deepEqual(result, profile);
  assert.equal(requestedId, "customer-1");
});

test("returns absence without creating or changing a Customer", async () => {
  assert.equal(
    await getCurrentCustomerProfile(
      { customer_id: "customer-missing" },
      { async findCurrentCustomerProfile() { return null; } },
    ),
    null,
  );
});

test("rejects missing authenticated context before repository access", async () => {
  let called = false;
  await assert.rejects(
    () => getCurrentCustomerProfile(
      { customer_id: "" },
      { async findCurrentCustomerProfile() { called = true; return null; } },
    ),
    (error) => error instanceof CustomerProfileQueryError
      && error.code === "CUSTOMER_CONTEXT_INVALID",
  );
  assert.equal(called, false);
});
