import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { createApplication } from "../dist/bootstrap/create-application.js";
import { createLocalMvpComposition } from "../dist/infrastructure/postgres/composition-root.js";

test("UAT API executes the authenticated tenant-aware Loyalty vertical without local-mvp scenario", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required");
  const composition = createLocalMvpComposition();
  const server = createServer(createApplication({ localMvp: composition.localMvp.createPort(), authentication: composition.authentication, uat: composition.uat }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const fixtureResponse = await fetch(`${url}/api/v1/uat/fixtures`, { method: "POST" });
    assert.equal(fixtureResponse.status, 201);
    const fixture = (await fixtureResponse.json()).data;
    const businessHeaders = { "content-type": "application/json", "x-uat-business-token": fixture.businessActorToken };
    const requested = await fetch(`${url}/api/v1/auth/otp/request`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phoneInput: fixture.phone, ipAddress: "127.0.0.1", deviceOrClient: "uat-test", deploymentOrBusiness: fixture.businessId, correlationId: "uat-auth" }) });
    assert.equal(requested.status, 200);
    const challenge = (await requested.json()).data;
    const verified = await fetch(`${url}/api/v1/auth/otp/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: challenge.challengeId, otpCode: composition.delivery.lastCode }) });
    assert.equal(verified.status, 200);
    const customerToken = (await verified.json()).data.token;
    const customerHeaders = { ...businessHeaders, authorization: `Bearer ${customerToken}` };
    const membership = await fetch(`${url}/api/v1/uat/memberships`, { method: "POST", headers: customerHeaders, body: JSON.stringify({ businessId: fixture.businessId, brandId: fixture.brandId, programId: fixture.programId, membershipId: fixture.membershipId, rewardAccountId: fixture.rewardAccountId, xpAccountId: fixture.xpAccountId, joinedAt: "2026-08-09T10:00:00.000Z" }) });
    assert.equal(membership.status, 201);
    const receipt = await fetch(`${url}/api/v1/uat/receipts`, { method: "POST", headers: customerHeaders, body: JSON.stringify({ businessId: fixture.businessId, brandId: fixture.brandId, programId: fixture.programId, membershipId: fixture.membershipId, rewardAccountId: fixture.rewardAccountId, xpAccountId: fixture.xpAccountId, receiptId: fixture.receiptId, redemptionId: fixture.redemptionId, amountMinor: "5000", currency: "RSD", occurredAt: "2026-08-09T10:00:00.000Z" }) });
    assert.equal(receipt.status, 201);
    const receiptBody = (await receipt.json()).data;
    assert.equal(receiptBody.availablePoints, "60");
    const account = await fetch(`${url}/api/v1/uat/reward-accounts/${fixture.rewardAccountId}?businessId=${fixture.businessId}`, { headers: businessHeaders });
    assert.equal(account.status, 200);
    assert.equal((await account.json()).data.available_points, "60");
    const analytics = await fetch(`${url}/api/v1/uat/analytics?businessId=${fixture.businessId}&programId=${fixture.programId}`, { headers: businessHeaders });
    assert.equal(analytics.status, 200);
    assert.ok((await analytics.json()).data.length > 0);
    const forbidden = await fetch(`${url}/api/v1/uat/reward-accounts/${fixture.rewardAccountId}?businessId=${randomUUID()}`, { headers: businessHeaders });
    assert.equal(forbidden.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await composition.pool.end();
  }
});
