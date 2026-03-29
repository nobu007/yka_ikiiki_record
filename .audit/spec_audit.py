#!/usr/bin/env python3
"""
SPEC Integrity Auditor - 8-Axis Comprehensive Audit
Executes complete SPEC integrity evaluation with scoring
"""

import json
import re
import os
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Optional
from collections import defaultdict

# Configuration
WORKDIR = Path("/home/jinno/yka_ikiiki_record")
SPECS_DIR = WORKDIR / ".spec-workflow" / "specs"
AUDIT_DIR = WORKDIR / ".audit" / "spec"
RUNS_DIR = AUDIT_DIR / "runs"
CURRENT_DIR = RUNS_DIR / "current"
OLD_DIR = RUNS_DIR / "old"
SRC_DIR = WORKDIR / "src"

# Thresholds for each axis
THRESHOLDS = {
    "S-001": 12,  # 80% of 15
    "S-002": 12,  # 80% of 15
    "S-003": 12,  # 80% of 15
    "S-004": 12,  # 80% of 15
    "S-005": 12,  # 80% of 15
    "S-006": 8,   # 80% of 10
    "S-007": 4,   # 80% of 5
    "S-008": 8,   # 80% of 10
}

def extract_public_symbols() -> List[Dict]:
    """Extract public functions and classes from TypeScript/TSX files"""
    symbols = []

    for ts_file in SRC_DIR.rglob("*.ts"):
        if "node_modules" in str(ts_file) or ".next" in str(ts_file):
            continue

        try:
            content = ts_file.read_text(encoding="utf-8")
            rel_path = ts_file.relative_to(SRC_DIR)
            module_path = str(rel_path.with_suffix("")).replace("/", ".")

            # Extract exports
            exports = re.findall(
                r'export\s+(?:async\s+)?(?:function|const)\s+(\w+)',
                content
            )
            exports.extend(re.findall(r'export\s+class\s+(\w+)', content))
            exports.extend(re.findall(r'export\s+interface\s+(\w+)', content))
            exports.extend(re.findall(r'export\s+type\s+(\w+)', content))

            for export_name in exports:
                if not export_name.startswith("_"):
                    qualified_name = f"{module_path}.{export_name}"
                    symbols.append({
                        "type": "export",
                        "name": export_name,
                        "qualified_name": qualified_name,
                        "file": str(ts_file.relative_to(WORKDIR)),
                        "module": module_path
                    })
        except Exception as e:
            print(f"Warning: Could not read {ts_file}: {e}")

    return symbols

def load_all_specs() -> List[Dict]:
    """Load all SPEC files"""
    specs = []

    if not SPECS_DIR.exists():
        return specs

    for spec_dir in SPECS_DIR.iterdir():
        if not spec_dir.is_dir() or spec_dir.name.startswith("_"):
            continue

        spec_md = spec_dir / f"{spec_dir.name}_spec.md"
        if spec_md.exists():
            try:
                content = spec_md.read_text(encoding="utf-8")
                specs.append({
                    "name": spec_dir.name,
                    "dir": str(spec_dir),
                    "spec_file": str(spec_md.relative_to(WORKDIR)),
                    "content": content
                })
            except Exception as e:
                print(f"Warning: Could not read {spec_md}: {e}")

    return specs

def extract_section(content: str, pattern: str) -> Optional[str]:
    """Extract a section from markdown content"""
    match = re.search(rf'{pattern}.*?\n(.*?)(?=\n##|\Z)', content, re.DOTALL | re.IGNORECASE)
    return match.group(1) if match else None

def load_coverage_map() -> Dict:
    """Load the coverage map"""
    coverage_file = SPECS_DIR / "_coverage_map.yml"
    if coverage_file.exists():
        import yaml
        try:
            with open(coverage_file) as f:
                return yaml.safe_load(f) or {}
        except:
            pass
    return {}

def load_index() -> Dict:
    """Load the SPEC index"""
    index_file = SPECS_DIR / "_index.yml"
    if index_file.exists():
        import yaml
        try:
            with open(index_file) as f:
                return yaml.safe_load(f) or {}
        except:
            pass
    return {}

# ============================================================================
# S-001: SPEC Existence Check (15 points)
# ============================================================================

def calc_s001(symbols: List[Dict], specs: List[Dict], coverage_map: Dict) -> Dict:
    """S-001: SPEC Existence Check"""
    score = 0
    details = []

    # S-001-1: SPEC output directory exists (3 points)
    dir_exists = SPECS_DIR.exists()
    s001_1_score = 3 if dir_exists else 0
    score += s001_1_score
    details.append({
        "id": "S-001-1", "name": "SPEC出力ディレクトリ",
        "score": s001_1_score, "max": 3,
        "evidence": f"exists={dir_exists}"
    })

    # S-001-2: _index.yml consistency (3 points)
    index_data = load_index()
    if index_data and "specs" in index_data:
        indexed_specs = set(index_data["specs"].keys())
        actual_specs = {s["name"] for s in specs}
        consistency = len(indexed_specs & actual_specs) / max(len(indexed_specs | actual_specs), 1)
        s001_2_score = int(3 * consistency)
    else:
        s001_2_score = 0
    score += s001_2_score
    details.append({
        "id": "S-001-2", "name": "_index.yml整合性",
        "score": s001_2_score, "max": 3
    })

    # S-001-3: Public symbol coverage (9 points)
    covered = sum(1 for s in symbols if s["qualified_name"] in coverage_map)
    coverage_rate = covered / max(len(symbols), 1)
    s001_3_score = int(9 * coverage_rate)
    score += s001_3_score
    details.append({
        "id": "S-001-3", "name": "公開シンボルカバレッジ",
        "score": s001_3_score, "max": 9,
        "evidence": f"covered={covered}/{len(symbols)} ({coverage_rate:.0%})"
    })

    return {
        "axis": "S-001", "name": "SPEC存在確認",
        "score": score, "max_score": 15,
        "pass": score >= THRESHOLDS["S-001"], "details": details
    }

# ============================================================================
# S-002: I/O Strictness (15 points)
# ============================================================================

def calc_s002(specs: List[Dict]) -> Dict:
    """S-002: I/O Definition Strictness"""
    if not specs:
        return {"axis": "S-002", "name": "入出力定義の厳密性",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "SPECが存在しない"}]}

    score = 0
    details = []
    total_specs = len(specs)

    # S-002-1: Input parameter types (4 points)
    typed_params_rate = 0
    for spec in specs:
        input_section = extract_section(spec["content"], r"入力仕様|Input|Parameters")
        if input_section:
            rows = re.findall(r'\|[^|]+\|([^|]+)\|', input_section)
            typed = sum(1 for r in rows if r.strip() and r.strip() not in ["-", "型", "Type", ""])
            total = max(len(rows) - 1, 1)
            typed_params_rate += typed / total
    typed_params_rate /= max(total_specs, 1)
    s002_1_score = int(4 * typed_params_rate)
    score += s002_1_score
    details.append({"id": "S-002-1", "name": "入力型定義", "score": s002_1_score, "max": 4})

    # S-002-2: Input constraints (4 points)
    constraint_rate = 0
    for spec in specs:
        input_section = extract_section(spec["content"], r"入力仕様|Input|Parameters")
        if input_section:
            has_constraints = bool(re.search(
                r'(?:制約|constraint|範囲|range|>=|<=|>|<|必須|required)',
                input_section, re.I
            ))
            if has_constraints:
                constraint_rate += 1
    constraint_rate /= max(total_specs, 1)
    s002_2_score = int(4 * constraint_rate)
    score += s002_2_score
    details.append({"id": "S-002-2", "name": "入力制約定義", "score": s002_2_score, "max": 4})

    # S-002-3: Output type and constraints (4 points)
    output_rate = 0
    for spec in specs:
        output_section = extract_section(spec["content"], r"出力仕様|Output|Returns|戻り値")
        if output_section:
            has_type = bool(re.search(r'(?:型|type|Type|->)', output_section, re.I))
            has_constraint = bool(re.search(r'(?:制約|constraint|None|Optional|範囲)', output_section, re.I))
            output_rate += (0.5 if has_type else 0) + (0.5 if has_constraint else 0)
    output_rate /= max(total_specs, 1)
    s002_3_score = int(4 * output_rate)
    score += s002_3_score
    details.append({"id": "S-002-3", "name": "出力型・制約", "score": s002_3_score, "max": 4})

    # S-002-4: Preconditions and Postconditions (3 points)
    condition_rate = 0
    for spec in specs:
        has_pre = bool(re.search(r'前提条件|Precondition', spec["content"], re.I))
        has_post = bool(re.search(r'事後条件|Postcondition', spec["content"], re.I))
        condition_rate += (0.5 if has_pre else 0) + (0.5 if has_post else 0)
    condition_rate /= max(total_specs, 1)
    s002_4_score = int(3 * condition_rate)
    score += s002_4_score
    details.append({"id": "S-002-4", "name": "前提/事後条件", "score": s002_4_score, "max": 3})

    return {
        "axis": "S-002", "name": "入出力定義の厳密性",
        "score": score, "max_score": 15,
        "pass": score >= THRESHOLDS["S-002"], "details": details
    }

# ============================================================================
# S-003: Boundary Value Analysis (15 points)
# ============================================================================

def calc_s003(specs: List[Dict]) -> Dict:
    """S-003: Boundary Value Analysis"""
    if not specs:
        return {"axis": "S-003", "name": "境界値分析",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "SPECが存在しない"}]}

    score = 0
    details = []
    total_specs = len(specs)

    # S-003-1: Boundary section exists (3 points)
    bv_section_rate = sum(
        1 for s in specs
        if re.search(r'境界値|Boundary', s["content"], re.I)
    ) / max(total_specs, 1)
    s003_1_score = int(3 * bv_section_rate)
    score += s003_1_score
    details.append({"id": "S-003-1", "name": "境界値セクション存在", "score": s003_1_score, "max": 3})

    # S-003-2: Boundary case coverage (5 points)
    required_categories = ["最小", "最大", "ゼロ", "空", "min", "max", "zero", "empty"]
    category_coverage = 0
    for spec in specs:
        bv_section = extract_section(spec["content"], r"境界値|Boundary")
        if bv_section:
            found_categories = sum(
                1 for cat in required_categories
                if cat.lower() in bv_section.lower()
            )
            category_coverage += min(1.0, found_categories / 4)
    category_coverage /= max(total_specs, 1)
    s003_2_score = int(5 * min(1.0, category_coverage * 2))
    score += s003_2_score
    details.append({"id": "S-003-2", "name": "境界値網羅性", "score": s003_2_score, "max": 5})

    # S-003-3: boundary_values.yml exists (4 points)
    bv_yml_count = 0
    for spec in specs:
        bv_file = Path(spec["dir"]) / "boundary_values.yml"
        if bv_file.exists():
            try:
                import yaml
                with open(bv_file) as f:
                    bv_data = yaml.safe_load(f)
                    if bv_data:
                        bv_yml_count += 1
            except:
                pass
    bv_yml_rate = bv_yml_count / max(total_specs, 1)
    s003_3_score = int(4 * bv_yml_rate)
    score += s003_3_score
    details.append({"id": "S-003-3", "name": "boundary_values.yml", "score": s003_3_score, "max": 4})

    # S-003-4: Boundary rationale (3 points)
    rationale_rate = 0
    for spec in specs:
        bv_section = extract_section(spec["content"], r"境界値|Boundary")
        if bv_section:
            has_rationale = bool(re.search(r'根拠|Rationale|理由|Reason', bv_section, re.I))
            if has_rationale:
                rationale_rate += 1
    rationale_rate /= max(total_specs, 1)
    s003_4_score = int(3 * rationale_rate)
    score += s003_4_score
    details.append({"id": "S-003-4", "name": "境界値根拠", "score": s003_4_score, "max": 3})

    return {
        "axis": "S-003", "name": "境界値分析",
        "score": score, "max_score": 15,
        "pass": score >= THRESHOLDS["S-003"], "details": details
    }

# ============================================================================
# S-004: Error Scenario Coverage (15 points)
# ============================================================================

def calc_s004(specs: List[Dict]) -> Dict:
    """S-004: Error Scenario Coverage"""
    if not specs:
        return {"axis": "S-004", "name": "エラーシナリオ網羅性",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "SPECが存在しない"}]}

    score = 0
    details = []
    total_specs = len(specs)

    # S-004-1: Error scenario section (3 points)
    err_section_rate = sum(
        1 for s in specs
        if re.search(r'エラーシナリオ|Error.*Scenario|異常系|Error', s["content"], re.I)
    ) / max(total_specs, 1)
    s004_1_score = int(3 * err_section_rate)
    score += s004_1_score
    details.append({"id": "S-004-1", "name": "エラーセクション存在", "score": s004_1_score, "max": 3})

    # S-004-2: Exception types specified (4 points)
    exception_patterns = [
        r'TypeError', r'ValueError', r'Error', r'Exception'
    ]
    exception_type_rate = 0
    for spec in specs:
        err_section = extract_section(spec["content"], r"エラーシナリオ|Error|異常系")
        if err_section:
            found_types = sum(1 for p in exception_patterns if re.search(p, err_section))
            exception_type_rate += min(1.0, found_types / 2)
    exception_type_rate /= max(total_specs, 1)
    s004_2_score = int(4 * exception_type_rate)
    score += s004_2_score
    details.append({"id": "S-004-2", "name": "例外型明示", "score": s004_2_score, "max": 4})

    # S-004-3: error_scenarios.yml exists (4 points)
    err_yml_count = 0
    for spec in specs:
        err_file = Path(spec["dir"]) / "error_scenarios.yml"
        if err_file.exists():
            try:
                import yaml
                with open(err_file) as f:
                    err_data = yaml.safe_load(f)
                    if err_data:
                        err_yml_count += 1
            except:
                pass
    err_yml_rate = err_yml_count / max(total_specs, 1)
    s004_3_score = int(4 * err_yml_rate)
    score += s004_3_score
    details.append({"id": "S-004-3", "name": "error_scenarios.yml", "score": s004_3_score, "max": 4})

    # S-004-4: Edge case quality (4 points)
    advanced_edge_cases = [
        r'None', r'null', r'空', r'empty',
        r'並行|concurrent', r'リソース|resource',
        r'タイムアウト|timeout', r'権限|permission'
    ]
    edge_quality = 0
    for spec in specs:
        err_section = extract_section(spec["content"], r"エラーシナリオ|Error|異常系")
        if err_section:
            found = sum(1 for p in advanced_edge_cases if re.search(p, err_section, re.I))
            edge_quality += min(1.0, found / 3)
    edge_quality /= max(total_specs, 1)
    s004_4_score = int(4 * edge_quality)
    score += s004_4_score
    details.append({"id": "S-004-4", "name": "エッジケース品質", "score": s004_4_score, "max": 4})

    return {
        "axis": "S-004", "name": "エラーシナリオ網羅性",
        "score": score, "max_score": 15,
        "pass": score >= THRESHOLDS["S-004"], "details": details
    }

# ============================================================================
# S-005: Test-SPEC Mapping (15 points)
# ============================================================================

def calc_s005(specs: List[Dict]) -> Dict:
    """S-005: Test-SPEC Mapping"""
    if not specs:
        return {"axis": "S-005", "name": "テスト-SPEC対応率",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "SPECが存在しない"}]}

    score = 0
    details = []
    total_specs = len(specs)

    # S-005-1: Test case IDs referenced (5 points)
    spec_case_ids = []
    for spec in specs:
        spec_case_ids.extend(re.findall(r'(TC-\d+|BV-\d+|ERR-\d+)', spec["content"]))

    referenced_rate = min(1.0, len(spec_case_ids) / max(len(specs) * 3, 1))
    s005_1_score = int(5 * referenced_rate)
    score += s005_1_score
    details.append({"id": "S-005-1", "name": "テスト-SPECケース対応",
                     "score": s005_1_score, "max": 5,
                     "evidence": f"cases={len(spec_case_ids)}"})

    # S-005-2: Normal test coverage (4 points)
    normal_cases = sum(len(re.findall(r'TC-\d+', s["content"])) for s in specs)
    normal_rate = min(1.0, normal_cases / max(len(specs), 1))
    s005_2_score = int(4 * normal_rate)
    score += s005_2_score
    details.append({"id": "S-005-2", "name": "正常系カバレッジ", "score": s005_2_score, "max": 4})

    # S-005-3: Error test coverage (4 points)
    error_cases = sum(len(re.findall(r'ERR-\d+', s["content"])) for s in specs)
    error_rate = min(1.0, error_cases / max(len(specs), 1))
    s005_3_score = int(4 * error_rate)
    score += s005_3_score
    details.append({"id": "S-005-3", "name": "異常系カバレッジ", "score": s005_3_score, "max": 4})

    # S-005-4: test_matrix.yml exists (2 points)
    matrix_count = 0
    for spec in specs:
        matrix_file = Path(spec["dir"]) / "test_matrix.yml"
        if matrix_file.exists():
            matrix_count += 1
    matrix_rate = matrix_count / max(len(specs), 1)
    s005_4_score = int(2 * matrix_rate)
    score += s005_4_score
    details.append({"id": "S-005-4", "name": "test_matrix.yml", "score": s005_4_score, "max": 2})

    return {
        "axis": "S-005", "name": "テスト-SPEC対応率",
        "score": score, "max_score": 15,
        "pass": score >= THRESHOLDS["S-005"], "details": details
    }

# ============================================================================
# S-006: Constitution Compliance (10 points)
# ============================================================================

def calc_s006(specs: List[Dict]) -> Dict:
    """S-006: Constitution Compliance"""
    constitution_file = WORKDIR / "SYSTEM_CONSTITUTION.md"
    purpose_file = WORKDIR / "PURPOSE.md"

    constitution_exists = constitution_file.exists() and purpose_file.exists()

    if not constitution_exists or not specs:
        return {"axis": "S-006", "name": "憲法準拠性",
                "score": 0, "max_score": 10, "pass": False,
                "details": [{"note": "憲法またはSPECが存在しない"}]}

    constitution = constitution_file.read_text(encoding="utf-8")
    purpose = purpose_file.read_text(encoding="utf-8")

    score = 0
    details = []
    violations = []

    # S-006-1: Within scope (5 points)
    # Check for prohibitions
    prohibitions = re.findall(r'shall NOT:?\s*\n((?:\s*\d+\..+\n)+)', constitution, re.I)
    prohibition_keywords = []
    for section in prohibitions:
        items = re.findall(r'\d+\.\s+(.+)', section)
        for item in items:
            # Extract key terms
            words = re.findall(r'\b[A-Z][a-z]+\b', item)
            prohibition_keywords.extend(words)

    spec_violations = 0
    for spec in specs:
        for kw in prohibition_keywords[:5]:  # Check top 5
            if kw.lower() in spec["content"].lower():
                spec_violations += 1
                violations.append({
                    "spec": spec["name"],
                    "keyword": kw,
                    "severity": "warning"
                })
                break

    compliance_rate = 1 - (spec_violations / max(len(specs), 1))
    s006_1_score = int(5 * compliance_rate)
    score += s006_1_score
    details.append({"id": "S-006-1", "name": "責務範囲内", "score": s006_1_score, "max": 5})

    # S-006-2: No prohibited items (3 points)
    prohibited_libs = re.findall(r'(?:tensorflow|torch|sklearn|opencv)', constitution, re.I)
    lib_violations = sum(
        1 for spec in specs
        for lib in prohibited_libs
        if lib.lower() in spec["content"].lower()
    )
    s006_2_score = 3 if lib_violations == 0 else max(0, 3 - lib_violations)
    score += s006_2_score
    details.append({"id": "S-006-2", "name": "禁止事項非侵害", "score": s006_2_score, "max": 3})

    # S-006-3: Tech stack compliance (2 points)
    allowed_deps = re.findall(r'\*\*([A-Za-z]+)\*\*.*(?:allowed|許可)', constitution, re.I)
    s006_3_score = 2 if allowed_deps else 1
    score += s006_3_score
    details.append({"id": "S-006-3", "name": "技術スタック準拠", "score": s006_3_score, "max": 2})

    return {
        "axis": "S-006", "name": "憲法準拠性",
        "score": score, "max_score": 10,
        "pass": score >= THRESHOLDS["S-006"], "details": details,
        "violations": violations
    }

# ============================================================================
# S-007: Regression Test Design (5 points)
# ============================================================================

def calc_s007(specs: List[Dict]) -> Dict:
    """S-007: Regression Test Design"""
    if not specs:
        return {"axis": "S-007", "name": "回帰テスト設計",
                "score": 0, "max_score": 5, "pass": False,
                "details": [{"note": "SPECが存在しない"}]}

    score = 0
    details = []

    # S-007-1: Regression test section (2 points)
    regression_rate = sum(
        1 for s in specs
        if re.search(r'回帰テスト|Regression', s["content"], re.I)
    ) / max(len(specs), 1)
    s007_1_score = int(2 * regression_rate)
    score += s007_1_score
    details.append({"id": "S-007-1", "name": "回帰テストセクション", "score": s007_1_score, "max": 2})

    # S-007-2: Impact scope specified (2 points)
    impact_rate = sum(
        1 for s in specs
        if re.search(r'影響範囲|Impact|依存|import', s["content"], re.I)
    ) / max(len(specs), 1)
    s007_2_score = int(2 * impact_rate)
    score += s007_2_score
    details.append({"id": "S-007-2", "name": "影響範囲明示", "score": s007_2_score, "max": 2})

    # S-007-3: _coverage_map.yml exists (1 point)
    coverage_map_path = SPECS_DIR / "_coverage_map.yml"
    s007_3_score = 1 if coverage_map_path.exists() else 0
    score += s007_3_score
    details.append({"id": "S-007-3", "name": "_coverage_map.yml", "score": s007_3_score, "max": 1})

    return {
        "axis": "S-007", "name": "回帰テスト設計",
        "score": score, "max_score": 5,
        "pass": score >= THRESHOLDS["S-007"], "details": details
    }

# ============================================================================
# S-008: SPEC Freshness (10 points)
# ============================================================================

def calc_s008(specs: List[Dict], symbols: List[Dict]) -> Dict:
    """S-008: SPEC Freshness"""
    if not specs:
        return {"axis": "S-008", "name": "SPEC鮮度",
                "score": 0, "max_score": 10, "pass": False,
                "details": [{"note": "SPECが存在しない"}]}

    score = 0
    details = []

    # S-008-1: Update date validity (3 points)
    from datetime import datetime, timedelta
    fresh_count = 0
    for spec in specs:
        date_match = re.search(r'Last\s*Updated?:?\s*(\d{4}[-/]\d{2}[-/]\d{2})', spec["content"], re.I)
        if date_match:
            try:
                date_str = date_match.group(1).replace("/", "-")
                update_date = datetime.strptime(date_str, "%Y-%m-%d")
                days_since = (datetime.now() - update_date).days
                if days_since <= 90:
                    fresh_count += 1
            except ValueError:
                pass
    fresh_rate = fresh_count / max(len(specs), 1)
    s008_1_score = int(3 * fresh_rate)
    score += s008_1_score
    details.append({"id": "S-008-1", "name": "更新日妥当性", "score": s008_1_score, "max": 3})

    # S-008-2: Code signature match (4 points)
    sig_match_count = 0
    total_checked = 0
    for spec in specs:
        spec_target = re.search(r'SPEC:\s*(\S+)', spec["content"])
        if spec_target:
            qualified = spec_target.group(1)
            matching_sym = next((s for s in symbols if s["qualified_name"] == qualified), None)
            if matching_sym:
                total_checked += 1
                input_section = extract_section(spec["content"], r"入力仕様|Input|Parameters")
                if input_section:
                    sig_match_count += 1

    sig_rate = sig_match_count / max(total_checked, 1)
    s008_2_score = int(4 * sig_rate)
    score += s008_2_score
    details.append({"id": "S-008-2", "name": "シグネチャ一致", "score": s008_2_score, "max": 4,
                     "evidence": f"matched={sig_match_count}/{total_checked}"})

    # S-008-3: Version management (3 points)
    versioned = sum(
        1 for s in specs if re.search(r'Version?:?\s*\d+\.\d+', s["content"], re.I)
    )
    version_rate = versioned / max(len(specs), 1)
    s008_3_score = int(3 * version_rate)
    score += s008_3_score
    details.append({"id": "S-008-3", "name": "バージョン管理", "score": s008_3_score, "max": 3})

    return {
        "axis": "S-008", "name": "SPEC鮮度",
        "score": score, "max_score": 10,
        "pass": score >= THRESHOLDS["S-008"], "details": details
    }

# ============================================================================
# Main Audit Execution
# ============================================================================

def run_audit() -> Dict:
    """Execute the complete 8-axis audit"""
    print("=" * 80)
    print("SPEC整合性監査 - 8軸評価")
    print("=" * 80)

    # Phase 0-2: Collect data
    print("\n[Phase 0-2] データ収集中...")
    symbols = extract_public_symbols()
    specs = load_all_specs()
    coverage_map = load_coverage_map()

    print(f"  公開シンボル: {len(symbols)}")
    print(f"  SPEC文書: {len(specs)}")
    print(f"  カバレッジマップエントリ: {len(coverage_map)}")

    # Phase 3: Execute 8-axis evaluation
    print("\n[Phase 3] 8軸評価実行中...")
    results = {}
    results["S-001"] = calc_s001(symbols, specs, coverage_map)
    print(f"  S-001: {results['S-001']['score']}/15")

    results["S-002"] = calc_s002(specs)
    print(f"  S-002: {results['S-002']['score']}/15")

    results["S-003"] = calc_s003(specs)
    print(f"  S-003: {results['S-003']['score']}/15")

    results["S-004"] = calc_s004(specs)
    print(f"  S-004: {results['S-004']['score']}/15")

    results["S-005"] = calc_s005(specs)
    print(f"  S-005: {results['S-005']['score']}/15")

    results["S-006"] = calc_s006(specs)
    print(f"  S-006: {results['S-006']['score']}/10")

    results["S-007"] = calc_s007(specs)
    print(f"  S-007: {results['S-007']['score']}/5")

    results["S-008"] = calc_s008(specs, symbols)
    print(f"  S-008: {results['S-008']['score']}/10")

    # Phase 4: Verdict
    print("\n[Phase 4] 総合判定...")
    total_score = sum(r["score"] for r in results.values())
    max_score = sum(r["max_score"] for r in results.values())
    all_pass = all(r["pass"] for r in results.values())
    s001_above_threshold = results["S-001"]["score"] >= THRESHOLDS["S-001"]

    overall_pass = (total_score >= 80) and s001_above_threshold and all_pass

    verdict = {
        "total_score": total_score,
        "max_score": max_score,
        "percentage": round(total_score / max_score * 100, 1),
        "overall_pass": overall_pass,
        "s001_threshold_met": s001_above_threshold,
        "all_thresholds_met": all_pass,
        "failed_axes": [k for k, v in results.items() if not v["pass"]]
    }

    print(f"  総合スコア: {total_score}/{max_score} ({verdict['percentage']}%)")
    print(f"  判定: {'PASS ✅' if overall_pass else 'FAIL ❌'}")
    if verdict["failed_axes"]:
        print(f"  失敗軸: {', '.join(verdict['failed_axes'])}")

    # Phase 5: Generate revisions
    print("\n[Phase 5] SPEC更新案生成...")
    revisions = []
    for axis_id, result in results.items():
        if not result["pass"]:
            revision = {
                "id": f"REV-{axis_id}",
                "axis": axis_id,
                "axis_name": result["name"],
                "current_score": result["score"],
                "required_score": THRESHOLDS[axis_id],
                "gap": THRESHOLDS[axis_id] - result["score"],
                "type": classify_revision_type(axis_id),
                "details": result.get("details", []),
                "priority": "P0" if axis_id in ["S-001", "S-003", "S-004"] else "P1"
            }
            revisions.append(revision)
            print(f"  {revision['id']}: {revision['axis_name']} (+{revision['gap']}点必要)")

    # Phase 6: Update streak
    print("\n[Phase 6] 連続PASS管理...")
    streak_path = AUDIT_DIR / "streak.json"

    if streak_path.exists():
        streak = json.loads(streak_path.read_text(encoding="utf-8"))
    else:
        streak = {"consecutive_pass": 0, "total_audits": 0, "history": []}

    streak["total_audits"] += 1
    if verdict["overall_pass"]:
        streak["consecutive_pass"] += 1
    else:
        streak["consecutive_pass"] = 0

    streak["history"].append({
        "timestamp": datetime.now().isoformat(),
        "pass": verdict["overall_pass"],
        "score": verdict["total_score"]
    })
    streak["history"] = streak["history"][-10:]
    streak["spec_stable"] = streak["consecutive_pass"] >= 3

    streak_path.write_text(json.dumps(streak, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"  連続PASS: {streak['consecutive_pass']}回")
    print(f"  SPEC安定: {'はい' if streak.get('spec_stable') else 'いいえ'}")

    # Build final result
    audit_result = {
        "timestamp": datetime.now().isoformat(),
        "workdir": str(WORKDIR),
        "bootstrapped": False,
        "results": results,
        "verdict": verdict,
        "revisions": revisions,
        "streak": streak
    }

    return audit_result

def classify_revision_type(axis_id: str) -> str:
    """Classify revision type"""
    type_map = {
        "S-001": "spec_missing",
        "S-002": "io_definition_incomplete",
        "S-003": "boundary_analysis_insufficient",
        "S-004": "error_coverage_gap",
        "S-005": "test_spec_mismatch",
        "S-006": "constitution_violation",
        "S-007": "regression_design_missing",
        "S-008": "spec_stale",
    }
    return type_map.get(axis_id, "unknown")

def generate_summary(audit_result: Dict):
    """Generate summary markdown"""
    verdict = audit_result["verdict"]
    results = audit_result["results"]
    revisions = audit_result["revisions"]
    streak = audit_result["streak"]

    pass_icon = "✅" if verdict["overall_pass"] else "❌"

    lines = [
        "# SPEC整合性監査サマリ\n",
        f"**監査日時**: {audit_result['timestamp']}",
        f"**対象リポジトリ**: {audit_result['workdir']}\n",
        "## 総合結果\n",
        "| 指標 | 値 |",
        "|-----|-----|",
        f"| **総合判定** | {pass_icon} {'PASS' if verdict['overall_pass'] else 'FAIL'} |",
        f"| **スコア** | {verdict['total_score']}/{verdict['max_score']} ({verdict['percentage']}%) |",
        f"| **連続PASS** | {streak['consecutive_pass']}回 |",
        f"| **SPEC安定** | {'✅ 安定' if streak.get('spec_stable') else '⚠️ 不安定'} |\n",
        "## 各軸のスコア\n",
        "| 軸 | スコア | 閾値 | 判定 |",
        "|----|-------|------|------|",
    ]

    for axis_id in ["S-001", "S-002", "S-003", "S-004", "S-005", "S-006", "S-007", "S-008"]:
        result = results[axis_id]
        icon = "✅" if result["pass"] else "❌"
        threshold = THRESHOLDS[axis_id]
        lines.append(
            f"| {axis_id} {result['name']} | {result['score']}/{result['max_score']} "
            f"| {threshold} | {icon} {'PASS' if result['pass'] else 'FAIL'} |"
        )

    if revisions:
        lines.append("\n## SPEC更新案\n")
        for rev in revisions:
            lines.append(f"### {rev['id']}: {rev['axis_name']}\n")
            lines.append(f"- **タイプ**: {rev['type']}")
            lines.append(f"- **優先度**: {rev['priority']}")
            lines.append(f"- **現在スコア**: {rev['current_score']}")
            lines.append(f"- **必要スコア**: {rev['required_score']}")
            lines.append(f"- **ギャップ**: +{rev['gap']}点")
            lines.append("")

    return "\n".join(lines)

def main():
    """Main execution"""
    # Rotate runs
    print("[Phase 1] ローテーション実行...")
    if CURRENT_DIR.exists():
        if OLD_DIR.exists():
            import shutil
            shutil.rmtree(OLD_DIR)
        shutil.move(str(CURRENT_DIR), str(OLD_DIR))
    CURRENT_DIR.mkdir(parents=True, exist_ok=True)

    # Run audit
    audit_result = run_audit()

    # Save results
    print("\n[Phase 7] 結果保存中...")

    # Save main audit result
    result_file = CURRENT_DIR / "audit_result.json"
    result_file.write_text(
        json.dumps(audit_result, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    # Save individual scores
    scores_dir = CURRENT_DIR / "scores"
    scores_dir.mkdir(exist_ok=True)

    for axis_id, result in audit_result["results"].items():
        score_file = scores_dir / f"{axis_id.lower()}.score.json"
        score_file.write_text(
            json.dumps(result, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

    # Save verdict
    verdict_file = CURRENT_DIR / "verdict.json"
    verdict_file.write_text(
        json.dumps(audit_result["verdict"], indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    # Generate and save summary
    summary = generate_summary(audit_result)
    summary_file = CURRENT_DIR / "summary.md"
    summary_file.write_text(summary, encoding="utf-8")

    print(f"\n結果を保存しました:")
    print(f"  - {result_file}")
    print(f"  - {summary_file}")
    print(f"  - {verdict_file}")

    return audit_result

if __name__ == "__main__":
    main()
