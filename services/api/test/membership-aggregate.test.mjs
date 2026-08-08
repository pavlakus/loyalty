import assert from "node:assert/strict";
import test from "node:test";
import { MembershipAggregate, MembershipValidationError } from "../dist/modules/membership/membership-aggregate.js";

const input = { id: "membership-1", customerId: "customer-1", loyaltyProgramId: "program-1", brandId: "brand-1", loyaltyProgramStatus: "ACTIVE", brandStatus: "ACTIVE", createdAt: "2026-08-08T10:00:00.000Z" };

test("creates one active Membership with durable Customer/Program identity", () => {
  const result = MembershipAggregate.create(input);
  assert.equal(result.membership.snapshot.status, "ACTIVE");
  assert.equal(result.membership.snapshot.joinedAt, input.createdAt);
  assert.equal(result.event.type, "MembershipCreated");
});

test("rejects inactive prerequisites and duplicate Customer/Program identity", () => {
  assert.throws(() => MembershipAggregate.create({ ...input, loyaltyProgramStatus: "SUSPENDED" }), MembershipValidationError);
  assert.throws(() => MembershipAggregate.create({ ...input, brandStatus: "SUSPENDED" }), MembershipValidationError);
  assert.throws(() => MembershipAggregate.create({ ...input, existingMemberships: [MembershipAggregate.create(input).membership.snapshot] }), MembershipValidationError);
});

test("supports reversible suspension and terminal closure without changing identity", () => {
  const aggregate = MembershipAggregate.create(input).membership;
  aggregate.suspend("2026-08-08T11:00:00.000Z");
  aggregate.reactivate("2026-08-08T12:00:00.000Z");
  aggregate.close("2026-08-08T13:00:00.000Z");
  assert.equal(aggregate.snapshot.id, input.id);
  assert.equal(aggregate.snapshot.joinedAt, input.createdAt);
  assert.equal(aggregate.snapshot.status, "CLOSED");
  assert.throws(() => aggregate.reactivate("2026-08-08T14:00:00.000Z"), MembershipValidationError);
});

test("rejects invalid direct transitions and timestamps", () => {
  const aggregate = MembershipAggregate.create(input).membership;
  assert.throws(() => aggregate.reactivate("2026-08-08T11:00:00.000Z"), MembershipValidationError);
  assert.throws(() => aggregate.suspend("not-a-timestamp"), MembershipValidationError);
});
