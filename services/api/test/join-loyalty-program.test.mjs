import assert from "node:assert/strict";
import test from "node:test";
import { JoinLoyaltyProgramError, joinLoyaltyProgram } from "../dist/modules/membership/join-loyalty-program.js";

const input = { membershipId: "membership-1", customerId: "customer-1", loyaltyProgramId: "program-1", brandId: "brand-1", loyaltyProgramStatus: "ACTIVE", brandStatus: "ACTIVE", enrollmentSource: "BRAND_QR", acceptedTermsVersion: "terms-v1", marketingConsent: false, idempotencyKey: "join-1", createdAt: "2026-08-08T10:00:00.000Z" };

test("joins through an authenticated Customer context and creates active Membership", () => {
  const result = joinLoyaltyProgram({ customerId: "customer-1" }, input, true);
  assert.equal(result.membership.status, "ACTIVE");
  assert.equal(result.event.type, "MembershipCreated");
});

test("rejects unauthenticated, cross-customer, unaccepted-terms, and ineligible joins", () => {
  assert.throws(() => joinLoyaltyProgram(null, input, true), JoinLoyaltyProgramError);
  assert.throws(() => joinLoyaltyProgram({ customerId: "customer-2" }, input, true), JoinLoyaltyProgramError);
  assert.throws(() => joinLoyaltyProgram({ customerId: "customer-1" }, { ...input, acceptedTermsVersion: "" }, true), JoinLoyaltyProgramError);
  assert.throws(() => joinLoyaltyProgram({ customerId: "customer-1" }, input, false), JoinLoyaltyProgramError);
});
