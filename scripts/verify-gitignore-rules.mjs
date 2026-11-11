#!/usr/bin/env node
/**
 * Regression guard for the generated .gitignore.
 *
 * The tas_autopilot `post_dispatch` step fails with
 * "post_dispatch: target worktree is dirty after dispatch" when host-local
 * artifacts produced by ai-hub show up as untracked files in this repository.
 * The root cause of the recurring failure was a stale merge: `.gitignore` was
 * no longer the result of merging `.gitignore.distribution` and
 * `.gitignore.local`, so the `.audit/` rule that already existed in
 * `.gitignore.local` never became effective.
 *
 * Usage: node scripts/verify-gitignore-rules.mjs
 * Exit code 0 = every check passed, 1 = at least one check failed.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const read = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8');

const distribution = read('.gitignore.distribution');
const local = read('.gitignore.local');
const merged = read('.gitignore');

const failures = [];

const check = (name, ok, detail) => {
  if (!ok) {
    failures.push(`${name}: ${detail}`);
  }
};

const ruleLines = (content) =>
  content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));

// 1. The merged file must still be the merge of its two sources.
check(
  'merged-contains-distribution',
  merged.includes(distribution),
  '.gitignore does not contain .gitignore.distribution verbatim',
);
check(
  'merged-ends-with-local',
  merged.trimEnd().endsWith(local.trimEnd()),
  '.gitignore does not end with the current .gitignore.local content; regenerate it',
);

// 2. Every rule of the local file must be effective in the merged file.
for (const rule of ruleLines(local)) {
  check('local-rule-effective', merged.includes(rule), `rule "${rule}" is missing from .gitignore`);
}

// 3. The rules that keep host-local ai-hub artifacts out of the worktree.
const requiredRules = ['.audit/', '/data/llm_analysis_*.md', '!src/lib/'];
for (const rule of requiredRules) {
  check('required-rule-present', merged.includes(rule), `required rule "${rule}" is missing from .gitignore`);
}

const isIgnored = (relativePath) => {
  try {
    execFileSync('git', ['check-ignore', '-q', '--', relativePath], { cwd: repoRoot });
    return true;
  } catch {
    return false;
  }
};

// 4. The artifacts that used to block post_dispatch must be ignored.
for (const artifact of ['.audit/development_direction.yml', 'data/llm_analysis_20261111-0000.md']) {
  check('artifact-ignored', isIgnored(artifact), `"${artifact}" is not ignored`);
}

// 5. The distribution rule "lib/" must not hide tracked sources under src/lib.
check(
  'src-lib-not-ignored',
  !isIgnored('src/lib/example-new-file.ts'),
  'src/lib is ignored; new source files there would need git add -f',
);

if (failures.length > 0) {
  console.error('gitignore verification failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('gitignore verification passed');
