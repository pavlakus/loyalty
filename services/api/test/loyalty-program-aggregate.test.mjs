import assert from "node:assert/strict";
import test from "node:test";
import {
  LoyaltyProgramAggregate,
  LoyaltyProgramValidationError,
} from "../dist/modules/loyalty-program/loyalty-program-aggregate.js";

const base = {
  id: "program-1",
  brandId: "brand-1",
  createdAt: "2026-08-07T10:00:00.000Z",
};

test("creates a draft Program with immutable Brand ownership", () => {
  const { program, event } = LoyaltyProgramAggregate.create(base);
  assert.equal(program.snapshot.status, "DRAFT");
  assert.equal(program.snapshot.brandId, "brand-1");
  assert.deepEqual(event, {
    type: "LoyaltyProgramCreated",
    programId: "program-1",
    brandId: "brand-1",
    status: "DRAFT",
    occurredAt: base.createdAt,
  });
});

test("enforces the approved lifecycle and terminal closure", () => {
  const { program } = LoyaltyProgramAggregate.create(base);
  assert.equal(program.activate("2026-08-07T11:00:00.000Z").type, "LoyaltyProgramActivated");
  assert.equal(program.suspend("2026-08-07T12:00:00.000Z").status, "SUSPENDED");
  assert.equal(program.activate("2026-08-07T13:00:00.000Z").status, "ACTIVE");
  assert.equal(program.close("2026-08-07T14:00:00.000Z").status, "CLOSED");
  assert.throws(
    () => program.activate("2026-08-07T15:00:00.000Z"),
    (error) => error instanceof LoyaltyProgramValidationError && error.code === "LOYALTY_PROGRAM_LIFECYCLE_CONFLICT",
  );
});

test("rejects every invalid transition", () => {
  const { program } = LoyaltyProgramAggregate.create(base);
  assert.throws(() => program.suspend("2026-08-07T11:00:00.000Z"), /lifecycle transition/);
  const { program: active } = LoyaltyProgramAggregate.create(base);
  active.activate("2026-08-07T11:00:00.000Z");
  assert.throws(() => active.activate("2026-08-07T12:00:00.000Z"), /lifecycle transition/);
  active.suspend("2026-08-07T13:00:00.000Z");
  assert.throws(() => active.suspend("2026-08-07T14:00:00.000Z"), /lifecycle transition/);
});

test("rejects invalid identity and timestamp inputs", () => {
  assert.throws(() => LoyaltyProgramAggregate.create({ ...base, id: " " }), /identifier/);
  assert.throws(() => LoyaltyProgramAggregate.create({ ...base, brandId: " " }), /identifier/);
  assert.throws(() => LoyaltyProgramAggregate.create({ ...base, createdAt: "2026-08-07T10:00:00Z" }), /canonical UTC/);
});
