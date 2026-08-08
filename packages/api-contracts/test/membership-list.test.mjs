import assert from "node:assert/strict";
import test from "node:test";
import { MembershipContractValidationError, validateMembershipListResponse } from "../dist/index.js";

test("validates bounded Membership list summaries", () => {
  assert.deepEqual(validateMembershipListResponse({ memberships: [{ membershipId: "m-1", brandId: "b-1", loyaltyProgramId: "p-1", status: "ACTIVE" }], nextCursor: null }).memberships[0], { membershipId: "m-1", brandId: "b-1", loyaltyProgramId: "p-1", status: "ACTIVE" });
});

test("rejects Customer/PII leakage and invalid Membership list state", () => {
  assert.throws(() => validateMembershipListResponse({ memberships: [{ membershipId: "m-1", brandId: "b-1", loyaltyProgramId: "p-1", status: "ACTIVE", customerPhone: "+381" }], nextCursor: null }), MembershipContractValidationError);
  assert.throws(() => validateMembershipListResponse({ memberships: [{ membershipId: "m-1", brandId: "b-1", loyaltyProgramId: "p-1", status: "UNKNOWN" }], nextCursor: null }), MembershipContractValidationError);
});
