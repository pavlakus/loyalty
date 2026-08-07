import assert from "node:assert/strict";
import test from "node:test";

import { resolveCustomerPreferredLanguage } from "../dist/modules/customer/preferred-language.js";

const sources = (overrides = {}) => ({
  preferred_language: null,
  application_locale: null,
  brand_fallback: null,
  platform_fallback: "en",
  ...overrides,
});

test("prefers the explicit Customer language", () => {
  assert.equal(
    resolveCustomerPreferredLanguage(sources({
      preferred_language: "sr-Latn",
      application_locale: "de-DE",
      brand_fallback: "en-GB",
    })),
    "sr-Latn",
  );
});

test("uses application, brand, then platform fallbacks", () => {
  assert.equal(resolveCustomerPreferredLanguage(sources({ application_locale: "de-DE" })), "de-DE");
  assert.equal(resolveCustomerPreferredLanguage(sources({ brand_fallback: "fr" })), "fr");
  assert.equal(resolveCustomerPreferredLanguage(sources()), "en");
});

test("rejects an invalid selected locale", () => {
  assert.throws(
    () => resolveCustomerPreferredLanguage(sources({ preferred_language: "English (US)" })),
    /preferred_language: must be a stable locale identifier/,
  );
});

test("does not mutate source values", () => {
  const input = sources({ preferred_language: " en-US " });
  const snapshot = structuredClone(input);

  assert.equal(resolveCustomerPreferredLanguage(input), "en-US");
  assert.deepEqual(input, snapshot);
});
