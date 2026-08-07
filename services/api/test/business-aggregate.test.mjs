import assert from "node:assert/strict";
import test from "node:test";

import { BusinessAggregate, BusinessValidationError } from "../dist/modules/business/business-aggregate.js";

const base = {
  id: "business-1",
  legalName: " Example Legal Name ",
  displayName: " Example ",
  registrationNumber: " REG-1 ",
  taxNumber: null,
  defaultCurrency: "EUR",
  timezone: "Europe/Belgrade",
  createdAt: "2026-08-07T10:00:00.000Z",
};

test("creates an active Business with normalized profile values", () => {
  const { business, event } = BusinessAggregate.create(base);
  assert.deepEqual(business.snapshot, {
    ...base,
    legalName: "Example Legal Name",
    displayName: "Example",
    registrationNumber: "REG-1",
    status: "ACTIVE",
    updatedAt: base.createdAt,
  });
  assert.deepEqual(event, { type: "BusinessCreated", businessId: "business-1", occurredAt: base.createdAt });
});

test("enforces the approved lifecycle and terminal CLOSED state", () => {
  const { business } = BusinessAggregate.create(base);
  assert.equal(business.suspend("2026-08-07T11:00:00.000Z").type, "BusinessSuspended");
  assert.equal(business.activate("2026-08-07T12:00:00.000Z").type, "BusinessActivated");
  assert.equal(business.close("2026-08-07T13:00:00.000Z").type, "BusinessClosed");
  assert.equal(business.snapshot.status, "CLOSED");
  assert.throws(() => business.activate("2026-08-07T14:00:00.000Z"), (error) => error instanceof BusinessValidationError && error.code === "BUSINESS_LIFECYCLE_CONFLICT");
  assert.throws(() => business.suspend("2026-08-07T15:00:00.000Z"), (error) => error instanceof BusinessValidationError && error.code === "BUSINESS_LIFECYCLE_CONFLICT");
});

test("rejects invalid value objects and timestamps without country-specific rules", () => {
  assert.throws(() => BusinessAggregate.create({ ...base, defaultCurrency: "RSD".toLowerCase() }), /ISO 4217/);
  assert.throws(() => BusinessAggregate.create({ ...base, defaultCurrency: "XXX" }), /ISO 4217/);
  assert.throws(() => BusinessAggregate.create({ ...base, timezone: "+02:00" }), /IANA/);
  assert.throws(() => BusinessAggregate.create({ ...base, legalName: " " }), /empty/);
  assert.throws(() => BusinessAggregate.create({ ...base, createdAt: "2026-08-07T10:00:00Z" }), /canonical UTC/);
});
