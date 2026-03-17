import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      "free-nextjs-admin-dashboard/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "jest.setup.js",
      "jest.config.js"
    ],
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
      "react": pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(nextPlugin.configs.recommended.rules).map(([key, value]) => [key, value])
      ),
      ...Object.fromEntries(
        Object.entries(pluginReact.configs.recommended.rules).map(([key, value]) => [key, value])
      ),
      ...Object.fromEntries(
        Object.entries(pluginReactHooks.configs.recommended.rules).map(([key, value]) => [key, value])
      ),
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/unbound-method": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-use-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": "off",
      "jsx-a11y/label-has-associated-control": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.test.setup.ts", "**/*.test.helpers.ts", "**/*.setup.ts", "**/*.types.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
