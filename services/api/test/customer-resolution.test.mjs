import assert from "node:assert/strict";
import test from "node:test";

import { CustomerResolutionError, resolveOrRegisterCustomer } from "../dist/modules/authentication/customer-resolution.js";

const identity = { normalized_phone_reference: "+381601234567" };

test("resolves an existing Customer without invoking registration", async () => {
  let registrations = 0;
  const customer = { customer_id: "customer-1", status: "active", version: 1 };
  const result = await resolveOrRegisterCustomer({ ...identity }, { profile: {} }, {
    async findByVerifiedIdentity(value) { assert.deepEqual(value, identity); return customer; },
    async registerVerifiedCustomer() { registrations += 1; return customer; },
  });
  assert.equal(result.created, false);
  assert.deepEqual(result.customer, customer);
  assert.equal(registrations, 0);
});

test("uses the Customer-owned registration command only when no Customer exists", async () => {
  const input = { profile: {} };
  let received;
  const result = await resolveOrRegisterCustomer(identity, input, {
    async findByVerifiedIdentity() { return null; },
    async registerVerifiedCustomer(value, registrationInput) { received = { value, registrationInput }; return { customer_id: "customer-2", status: "active", version: 1 }; },
  });
  assert.equal(result.created, true);
  assert.deepEqual(received, { value: identity, registrationInput: input });
});

test("does not re-identify anonymized Customers and rejects invalid identity", async () => {
  await assert.rejects(
    () => resolveOrRegisterCustomer(identity, {}, {
      async findByVerifiedIdentity() { return { customer_id: "customer-3", status: "anonymized", version: 2 }; },
      async registerVerifiedCustomer() { throw new Error("must not register"); },
    }),
    (error) => error instanceof CustomerResolutionError && error.code === "CUSTOMER_ANONYMIZED",
  );
  await assert.rejects(
    () => resolveOrRegisterCustomer({ normalized_phone_reference: " " }, {}, { findByVerifiedIdentity: async () => null, registerVerifiedCustomer: async () => { throw new Error("must not register"); } }),
    (error) => error instanceof CustomerResolutionError && error.code === "CUSTOMER_IDENTITY_INVALID",
  );
});
