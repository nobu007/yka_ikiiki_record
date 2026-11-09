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
 *
 * The file is executed by two runners: `node --test` (the harness binding for
 * this repository) and the repository's own jest suite. It therefore avoids
 * runner-specific globals (__dirname, import.meta) and registers its cases
 * through whichever API the current runner provides.
 */

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const RULE = 'data/llm_analysis_*.md';
const PROBE_PATH = 'data/llm_analysis_probe.md';
const SUITE_NAME = 'Monitoring report ignore rule';

type TestBody = () => void;
type SuiteFn = (name: string, body: () => void) => void;
type TestFn = (name: string, body: TestBody) => void;

interface GitResult {
  status: number | null;
  stdout: string;
  stderr: string;
  error: Error | undefined;
}

interface TestApi {
  describe: SuiteFn;
  it: TestFn;
}

function selectTestApi(): TestApi {
  const globals = globalThis as unknown as { describe?: SuiteFn; it?: TestFn };
  if (typeof globals.describe === 'function' && typeof globals.it === 'function') {
    // jest injects describe/it as globals of the test environment.
    return { describe: globals.describe, it: globals.it };
  }
  // node --test: node:test is reachable through require even from an ES
  // module, where the bare `node:test` specifier is avoided so that jest can
  // still load this file.
  const nodeTest = createRequire(join(process.cwd(), 'noop.js'))('node:test') as {
    describe: SuiteFn;
    it: TestFn;
  };
  return { describe: nodeTest.describe, it: nodeTest.it };
}

function runGit(args: string[], cwd: string): GitResult {
  const result = spawnSync('git', args, { cwd, encoding: 'utf-8' });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error,
  };
}

function resolveRepoRoot(): string {
  const fromGit = runGit(['rev-parse', '--show-toplevel'], process.cwd());
  if (!fromGit.error && fromGit.status === 0) {
    const root = fromGit.stdout.trim();
    if (root) {
      return root;
    }
  }
  const entry = process.argv[1];
  if (entry && entry.endsWith('monitoring-report-ignore.test.ts')) {
    return join(dirname(entry), '..');
  }
  return process.cwd();
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function ignoreRuleLines(relativePath: string): string[] {
  const absolute = join(REPO_ROOT, relativePath);
  assertTrue(existsSync(absolute), `${relativePath} is missing`);
  return readFileSync(absolute, 'utf-8')
    .split('\n')
    .map((line) => line.trim());
}

const REPO_ROOT = resolveRepoRoot();
const { describe, it } = selectTestApi();

describe(SUITE_NAME, () => {
  it('keeps the AI Hub monitoring report pattern in .gitignore.local', () => {
    assertTrue(
      ignoreRuleLines('.gitignore.local').includes(RULE),
      `.gitignore.local does not contain ${RULE}`,
    );
  });

  it('keeps the AI Hub monitoring report pattern in the merged .gitignore', () => {
    assertTrue(
      ignoreRuleLines('.gitignore').includes(RULE),
      `.gitignore does not contain ${RULE}`,
    );
  });

  it('makes git ignore a stray monitoring report under data/', () => {
    const result = runGit(['check-ignore', '--no-index', '-q', PROBE_PATH], REPO_ROOT);
    assertTrue(!result.error, `git check-ignore could not run: ${result.error?.message}`);
    assertTrue(
      result.status === 0,
      `git check-ignore does not match ${PROBE_PATH} (exit ${result.status})`,
    );
  });

  it('keeps git status --porcelain free of stray monitoring reports', () => {
    const probe = join(REPO_ROOT, PROBE_PATH);
    mkdirSync(dirname(probe), { recursive: true });
    writeFileSync(probe, '# stray monitoring report probe\n');
    // The probe is the very file the ignore rule has to cover, so it must
    // never outlive the case: an aborted run would dirty the checkout that
    // the TAS self-push precondition inspects.
    const cleanup = (): void => {
      rmSync(probe, { force: true });
    };
    process.once('exit', cleanup);
    try {
      const status = runGit(['status', '--porcelain'], REPO_ROOT);
      assertTrue(!status.error, `git status could not run: ${status.error?.message}`);
      assertTrue(status.status === 0, `git status exited with ${status.status}`);
      const offending = status.stdout
        .split('\n')
        .filter((line) => line.includes('llm_analysis'));
      assertTrue(
        offending.length === 0,
        `stray monitoring report still dirties the checkout: ${offending.join(' | ')}`,
      );
    } finally {
      process.removeListener('exit', cleanup);
      cleanup();
    }
  });
});
