import assert from "node:assert/strict";
import test from "node:test";

import {
  createErrorResponse,
  createSuccessResponse,
  validateCustomerProfileUpdateRequest,
} from "../dist/index.js";

const CUSTOMER_ENDPOINTS = [
  ["GET", "/api/v1/customers/me"],
  ["PATCH", "/api/v1/customers/me"],
  ["POST", "/api/v1/customers/me/anonymize"],
  ["GET", "/api/v1/customers/me/privacy"],
];

test("documents the approved Customer endpoint boundary", () => {
  assert.deepEqual(CUSTOMER_ENDPOINTS, [
    ["GET", "/api/v1/customers/me"],
    ["PATCH", "/api/v1/customers/me"],
    ["POST", "/api/v1/customers/me/anonymize"],
    ["GET", "/api/v1/customers/me/privacy"],
  ]);
  assert.equal(CUSTOMER_ENDPOINTS.some(([, path]) => path.includes("/export")), false);
});

test("uses stable response envelopes and excludes phone mutations", () => {
  const response = createSuccessResponse({ customer_id: "customer-1", status: "active" }, { request_id: "request-1", timestamp: "2026-08-07T10:00:00.000Z" });
  assert.equal(response.success, true);
  assert.deepEqual(response.errors, []);
  assert.throws(() => validateCustomerProfileUpdateRequest({ phone: "+381600000000" }));
  const errorResponse = createErrorResponse([{ code: "CUSTOMER_INVALID", message: "invalid", field: "email" }], { request_id: "request-1", timestamp: "2026-08-07T10:00:00.000Z" });
  assert.equal(errorResponse.success, false);
  assert.equal(errorResponse.data, null);
});
