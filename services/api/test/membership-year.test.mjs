import assert from "node:assert/strict";
import test from "node:test";
import { MembershipYearValidationError, assertRenewalPeriodAvailable, completeMembershipYear, createMembershipYearBoundary } from "../dist/modules/membership/membership-year.js";

const input = { id: "year-1", membershipId: "membership-1", periodNumber: 1, periodStart: "2026-03-15T00:00:00.000Z", periodEnd: "2027-03-15T00:00:00.000Z" };

test("creates and immutably completes an explicit Membership Year boundary", () => {
  const year = createMembershipYearBoundary(input);
  assert.equal(year.status, "OPEN");
  assert.equal(completeMembershipYear(year).status, "COMPLETED");
  assert.equal(year.status, "OPEN");
});

test("rejects invalid periods and duplicate renewal periods", () => {
  assert.throws(() => createMembershipYearBoundary({ ...input, periodEnd: input.periodStart }), MembershipYearValidationError);
  const year = createMembershipYearBoundary(input);
  assert.throws(() => assertRenewalPeriodAvailable([year], 1), MembershipYearValidationError);
  assert.throws(() => completeMembershipYear(completeMembershipYear(year)), MembershipYearValidationError);
});
