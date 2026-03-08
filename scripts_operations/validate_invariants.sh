#!/bin/bash
# Invariant Validation Script - Milestone M2 Delivery
# Automated checks for all critical invariants defined in .concept/invariants.yml

set -e

echo "🔍 INVARIANT VALIDATION - Milestone M2+ (Test Files Governed)"
echo "=============================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track violations
VIOLATIONS=0
WARNINGS=0

# Function to check invariant
check_invariant() {
    local invariant_id=$1
    local invariant_name=$2
    local severity=$3
    local check_command=$4
    local threshold=$5

    echo "Checking $invariant_id: $invariant_name"
    result=$(eval "$check_command")

    if [ "$result" -gt "$threshold" ]; then
        if [ "$severity" = "CRITICAL" ]; then
            echo -e "${RED}❌ CRITICAL VIOLATION: $result violations (threshold: $threshold)${NC}"
            VIOLATIONS=$((VIOLATIONS + 1))
        else
            echo -e "${YELLOW}⚠️  WARNING: $result violations (threshold: $threshold)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${GREEN}✅ PASS: $result violations (threshold: $threshold)${NC}"
    fi
    echo ""
}

# INV-ARCH-001: Single Responsibility Enforcement
# ALL files must comply (including test files) - test file governance enforced
echo "🔍 INV-ARCH-001: Checking ALL files (including test files) for 300-line limit"
check_invariant \
    "INV-ARCH-001" \
    "Single_Responsibility_Enforcement" \
    "CRITICAL" \
    "find src -name '*.tsx' -o -name '*.ts' | xargs wc -l | awk 'NR>1 && \$1>300 && !/total/ {count++} END {print count+0}'" \
    "0"

# INV-ARCH-002: Layer Separation
check_invariant \
    "INV-ARCH-002" \
    "Layer_Separation" \
    "CRITICAL" \
    "grep -r 'from.*infrastructure' src/domain --include='*.ts' --include='*.tsx' | wc -l" \
    "0"

# INV-ARCH-003: Reference Based Options Propagation
check_invariant \
    "INV-ARCH-003" \
    "Reference_Based_Options_Propagation" \
    "CRITICAL" \
    "grep -r 'deepcopy(options)' src --include='*.ts' --include='*.tsx' | wc -l" \
    "0"

# INV-QUAL-001: No Logger Getter
check_invariant \
    "INV-QUAL-001" \
    "No_Logger_Getter" \
    "CRITICAL" \
    "grep -r 'logging.getLogger' src --include='*.ts' --include='*.tsx' | wc -l" \
    "0"

# INV-QUAL-002: Fixed Filename Policy
# Exclude build artifacts, cache, and temporary files
check_invariant \
    "INV-QUAL-002" \
    "Fixed_Filename_Policy" \
    "CRITICAL" \
    "find . -name '*_[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]*' ! -path './node_modules/*' ! -path './.git/*' ! -path './.jest-cache/*' ! -path './dist/*' ! -path './build/*' ! -name '*.cache' ! -name '*.map' | wc -l" \
    "0"

# INV-QUAL-003: Common Process Reuse (baseline check)
check_invariant \
    "INV-QUAL-003" \
    "Common_Process_Reuse" \
    "HIGH" \
    "grep -r 'CLIProcessor\|RateLimitAwareCLIProcessor' src --include='*.ts' --include='*.tsx' | wc -l" \
    "0"

# INV-WORK-002: Clean Git State
check_invariant \
    "INV-WORK-002" \
    "Clean_Git_State" \
    "MEDIUM" \
    "git status --porcelain | wc -l" \
    "0"

# Summary
echo "======================================"
echo "VALIDATION SUMMARY"
echo "======================================"

if [ $VIOLATIONS -gt 0 ]; then
    echo -e "${RED}❌ CRITICAL VIOLATIONS: $VIOLATIONS${NC}"
    echo "Action required: Fix all critical violations before commit"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}"
    echo "Recommendation: Address warnings in next iteration"
    exit 0
else
    echo -e "${GREEN}✅ ALL INVARIANTS PASSING - System is constitutionally compliant${NC}"
    exit 0
fi
