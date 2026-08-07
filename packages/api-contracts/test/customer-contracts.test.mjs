import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerContractValidationError,
  validateAndNormalizeCustomerProfileUpdateRequest,
  validateCustomerProfileUpdateRequest,
} from "../dist/index.js";

test("validates the documented Customer profile update fields", () => {
  const request = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: null,
    birth_date: "1815-12-10",
    preferred_language: "en",
  };
  assert.deepEqual(validateCustomerProfileUpdateRequest(request), request);
});

test("rejects phone changes and unknown Customer fields", () => {
  assert.throws(
    () => validateCustomerProfileUpdateRequest({ phone: "+381600000000" }),
    CustomerContractValidationError,
  );
  assert.throws(
    () => validateCustomerProfileUpdateRequest({ birth_date: "not-a-date" }),
    CustomerContractValidationError,
  );
});

test("normalizes email while preserving the approved profile field boundary", () => {
  assert.deepEqual(
    validateAndNormalizeCustomerProfileUpdateRequest({
      email: "  Ada@Example.COM ",
      preferred_language: "en-US",
    }),
    { email: "ada@example.com", preferred_language: "en-US" },
  );
});

test("rejects invalid profile values", () => {
  assert.throws(
    () => validateAndNormalizeCustomerProfileUpdateRequest({ email: "not-an-email" }),
    CustomerContractValidationError,
  );
  assert.throws(
    () => validateCustomerProfileUpdateRequest({ preferred_language: "English (US)" }),
    CustomerContractValidationError,
  );
  assert.throws(
    () => validateCustomerProfileUpdateRequest({ birth_date: "2026-02-30" }),
    CustomerContractValidationError,
  );
});
