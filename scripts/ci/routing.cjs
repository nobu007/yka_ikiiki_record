// Shared change classification for self-hosted CI and Vercel previews.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 45000 }).trim();
const mode = process.argv[2];
try {
  let base;
  if (mode === 'vercel-ignore' && process.env.VERCEL_GIT_COMMIT_REF === 'main') {
    base = process.env.VERCEL_GIT_PREVIOUS_SHA;
    if (!base || !/^[0-9a-f]{40}$/.test(base)) process.exit(1);
    git('cat-file', '-e', `${base}^{commit}`);
  } else {
    const branch = process.env.CI_COMMIT_TARGET_BRANCH || 'main';
    if (!/^[A-Za-z0-9_./-]+$/.test(branch) || branch.startsWith('-')) throw Error('invalid target branch');
    git('fetch', '--no-tags', 'origin', branch);
    base = git('merge-base', 'HEAD', 'FETCH_HEAD');
  }
  const paths = git('diff', '--name-only', '--no-renames', '-z', base, 'HEAD').split('\0').filter(Boolean);
  function policyOnly(path) {
    if (path.startsWith('docs/') || path.endsWith('.md')) return true;
    if (['.woodpecker.yml', '.github/workflows/ci.yml', '.github/workflows/infrastructure.yml', 'scripts/ci/routing.cjs', 'scripts/ci/check.sh'].includes(path)) return true;
    if (path !== 'vercel.json') return false;
    const previous = JSON.parse(git('show', `${base}:vercel.json`));
    const current = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    delete previous.ignoreCommand;
    delete current.ignoreCommand;
    return JSON.stringify(previous) === JSON.stringify(current);
  }
  const docsOnly = paths.length > 0 && paths.every(policyOnly);
  if (mode === 'vercel-ignore') process.exit(docsOnly ? 0 : 1);
  if (mode !== 'classify') throw Error('unknown mode');
  git('diff', '--check', base, 'HEAD');
  console.log(JSON.stringify({ base, head: git('rev-parse', 'HEAD'), paths, scope: docsOnly ? 'documentation-and-ci-policy' : 'application' }));
} catch (error) {
  // Missing history/configuration cannot suppress an application build.
  if (mode === 'vercel-ignore') process.exit(1);
  console.error(error.message);
  process.exit(1);
}
