import assert from "node:assert/strict";
import test from "node:test";

import { validateEventEnvelope } from "../dist/shared/events/event-validation.js";

test("API event validation uses the public event-contracts entry point", () => {
  assert.equal(typeof validateEventEnvelope, "function");
});
