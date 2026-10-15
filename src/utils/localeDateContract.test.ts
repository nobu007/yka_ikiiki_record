/**
 * Source contract: user-facing date formatting must not depend on the
 * runtime locale.
 *
 * EventManager rendered event dates with an argument-less
 * `toLocaleDateString()`, so the same event displayed as 2026/1/15 on a
 * ja-JP machine and 1/15/2026 elsewhere. Every Date locale formatting call
 * in src/ must therefore pass an explicit locale. Timezone pinning is
 * covered per-component by rendering tests (e.g. EventManager.rendering).
 *
 * `toLocaleString()` is intentionally out of scope: numbers legitimately
 * call it without arguments and a regex cannot tell number from Date.
 */
import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";

const REPO_ROOT = join(__dirname, "..", "..");
const SRC_ROOT = join(__dirname, "..");
const CONTRACT_TEST_FILE = relative(REPO_ROOT, __filename);
const UNGUARDED_DATE_CALL = /\.toLocale(?:Date|Time)String\(\s*\)/;

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, acc);
    } else if (
      /\.tsx?$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name) &&
      relative(REPO_ROOT, fullPath) !== CONTRACT_TEST_FILE
    ) {
      acc.push(fullPath);
    }
  }
  return acc;
}

describe("locale-aware date formatting contract", () => {
  it("never calls toLocaleDateString/toLocaleTimeString without an explicit locale", () => {
    const violations: string[] = [];

    for (const filePath of collectSourceFiles(SRC_ROOT)) {
      const lines = readFileSync(filePath, "utf8").split("\n");
      lines.forEach((line, index) => {
        if (UNGUARDED_DATE_CALL.test(line)) {
          violations.push(
            `${relative(REPO_ROOT, filePath)}:${index + 1}: ${line.trim()}`
          );
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
