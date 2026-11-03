#!/usr/bin/env bash
set -euo pipefail
node --check scripts/ci/routing.cjs
bash -n scripts/ci/check.sh
node scripts/ci/routing.cjs classify > /tmp/yka-ci-scope.json
cat /tmp/yka-ci-scope.json
python3 - <<'PY'
import json
from pathlib import Path
import yaml
for path in (Path('.woodpecker.yml'), *Path('.github/workflows').glob('*.yml')):
    yaml.safe_load(path.read_text())
json.loads(Path('vercel.json').read_text())
print('CI YAML / JSON structure: passed')
PY
if node -e "process.exit(require('/tmp/yka-ci-scope.json').scope === 'documentation-and-ci-policy' ? 0 : 1)"; then
  echo 'Documentation/CI policy only: product tests and build not required.'
  exit 0
fi
corepack enable
corepack prepare pnpm@9 --activate
pnpm install --frozen-lockfile
cp .env.example .env
export DATABASE_PROVIDER=mirage
pnpm run build
pnpm exec eslint .
pnpm run test -- --runInBand
pnpm exec playwright install --with-deps
pnpm run test:e2e
