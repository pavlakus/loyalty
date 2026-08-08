import assert from "node:assert/strict";
import test from "node:test";
import { MembershipAggregate, MembershipValidationError } from "../dist/modules/membership/membership-aggregate.js";
import { applyMembershipLifecycleCommand } from "../dist/modules/membership/membership-lifecycle-commands.js";

const input = { id: "membership-1", customerId: "customer-1", loyaltyProgramId: "program-1", brandId: "brand-1", loyaltyProgramStatus: "ACTIVE", brandStatus: "ACTIVE", createdAt: "2026-08-08T10:00:00.000Z" };

test("routes explicit lifecycle commands to the aggregate", () => {
  const aggregate = MembershipAggregate.create(input).membership;
  assert.equal(applyMembershipLifecycleCommand(aggregate, "suspend", "2026-08-08T11:00:00.000Z").type, "MembershipSuspended");
  assert.equal(applyMembershipLifecycleCommand(aggregate, "reactivate", "2026-08-08T12:00:00.000Z").type, "MembershipActivated");
  assert.equal(applyMembershipLifecycleCommand(aggregate, "close", "2026-08-08T13:00:00.000Z").type, "MembershipClosed");
});

test("does not permit lifecycle commands to bypass aggregate rules", () => {
  const aggregate = MembershipAggregate.create(input).membership;
  assert.throws(() => applyMembershipLifecycleCommand(aggregate, "reactivate", "2026-08-08T11:00:00.000Z"), MembershipValidationError);
});
