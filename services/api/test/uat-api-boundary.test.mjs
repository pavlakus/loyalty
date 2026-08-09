import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

test("UAT application service has no PostgreSQL or SQL infrastructure dependency", () => {
  const source = readFileSync(new URL("../src/application/uat-api-service.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /from ["']\.\.\/infrastructure\//u);
  assert.doesNotMatch(source, /(?:db\.query|withTransaction|DATABASE_URL|\bpg\b)/u);
});

test("UAT repository owns PostgreSQL access", () => {
  const source = readFileSync(new URL("../src/infrastructure/postgres/uat-repository.ts", import.meta.url), "utf8");
  assert.match(source, /db\.query/u);
  assert.match(source, /withTransaction/u);
});
