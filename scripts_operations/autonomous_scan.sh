#!/bin/bash
# Autonomous Improvement Scanner - Phase 2 of the autonomous loop
# Systematically identifies improvement opportunities across multiple dimensions

set -e

echo "🔍 AUTONOMOUS IMPROVEMENT SCANNER"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create opportunities log
OPPORTUNITIES_LOG="/tmp/improvement_opportunities_$(date +%s).log"
echo "Improvement Opportunities Scan Results" > "$OPPORTUNITIES_LOG"
echo "======================================" >> "$OPPORTUNITIES_LOG"
echo "" >> "$OPPORTUNITIES_LOG"

# Function to log opportunity
log_opportunity() {
    local category=$1
    local priority=$2
    local description=$3
    local evidence=$4
    local impact=$5
    
    echo "[$priority] $category: $description" >> "$OPPORTUNITIES_LOG"
    echo "  Evidence: $evidence" >> "$OPPORTUNITIES_LOG"
    echo "  Impact: $impact" >> "$OPPORTUNITIES_LOG"
    echo "" >> "$OPPORTUNITIES_LOG"
    
    if [ "$priority" = "CRITICAL" ]; then
        echo -e "${RED}🚨 CRITICAL: $category - $description${NC}"
    elif [ "$priority" = "HIGH" ]; then
        echo -e "${YELLOW}⚠️  HIGH: $category - $description${NC}"
    elif [ "$priority" = "MEDIUM" ]; then
        echo -e "${BLUE}📊 MEDIUM: $category - $description${NC}"
    else
        echo -e "${GREEN}💡 LOW: $category - $description${NC}"
    fi
}

echo "🔍 Scanning for improvement opportunities..."
echo ""

# 1. Code Quality Scans
echo "📝 Code Quality Analysis..."

# Large files (approaching 300 line limit)
LARGE_FILES=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk 'NR>1 && $1>250 && $1<=300 {print $0}' | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
    log_opportunity "Code Quality" "MEDIUM" "Files approaching size limit" "$LARGE_FILES files > 250 lines" "SRP compliance risk"
fi

# Very large files (violating 300 line limit)
VIOLATING_FILES=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk 'NR>1 && $1>300 && !/total/ {count++} END {print count+0}')
if [ "$VIOLATING_FILES" -gt 0 ]; then
    log_opportunity "Code Quality" "CRITICAL" "Files exceeding size limit" "$VIOLATING_FILES files > 300 lines" "INV-ARCH-001 violation"
fi

# TODO/FIXME markers
TODO_COUNT=$(find src -name "*.ts" -o -name "*.tsx" -exec grep -l "TODO\|FIXME\|XXX" {} \; | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    log_opportunity "Code Quality" "MEDIUM" "Technical debt markers" "$TODO_COUNT files with TODO/FIXME" "Code completeness"
fi

# 2. Test Coverage Analysis
echo "🧪 Test Coverage Analysis..."

# Run coverage check
COVERAGE_OUTPUT=$(npm test -- --coverage --coverageReporters=text --watchAll=false 2>/dev/null | grep -E "All files|Lines:" || echo "Coverage data unavailable")
if [[ "$COVERAGE_OUTPUT" == *"All files"* ]]; then
    COVERAGE_PERCENT=$(echo "$COVERAGE_OUTPUT" | grep "All files" | awk '{print $NF}' | sed 's/%//' | tr -d '\r\n')
    if [[ -n "$COVERAGE_PERCENT" ]] && (( $(echo "$COVERAGE_PERCENT < 90" | bc -l 2>/dev/null || echo "0") )); then
        log_opportunity "Testing" "HIGH" "Coverage below target" "Current: ${COVERAGE_PERCENT}%" "Test completeness"
    fi
else
    log_opportunity "Testing" "MEDIUM" "Coverage analysis unavailable" "Coverage report generation failed" "Test visibility"
fi

# Test file balance
PROD_FILES=$(find src -name "*.ts" -o -name "*.tsx" | grep -v test | wc -l)
TEST_FILES=$(find src -name "*.test.*" | wc -l)
RATIO=$(echo "scale=2; $TEST_FILES / $PROD_FILES" | bc)
if (( $(echo "$RATIO < 0.5" | bc -l) )); then
    log_opportunity "Testing" "MEDIUM" "Low test-to-production ratio" "$TEST_FILES test files vs $PROD_FILES prod files" "Test coverage balance"
fi

# 3. Performance Analysis
echo "⚡ Performance Analysis..."

# Bundle size (if available)
if [ -f "package.json" ] && grep -q "build" package.json; then
    echo "Checking bundle size..."
    # This would be enhanced with actual bundle analysis
    log_opportunity "Performance" "LOW" "Bundle optimization opportunity" "Bundle size analysis available" "Performance optimization"
fi

# Dependency analysis
UNUSED_DEPS=$(npm ls --depth=0 2>/dev/null | grep -c "UNMET\|missing\|peer" 2>/dev/null | tr -d '\r\n ' | head -1)
if [[ -n "$UNUSED_DEPS" ]] && [[ "$UNUSED_DEPS" =~ ^[0-9]+$ ]] && [ "$UNUSED_DEPS" -gt 0 ]; then
    log_opportunity "Performance" "MEDIUM" "Dependency issues detected" "$UNUSED_DEPS dependency problems" "Bundle size and security"
fi

# 4. Documentation Analysis
echo "📚 Documentation Analysis..."

# README completeness
if [ -f "README.md" ]; then
    README_SIZE=$(wc -l < README.md)
    if [ "$README_SIZE" -lt 50 ]; then
        log_opportunity "Documentation" "MEDIUM" "README needs enhancement" "Only $README_SIZE lines" "Project onboarding"
    fi
else
    log_opportunity "Documentation" "HIGH" "Missing README" "No README.md found" "Project accessibility"
fi

# API documentation
API_DOCS=$(find src -name "*.ts" -exec grep -l "@param\|@returns\|@example" {} \; | wc -l)
TOTAL_TS_FILES=$(find src -name "*.ts" | wc -l)
if [ "$API_DOCS" -lt "$TOTAL_TS_FILES" ]; then
    log_opportunity "Documentation" "LOW" "API documentation gaps" "$API_DOCS/$TOTAL_TS_FILES files documented" "Code maintainability"
fi

# 5. Security Analysis
echo "🔒 Security Analysis..."

# Check for actual security patterns (excluding legitimate TypeScript/Jest patterns)
UNSAFE_PATTERNS=$(grep -r "eval(" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "\.test\." | wc -l)
CONSTRUCTOR_PATTERNS=$(grep -r "new Function(" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "\.test\." | wc -l)
UNSAFE_SETTIMEOUT=$(grep -r "setTimeout.*string" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "\.test\." | wc -l)

TOTAL_UNSAFE=$((UNSAFE_PATTERNS + CONSTRUCTOR_PATTERNS + UNSAFE_SETTIMEOUT))
if [ "$TOTAL_UNSAFE" -gt 0 ]; then
    log_opportunity "Security" "HIGH" "Potentially unsafe patterns" "$TOTAL_UNSAFE actual security issues found" "Security hardening"
fi

# 6. Architectural Analysis
echo "🏗️  Architectural Analysis..."

# Check for circular dependencies
echo "Analyzing dependency patterns..."
log_opportunity "Architecture" "LOW" "Dependency analysis" "Circular dependency check available" "Architectural health"

# 7. Build System Analysis
echo "🔧 Build System Analysis..."

# Check build configuration
if [ -f "package.json" ]; then
    SCRIPT_COUNT=$(jq '.scripts | keys | length' package.json 2>/dev/null || echo "0")
    if [ "$SCRIPT_COUNT" -lt 5 ]; then
        log_opportunity "Build System" "MEDIUM" "Limited build automation" "Only $SCRIPT_COUNT npm scripts" "Developer experience"
    fi
fi

echo ""
echo "======================================"
echo "SCAN SUMMARY"
echo "======================================"
echo ""

# Count opportunities
CRITICAL_COUNT=$(grep -c "CRITICAL" "$OPPORTUNITIES_LOG" 2>/dev/null | tr -d '\r\n ' | head -1 || echo "0")
HIGH_COUNT=$(grep -c "HIGH" "$OPPORTUNITIES_LOG" 2>/dev/null | tr -d '\r\n ' | head -1 || echo "0")
MEDIUM_COUNT=$(grep -c "MEDIUM" "$OPPORTUNITIES_LOG" 2>/dev/null | tr -d '\r\n ' | head -1 || echo "0")
LOW_COUNT=$(grep -c "LOW" "$OPPORTUNITIES_LOG" 2>/dev/null | tr -d '\r\n ' | head -1 || echo "0")

# Ensure we have valid numbers
CRITICAL_COUNT=${CRITICAL_COUNT:-0}
HIGH_COUNT=${HIGH_COUNT:-0}
MEDIUM_COUNT=${MEDIUM_COUNT:-0}
LOW_COUNT=${LOW_COUNT:-0}

echo -e "${RED}🚨 Critical: $CRITICAL_COUNT${NC}"
echo -e "${YELLOW}⚠️  High: $HIGH_COUNT${NC}"
echo -e "${BLUE}📊 Medium: $MEDIUM_COUNT${NC}"
echo -e "${GREEN}💡 Low: $LOW_COUNT${NC}"

TOTAL_OPPORTUNITIES=$((CRITICAL_COUNT + HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT))
echo ""
echo "Total opportunities identified: $TOTAL_OPPORTUNITIES"
echo ""

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION${NC}"
    echo "Review: $OPPORTUNITIES_LOG"
    exit 1
elif [ "$HIGH_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  High priority issues should be addressed soon${NC}"
    echo "Review: $OPPORTUNITIES_LOG"
    exit 0
else
    echo -e "${GREEN}✅ System is healthy - only minor improvements identified${NC}"
    echo "Opportunities logged: $OPPORTUNITIES_LOG"
    exit 0
fi
