import assert from "node:assert/strict";
import test from "node:test";

import { createSuccessResponse } from "../dist/index.js";

test("creates the canonical success response envelope", () => {
  assert.deepEqual(
    createSuccessResponse({ id: "example" }, {
      request_id: "request-1",
      timestamp: "2026-01-01T00:00:00.000Z",
    }),
    {
      success: true,
      data: { id: "example" },
      metadata: {
        request_id: "request-1",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
      errors: [],
    },
  );
});
