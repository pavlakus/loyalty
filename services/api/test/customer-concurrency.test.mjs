import assert from "node:assert/strict";
import test from "node:test";

import { anonymizeCustomer } from "../dist/modules/customer/anonymization-command.js";
import { transitionCustomerLifecycle } from "../dist/modules/customer/lifecycle-management.js";
import { updateCustomerProfile } from "../dist/modules/customer/profile-update.js";

function singleWinnerRepository() {
  let acceptedVersion = 1;
  return {
    async updateCustomerProfile(_id, _request, expectedVersion) {
      if (expectedVersion !== acceptedVersion) throw new Error("VERSION_CONFLICT");
      acceptedVersion += 1;
      return { profile: { status: "active", version: acceptedVersion }, changed: true, changed_fields: ["first_name"] };
    },
    async transitionCustomerLifecycle(_id, targetStatus, expectedVersion) {
      if (expectedVersion !== acceptedVersion) throw new Error("VERSION_CONFLICT");
      acceptedVersion += 1;
      return { profile: { status: targetStatus, version: acceptedVersion }, changed: true };
    },
    async anonymizeCustomer(_id, _reason, expectedVersion) {
      if (expectedVersion !== acceptedVersion) throw new Error("VERSION_CONFLICT");
      acceptedVersion += 1;
      return { profile: { status: "anonymized", version: acceptedVersion }, changed: true, anonymized_at: "2026-08-07T10:00:00.000Z" };
    },
  };
}

test("parallel profile updates have one atomic version winner", async () => {
  const repository = singleWinnerRepository();
  const publisher = { async publishCustomerProfileUpdated() {} };
  const results = await Promise.allSettled([
    updateCustomerProfile({ customer_id: "customer-1" }, { first_name: "Ada" }, 1, repository, publisher),
    updateCustomerProfile({ customer_id: "customer-1" }, { first_name: "Grace" }, 1, repository, publisher),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
});

test("lifecycle and anonymization operations preserve stale-version rejection", async () => {
  const repository = singleWinnerRepository();
  const audit = { async recordCustomerLifecycleTransition() {} };
  const lifecyclePublisher = { async publishCustomerLifecycleChanged() {} };
  const anonymizationAudit = { async recordCustomerAnonymization() {} };
  const anonymizationPublisher = { async publishCustomerAnonymized() {} };

  await transitionCustomerLifecycle({ customer_id: "customer-1" }, "suspend", 1, repository, audit, lifecyclePublisher);
  await assert.rejects(
    () => anonymizeCustomer({ actor_id: "actor-1", customer_id: "customer-1" }, "customer-request", 1, repository, anonymizationAudit, anonymizationPublisher),
    /VERSION_CONFLICT/,
  );
});
