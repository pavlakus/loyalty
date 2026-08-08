import assert from "node:assert/strict";
import test from "node:test";
import { evaluateXPEarning, XPEarningError } from "../dist/modules/xp/xp-earning.js";
const ruleSet = { programConfigurationVersionId: "version-1", currency: "EUR", rules: [{ id: "purchase", type: "PURCHASE", enabled: true, condition: { type: "PURCHASE" }, xpAmount: 10n }, { id: "threshold", type: "PURCHASE_AMOUNT_THRESHOLD", enabled: true, condition: { type: "PURCHASE_AMOUNT_THRESHOLD", minimumAmountMinor: 1000n }, xpAmount: 5n }] };
const input = { membershipId: "membership-1", xpAccountId: "xp-account-1", loyaltyProgramId: "program-1", membershipYearId: "year-1", activity: { sourceActivityId: "receipt-1", type: "PURCHASE", qualifying: true, amountMinor: 2000n, currency: "EUR" }, idempotencyPrefix: "earn", occurredAt: "2026-08-08T10:00:00.000Z" };
test("creates additive version-bound XP transactions", () => { const result = evaluateXPEarning(ruleSet, input); assert.equal(result.decision.totalXp, 15n); assert.equal(result.transactions.length, 2); assert.equal(result.transactions[0].programConfigurationVersionId, "version-1"); });
test("rejects duplicate rule/source earning", () => { const first = evaluateXPEarning(ruleSet, input); assert.throws(() => evaluateXPEarning(ruleSet, input, first.transactions), XPEarningError); });
