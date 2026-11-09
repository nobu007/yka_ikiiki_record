/**
 * Regression guard for the TAS self-push failure
 * "post_dispatch: target worktree is dirty after dispatch".
 *
 * ai-hub's monitoring writer (tools/monitoring/llm_analyzer.py main()) writes
 * llm_analysis_<UTC>.md into <repo>/data/. Whenever such a file is untracked
 * the TAS self-push precondition ("git status --porcelain" must be empty)
 * fails, so the ignore rule has to stay in .gitignore.local (the source of
 * truth for repository-specific rules) and in the merged .gitignore.
 *
 * See docs/llm-wiki/relations.md for the upstream ai-hub defect that produces
 * the files in the first place.
 */

import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO_ROOT = join(__dirname, '..');
const RULE = 'data/llm_analysis_*.md';
const PROBE_PATH = 'data/llm_analysis_probe.md';

function ignoreRuleLines(relativePath: string): string[] {
  return readFileSync(join(REPO_ROOT, relativePath), 'utf-8')
    .split('\n')
    .map((line) => line.trim());
}

describe('Monitoring report ignore rule', () => {
  it('keeps the AI Hub monitoring report pattern in .gitignore.local', () => {
    expect(ignoreRuleLines('.gitignore.local')).toContain(RULE);
  });

  it('keeps the AI Hub monitoring report pattern in the merged .gitignore', () => {
    expect(ignoreRuleLines('.gitignore')).toContain(RULE);
  });

  it('makes git ignore a stray monitoring report under data/', () => {
    const result = spawnSync('git', ['check-ignore', '--no-index', '-q', PROBE_PATH], {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    });

    if (result.error) {
      // git is unavailable in this environment: the two content assertions above
      // still cover the rule itself.
      process.stderr.write(`git unavailable, skipped check-ignore probe: ${result.error.message}\n`);
      return;
    }

    expect(result.status).toBe(0);
  });
});
