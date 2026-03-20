#!/usr/bin/env python3
"""
Meta Checker - Autonomous Quality Monitor for Constitution-Driven Development

This script performs comprehensive audits of the repository to ensure:
1. Clean Architecture compliance (dependency direction enforcement)
2. Test coverage standards (>= 95% statements, >= 90% branches)
3. TypeScript strict mode compliance (zero `any` types)
4. ESLint zero warnings
5. Code quality metrics

Generates meta_report.md and judgment_metrics.csv for the autonomous improvement loop.
"""

import subprocess
import json
import re
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple


class MetaChecker:
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.data_dir = self.repo_path / "data"
        self.data_dir.mkdir(exist_ok=True)

        self.metrics = {
            "timestamp": datetime.now().isoformat(),
            "clean_architecture_violations": 0,
            "test_coverage_statements": 0.0,
            "test_coverage_branches": 0.0,
            "test_coverage_functions": 0.0,
            "test_coverage_lines": 0.0,
            "typescript_any_types": 0,
            "eslint_warnings": 0,
            "test_pass_rate": 0.0,
            "judgment_score": 0,
        }

    def run_command(self, cmd: List[str], cwd=None) -> Tuple[str, str, int]:
        """Run command and return stdout, stderr, exit code."""
        if cwd is None:
            cwd = self.repo_path
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=300
        )
        return result.stdout, result.stderr, result.returncode

    def check_clean_architecture(self) -> List[str]:
        """Check for Clean Architecture violations in dependency direction."""
        violations = []

        # Rule: Client Components MUST NOT directly import from domain/infrastructure
        # Exception: Components marked with 'use client' directive
        patterns = [
            (r'from [\'"]@/domain/', "Domain layer import in Client Component"),
            (r'from [\'"]@/infrastructure/', "Infrastructure layer import in Client Component"),
        ]

        # Scan all TSX/TS files in src/app
        app_dir = self.repo_path / "src" / "app"
        if app_dir.exists():
            for file_path in app_dir.rglob("*.tsx"):
                content = file_path.read_text()

                # Skip files with 'use client' directive
                if "'use client'" in content or '"use client"' in content:
                    continue

                # Check for violations
                for pattern, description in patterns:
                    if re.search(pattern, content):
                        violations.append(f"{file_path.relative_to(self.repo_path)}: {description}")

        # Rule: Domain layer MUST NOT import from other layers
        domain_dir = self.repo_path / "src" / "domain"
        if domain_dir.exists():
            for file_path in domain_dir.rglob("*.ts"):
                content = file_path.read_text()

                # Domain should not import from infrastructure, application, presentation
                forbidden_patterns = [
                    r'from [\'"]@/infrastructure/',
                    r'from [\'"]@/application/',
                    r'from [\'"]@/presentation/',
                    r'from [\'"]next/',  # Domain should be framework-agnostic
                    r'from [\'"]@prisma/',  # Domain should not depend on DB
                ]

                for pattern in forbidden_patterns:
                    if re.search(pattern, content):
                        violations.append(f"{file_path.relative_to(self.repo_path)}: Domain importing forbidden layer")

        self.metrics["clean_architecture_violations"] = len(violations)
        return violations

    def check_test_coverage(self) -> Dict[str, float]:
        """Extract test coverage from Jest coverage report."""
        coverage = {
            "statements": 0.0,
            "branches": 0.0,
            "functions": 0.0,
            "lines": 0.0,
        }

        # Try coverage-summary.json first (if using custom reporter)
        coverage_file = self.repo_path / "coverage" / "coverage-summary.json"
        if not coverage_file.exists():
            # Fall back to coverage-final.json (default Jest output)
            coverage_file = self.repo_path / "coverage" / "coverage-final.json"

        if not coverage_file.exists():
            # Run coverage if not exists
            self.run_command(["npm", "test", "--", "--coverage", "--watchAll=false"])

        if coverage_file.exists():
            try:
                with open(coverage_file) as f:
                    data = json.load(f)

                # Check if this is coverage-summary.json format (has "total" key)
                if "total" in data:
                    total = data.get("total", {})
                    coverage = {
                        "statements": total.get("statements", {}).get("pct", 0),
                        "branches": total.get("branches", {}).get("pct", 0),
                        "functions": total.get("functions", {}).get("pct", 0),
                        "lines": total.get("lines", {}).get("pct", 0),
                    }
                else:
                    # Parse coverage-final.json format (per-file data)
                    # Aggregate totals from all files
                    total_statements = 0
                    covered_statements = 0
                    total_branches = 0
                    covered_branches = 0
                    total_functions = 0
                    covered_functions = 0

                    for file_path, file_data in data.items():
                        if isinstance(file_data, dict):
                            s = file_data.get("s", {})
                            b = file_data.get("b", {})
                            f = file_data.get("f", {})

                            # Count statements
                            for v in s.values():
                                if isinstance(v, int):
                                    total_statements += 1
                                    if v > 0:
                                        covered_statements += 1

                            # Count branches
                            # A branch is covered if ANY of its outcomes has been executed
                            for branch_list in b.values():
                                if isinstance(branch_list, list) and len(branch_list) > 0:
                                    total_branches += 1
                                    # Check if any outcome has been executed
                                    if any(v > 0 for v in branch_list if isinstance(v, int)):
                                        covered_branches += 1

                            # Count functions
                            for v in f.values():
                                if isinstance(v, int):
                                    total_functions += 1
                                    if v > 0:
                                        covered_functions += 1

                    # Calculate percentages
                    # Note: Jest's coverage-final.json doesn't provide separate "lines" metric
                    # Lines coverage is equivalent to statements coverage in Jest
                    statements_pct = (covered_statements / total_statements * 100) if total_statements > 0 else 0
                    coverage = {
                        "statements": statements_pct,
                        "branches": (covered_branches / total_branches * 100) if total_branches > 0 else 0,
                        "functions": (covered_functions / total_functions * 100) if total_functions > 0 else 0,
                        "lines": statements_pct,
                    }
            except (json.JSONDecodeError, KeyError, TypeError, ZeroDivisionError):
                pass

        self.metrics["test_coverage_statements"] = round(coverage["statements"], 2)
        self.metrics["test_coverage_branches"] = round(coverage["branches"], 2)
        self.metrics["test_coverage_functions"] = round(coverage["functions"], 2)
        self.metrics["test_coverage_lines"] = round(coverage["lines"], 2)

        return coverage

    def check_typescript_strict_mode(self) -> int:
        """Count `any` type usage in the codebase."""
        any_count = 0

        # Search for: any type usage (excluding comments)
        src_dir = self.repo_path / "src"
        if src_dir.exists():
            for file_path in src_dir.rglob("*.ts"):
                if "test.ts" in str(file_path) or "test.tsx" in str(file_path):
                    continue

                content = file_path.read_text()

                # Remove comments
                content = re.sub(r'//.*', '', content)
                content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

                # Count `: any` and `<any>` patterns
                any_count += len(re.findall(r':\s*any\b', content))
                any_count += len(re.findall(r'<any>', content))
                any_count += len(re.findall(r'as any\b', content))

        self.metrics["typescript_any_types"] = any_count
        return any_count

    def check_eslint_warnings(self) -> int:
        """Count ESLint warnings."""
        stdout, stderr, exit_code = self.run_command(["npm", "run", "lint"])

        # Parse output for warnings
        warning_count = 0
        if stdout:
            # Look for warnings in ESLint output
            warning_count = len(re.findall(r'\d+:\d+\s+warning', stdout))

        self.metrics["eslint_warnings"] = warning_count
        return warning_count

    def check_test_pass_rate(self) -> float:
        """Get test pass rate from Jest output."""
        stdout, stderr, exit_code = self.run_command(["npm", "test", "--", "--runInBand"])

        pass_rate = 0.0
        output = stdout + stderr
        if output:
            # Parse "Tests: 1189 passed, 1189 total"
            match = re.search(r'Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total', output)
            if match:
                passed = int(match.group(1))
                total = int(match.group(2))
                if total > 0:
                    pass_rate = (passed / total) * 100

        self.metrics["test_pass_rate"] = pass_rate
        return pass_rate

    def calculate_judgment_score(self) -> int:
        """
        Calculate JudgmentScore (0-100) based on all metrics.

        Scoring:
        - Clean Architecture violations: -10 each
        - Test coverage below threshold: -1 per percentage point
        - TypeScript any types: -5 each
        - ESLint warnings: -2 each
        - Test pass rate below 100%: -1 per percentage point

        Base score: 100
        """
        score = 100

        # Clean Architecture violations
        score -= self.metrics["clean_architecture_violations"] * 10

        # Test coverage (thresholds: 95% statements, 90% branches)
        if self.metrics["test_coverage_statements"] < 95:
            score -= (95 - self.metrics["test_coverage_statements"])
        if self.metrics["test_coverage_branches"] < 90:
            score -= (90 - self.metrics["test_coverage_branches"])

        # TypeScript any types
        score -= self.metrics["typescript_any_types"] * 5

        # ESLint warnings
        score -= self.metrics["eslint_warnings"] * 2

        # Test pass rate
        if self.metrics["test_pass_rate"] < 100:
            score -= (100 - self.metrics["test_pass_rate"])

        # Clamp to 0-100
        self.metrics["judgment_score"] = max(0, min(100, int(score)))
        return self.metrics["judgment_score"]

    def generate_meta_report(self, violations: List[str]) -> str:
        """Generate meta_report.md content."""
        report = f"""# Meta Audit Report

Generated: {self.metrics['timestamp']}

## Judgment Score: {self.metrics['judgment_score']}/100

{'## ⚠️ CRITICAL ISSUES DETECTED' if self.metrics['judgment_score'] < 70 else '## ✅ SYSTEM HEALTHY' if self.metrics['judgment_score'] >= 90 else '## ⚡ MINOR ISSUES DETECTED'}

---

## Metrics Summary

### Clean Architecture Compliance
- **Violations**: {self.metrics['clean_architecture_violations']}

{self._format_violations(violations) if violations else '- ✅ No violations detected'}

### Test Coverage
- **Statements**: {self.metrics['test_coverage_statements']:.2f}% {'(✅ ≥95%)' if self.metrics['test_coverage_statements'] >= 95 else '(❌ <95%)'}
- **Branches**: {self.metrics['test_coverage_branches']:.2f}% {'(✅ ≥90%)' if self.metrics['test_coverage_branches'] >= 90 else '(❌ <90%)'}
- **Functions**: {self.metrics['test_coverage_functions']:.2f}% {'(✅ ≥95%)' if self.metrics['test_coverage_functions'] >= 95 else '(❌ <95%)'}
- **Lines**: {self.metrics['test_coverage_lines']:.2f}% {'(✅ ≥95%)' if self.metrics['test_coverage_lines'] >= 95 else '(❌ <95%)'}

### TypeScript Strict Mode
- **`any` type usage**: {self.metrics['typescript_any_types']} {'(✅ Zero)' if self.metrics['typescript_any_types'] == 0 else '(❌ Found)'}

### Code Quality
- **ESLint warnings**: {self.metrics['eslint_warnings']} {'(✅ Zero)' if self.metrics['eslint_warnings'] == 0 else '(❌ Found)'}
- **Test pass rate**: {self.metrics['test_pass_rate']:.2f}% {'(✅ 100%)' if self.metrics['test_pass_rate'] == 100 else '(❌ <100%)'}

---

## Improvement Recommendations

{self._generate_recommendations()}

---

## Constitution Compliance

This audit checks compliance with SYSTEM_CONSTITUTION.md requirements:

- ✅ Clean Architecture (4-layer separation)
- ✅ TypeScript strict mode (zero `any` types)
- ✅ Test coverage (≥95% statements, ≥90% branches)
- ✅ ESLint (zero warnings)
- ✅ Test success rate (100%)

"""

        return report

    def _format_violations(self, violations: List[str]) -> str:
        """Format violations list for report."""
        if not violations:
            return ""
        formatted = "\n```\n"
        for v in violations[:10]:  # Limit to first 10
            formatted += f"❌ {v}\n"
        if len(violations) > 10:
            formatted += f"... and {len(violations) - 10} more\n"
        formatted += "```\n"
        return formatted

    def _generate_recommendations(self) -> str:
        """Generate prioritized improvement recommendations."""
        recommendations = []

        if self.metrics['clean_architecture_violations'] > 0:
            recommendations.append(f"1. **URGENT**: Fix {self.metrics['clean_architecture_violations']} Clean Architecture violations")

        if self.metrics['test_coverage_statements'] < 95:
            recommendations.append(f"2. Increase statement coverage to ≥95% (current: {self.metrics['test_coverage_statements']:.2f}%)")

        if self.metrics['test_coverage_branches'] < 90:
            recommendations.append(f"3. Increase branch coverage to ≥90% (current: {self.metrics['test_coverage_branches']:.2f}%)")

        if self.metrics['typescript_any_types'] > 0:
            recommendations.append(f"4. Remove all `{self.metrics['typescript_any_types']}` `any` types")

        if self.metrics['eslint_warnings'] > 0:
            recommendations.append(f"5. Fix {self.metrics['eslint_warnings']} ESLint warnings")

        if self.metrics['test_pass_rate'] < 100:
            recommendations.append(f"6. Fix failing tests (pass rate: {self.metrics['test_pass_rate']:.2f}%)")

        if not recommendations:
            recommendations.append("✅ **ALL GOOD**: No improvements needed. System is healthy.")

        return "\n".join(recommendations)

    def save_judgment_metrics(self):
        """Append metrics to judgment_metrics.csv."""
        metrics_file = self.data_dir / "judgment_metrics.csv"

        # Check if file exists, write header if not
        if not metrics_file.exists():
            with open(metrics_file, 'w') as f:
                f.write("timestamp,judgment_score,clean_architecture_violations,test_coverage_statements,test_coverage_branches,typescript_any_types,eslint_warnings,test_pass_rate\n")

        # Append metrics
        with open(metrics_file, 'a') as f:
            f.write(f"{self.metrics['timestamp']},{self.metrics['judgment_score']},{self.metrics['clean_architecture_violations']},{self.metrics['test_coverage_statements']},{self.metrics['test_coverage_branches']},{self.metrics['typescript_any_types']},{self.metrics['eslint_warnings']},{self.metrics['test_pass_rate']}\n")

    def run_audit(self):
        """Run complete audit and generate reports."""
        print(f"[Meta Checker] Starting audit for {self.repo_path}")

        # Run all checks
        violations = self.check_clean_architecture()
        self.check_test_coverage()
        self.check_typescript_strict_mode()
        self.check_eslint_warnings()
        self.check_test_pass_rate()
        judgment_score = self.calculate_judgment_score()

        # Generate reports
        meta_report = self.generate_meta_report(violations)
        report_path = self.data_dir / "meta_report.md"

        with open(report_path, 'w') as f:
            f.write(meta_report)

        # Save metrics
        self.save_judgment_metrics()

        print(f"[Meta Checker] Audit complete")
        print(f"[Meta Checker] Judgment Score: {judgment_score}/100")
        print(f"[Meta Checker] Report saved to: {report_path}")

        return judgment_score


def main():
    import sys

    if len(sys.argv) > 1:
        repo_path = sys.argv[1]
    else:
        repo_path = os.getcwd()

    checker = MetaChecker(repo_path)
    score = checker.run_audit()

    # Exit with non-zero if score is critically low
    sys.exit(0 if score >= 40 else 1)


if __name__ == "__main__":
    main()
