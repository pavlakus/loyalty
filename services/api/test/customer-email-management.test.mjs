import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerEmailValidationError,
  updateCustomerEmail,
} from "../dist/modules/customer/email-management.js";

const profile = {
  customer_id: "customer-1",
  verified_phone: "verified-ref",
  first_name: "Ada",
  last_name: null,
  email: "ada@example.com",
  preferred_language: "en",
  birth_date: null,
  status: "active",
  version: 2,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

test("normalizes and updates optional email for the authenticated Customer", async () => {
  let received;
  let published = false;
  const result = await updateCustomerEmail(
    { customer_id: "customer-1" },
    "  Ada@Example.COM ",
    1,
    {
      async updateCustomerEmail(customerId, email, expectedVersion) {
        received = [customerId, email, expectedVersion];
        return { profile, changed: true };
      },
    },
    { async publishCustomerEmailUpdated() { published = true; } },
  );
  assert.deepEqual(received, ["customer-1", "ada@example.com", 1]);
  assert.equal(result.changed, true);
  assert.equal(published, true);
});

test("supports clearing email without merging Customers", async () => {
  let receivedEmail;
  await updateCustomerEmail(
    { customer_id: "customer-1" },
    null,
    2,
    { async updateCustomerEmail(_id, email) { receivedEmail = email; return { profile, changed: true }; } },
    { async publishCustomerEmailUpdated() {} },
  );
  assert.equal(receivedEmail, null);
});

test("rejects invalid email and version before repository access", async () => {
  let called = false;
  await assert.rejects(
    () => updateCustomerEmail(
      { customer_id: "customer-1" },
      "not-an-email",
      1,
      { async updateCustomerEmail() { called = true; return { profile, changed: false }; } },
      { async publishCustomerEmailUpdated() {} },
    ),
    /email: must be a valid email address/,
  );
  assert.equal(called, false);
  await assert.rejects(
    () => updateCustomerEmail(
      { customer_id: "customer-1" },
      null,
      0,
      { async updateCustomerEmail() { called = true; return { profile, changed: false }; } },
      { async publishCustomerEmailUpdated() {} },
    ),
    (error) => error instanceof CustomerEmailValidationError
      && error.code === "CUSTOMER_VERSION_INVALID",
  );
  assert.equal(called, false);
});
