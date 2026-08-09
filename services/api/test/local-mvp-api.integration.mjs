import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createApplication } from "../dist/bootstrap/create-application.js";
import { createLocalMvpComposition } from "../dist/infrastructure/postgres/composition-root.js";

const ids = {
  businessId: "11111111-1111-4111-8111-111111111111",
  brandId: "22222222-2222-4222-8222-222222222222",
  programId: "33333333-3333-4333-8333-333333333333",
  customerId: "44444444-4444-4444-8444-444444444444",
  membershipId: "55555555-5555-4555-8555-555555555555",
  rewardAccountId: "66666666-6666-4666-8666-666666666666",
  xpAccountId: "77777777-7777-4777-8777-777777777777",
  receiptId: "88888888-8888-4888-8888-888888888888",
  redemptionId: "99999999-9999-4999-8999-999999999999",
  amountMinor: "5000",
  currency: "RSD",
  occurredAt: "2026-08-09T10:00:00.000Z",
};

test("local MVP API persists the complete loyalty vertical and is idempotent", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for this integration test");
  const composition = createLocalMvpComposition();
  await composition.pool.query("INSERT INTO customers (id,normalized_phone_reference) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING", ["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "+381601234567"]);
  const server = createServer(createApplication({ localMvp: composition.localMvp.createPort(), authentication: composition.authentication }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const first = await fetch(`${url}/api/v1/local-mvp/scenario`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(ids) });
    const firstBody = await first.json();
    assert.equal(first.status, 200);
    assert.equal(firstBody.data.availablePoints, "60");
    assert.equal(firstBody.data.redeemedPoints, "40");
    const second = await fetch(`${url}/api/v1/local-mvp/scenario`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(ids) });
    const secondBody = await second.json();
    assert.equal(second.status, 200);
    assert.deepEqual(secondBody.data, firstBody.data);
    assert.equal(Object.hasOwn(firstBody.data, "otpCode"), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await composition.pool.end();
  }
});

test("local provider-neutral OTP flow persists a challenge and session without exposing the OTP", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for this integration test");
  const composition = createLocalMvpComposition();
  await composition.pool.query("INSERT INTO customers (id,normalized_phone_reference) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING", ["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "+381601234567"]);
  const server = createServer(createApplication({ authentication: composition.authentication }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const requested = await fetch(`${url}/api/v1/auth/otp/request`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phoneInput: "+381601234567", ipAddress: "127.0.0.1", deviceOrClient: "integration-test", deploymentOrBusiness: "local", correlationId: "integration-auth" }) });
    const requestedBody = await requested.json();
    assert.equal(requested.status, 200);
    assert.equal(Object.hasOwn(requestedBody.data, "otpCode"), false);
    const verified = await fetch(`${url}/api/v1/auth/otp/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: requestedBody.data.challengeId, otpCode: composition.delivery.lastCode }) });
    const verifiedBody = await verified.json();
    assert.equal(verified.status, 200);
    assert.ok(verifiedBody.data.sessionId);
    assert.ok(verifiedBody.data.token);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await composition.pool.end();
  }
});
