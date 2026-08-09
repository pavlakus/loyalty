import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createApplication } from "../dist/bootstrap/create-application.js";
import { URL } from "node:url";
import { mapUatError } from "../dist/application/uat-api-errors.js";
import { UatRequestValidationError, validateReceiptRequest, validateAnalyticsQuery } from "../dist/application/uat-api-validation.js";

test("malformed UAT input maps to the canonical validation response", () => {
  assert.throws(() => validateReceiptRequest({ businessId: "b", brandId: "br", programId: "p", membershipId: "m", rewardAccountId: "ra", xpAccountId: "xa", receiptId: "r", redemptionId: "rd", amountMinor: "not-a-number", currency: "RSD", occurredAt: "2026-08-09T10:00:00.000Z" }), (error) => error.field === "amountMinor");
  const mapped = mapUatError(new UatRequestValidationError("amountMinor", "invalid"), "request-1");
  assert.equal(mapped.status, 400);
  assert.equal(mapped.body.errors[0].code, "REQUEST_INVALID");
});

test("analytics query rejects undeclared fields and invalid periods", () => {
  assert.throws(() => validateAnalyticsQuery(new URL("http://localhost/?businessId=b&programId=p&unexpected=x")), (error) => error.field === "unexpected");
  assert.throws(() => validateAnalyticsQuery(new URL("http://localhost/?businessId=b&programId=p&from=2026-01-02T00:00:00.000Z&to=2026-01-01T00:00:00.000Z")), (error) => error.field === "from");
});

test("canonical UAT errors distinguish auth, authorization, not-found and conflict", () => {
  const cases = [
    [new Error("customer authentication is required"), 401, "AUTHENTICATION_REQUIRED"],
    [new Error("tenant context is not authorized"), 403, "ACCESS_DENIED"],
    [new Error("Customer was not found"), 404, "RESOURCE_NOT_FOUND"],
    [new Error("idempotency conflict"), 409, "REQUEST_CONFLICT"],
  ];
  for (const [error, status, code] of cases) {
    const mapped = mapUatError(error, "request-2");
    assert.equal(mapped.status, status);
    assert.equal(mapped.body.errors[0].code, code);
  }
});

test("unexpected UAT failures return a safe canonical response", () => {
  const mapped = mapUatError(new Error("database password=secret internal stack"), "request-3");
  assert.equal(mapped.status, 500);
  assert.equal(mapped.body.errors[0].message, "An unexpected error occurred.");
  assert.doesNotMatch(JSON.stringify(mapped.body), /secret/u);
});

test("UAT routes return canonical validation, authentication, authorization, not-found and conflict responses", async () => {
  const fake = {
    resolveCustomerSession: async () => { throw new Error("customer authentication is required"); },
    resolveBusinessActor: async () => ({ kind: "business", businessId: "business-a" }),
    business: async () => { throw new Error("Business tenant context is not authorized"); },
    reserve: async () => { throw new Error("idempotency conflict"); },
  };
  const server = createServer(createApplication({ uat: fake }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const invalid = await fetch(`${url}/api/v1/uat/receipts`, { method: "POST", body: JSON.stringify({ unknown: true }) });
    assert.equal(invalid.status, 400); assert.equal((await invalid.json()).errors[0].code, "REQUEST_INVALID");
    const unauthenticated = await fetch(`${url}/api/v1/uat/customers/me`);
    assert.equal(unauthenticated.status, 401); assert.equal((await unauthenticated.json()).errors[0].code, "AUTHENTICATION_REQUIRED");
    const unauthorized = await fetch(`${url}/api/v1/uat/businesses/me?businessId=business-b`, { headers: { "x-uat-business-token": "token" } });
    assert.equal(unauthorized.status, 403); assert.equal((await unauthorized.json()).errors[0].code, "ACCESS_DENIED");
    const notFound = await fetch(`${url}/api/v1/uat/unknown`, { headers: { "x-uat-business-token": "token" } });
    assert.equal(notFound.status, 404); assert.equal((await notFound.json()).errors[0].code, "RESOURCE_NOT_FOUND");
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
