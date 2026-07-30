import assert from "node:assert/strict";
import test from "node:test";

import {
  CustomerContractValidationError,
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
