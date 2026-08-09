import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "apps/**",
      "packages/**",
      "services/**",
      "scripts/validate-fcr-artifacts.mjs",
      "tests/typecheck/**",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        structuredClone: "readonly",
      },
    },
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
);
