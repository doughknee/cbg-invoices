import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Generated / build output — never lint.
  { ignores: ["dist", "src/routeTree.gen.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TanStack Router route files export a `Route` alongside the component by
      // design; this HMR-only hint doesn't apply to them.
      "react-refresh/only-export-components": "off",
      // Block on the react-hooks rules (set-state-in-effect / refs default to
      // error in the recommended preset). The handful of intentional pre-existing
      // cases carry inline eslint-disable comments explaining each one.
      "react-hooks/exhaustive-deps": "error",
    },
  },
);
