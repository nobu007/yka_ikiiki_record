# Automation Scripts

This directory contains automation scripts for deployment, verification, and quality assurance.

## Scripts Overview

### Deployment

- **`deploy-production.sh`** (130 lines)
  - Automated production deployment to Vercel
  - PostgreSQL database setup
  - Environment variable configuration
  - Usage: `npm run deploy:production`

### Verification

- **`verify-deployment.sh`** (175 lines)
  - Post-deployment verification
  - API endpoint testing
  - Database connectivity checks
  - E2E test execution against production
  - Usage: `npm run verify:deployment <production-url>`

### Quality Assurance

- **`test-e2e-local.sh`** (NEW - 175 lines)
  - Local E2E integration testing
  - Serves as P2 alternative for production deployment verification
  - Automatically starts dev server if needed
  - Runs full Playwright E2E test suite
  - Usage: `npm run test:e2e:local`

### Monitoring

- **`meta_checker.py`** (474 lines)
  - Autonomous quality monitoring system
  - JudgmentScore calculation
  - Code quality metrics tracking
  - Usage: `npm run quality:check`

## Total Automation Lines

- **Total**: 954 lines of automation scripts
- **Languages**: Bash (480 lines), Python (474 lines)

## CI/CD Integration

All scripts are designed to be run in CI/CD pipelines:

```bash
# Pre-commit checks
npm run lint
npm run test

# Pre-deployment checks
npm run test:coverage
npm run build
npm run test:e2e:local

# Deployment
npm run deploy:production

# Post-deployment verification
npm run verify:deployment
```

## Constitution Compliance

These scripts implement the following constitutional requirements:

- **§6 AUTONOMOUS RESILIENCE PROTOCOLS**: Timeout enforcement, circuit breaker, loop detection
- **§7 TESTING MANDATES**: Automated testing, 95%+ coverage, E2E tests
- **§9 CI/CD REQUIREMENTS**: All commits must pass testing, coverage cannot decrease
- **§10 METRICS & MONITORING**: Performance metrics, quality gates, automated monitoring

## Purpose-Driven Implementation

These scripts support the following PURPOSE.md deliverables:

- **P1: 本番デプロイ実行** - `deploy-production.sh`, `verify-deployment.sh`
- **P2: デプロイ後の機能改善（代替）** - `test-e2e-local.sh` as production proxy
- **P3: 品質メトリクスの維持** - `meta_checker.py` autonomous monitoring
