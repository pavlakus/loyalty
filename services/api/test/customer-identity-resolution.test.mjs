import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerIdentityResolutionError,
  resolveCustomerByVerifiedIdentity,
} from "../dist/modules/customer/identity-resolution.js";

const identity = { normalized_phone_reference: "phone-ref-1" };

test("resolves a Customer through the verified identity repository boundary", async () => {
  let received;
  const customer = { customer_id: "customer-1", status: "active", version: 3 };
  const result = await resolveCustomerByVerifiedIdentity(identity, {
    async findByVerifiedIdentity(value) {
      received = value;
      return customer;
    },
  });

  assert.deepEqual(result, customer);
  assert.deepEqual(received, identity);
});

test("returns null when no Customer exists", async () => {
  assert.equal(
    await resolveCustomerByVerifiedIdentity(identity, {
      async findByVerifiedIdentity() { return null; },
    }),
    null,
  );
});

test("does not resolve an anonymized Customer", async () => {
  await assert.rejects(
    () => resolveCustomerByVerifiedIdentity(identity, {
      async findByVerifiedIdentity() {
        return { customer_id: "customer-1", status: "anonymized", version: 4 };
      },
    }),
    (error) => error instanceof CustomerIdentityResolutionError
      && error.code === "CUSTOMER_ANONYMIZED",
  );
});

test("rejects an empty identity before repository access", async () => {
  let called = false;
  await assert.rejects(
    () => resolveCustomerByVerifiedIdentity({ normalized_phone_reference: "" }, {
      async findByVerifiedIdentity() { called = true; return null; },
    }),
    (error) => error instanceof CustomerIdentityResolutionError
      && error.code === "CUSTOMER_IDENTITY_INVALID",
  );
  assert.equal(called, false);
});
