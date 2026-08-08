import assert from "node:assert/strict";
import test from "node:test";
import { validateRedemptionEventPayload } from "../dist/index.js";

const payload = { redemption_id: "redemption-1", reservation_id: "reservation-1", membership_id: "membership-1", reward_account_id: "account-1", reward_definition_id: "reward-1", loyalty_program_id: "program-1", program_configuration_version_id: "version-1", points: 400, occurred_at: "2026-08-08T10:00:00.000Z", idempotency_key: "request-1" };
test("validates privacy-safe redemption event payloads", () => { assert.equal(validateRedemptionEventPayload("RewardPointsReserved", payload).points, 400); assert.equal(validateRedemptionEventPayload("RewardPointsRedeemed", payload).membership_id, "membership-1"); });
test("rejects invalid points, timestamps, and unknown sensitive fields", () => { assert.throws(() => validateRedemptionEventPayload("RewardPointsReserved", { ...payload, points: 0 })); assert.throws(() => validateRedemptionEventPayload("RewardPointsReserved", { ...payload, occurred_at: "2026-08-08" })); assert.throws(() => validateRedemptionEventPayload("RewardPointsReserved", { ...payload, phone: "+381641234567" })); });
