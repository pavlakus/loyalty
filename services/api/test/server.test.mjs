import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { startServer } from "../dist/bootstrap/start-server.js";

test("starts the API and serves health and readiness endpoints", async () => {
  const runningServer = await startServer({ port: 0 });
  const address = runningServer.server.address();
  assert.ok(address && typeof address !== "string");

  try {
    const health = await fetch(`http://127.0.0.1:${address.port}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const readiness = await fetch(`http://127.0.0.1:${address.port}/ready`);
    assert.equal(readiness.status, 200);
    assert.deepEqual(await readiness.json(), { status: "ready" });
  } finally {
    await runningServer.close();
  }
});

test("closes gracefully and reports startup errors clearly", async () => {
  const occupiedServer = createServer();
  occupiedServer.listen(0, "127.0.0.1");
  await once(occupiedServer, "listening");
  const address = occupiedServer.address();
  assert.ok(address && typeof address !== "string");

  try {
    await assert.rejects(
      startServer({ host: "127.0.0.1", port: address.port }),
      /API startup failed:/,
    );
  } finally {
    occupiedServer.close();
    await once(occupiedServer, "close");
  }

  const runningServer = await startServer({ port: 0 });
  await runningServer.close();
  assert.equal(runningServer.server.listening, false);
});
