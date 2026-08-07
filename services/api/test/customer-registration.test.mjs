import assert from "node:assert/strict";
import test from "node:test";

import { registerCustomer, CustomerRegistrationValidationError } from "../dist/modules/customer/registration.js";

const identity = { normalized_phone_reference: "phone-ref-1" };
const profile = { preferred_language: "en" };

test("publishes registration only after an atomic create", async () => {
  const calls = [];
  const result = await registerCustomer(
    { verified_identity: identity, profile },
    {
      async createOrResolveCustomer(receivedIdentity, receivedProfile) {
        calls.push(["create", receivedIdentity, receivedProfile]);
        return { customer: { customer_id: "customer-1", version: 1 }, created: true };
      },
    },
    {
      async publishCustomerRegistered(customer) {
        calls.push(["publish", customer]);
      },
    },
  );

  assert.deepEqual(result, { customer: { customer_id: "customer-1", version: 1 }, created: true });
  assert.deepEqual(calls.map(([name]) => name), ["create", "publish"]);
});

test("resolves an existing Customer without a duplicate event", async () => {
  let published = 0;
  const result = await registerCustomer(
    { verified_identity: identity, profile },
    { async createOrResolveCustomer() { return { customer: { customer_id: "customer-1", version: 2 }, created: false }; } },
    { async publishCustomerRegistered() { published += 1; } },
  );

  assert.equal(result.created, false);
  assert.equal(published, 0);
});

test("rejects missing verified identity before repository access", async () => {
  let repositoryCalled = false;
  await assert.rejects(
    () => registerCustomer(
      { verified_identity: { normalized_phone_reference: "" }, profile },
      { async createOrResolveCustomer() { repositoryCalled = true; throw new Error("must not call"); } },
      { async publishCustomerRegistered() {} },
    ),
    CustomerRegistrationValidationError,
  );
  assert.equal(repositoryCalled, false);
});

test("normalizes only through the existing profile contract", async () => {
  let receivedProfile;
  await registerCustomer(
    { verified_identity: identity, profile: { email: "  Ada@Example.COM " } },
    {
      async createOrResolveCustomer(_identity, received) {
        receivedProfile = received;
        return { customer: { customer_id: "customer-1", version: 1 }, created: false };
      },
    },
    { async publishCustomerRegistered() {} },
  );
  assert.deepEqual(receivedProfile, { email: "ada@example.com" });
});
