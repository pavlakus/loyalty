import assert from "node:assert/strict";
import test from "node:test";

import {
  EnvironmentConfigurationError,
  loadServerEnvironment,
} from "../dist/config/environment.js";

test("uses safe development defaults without environment variables", () => {
  assert.deepEqual(loadServerEnvironment({}), {
    nodeEnv: "development",
    port: 3000,
    host: "127.0.0.1",
  });
});

test("accepts the approved values and keeps them server-only", () => {
  const configuration = loadServerEnvironment({
    NODE_ENV: "production",
    PORT: "8080",
    HOST: "0.0.0.0",
  });

  assert.deepEqual(configuration, {
    nodeEnv: "production",
    port: 8080,
    host: "0.0.0.0",
  });
  assert.equal(Object.hasOwn(configuration, "public"), false);
  assert.equal(Object.hasOwn(configuration, "secret"), false);
});

test("rejects invalid values without exposing their contents", () => {
  for (const [variableName, environment] of [
    ["NODE_ENV", { NODE_ENV: "staging" }],
    ["PORT", { PORT: "12.5" }],
    ["HOST", { HOST: "bad host" }],
  ]) {
    assert.throws(
      () => loadServerEnvironment(environment),
      (error) => {
        assert.ok(error instanceof EnvironmentConfigurationError);
        assert.equal(error.variableName, variableName);
        assert.equal(error.message.includes(environment[variableName]), false);
        return true;
      },
    );
  }
});

test("accepts an ephemeral test port", () => {
  assert.equal(loadServerEnvironment({ NODE_ENV: "test", PORT: "0" }).port, 0);
});
