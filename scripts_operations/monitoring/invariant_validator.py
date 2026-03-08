#!/usr/bin/env python3
"""
Invariant Validator - Automated checks for all critical invariants

This script validates the codebase against the invariants defined in
.concept/invariants.yml. It implements the automated checks specified in
the monitoring section.

Milestone: M2 - Invariant_Validation_Automation
"""

import subprocess
import sys
from pathlib import Path
from typing import List, Tuple


class InvariantCheck:
    """Represents a single invariant check"""

    def __init__(self, name: str, command: str, threshold: int, severity: str):
        self.name = name
        self.command = command
        self.threshold = threshold
        self.severity = severity
        self.actual = None
        self.passed = False

    def run(self) -> bool:
        """Execute the check command and return True if passed"""
        try:
            result = subprocess.run(
                self.command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            self.actual = int(result.stdout.strip())
            self.passed = self.actual <= self.threshold
            return self.passed
        except (subprocess.TimeoutExpired, ValueError) as e:
            print(f"❌ Error running {self.name}: {e}")
            self.passed = False
            return False


class InvariantValidator:
    """Main validator that runs all invariant checks"""

    def __init__(self):
        self.checks: List[InvariantCheck] = []
        self.project_root = Path.cwd()
        self._setup_checks()

    def _setup_checks(self):
        """Initialize all invariant checks from invariants.yml"""
        # CRITICAL: INV-ARCH-001 - Single Responsibility (300-line limit)
        self.checks.append(InvariantCheck(
            name="INV-ARCH-001: Single Responsibility (300-line limit)",
            command="find ./src -name '*.ts' -o -name '*.tsx' | while read f; do lines=$(wc -l < \"$f\"); if [ $lines -gt 300 ]; then echo \"$f: $lines\"; fi; done | wc -l",
            threshold=0,
            severity="CRITICAL"
        ))

        # CRITICAL: INV-ARCH-002 - Layer Separation (Domain <- Infrastructure)
        self.checks.append(InvariantCheck(
            name="INV-ARCH-002: Layer Separation (no domain->infrastructure imports)",
            command="grep -r 'from.*infrastructure' src/domain/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l",
            threshold=0,
            severity="CRITICAL"
        ))

        # CRITICAL: INV-ARCH-003 - Reference-based options (no deepcopy)
        self.checks.append(InvariantCheck(
            name="INV-ARCH-003: Reference-based options propagation",
            command="grep -r 'deepcopy\\|deepCopy\\|copy\\.deepCopy' src/ --include='*.ts' --include='*.tsx' --include='*.py' | wc -l",
            threshold=0,
            severity="CRITICAL"
        ))

        # CRITICAL: INV-QUAL-001 - No logging.getLogger
        self.checks.append(InvariantCheck(
            name="INV-QUAL-001: No logging.getLogger",
            command="grep -r 'logging.getLogger' src/ --include='*.ts' --include='*.tsx' --include='*.js' --include='*.py' | wc -l",
            threshold=0,
            severity="CRITICAL"
        ))

        # CRITICAL: INV-QUAL-002 - No timestamped filenames
        self.checks.append(InvariantCheck(
            name="INV-QUAL-002: No timestamped filenames",
            command="find . \\( -name '*_[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]*' -o -name '*_20[0-9][0-9]*' \\) "
                   "! -path '*/node_modules/*' ! -path '*/.git/*' ! -path '*/.jest-cache/*' "
                   "! -path '*/.next/*' ! -path '*/test-results/*' ! -path '*/playwright-report/*' "
                   "! -path '*/.pnpm/*' ! -path '*/coverage/*' | wc -l",
            threshold=0,
            severity="CRITICAL"
        ))

        # HIGH: INV-QUAL-003 - Common code reuse (baseline check)
        # Note: This is a Python-specific invariant. Frontend is TypeScript/React.
        # Threshold is 0 until Python processors are implemented.
        self.checks.append(InvariantCheck(
            name="INV-QUAL-003: Common code reuse baseline",
            command="grep -r 'CLIProcessor\\|RateLimitAwareCLIProcessor' src/ --include='*.py' | wc -l",
            threshold=0,  # No Python code exists yet
            severity="HIGH"
        ))

    def run_all_checks(self) -> Tuple[int, int, int]:
        """Run all checks and return (critical, high, medium) violation counts"""
        critical_failures = 0
        high_failures = 0
        medium_failures = 0

        print("🔍 Running Invariant Validator")
        print("=" * 80)

        for check in self.checks:
            check.run()
            status = "✅ PASS" if check.passed else "❌ FAIL"

            print(f"\n{status} {check.name}")
            print(f"   Severity: {check.severity}")
            print(f"   Actual: {check.actual} | Threshold: ≤{check.threshold}")

            if not check.passed:
                if check.severity == "CRITICAL":
                    critical_failures += 1
                elif check.severity == "HIGH":
                    high_failures += 1
                else:
                    medium_failures += 1

        return critical_failures, high_failures, medium_failures

    def print_summary(self, critical: int, high: int, medium: int):
        """Print final summary and exit with appropriate code"""
        print("\n" + "=" * 80)
        print("📊 INVARIANT VALIDATION SUMMARY")
        print("=" * 80)

        total_failures = critical + high + medium
        print(f"Critical Violations: {critical}")
        print(f"High Severity Violations: {high}")
        print(f"Medium Severity Violations: {medium}")
        print(f"Total Violations: {total_failures}")

        if critical > 0:
            print("\n🚨 CRITICAL INVARIANT VIOLATIONS DETECTED")
            print("   Action: BLOCK_COMMIT - Fix required before commit")
            sys.exit(1)
        elif high > 0:
            print("\n⚠️  HIGH SEVERITY VIOLATIONS DETECTED")
            print("   Action: WARN_REQUIRE_FIX - Fix strongly recommended")
            sys.exit(2)
        elif medium > 0:
            print("\n⚡ MEDIUM SEVERITY VIOLATIONS DETECTED")
            print("   Action: LOG_WARN - Address in next iteration")
            sys.exit(3)
        else:
            print("\n✅ ALL INVARIANTS SATISFIED")
            print("   System is in compliance with architectural constraints")
            sys.exit(0)


def main():
    """Main entry point"""
    validator = InvariantValidator()
    critical, high, medium = validator.run_all_checks()
    validator.print_summary(critical, high, medium)


if __name__ == "__main__":
    main()
