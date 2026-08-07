import assert from "node:assert/strict";
import test from "node:test";

import { BusinessContractValidationError, validateCreateBusinessRequest, validateUpdateBusinessRequest } from "../dist/index.js";

test("validates the approved Business create contract", () => {
  const value = validateCreateBusinessRequest({ id: "b1", legalName: "Legal", displayName: "Display", defaultCurrency: "EUR", timezone: "Europe/Belgrade", createdAt: "2026-08-07T10:00:00.000Z" });
  assert.equal(value.defaultCurrency, "EUR");
});

test("rejects unknown fields and empty updates", () => {
  assert.throws(() => validateCreateBusinessRequest({ id: "b1", legalName: "Legal", displayName: "Display", defaultCurrency: "EUR", timezone: "Europe/Belgrade", createdAt: "now", secret: "x" }), BusinessContractValidationError);
  assert.throws(() => validateUpdateBusinessRequest({}), /must contain an update/);
  assert.deepEqual(validateUpdateBusinessRequest({ displayName: "New" }), { displayName: "New" });
});
