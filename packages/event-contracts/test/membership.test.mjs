import assert from "node:assert/strict";
import test from "node:test";
import { EventContractValidationError, validateMembershipEventPayload } from "../dist/index.js";

test("validates approved Membership event payloads without personal data", () => {
  assert.equal(validateMembershipEventPayload("MembershipCreated", { membership_id: "m-1", customer_id: "c-1", loyalty_program_id: "p-1", brand_id: "b-1", status: "ACTIVE" }).status, "ACTIVE");
  assert.equal(validateMembershipEventPayload("LoyaltyProgramJoinRequested", { customer_id: "c-1", loyalty_program_id: "p-1", enrollment_source: "BRAND_QR", accepted_terms_version: "v1", marketing_consent: false }).customer_id, "c-1");
});

test("rejects invalid event state and unnecessary fields", () => {
  assert.throws(() => validateMembershipEventPayload("MembershipCreated", { membership_id: "m-1", customer_id: "c-1", loyalty_program_id: "p-1", brand_id: "b-1", status: "SUSPENDED" }), EventContractValidationError);
  assert.throws(() => validateMembershipEventPayload("MembershipCreated", { membership_id: "m-1", customer_id: "c-1", loyalty_program_id: "p-1", brand_id: "b-1", status: "ACTIVE", phone: "+381" }), EventContractValidationError);
});
