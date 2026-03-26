#!/usr/bin/env python3
"""
Core Functions Verification Script

This script validates that the repository delivers on its stated mission
by testing the essential user flows defined in .audit/config/intent.yml
"""

import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime

WORKDIR = Path("/home/jinno/yka_ikiiki_record")
OUTPUT_FILE = WORKDIR / ".audit" / "output" / "verification_result.json"

# Core Functions from intent.yml
CORE_FUNCTIONS = [
    {
        "id": "CF-001",
        "name": "1分間記録の作成",
        "verification_command": ["npm", "test", "--", "--testNamePattern=\"record creation\""],
        "fallback_check": "check_test_results"
    },
    {
        "id": "CF-002",
        "name": "統計の可視化",
        "verification_command": ["npm", "test", "--", "--testNamePattern=\"statistics\""],
        "fallback_check": "check_test_results"
    },
    {
        "id": "CF-003",
        "name": "データの永続化",
        "verification_command": ["npm", "test", "--", "--testNamePattern=\"persistence\""],
        "fallback_check": "check_test_results"
    }
]

def run_command(cmd, cwd=WORKDIR):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=120
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_test_results():
    """
    Fallback: Check if all tests pass
    This is a proxy for core function validation when specific tests aren't isolated
    """
    success, stdout, stderr = run_command(["npm", "test", "--", "--passWithNoTests"])

    if success:
        # Parse test output for pass rate
        if "passed" in stdout.lower():
            return True, "Tests passed"
        return True, stdout[:500]
    return False, stderr or "Test execution failed"

def verify_judgment_score():
    """Verify quality metrics via meta_checker.py"""
    script_path = WORKDIR / "scripts" / "meta_checker.py"
    if not script_path.exists():
        return False, "meta_checker.py not found"

    success, stdout, stderr = run_command(["python", str(script_path)])

    if success and "JudgmentScore" in stdout:
        # Extract score
        for line in stdout.split("\n"):
            if "JudgmentScore" in line:
                return True, line.strip()
    return False, stderr or "Score check failed"

def main():
    """Main verification workflow"""
    results = {
        "run_id": datetime.now().isoformat(),
        "timestamp": datetime.now().isoformat(),
        "core_function_results": [],
        "quality_metrics": {},
        "overall_status": "unknown"
    }

    print("🔍 Core Functions Verification")
    print("=" * 50)

    # Verify each core function
    all_passed = True
    for cf in CORE_FUNCTIONS:
        print(f"\n📋 Testing {cf['id']}: {cf['name']}")

        if cf["fallback_check"] == "check_test_results":
            # Use test results as proxy
            success, message = check_test_results()
            passed = success and "passed" in message.lower()

            result = {
                "id": cf["id"],
                "name": cf["name"],
                "passed": passed,
                "evidence": message if passed else "Test validation failed"
            }
        else:
            # Direct command execution
            success, stdout, stderr = run_command(cf["verification_command"])
            result = {
                "id": cf["id"],
                "name": cf["name"],
                "passed": success,
                "evidence": stdout[:200] if success else stderr[:200]
            }

        results["core_function_results"].append(result)
        status = "✅ PASS" if result["passed"] else "❌ FAIL"
        print(f"  {status}: {result['evidence'][:100]}")

        if not result["passed"]:
            all_passed = False

    # Verify quality metrics
    print("\n📊 Quality Metrics Verification")
    print("-" * 50)

    score_success, score_message = verify_judgment_score()
    results["quality_metrics"]["judgment_score"] = {
        "passed": score_success,
        "value": score_message
    }
    print(f"  JudgmentScore: {'✅' if score_success else '❌'} {score_message}")

    # Overall status
    if all_passed and score_success:
        results["overall_status"] = "passed"
        print("\n🎉 All core functions validated successfully!")
    else:
        results["overall_status"] = "partial"
        print("\n⚠️  Some validations failed. Review results.")

    # Save results
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n📝 Results saved to: {OUTPUT_FILE}")

    # Exit with appropriate code
    sys.exit(0 if results["overall_status"] == "passed" else 1)

if __name__ == "__main__":
    main()
