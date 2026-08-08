import assert from "node:assert/strict";
import test from "node:test";
import { ReceiptAggregate, ReceiptValidationError } from "../dist/modules/receipt/receipt-aggregate.js";

const input = { id: "receipt-1", businessId: "business-1", brandId: "brand-1", loyaltyProgramId: "program-1", membershipId: "membership-1", locationId: "location-1", receiptNumber: "receipt-number-1", sourceId: "source-1", amountMinor: 125000, currency: "RSD", occurredAt: "2026-08-08T10:00:00.000Z", createdAt: "2026-08-08T10:01:00.000Z" };

test("records an accepted immutable Receipt with commercial context", () => {
  const result = ReceiptAggregate.record(input).receipt;
  assert.deepEqual(result.snapshot, { ...input, currency: "RSD", status: "ACCEPTED" });
  assert.equal(Object.isFrozen(result.snapshot), true);
});

test("uses integer minor units and explicit currency/timestamp validation", () => {
  assert.throws(() => ReceiptAggregate.record({ ...input, amountMinor: 10.5 }), ReceiptValidationError);
  assert.throws(() => ReceiptAggregate.record({ ...input, amountMinor: -1 }), ReceiptValidationError);
  assert.throws(() => ReceiptAggregate.record({ ...input, currency: "€" }), ReceiptValidationError);
  assert.throws(() => ReceiptAggregate.record({ ...input, occurredAt: "2026-08-08" }), ReceiptValidationError);
});

test("keeps aggregate references separate from Reward/XP and configuration state", () => {
  const snapshot = ReceiptAggregate.record(input).receipt.snapshot;
  assert.equal("rewardBalance" in snapshot, false);
  assert.equal("currentXp" in snapshot, false);
  assert.equal("configuration" in snapshot, false);
});
