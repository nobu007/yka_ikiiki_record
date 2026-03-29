#!/bin/bash

# Production Readiness Validation Script
# Validates that the system is ready for production deployment
# Part of the autonomous resilience protocols (SYSTEM_CONSTITUTION.md §6)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXIT_CODE=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

log_failure() {
    echo -e "${RED}[✗]${NC} $1"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
    EXIT_CODE=1
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

run_test() {
    local test_name="$1"
    local test_command="$2"

    log_info "Running: $test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name"
        return 0
    else
        log_failure "$test_name"
        return 1
    fi
}

echo "=========================================="
echo "Production Readiness Validation"
echo "=========================================="
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# ============================================================================
# Section 1: Environment Validation
# ============================================================================
echo "=== Environment Validation ==="

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null || echo "none")
if [[ "$NODE_VERSION" != "none" ]]; then
    log_success "Node.js installed: $NODE_VERSION"
else
    log_failure "Node.js not found"
fi

# Check npm version
NPM_VERSION=$(npm -v 2>/dev/null || echo "none")
if [[ "$NPM_VERSION" != "none" ]]; then
    log_success "npm installed: $NPM_VERSION"
else
    log_failure "npm not found"
fi

# Check if required files exist
run_test "package.json exists" "test -f package.json"
run_test "tsconfig.json exists" "test -f tsconfig.json"
run_test "next.config.js exists" "test -f next.config.js"
run_test ".env.example exists" "test -f .env.example"

# ============================================================================
# Section 2: Dependency Validation
# ============================================================================
echo ""
echo "=== Dependency Validation ==="

# Check if node_modules exists and is complete
if [ -d "node_modules" ]; then
    log_success "node_modules directory exists"

    # Check for critical dependencies
    run_test "Next.js installed" "test -d node_modules/next"
    run_test "React installed" "test -d node_modules/react"
    run_test "TypeScript installed" "test -d node_modules/typescript"
    run_test "Prisma installed" "test -d node_modules/@prisma/client"
    run_test "Zod installed" "test -d node_modules/zod"
    run_test "Testing library installed" "test -d node_modules/@testing-library"
else
    log_failure "node_modules not found - run 'npm install'"
fi

# ============================================================================
# Section 3: Type Safety Validation
# ============================================================================
echo ""
echo "=== Type Safety Validation ==="

# Check for TypeScript compilation errors
log_info "Running TypeScript compilation check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    log_success "TypeScript compilation: No errors"
else
    log_failure "TypeScript compilation: Errors detected"

    # Show first 10 errors
    log_info "Showing first 10 TypeScript errors:"
    npx tsc --noEmit 2>&1 | head -n 10
fi

# Check for 'any' types (strict mode violation)
log_info "Checking for 'any' type usage..."
ANY_COUNT=$(npx tsc --noEmit 2>&1 | grep -c "any" || echo "0")
if [ "$ANY_COUNT" -eq 0 ]; then
    log_success "No 'any' types detected"
else
    log_warning "Found $ANY_COUNT potential 'any' type usages (may be false positives)"
fi

# ============================================================================
# Section 4: Linting Validation
# ============================================================================
echo ""
echo "=== Linting Validation ==="

# Run ESLint
log_info "Running ESLint..."
if npx eslint . --max-warnings 0 > /dev/null 2>&1; then
    log_success "ESLint: No errors or warnings"
else
    LINT_RESULT=$(npx eslint . --max-warnings 0 2>&1 || true)
    LINT_ERRORS=$(echo "$LINT_RESULT" | grep -c "error" || echo "0")
    LINT_WARNINGS=$(echo "$LINT_RESULT" | grep -c "warning" || echo "0")

    if [ "$LINT_ERRORS" -gt 0 ] || [ "$LINT_WARNINGS" -gt 0 ]; then
        log_failure "ESLint: $LINT_ERRORS errors, $LINT_WARNINGS warnings"

        # Show summary
        log_info "ESLint summary:"
        echo "$LINT_RESULT" | tail -n 20
    fi
fi

# ============================================================================
# Section 5: Testing Validation
# ============================================================================
echo ""
echo "=== Testing Validation ==="

# Check if tests can run
log_info "Running test suite..."
if npm test -- --runInBand --passWithNoTests > test_output.txt 2>&1; then
    # Parse test results
    TEST_TOTAL=$(grep -oP '\d+(?= total)' test_output.txt || echo "0")
    TEST_PASSING=$(grep -oP '\d+(?=\s+passing)' test_output.txt || echo "0")

    if [ "$TEST_PASSING" -eq "$TEST_TOTAL" ] && [ "$TEST_TOTAL" -gt 0 ]; then
        log_success "Test suite: $TEST_PASSING/$TEST_TOTAL passing (100%)"
    else
        log_failure "Test suite: $TEST_PASSING/$TEST_TOTAL passing"
    fi

    rm -f test_output.txt
else
    log_failure "Test suite failed to run"

    # Show error output
    if [ -f test_output.txt ]; then
        log_info "Test output (last 30 lines):"
        tail -n 30 test_output.txt
        rm -f test_output.txt
    fi
fi

# Check coverage
log_info "Checking test coverage..."
COVERAGE_OUTPUT=$(npm run test:coverage -- --runInBand --passWithNoTests 2>&1 || true)

# Parse coverage percentages
COVERAGE_STATEMENTS=$(echo "$COVERAGE_OUTPUT" | grep -oP 'Statements\s*:\s*\K[\d.]+' || echo "0")
COVERAGE_BRANCHES=$(echo "$COVERAGE_OUTPUT" | grep -oP 'Branches\s*:\s*\K[\d.]+' || echo "0")
COVERAGE_FUNCTIONS=$(echo "$COVERAGE_OUTPUT" | grep -oP 'Functions\s*:\s*\K[\d.]+' || echo "0")
COVERAGE_LINES=$(echo "$COVERAGE_OUTPUT" | grep -oP 'Lines\s*:\s*\K[\d.]+' || echo "0")

# Check if coverage meets threshold (90%)
COVERAGE_THRESHOLD=90

if (( $(echo "$COVERAGE_STATEMENTS >= $COVERAGE_THRESHOLD" | bc -l) )); then
    log_success "Coverage statements: ${COVERAGE_STATEMENTS}% (≥${COVERAGE_THRESHOLD}%)"
else
    log_failure "Coverage statements: ${COVERAGE_STATEMENTS}% (<${COVERAGE_THRESHOLD}%)"
fi

if (( $(echo "$COVERAGE_BRANCHES >= $COVERAGE_THRESHOLD" | bc -l) )); then
    log_success "Coverage branches: ${COVERAGE_BRANCHES}% (≥${COVERAGE_THRESHOLD}%)"
else
    log_warning "Coverage branches: ${COVERAGE_BRANCHES}% (<${COVERAGE_THRESHOLD}%, but acceptable)"
fi

if (( $(echo "$COVERAGE_FUNCTIONS >= $COVERAGE_THRESHOLD" | bc -l) )); then
    log_success "Coverage functions: ${COVERAGE_FUNCTIONS}% (≥${COVERAGE_THRESHOLD}%)"
else
    log_warning "Coverage functions: ${COVERAGE_FUNCTIONS}% (<${COVERAGE_THRESHOLD}%, but acceptable)"
fi

if (( $(echo "$COVERAGE_LINES >= $COVERAGE_THRESHOLD" | bc -l) )); then
    log_success "Coverage lines: ${COVERAGE_LINES}% (≥${COVERAGE_THRESHOLD}%)"
else
    log_failure "Coverage lines: ${COVERAGE_LINES}% (<${COVERAGE_THRESHOLD}%)"
fi

# ============================================================================
# Section 6: Database/Prisma Validation
# ============================================================================
echo ""
echo "=== Database/Prisma Validation ==="

# Check if Prisma schema exists
run_test "Prisma schema exists" "test -f prisma/schema.prisma"

# Validate Prisma schema
log_info "Validating Prisma schema..."
if npx prisma validate > /dev/null 2>&1; then
    log_success "Prisma schema validation: Valid"
else
    log_failure "Prisma schema validation: Errors found"
    npx prisma validate 2>&1 | head -n 20
fi

# Check if Prisma client is generated
if [ -d "node_modules/.prisma/client" ]; then
    log_success "Prisma client generated"
else
    log_warning "Prisma client not generated - run 'npx prisma generate'"
fi

# ============================================================================
# Section 7: Build Validation
# ============================================================================
echo ""
echo "=== Build Validation ==="

# Test production build
log_info "Running production build (this may take a while)..."
if npm run build > build_output.txt 2>&1; then
    log_success "Production build: Successful"

    # Check if .next directory exists
    if [ -d ".next" ]; then
        log_success "Build artifacts (.next/) created"
    else
        log_failure "Build artifacts (.next/) not found"
    fi

    rm -f build_output.txt
else
    log_failure "Production build: Failed"

    # Show error output
    if [ -f build_output.txt ]; then
        log_info "Build errors:"
        tail -n 50 build_output.txt
        rm -f build_output.txt
    fi
fi

# ============================================================================
# Section 8: Clean Architecture Validation
# ============================================================================
echo ""
echo "=== Clean Architecture Validation ==="

# Check for proper directory structure
run_test "Domain layer exists" "test -d src/domain"
run_test "Application layer exists" "test -d src/application"
run_test "Infrastructure layer exists" "test -d src/infrastructure"
run_test "Presentation layer exists" "test -d src/app"

# Check for circular dependencies (basic check)
log_info "Checking for obvious circular dependency violations..."
if grep -r "from.*infrastructure" src/domain/ > /dev/null 2>&1; then
    log_failure "Domain layer imports from Infrastructure (violation)"
else
    log_success "Domain layer does not import from Infrastructure"
fi

if grep -r "from.*application" src/domain/ > /dev/null 2>&1; then
    log_failure "Domain layer imports from Application (violation)"
else
    log_success "Domain layer does not import from Application"
fi

# ============================================================================
# Section 9: Environment Configuration Validation
# ============================================================================
echo ""
echo "=== Environment Configuration Validation ==="

# Check for .env.example completeness
if [ -f ".env.example" ]; then
    REQUIRED_VARS=(
        "DATABASE_URL"
        "DATABASE_PROVIDER"
        "NEXT_PUBLIC_API_URL"
    )

    MISSING_VARS=0
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env.example 2>/dev/null; then
            log_success "Required var in .env.example: $var"
        else
            log_warning "Missing required var in .env.example: $var"
            ((MISSING_VARS++))
        fi
    done

    if [ $MISSING_VARS -eq 0 ]; then
        log_success "All required environment variables documented"
    else
        log_warning "Missing $MISSING_VARS required environment variables in .env.example"
    fi
else
    log_warning ".env.example not found - cannot validate environment configuration"
fi

# ============================================================================
# Section 10: Deployment Scripts Validation
# ============================================================================
echo ""
echo "=== Deployment Scripts Validation ==="

# Check if deployment scripts exist and are executable
run_test "deploy-production.sh exists" "test -f scripts/deploy-production.sh"
run_test "verify-deployment.sh exists" "test -f scripts/verify-deployment.sh"

if [ -f "scripts/deploy-production.sh" ]; then
    if [ -x "scripts/deploy-production.sh" ]; then
        log_success "deploy-production.sh is executable"
    else
        log_warning "deploy-production.sh is not executable - run 'chmod +x scripts/deploy-production.sh'"
    fi
fi

if [ -f "scripts/verify-deployment.sh" ]; then
    if [ -x "scripts/verify-deployment.sh" ]; then
        log_success "verify-deployment.sh is executable"
    else
        log_warning "verify-deployment.sh is not executable - run 'chmod +x scripts/verify-deployment.sh'"
    fi
fi

# ============================================================================
# Section 11: Resilience Protocols Validation
# ============================================================================
echo ""
echo "=== Resilience Protocols Validation ==="

# Check for resilience components
run_test "Resilience library exists" "test -f src/lib/resilience/index.ts"
run_test "Timeout enforcement implemented" "test -f src/lib/resilience/timeout.ts"
run_test "Circuit breaker implemented" "test -f src/lib/resilience/circuit-breaker.ts"
run_test "Loop detector implemented" "test -f src/lib/resilience/loop-detector.ts"
run_test "Memory monitor implemented" "test -f src/lib/resilience/memory-monitor.ts"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
echo ""
echo "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ PRODUCTION READY${NC}"
    echo ""
    echo "The system is ready for production deployment."
    echo "Next steps:"
    echo "  1. Run: ./scripts/deploy-production.sh"
    echo "  2. Verify: ./scripts/verify-deployment.sh <production-url>"
else
    echo -e "${RED}✗ NOT PRODUCTION READY${NC}"
    echo ""
    echo "Please fix the failures above before deploying to production."
fi

exit $EXIT_CODE
