import assert from "node:assert/strict";
import test from "node:test";

import {
  ERROR_CATEGORIES,
  FrameworkError,
  createFrameworkError,
  mapFrameworkError,
} from "../dist/shared/errors/framework-errors.js";

const metadata = { request_id: "request-1", timestamp: "2026-01-01T00:00:00.000Z" };

test("defines the approved framework error categories", () => {
  assert.deepEqual(Object.keys(ERROR_CATEGORIES), [
    "ValidationError", "AuthenticationError", "AuthorizationError", "NotFoundError",
    "BusinessRuleError", "ConflictError", "ConcurrencyError", "RateLimitError",
    "TemporaryInfrastructureError", "PermanentProviderError", "UnexpectedError",
  ]);
});

test("maps every approved category to its canonical default HTTP status", () => {
  const expectedStatuses = {
    ValidationError: 400,
    AuthenticationError: 401,
    AuthorizationError: 403,
    NotFoundError: 404,
    BusinessRuleError: 422,
    ConflictError: 409,
    ConcurrencyError: 409,
    RateLimitError: 429,
    TemporaryInfrastructureError: 503,
    PermanentProviderError: 502,
    UnexpectedError: 500,
  };

  for (const [category, status] of Object.entries(expectedStatuses)) {
    const error = createFrameworkError({
      category,
      code: `${category.toUpperCase()}_CODE`,
      safeMessage: "Safe error.",
      requestId: "request-1",
    });
    assert.equal(mapFrameworkError(error, metadata).status, status);
  }
});

test("maps framework errors to safe canonical responses", () => {
  const error = createFrameworkError({
    category: "ValidationError",
    code: "INVALID_REQUEST",
    safeMessage: "The request is invalid.",
    requestId: "request-1",
    field: "name",
  });
  assert.ok(error instanceof FrameworkError);
  assert.deepEqual(mapFrameworkError(error, metadata), {
    status: 400,
    body: {
      success: false,
      data: null,
      metadata,
      errors: [{ code: "INVALID_REQUEST", message: "The request is invalid.", field: "name" }],
    },
  });
});

test("redacts unknown error details", () => {
  const result = mapFrameworkError(new Error("database password leaked"), metadata);
  assert.equal(result.status, 500);
  assert.deepEqual(result.body.errors, [
    { code: "INTERNAL_ERROR", message: "An unexpected error occurred.", field: null },
  ]);
});
