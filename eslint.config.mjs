import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["coverage/**", "node_modules/**", "docs/**", "**/*.min.js", "dist/**", "src/vendor/**", "build.js"]
  },
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        ...globals.serviceworker
      }
    },
    rules: {
      "no-unused-vars": "warn"
    }
  }
];