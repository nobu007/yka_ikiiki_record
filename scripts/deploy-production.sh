#!/bin/bash
set -euo pipefail

# Production Deployment Automation Script
# This script executes P2: 本番デプロイ実行 (Production Deployment Execution)
# Target: Vercel + PostgreSQL deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Verify prerequisites
log_info "Step 1: Verifying deployment prerequisites..."

if ! command -v vercel &> /dev/null; then
    log_error "Vercel CLI is not installed. Install with: npm i -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    log_error "Not logged in to Vercel. Run: vercel login"
    exit 1
fi

log_info "✓ Vercel CLI installed and authenticated"

# Verify tests pass
log_info "Step 2: Running test suite..."
cd "${PROJECT_ROOT}"
if ! npm test -- --silent 2>&1 | grep -q "passed"; then
    log_error "Tests failed. Cannot deploy with failing tests."
    exit 1
fi
log_info "✓ All tests passing"

# Verify build succeeds
log_info "Step 3: Verifying production build..."
if ! npm run build &> /dev/null; then
    log_error "Production build failed. Cannot deploy."
    exit 1
fi
log_info "✓ Production build successful"

# Step 4: Deploy to Vercel
log_info "Step 4: Deploying to Vercel production..."
vercel --prod --yes

# Step 5: Database setup instructions
log_info "Step 5: Database setup required"
log_warn "==========================================="
log_warn "ACTION REQUIRED: Set up production database"
log_warn "==========================================="
log_warn ""
log_warn "Option A: Vercel Postgres (Recommended)"
log_warn "  1. Go to Vercel Dashboard: https://vercel.com/dashboard"
log_warn "  2. Select your project → Storage → Create Database → Postgres"
log_warn "  3. Copy the DATABASE_URL from Vercel"
log_warn "  4. Add to project environment variables"
log_warn ""
log_warn "Option B: External PostgreSQL (Supabase, Neon, etc.)"
log_warn "  1. Create a PostgreSQL database"
log_warn "  2. Copy the connection string"
log_warn "  3. Set environment variable:"
log_warn "     vercel env add DATABASE_URL production"
log_warn "     (paste your connection string when prompted)"
log_warn ""
log_warn "After setting DATABASE_URL, run database migrations:"
log_warn "  vercel exec -- npm run db:migrate:deploy"
log_warn ""

# Check if DATABASE_URL is set
if ! vercel env ls . | grep -q "DATABASE_URL.*production"; then
    log_warn "DATABASE_URL not set in production environment"
    log_warn "Please set it using: vercel env add DATABASE_URL production"
else
    log_info "DATABASE_URL is configured"

    # Step 6: Deploy database migrations
    log_info "Step 6: Deploying database migrations..."
    if vercel exec -- npm run db:migrate:deploy; then
        log_info "✓ Database migrations deployed successfully"
    else
        log_warn "Database migration deployment failed or skipped"
        log_warn "Run manually: vercel exec -- npm run db:migrate:deploy"
    fi
fi

# Step 7: Verify deployment
log_info "Step 7: Verifying production deployment..."
PROD_URL=$(vercel ls --prod | grep -m1 'lively-demo' | awk '{print $2}')
if [[ -n "$PROD_URL" ]]; then
    log_info "✓ Production URL: https://${PROD_URL}"
    log_info "Visit the URL to verify the deployment is working"
else
    log_warn "Could not determine production URL"
fi

log_info ""
log_info "==========================================="
log_info "✓ P2 DEPLOYMENT COMPLETE"
log_info "==========================================="
log_info ""
log_info "Next Steps (P3 - 運用開始後の改善):"
log_info "  1. Set up DATABASE_URL if not already done"
log_info "  2. Run database migrations"
log_info "  3. Test /api/seed endpoint"
log_info "  4. Test /api/stats endpoint"
log_info "  5. Verify dashboard displays data correctly"
log_info "  6. Consider authentication/authorization systems"
log_info "  7. Consider multi-class support"
log_info "  8. Consider data export features"
log_info ""
