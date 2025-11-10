/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project: [
          "tsconfig.base.json",
          "apps/*/tsconfig.json",
          "packages/*/tsconfig.json",
          "services/*/tsconfig.json",
        ],
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    // Keep JSX runtime relaxed (React 17+)
    "react/react-in-jsx-scope": "off",
    // Prefer explicit function return types only where useful
    "@typescript-eslint/explicit-function-return-type": "off",
    // Prettier formatting surfaced via ESLint
    "prettier/prettier": "warn",
    // Enforce: never use `any`
    "@typescript-eslint/no-explicit-any": "error",
    // React's default export can be ESM/CJS; avoid false positives
    "import/default": "off",
    // Avoid noisy suggestions around named vs default imports
    "import/no-named-as-default-member": "off",
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        // Example TS-specific tweaks can live here
      },
    },
    {
      files: [
        "**/*.config.{js,cjs,ts}",
        "**/vite.config.{js,ts}",
        "**/vitest.config.{js,ts}",
        "**/vitest.workspace.{js,ts}",
        "**/*.setup.{js,ts}",
      ],
      env: { node: true },
      rules: {
        "import/no-unresolved": "off",
      },
    },
    {
      files: ["**/*.test.{ts,tsx,js,jsx}", "**/__tests__/**/*"],
      env: { jest: true },
    },
  ],
};
