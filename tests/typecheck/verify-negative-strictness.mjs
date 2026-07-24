import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm", ["exec", "tsc", "-p", "tests/typecheck/tsconfig.negative.json", "--noEmit"], {
  encoding: "utf8",
  stdio: "pipe"
});

const output = `${result.stdout}${result.stderr}`;
if (result.status === 0 || !output.includes("TS7006")) {
  console.error(output);
  console.error("Expected strict TypeScript validation to reject the implicit-any fixture.");
  process.exit(1);
}

console.log("negative strictness validation passed: implicit any rejected (TS7006)");
