#!/bin/bash
set -euo pipefail

# Local E2E Integration Test Script
# This script runs E2E tests against the local development server
# as a proxy for production deployment verification (P2 alternative)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if dev server is running
check_dev_server() {
    local max_attempts=30
    local attempt=1

    log_step "Checking if dev server is running..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s -o /dev/null http://127.0.0.1:3000 2>/dev/null; then
            log_info "✓ Dev server is running on http://127.0.0.1:3000"
            return 0
        fi

        if [ $attempt -eq 1 ]; then
            log_warn "Dev server not detected. Starting it..."
            cd "$PROJECT_ROOT"
            npm run dev &
            DEV_SERVER_PID=$!
            log_info "Dev server started with PID: $DEV_SERVER_PID"
            log_info "Waiting for server to be ready..."
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "Dev server failed to start within ${max_attempts} attempts"
    return 1
}

# Run E2E tests
run_e2e_tests() {
    log_step "Running E2E tests..."

    cd "$PROJECT_ROOT"

    # Set BASE_URL for Playwright
    export BASE_URL="http://127.0.0.1:3000"

    # Run Playwright tests
    if npm run test:e2e; then
        log_info "✓ All E2E tests passed"
        return 0
    else
        log_error "✗ Some E2E tests failed"
        return 1
    fi
}

# Cleanup function
cleanup() {
    if [ -n "${DEV_SERVER_PID:-}" ]; then
        log_info "Stopping dev server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null || true
        wait $DEV_SERVER_PID 2>/dev/null || true
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Main execution flow
main() {
    log_info "==========================================="
    log_info "Local E2E Integration Test"
    log_info "==========================================="
    log_info ""
    log_info "This script runs E2E tests as a proxy for"
    log_info "production deployment verification (P2)"
    log_info ""
    log_info "Constitution Link: §7 Testing Mandates"
    log_info "Constitution Link: §9 CI/CD Requirements"
    log_info ""

    # Check prerequisites
    log_step "Checking prerequisites..."

    if ! command -v npx &> /dev/null; then
        log_error "npx not found. Please install Node.js"
        exit 1
    fi

    if [ ! -f "$PROJECT_ROOT/playwright.config.ts" ]; then
        log_error "Playwright config not found"
        exit 1
    fi

    log_info "✓ Prerequisites met"
    log_info ""

    # Ensure dev server is running
    if ! check_dev_server; then
        log_error "Failed to start dev server"
        exit 1
    fi
    log_info ""

    # Wait a bit more for server to be fully ready
    log_info "Waiting for dev server to stabilize..."
    sleep 5
    log_info ""

    # Run E2E tests
    if ! run_e2e_tests; then
        log_error "E2E tests failed"
        exit 1
    fi
    log_info ""

    # Summary
    log_info "==========================================="
    log_info "✓ E2E INTEGRATION TEST COMPLETE"
    log_info "==========================================="
    log_info ""
    log_info "Test Results:"
    log_info "  [✓] Dev server running"
    log_info "  [✓] All E2E tests passed"
    log_info ""
    log_info "Test Coverage:"
    log_info "  - Landing page navigation"
    log_info "  - Data generation flow"
    log_info "  - Statistics display"
    log_info "  - Chart interactions"
    log_info "  - Responsive design"
    log_info "  - Error handling"
    log_info ""
    log_info "This validates the application is ready for"
    log_info "production deployment (P2 alternative)"
    log_info ""
}

main "$@"
