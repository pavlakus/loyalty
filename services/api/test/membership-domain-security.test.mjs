import assert from "node:assert/strict";
import test from "node:test";
import { MembershipAggregate } from "../dist/modules/membership/membership-aggregate.js";
import { InMemoryEnrollmentIdempotencyStore, EnrollmentIdempotencyError } from "../dist/modules/membership/enrollment-idempotency.js";
import { createMembershipQrPayload, createPublicMembershipToken, PublicMembershipTokenError } from "../dist/modules/membership/public-membership-token.js";
import { validateMembershipEventPayload, EventContractValidationError } from "../../../packages/event-contracts/dist/index.js";

const input = { id: "membership-test", customerId: "customer-test", loyaltyProgramId: "program-test", brandId: "brand-test", loyaltyProgramStatus: "ACTIVE", brandStatus: "ACTIVE", createdAt: "2026-08-08T10:00:00.000Z" };

test("Membership lifecycle preserves identity, history boundaries, and terminal closure", () => {
  const aggregate = MembershipAggregate.create(input).membership;
  aggregate.suspend("2026-08-08T11:00:00.000Z");
  aggregate.reactivate("2026-08-08T12:00:00.000Z");
  aggregate.close("2026-08-08T13:00:00.000Z");
  assert.deepEqual({ id: aggregate.snapshot.id, customerId: aggregate.snapshot.customerId, loyaltyProgramId: aggregate.snapshot.loyaltyProgramId, status: aggregate.snapshot.status }, { id: input.id, customerId: input.customerId, loyaltyProgramId: input.loyaltyProgramId, status: "CLOSED" });
});

test("enrollment idempotency is scoped and rejects payload mismatch without exposing request data", () => {
  const store = new InMemoryEnrollmentIdempotencyStore();
  let executions = 0;
  const request = { customerId: "customer-test", loyaltyProgramId: "program-test", idempotencyKey: "key-test", enrollmentSource: "BRAND_QR", acceptedTermsVersion: "terms-v1", marketingConsent: false };
  const first = store.executeOnce(request, input.id, () => { executions += 1; return { accepted: true }; });
  const replay = store.executeOnce(request, input.id, () => { executions += 1; return { accepted: true }; });
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(executions, 1);
  assert.equal(store.environment, "NON_PRODUCTION");
  assert.throws(() => store.executeOnce({ ...request, marketingConsent: true }, input.id, () => null), (error) => error instanceof EnrollmentIdempotencyError && error.code === "IDEMPOTENCY_CONFLICT" && !error.message.includes(request.customerId));
});

test("public token and event contracts reject PII or client-controlled invalid fields", () => {
  const token = createPublicMembershipToken("opaque-membership-token");
  assert.deepEqual(createMembershipQrPayload(token), { publicMemberToken: token.value });
  assert.throws(() => createPublicMembershipToken("+381 600000000"), PublicMembershipTokenError);
  assert.throws(() => validateMembershipEventPayload("MembershipCreated", { membership_id: "m", customer_id: "c", loyalty_program_id: "p", brand_id: "b", status: "ACTIVE", customer_phone: "+381" }), EventContractValidationError);
  assert.equal(validateMembershipEventPayload("MembershipSuspended", { membership_id: "m", customer_id: "c", loyalty_program_id: "p", brand_id: "b", status: "SUSPENDED" }).status, "SUSPENDED");
});
