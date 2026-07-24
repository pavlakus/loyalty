import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { analyzeBoundary } from "../../scripts/check-module-boundaries.mjs";

test("detects circular dependencies within a module", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "lp-cycle-"));
  const source = path.join(root, "packages", "shared", "src");
  await fs.mkdir(source, { recursive: true });
  await fs.writeFile(path.join(source, "a.ts"), 'import "./b";\n');
  await fs.writeFile(path.join(source, "b.ts"), 'import "./a";\n');
  const result = analyzeBoundary(root);
  assert.equal(result.violations.length, 0);
  assert.equal(result.cycles.length, 1);
});
