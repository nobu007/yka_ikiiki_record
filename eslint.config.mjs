import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "free-nextjs-admin-dashboard/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**"
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }
      ],
      "react-hooks/exhaustive-deps": "off"
    }
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.test.setup.ts", "**/*.test.helpers.ts", "**/*.setup.ts", "**/*.types.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];

export default eslintConfig;
