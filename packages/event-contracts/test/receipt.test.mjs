import assert from "node:assert/strict";
import test from "node:test";
import { validateReceiptEventPayload } from "../dist/index.js";
test("validates Receipt events without unnecessary PII", () => { assert.equal(validateReceiptEventPayload("ReceiptRecorded", { receipt_id: "r", business_id: "b", brand_id: "br", loyalty_program_id: "p", membership_id: "m", occurred_at: "2026-08-08T10:00:00.000Z", amount_minor: 100, currency: "EUR", status: "ACCEPTED" }).status, "ACCEPTED"); assert.throws(() => validateReceiptEventPayload("ReceiptCancelled", { receipt_id: "r", business_id: "b", brand_id: "br", loyalty_program_id: "p", membership_id: "m", occurred_at: "2026-08-08T10:00:00.000Z", status: "CANCELLED", customer_phone: "+381" })); });
