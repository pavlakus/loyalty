import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { analyzeBoundary } from "../../scripts/check-module-boundaries.mjs";

test("rejects a relative import across top-level module boundaries", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "lp-boundary-"));
  await fs.mkdir(path.join(root, "apps", "customer", "src"), { recursive: true });
  await fs.mkdir(path.join(root, "packages", "shared", "src"), { recursive: true });
  await fs.writeFile(
    path.join(root, "apps", "customer", "src", "main.ts"),
    'import value from "../../../packages/shared/src/value";\n',
  );
  await fs.writeFile(
    path.join(root, "packages", "shared", "src", "value.ts"),
    "export default 1;\n",
  );
  const result = analyzeBoundary(root);
  assert.equal(result.violations.length, 1);
  assert.equal(result.cycles.length, 0);
});

test("rejects a private package subpath import", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "lp-package-boundary-"));
  await fs.mkdir(path.join(root, "apps", "customer", "src"), { recursive: true });
  await fs.mkdir(path.join(root, "packages", "shared", "src"), { recursive: true });
  await fs.writeFile(
    path.join(root, "apps", "customer", "package.json"),
    JSON.stringify({ name: "@example/customer" }),
  );
  await fs.writeFile(
    path.join(root, "packages", "shared", "package.json"),
    JSON.stringify({ name: "@example/shared" }),
  );
  await fs.writeFile(
    path.join(root, "apps", "customer", "src", "main.ts"),
    'import value from "@example/shared/src/value";\n',
  );
  const result = analyzeBoundary(root);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0].specifier, /shared\/src/);
});
