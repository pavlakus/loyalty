import assert from "node:assert/strict";
import test from "node:test";
import { completeReceiptCancellation, ReceiptCancellationError, requestReceiptCancellation } from "../dist/modules/receipt/receipt-cancellation.js";
const input = { cancellationId: "cancel-1", receiptId: "receipt-1", reason: "refund", locationId: "location-1", requestedAt: "2026-08-08T11:00:00.000Z" };
test("creates a compensating cancellation record without mutating the Receipt", () => { const requested = requestReceiptCancellation(input); const cancelled = completeReceiptCancellation(requested); assert.equal(requested.status, "REQUESTED"); assert.equal(cancelled.status, "CANCELLED"); assert.equal(cancelled.receiptId, input.receiptId); });
test("rejects duplicate cancellation and invalid timestamps", () => { const record = requestReceiptCancellation(input); assert.throws(() => requestReceiptCancellation(input, record), ReceiptCancellationError); assert.throws(() => requestReceiptCancellation({ ...input, requestedAt: "2026-08-08" }), ReceiptCancellationError); });
