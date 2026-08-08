import assert from "node:assert/strict";
import test from "node:test";
import { MembershipContractValidationError, validateCreateMembershipRequest, validateMembershipLifecycleCommand, validateMembershipResponse } from "../dist/index.js";

test("validates strict Membership join and response contracts", () => {
  assert.deepEqual(validateCreateMembershipRequest({ enrollmentSource: "BRAND_QR", acceptedTermsVersion: "terms-v1", marketingConsent: false, idempotencyKey: "join-1" }).idempotencyKey, "join-1");
  assert.equal(validateMembershipLifecycleCommand("suspend"), "suspend");
  assert.equal(validateMembershipResponse({ membershipId: "membership-1", loyaltyProgramId: "program-1", brandId: "brand-1", publicMemberToken: "opaque-token", status: "ACTIVE", joinedAt: "2026-08-08T10:00:00.000Z", initialStatus: "BRONZE", rewardBalance: 0, pendingBalance: 0, currentXp: 0, welcomeActionsPending: true }).status, "ACTIVE");
});

test("rejects client lifecycle/ownership injection and invalid commands", () => {
  assert.throws(() => validateCreateMembershipRequest({ enrollmentSource: "QR", acceptedTermsVersion: "v1", marketingConsent: false, idempotencyKey: "j", status: "CLOSED" }), MembershipContractValidationError);
  assert.throws(() => validateMembershipLifecycleCommand("CLOSED"), MembershipContractValidationError);
  assert.throws(() => validateMembershipResponse({ membershipId: "m", loyaltyProgramId: "p", brandId: "b", publicMemberToken: "t", status: "ACTIVE", joinedAt: "2026-08-08T10:00:00.000Z", initialStatus: "BRONZE", rewardBalance: 0, pendingBalance: 0, currentXp: 0, welcomeActionsPending: false, customerPhone: "+381" }), MembershipContractValidationError);
});
