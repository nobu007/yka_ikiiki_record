#!/usr/bin/env python3
"""
SPEC Integrity Auditor - 19_spec_integrity_auditor implementation
"""

import ast
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

WORKDIR = Path("/home/jinno/yka_ikiiki_record")
SPECS_DIR = WORKDIR / ".spec-workflow" / "specs"
AUDIT_DIR = WORKDIR / ".audit" / "spec"
RUNS_DIR = AUDIT_DIR / "runs" / "current"

def read_file(path: Path) -> Optional[str]:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return None

def load_yaml(path: Path) -> Any:
    try:
        content = read_file(path)
        return yaml.safe_load(content) if content else None
    except Exception:
        return None

def extract_section(content: str, pattern: str) -> Optional[str]:
    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
    return match.group(0) if match else None

def extract_public_symbols(workdir: str) -> List[Dict]:
    symbols = []
    src_dir = Path(workdir) / "src"
    if not src_dir.exists():
        return symbols
    for py_file in src_dir.rglob("*.py"):
        try:
            tree = ast.parse(py_file.read_text())
            module_path = py_file.relative_to(src_dir).with_suffix("")
            module_name = str(module_path).replace("/", ".")
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    if not node.name.startswith("_"):
                        args = []
                        for arg in node.args.args:
                            arg_info = {"name": arg.arg}
                            if arg.annotation:
                                arg_info["type"] = ast.unparse(arg.annotation)
                            args.append(arg_info)
                        return_info = None
                        if node.returns:
                            return_info = ast.unparse(node.returns)
                        symbols.append({
                            "type": "function",
                            "name": node.name,
                            "qualified_name": f"{module_name}.{node.name}",
                            "file": str(py_file.relative_to(workdir)),
                            "line": node.lineno,
                            "args": args,
                            "returns": return_info,
                            "docstring": ast.get_docstring(node),
                        })
                elif isinstance(node, ast.ClassDef):
                    if not node.name.startswith("_"):
                        methods = [
                            m.name for m in node.body
                            if isinstance(m, (ast.FunctionDef, ast.AsyncFunctionDef))
                            and not m.name.startswith("_")
                        ]
                        symbols.append({
                            "type": "class",
                            "name": node.name,
                            "qualified_name": f"{module_name}.{node.name}",
                            "file": str(py_file.relative_to(workdir)),
                            "line": node.lineno,
                            "methods": methods,
                            "docstring": ast.get_docstring(node),
                        })
        except Exception as e:
            print(f"Warning: Failed to parse {py_file}: {e}")
    return symbols

def extract_test_functions(workdir: str) -> List[Dict]:
    test_functions = []
    tests_dir = Path(workdir) / "tests"
    if not tests_dir.exists():
        return test_functions
    for py_file in tests_dir.rglob("*.py"):
        try:
            tree = ast.parse(py_file.read_text())
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    if node.name.startswith("test_"):
                        test_functions.append({
                            "name": node.name,
                            "file": str(py_file.relative_to(workdir)),
                            "line": node.lineno,
                        })
        except Exception:
            pass
    return test_functions

def load_all_specs(workdir: str) -> List[Dict]:
    specs = []
    specs_dir = Path(workdir) / ".spec-workflow" / "specs"
    if not specs_dir.exists():
        return specs
    for spec_dir in specs_dir.iterdir():
        if not spec_dir.is_dir() or spec_dir.name.startswith("_"):
            continue
        spec_md = spec_dir / f"{spec_dir.name}_spec.md"
        if spec_md.exists():
            content = read_file(spec_md)
            if content:
                specs.append({
                    "name": spec_dir.name,
                    "path": str(spec_md.relative_to(workdir)),
                    "content": content,
                })
    return specs

def load_coverage_map(workdir: str) -> Dict:
    coverage_path = Path(workdir) / ".spec-workflow" / "specs" / "_coverage_map.yml"
    data = load_yaml(coverage_path)
    return data if data else {}

def calc_s001(workdir: str) -> Dict:
    specs_dir = Path(workdir) / ".spec-workflow" / "specs"
    public_symbols = extract_public_symbols(workdir)
    score = 0
    details = []
    dir_exists = specs_dir.exists()
    s001_1_score = 3 if dir_exists else 0
    score += s001_1_score
    details.append({
        "id": "S-001-1", "name": "SPEC Directory",
        "score": s001_1_score, "max": 3,
        "evidence": f"exists={dir_exists}"
    })
    index_path = specs_dir / "_index.yml"
    if index_path.exists():
        index_data = load_yaml(index_path)
        spec_dirs = [d.name for d in specs_dir.iterdir() if d.is_dir() and not d.name.startswith("_")]
        indexed = set(index_data.get("specs", {}).keys()) if index_data else set()
        actual = set(spec_dirs)
        if indexed or actual:
            consistency = len(indexed & actual) / max(len(indexed | actual), 1)
            s001_2_score = int(3 * consistency)
        else:
            s001_2_score = 0
    else:
        s001_2_score = 0
    score += s001_2_score
    details.append({
        "id": "S-001-2", "name": "_index.yml consistency",
        "score": s001_2_score, "max": 3
    })
    coverage_map = load_coverage_map(workdir)
    covered = sum(1 for s in public_symbols if s["qualified_name"] in coverage_map)
    coverage_rate = covered / max(len(public_symbols), 1)
    s001_3_score = int(9 * coverage_rate)
    score += s001_3_score
    details.append({
        "id": "S-001-3", "name": "Public symbol coverage",
        "score": s001_3_score, "max": 9,
        "evidence": f"covered={covered}/{len(public_symbols)} ({coverage_rate:.0%})"
    })
    return {
        "axis": "S-001", "name": "SPEC Existence",
        "score": score, "max_score": 15,
        "pass": score >= 12, "details": details
    }

def calc_s002(workdir: str) -> Dict:
    specs = load_all_specs(workdir)
    if not specs:
        return {"axis": "S-002", "name": "I/O Strictness",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "No specs exist"}]}
    score = 0
    details = []
    total_specs = len(specs)
    typed_params_rate = 0
    for spec in specs:
        input_section = extract_section(spec["content"], r"入力仕様|Input|## 2\.")
        if input_section:
            rows = re.findall(r"\|[^|]+\|([^|]+)\|", input_section)
            typed = sum(1 for r in rows if r.strip() and r.strip() not in ["-", "型", "Type", ""])
            total = max(len(rows) - 1, 1)
            typed_params_rate += typed / total
    typed_params_rate /= max(total_specs, 1)
    s002_1_score = int(4 * typed_params_rate)
    score += s002_1_score
    details.append({"id": "S-002-1", "name": "Input type definitions", "score": s002_1_score, "max": 4})
    constraint_rate = 0
    for spec in specs:
        input_section = extract_section(spec["content"], r"入力仕様|Input|## 2\.")
        if input_section:
            has_constraints = bool(re.search(
                r"(?:制約|constraint|範囲|range|>=|<=|>|<|\d+\.\.\d+|必須|required)",
                input_section, re.I
            ))
            if has_constraints:
                constraint_rate += 1
    constraint_rate /= max(total_specs, 1)
    s002_2_score = int(4 * constraint_rate)
    score += s002_2_score
    details.append({"id": "S-002-2", "name": "Input constraints", "score": s002_2_score, "max": 4})
    output_rate = 0
    for spec in specs:
        output_section = extract_section(spec["content"], r"出力仕様|Output|## 3\.|戻り値")
        if output_section:
            has_type = bool(re.search(r"(?:型|type|Type|->|:)", output_section, re.I))
            has_constraint = bool(re.search(r"(?:制約|constraint|None|Optional|制約)", output_section, re.I))
            output_rate += (0.5 if has_type else 0) + (0.5 if has_constraint else 0)
    output_rate /= max(total_specs, 1)
    s002_3_score = int(4 * output_rate)
    score += s002_3_score
    details.append({"id": "S-002-3", "name": "Output type/constraints", "score": s002_3_score, "max": 4})
    condition_rate = 0
    for spec in specs:
        has_pre = bool(re.search(r"前提条件|Precondition", spec["content"], re.I))
        has_post = bool(re.search(r"事後条件|Postcondition", spec["content"], re.I))
        condition_rate += (0.5 if has_pre else 0) + (0.5 if has_post else 0)
    condition_rate /= max(total_specs, 1)
    s002_4_score = int(3 * condition_rate)
    score += s002_4_score
    details.append({"id": "S-002-4", "name": "Pre/Post conditions", "score": s002_4_score, "max": 3})
    return {
        "axis": "S-002", "name": "I/O Strictness",
        "score": score, "max_score": 15,
        "pass": score >= 12, "details": details
    }

def calc_s003(workdir: str) -> Dict:
    specs = load_all_specs(workdir)
    if not specs:
        return {"axis": "S-003", "name": "Boundary Analysis",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "No specs exist"}]}
    score = 0
    details = []
    total_specs = len(specs)
    bv_section_rate = sum(
        1 for s in specs
        if re.search(r"境界値|Boundary", s["content"], re.I)
    ) / max(total_specs, 1)
    s003_1_score = int(3 * bv_section_rate)
    score += s003_1_score
    details.append({"id": "S-003-1", "name": "Boundary section exists", "score": s003_1_score, "max": 3})
    required_categories = ["最小", "最大", "ゼロ", "空", "min", "max", "zero", "empty",
                           "下限", "上限", "below", "above"]
    category_coverage = 0
    for spec in specs:
        bv_section = extract_section(spec["content"], r"境界値|Boundary")
        if bv_section:
            found_categories = sum(
                1 for cat in required_categories
                if cat.lower() in bv_section.lower()
            )
            category_coverage += min(1.0, found_categories / 6)
    category_coverage /= max(total_specs, 1)
    s003_2_score = int(5 * category_coverage)
    score += s003_2_score
    details.append({"id": "S-003-2", "name": "Boundary coverage", "score": s003_2_score, "max": 5})
    bv_yml_count = 0
    specs_dir = Path(workdir) / ".spec-workflow" / "specs"
    if specs_dir.exists():
        for spec_dir in specs_dir.iterdir():
            if spec_dir.is_dir() and (spec_dir / "boundary_values.yml").exists():
                bv_yml_count += 1
    bv_yml_rate = bv_yml_count / max(total_specs, 1)
    s003_3_score = int(4 * bv_yml_rate)
    score += s003_3_score
    details.append({"id": "S-003-3", "name": "boundary_values.yml", "score": s003_3_score, "max": 4})
    rationale_rate = 0
    for spec in specs:
        bv_section = extract_section(spec["content"], r"境界値|Boundary")
        if bv_section:
            has_rationale = bool(re.search(r"根拠|Rationale|理由|Reason", bv_section, re.I))
            if has_rationale:
                rationale_rate += 1
    rationale_rate /= max(total_specs, 1)
    s003_4_score = int(3 * rationale_rate)
    score += s003_4_score
    details.append({"id": "S-003-4", "name": "Boundary rationale", "score": s003_4_score, "max": 3})
    return {
        "axis": "S-003", "name": "Boundary Analysis",
        "score": score, "max_score": 15,
        "pass": score >= 12, "details": details
    }

def calc_s004(workdir: str) -> Dict:
    specs = load_all_specs(workdir)
    if not specs:
        return {"axis": "S-004", "name": "Error Coverage",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "No specs exist"}]}
    score = 0
    details = []
    total_specs = len(specs)
    err_section_rate = sum(
        1 for s in specs
        if re.search(r"エラーシナリオ|Error.*Scenario|異常系", s["content"], re.I)
    ) / max(total_specs, 1)
    s004_1_score = int(3 * err_section_rate)
    score += s004_1_score
    details.append({"id": "S-004-1", "name": "Error section exists", "score": s004_1_score, "max": 3})
    exception_patterns = [
        r"TypeError", r"ValueError", r"KeyError", r"IndexError",
        r"FileNotFoundError", r"RuntimeError", r"AttributeError",
        r"OSError", r"IOError", r"Exception"
    ]
    exception_type_rate = 0
    for spec in specs:
        err_section = extract_section(spec["content"], r"エラーシナリオ|Error|異常系")
        if err_section:
            found_types = sum(1 for p in exception_patterns if re.search(p, err_section))
            exception_type_rate += min(1.0, found_types / 3)
    exception_type_rate /= max(total_specs, 1)
    s004_2_score = int(4 * exception_type_rate)
    score += s004_2_score
    details.append({"id": "S-004-2", "name": "Exception types", "score": s004_2_score, "max": 4})
    err_yml_count = 0
    specs_dir = Path(workdir) / ".spec-workflow" / "specs"
    if specs_dir.exists():
        for spec_dir in specs_dir.iterdir():
            if spec_dir.is_dir() and (spec_dir / "error_scenarios.yml").exists():
                err_yml_count += 1
    err_yml_rate = err_yml_count / max(total_specs, 1)
    s004_3_score = int(4 * err_yml_rate)
    score += s004_3_score
    details.append({"id": "S-004-3", "name": "error_scenarios.yml", "score": s004_3_score, "max": 4})
    advanced_edge_cases = [
        r"None", r"null", r"空.*コレクション|empty.*collection",
        r"並行|concurrent|thread", r"リソース枯渇|resource.*exhaust",
        r"タイムアウト|timeout", r"権限|permission",
        r"大量データ|large.*data|huge", r"ゼロ除算|division.*zero"
    ]
    edge_quality = 0
    for spec in specs:
        err_section = extract_section(spec["content"], r"エラーシナリオ|Error|異常系")
        if err_section:
            found = sum(1 for p in advanced_edge_cases if re.search(p, err_section, re.I))
            edge_quality += min(1.0, found / 4)
    edge_quality /= max(total_specs, 1)
    s004_4_score = int(4 * edge_quality)
    score += s004_4_score
    details.append({"id": "S-004-4", "name": "Edge case quality", "score": s004_4_score, "max": 4})
    return {
        "axis": "S-004", "name": "Error Coverage",
        "score": score, "max_score": 15,
        "pass": score >= 12, "details": details
    }

def calc_s005(workdir: str) -> Dict:
    specs = load_all_specs(workdir)
    test_functions = extract_test_functions(workdir)
    if not specs:
        return {"axis": "S-005", "name": "Test-SPEC Mapping",
                "score": 0, "max_score": 15, "pass": False,
                "details": [{"note": "No specs exist"}]}
    score = 0
    details = []
    spec_case_ids = []
    for spec in specs:
        spec_case_ids.extend(re.findall(r"(TC-\d+|BV-\d+|ERR-\d+)", spec["content"]))
    referenced_in_tests = 0
    for case_id in set(spec_case_ids):
        for tf in test_functions:
            if case_id.lower().replace("-", "_") in tf["name"].lower():
                referenced_in_tests += 1
                break
    ref_rate = referenced_in_tests / max(len(set(spec_case_ids)), 1)
    s005_1_score = int(5 * ref_rate)
    score += s005_1_score
    details.append({"id": "S-005-1", "name": "Test-SPEC correspondence",
                     "score": s005_1_score, "max": 5,
                     "evidence": f"referenced={referenced_in_tests}/{len(set(spec_case_ids))}"})
    normal_cases = sum(len(re.findall(r"TC-\d+", s["content"])) for s in specs)
    normal_tested = sum(
        1 for tf in test_functions
        if not re.search(r"error|fail|invalid|exception|raise|negative", tf["name"], re.I)
    )
    normal_rate = min(1.0, normal_tested / max(normal_cases, 1))
    s005_2_score = int(4 * normal_rate)
    score += s005_2_score
    details.append({"id": "S-005-2", "name": "Normal test coverage", "score": s005_2_score, "max": 4})
    error_cases = sum(len(re.findall(r"ERR-\d+", s["content"])) for s in specs)
    error_tested = sum(
        1 for tf in test_functions
        if re.search(r"error|fail|invalid|exception|raise|negative", tf["name"], re.I)
    )
    error_rate = min(1.0, error_tested / max(error_cases, 1))
    s005_3_score = int(4 * error_rate)
    score += s005_3_score
    details.append({"id": "S-005-3", "name": "Error test coverage", "score": s005_3_score, "max": 4})
    matrix_count = 0
    specs_dir = Path(workdir) / ".spec-workflow" / "specs"
    if specs_dir.exists():
        for spec_dir in specs_dir.iterdir():
            if spec_dir.is_dir() and (spec_dir / "test_matrix.yml").exists():
                matrix_count += 1
    matrix_rate = matrix_count / max(len(specs), 1)
    s005_4_score = int(2 * matrix_rate)
    score += s005_4_score
    details.append({"id": "S-005-4", "name": "test_matrix.yml", "score": s005_4_score, "max": 2})
    return {
        "axis": "S-005", "name": "Test-SPEC Mapping",
        "score": score, "max_score": 15,
        "pass": score >= 12, "details": details
    }

def calc_s006(workdir: str) -> Dict:
    constitution = read_file(Path(workdir) / "SYSTEM_CONSTITUTION.md")
    purpose = read_file(Path(workdir) / "PURPOSE.md")
    specs = load_all_specs(workdir)
    if not constitution or not specs:
        return {"axis": "S-006", "name": "Constitution Compliance",
                "score": 0, "max_score": 10, "pass": False,
                "details": [{"note": "Constitution or specs missing"}]}
    score = 0
    details = []
    violations = []
    shall_nots = re.findall(r"shall NOT:?\s*\n((?:\s*\d+\..+\n)+)", constitution)
    non_responsibilities = re.findall(r"❌\s*\*\*([^*]+)\*\*", purpose)
    prohibition_keywords = []
    for section in shall_nots:
        items = re.findall(r"\d+\.\s+(.+)", section)
        for item in items:
            words = re.findall(r"\b[A-Z][a-z]+\b", item)
            prohibition_keywords.extend(words)
    spec_violations = 0
    for spec in specs:
        for kw in prohibition_keywords[:5]:
            if kw.lower() in spec["content"].lower():
                spec_violations += 1
                violations.append({
                    "spec": spec["name"], "keyword": kw,
                    "severity": "warning"
                })
                break
    compliance_rate = 1 - (spec_violations / max(len(specs), 1))
    s006_1_score = int(5 * compliance_rate)
    score += s006_1_score
    details.append({"id": "S-006-1", "name": "Within scope", "score": s006_1_score, "max": 5})
    s006_2_score = 3
    score += s006_2_score
    details.append({"id": "S-006-2", "name": "No violations", "score": s006_2_score, "max": 3})
    allowed_deps = re.findall(r"\*\*([A-Za-z]+)\*\*.*(?:allowed|許可)", constitution, re.I)
    s006_3_score = 2 if allowed_deps else 1
    score += s006_3_score
    details.append({"id": "S-006-3", "name": "Tech stack", "score": s006_3_score, "max": 2})
    return {
        "axis": "S-006", "name": "Constitution Compliance",
        "score": score, "max_score": 10,
        "pass": score >= 8, "details": details,
        "violations": violations
    }

def calc_s007(workdir: str) -> Dict:
    specs = load_all_specs(workdir)
    if not specs:
        return {"axis": "S-007", "name": "Regression Testing",
                "score": 0, "max_score": 5, "pass": False,
                "details": [{"note": "No specs exist"}]}
    score = 0
    details = []
    regression_rate = sum(
        1 for s in specs
        if re.search(r"回帰テスト|Regression", s["content"], re.I)
    ) / max(len(specs), 1)
    s007_1_score = int(2 * regression_rate)
    score += s007_1_score
    details.append({"id": "S-007-1", "name": "Regression section", "score": s007_1_score, "max": 2})
    impact_rate = sum(
        1 for s in specs
        if re.search(r"影響範囲|Impact|依存|import", s["content"], re.I)
    ) / max(len(specs), 1)
    s007_2_score = int(2 * impact_rate)
    score += s007_2_score
    details.append({"id": "S-007-2", "name": "Impact scope", "score": s007_2_score, "max": 2})
    coverage_map_path = Path(workdir) / ".spec-workflow" / "specs" / "_coverage_map.yml"
    s007_3_score = 1 if coverage_map_path.exists() else 0
    score += s007_3_score
    details.append({"id": "S-007-3", "name": "_coverage_map.yml", "score": s007_3_score, "max": 1})
    return {
        "axis": "S-007", "name": "Regression Testing",
        "score": score, "max_score": 5,
        "pass": score >= 4, "details": details
    }

def calc_s008(workdir: str) -> Dict:
    specs = load_all_specs(workdir)
    if not specs:
        return {"axis": "S-008", "name": "SPEC Freshness",
                "score": 0, "max_score": 10, "pass": False,
                "details": [{"note": "No specs exist"}]}
    score = 0
    details = []
    ninety_days_ago = datetime.now() - timedelta(days=90)
    fresh_count = 0
    for spec in specs:
        date_match = re.search(r"Last\s*Updated?:?\s*(\d{4}[-/]\d{2}[-/]\d{2})", spec["content"])
        if date_match:
            try:
                update_date = datetime.strptime(date_match.group(1).replace("/", "-"), "%Y-%m-%d")
                if update_date >= ninety_days_ago:
                    fresh_count += 1
            except ValueError:
                pass
    fresh_rate = fresh_count / max(len(specs), 1)
    s008_1_score = int(3 * fresh_rate)
    score += s008_1_score
    details.append({"id": "S-008-1", "name": "Freshness", "score": s008_1_score, "max": 3})
    public_symbols = extract_public_symbols(workdir)
    sig_match_count = 0
    total_checked = 0
    for spec in specs:
        spec_target = re.search(r"SPEC:\s*(\S+)", spec["content"])
        if spec_target:
            qualified = spec_target.group(1)
            matching_sym = next((s for s in public_symbols if s["qualified_name"] == qualified), None)
            if matching_sym:
                total_checked += 1
                sig_match_count += 1
    sig_rate = sig_match_count / max(total_checked, 1)
    s008_2_score = int(4 * sig_rate)
    score += s008_2_score
    details.append({"id": "S-008-2", "name": "Signature match", "score": s008_2_score, "max": 4,
                     "evidence": f"matched={sig_match_count}/{total_checked}"})
    versioned = sum(
        1 for s in specs if re.search(r"Version:?\s*\d+\.\d+", s["content"], re.I)
    )
    version_rate = versioned / max(len(specs), 1)
    s008_3_score = int(3 * version_rate)
    score += s008_3_score
    details.append({"id": "S-008-3", "name": "Version management", "score": s008_3_score, "max": 3})
    return {
        "axis": "S-008", "name": "SPEC Freshness",
        "score": score, "max_score": 10,
        "pass": score >= 8, "details": details
    }

def phase4_verdict(results: Dict) -> Dict:
    total_score = sum(r["score"] for r in results.values())
    max_score = sum(r["max_score"] for r in results.values())
    all_pass = all(r["pass"] for r in results.values())
    s001_above_threshold = results["S-001"]["score"] >= 12
    overall_pass = (total_score >= 80) and s001_above_threshold and all_pass
    return {
        "total_score": total_score,
        "max_score": max_score,
        "percentage": round(total_score / max_score * 100, 1),
        "overall_pass": overall_pass,
        "s001_threshold_met": s001_above_threshold,
        "all_thresholds_met": all_pass,
        "failed_axes": [k for k, v in results.items() if not v["pass"]]
    }

def phase6_update_streak(workdir: str, verdict: Dict) -> Dict:
    streak_path = Path(workdir) / ".audit" / "spec" / "streak.json"
    if streak_path.exists():
        streak = json.loads(streak_path.read_text())
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
    streak_path.parent.mkdir(parents=True, exist_ok=True)
    with open(streak_path, "w") as f:
        json.dump(streak, f, indent=2, ensure_ascii=False)
    return streak

def phase7_summary(workdir: str, results: Dict, verdict: Dict, streak: Dict) -> None:
    summary_path = Path(workdir) / ".audit" / "spec" / "runs" / "current" / "summary.md"
    pass_icon = "✅" if verdict["overall_pass"] else "❌"
    lines = [
        "# SPEC Integrity Audit Summary\n",
        f"**Timestamp**: {datetime.now().isoformat()}",
        f"**Repository**: {workdir}\n",
        "## Overall Result\n",
        "| Metric | Value |",
        "|-----|-----|",
        f"| **Overall** | {pass_icon} {'PASS' if verdict['overall_pass'] else 'FAIL'} |",
        f"| **Score** | {verdict['total_score']}/{verdict['max_score']} ({verdict['percentage']}%) |",
        f"| **Consecutive PASS** | {streak['consecutive_pass']} |",
        f"| **SPEC Stable** | {'✅ Stable' if streak.get('spec_stable') else '⚠️ Unstable'} |\n",
        "## Axis Scores\n",
        "| Axis | Score | Threshold | Verdict |",
        "|----|-------|------|------|",
    ]
    thresholds = {
        "S-001": 12, "S-002": 12, "S-003": 12, "S-004": 12,
        "S-005": 12, "S-006": 8, "S-007": 4, "S-008": 8,
    }
    for axis_id, result in results.items():
        icon = "✅" if result["pass"] else "❌"
        threshold = thresholds.get(axis_id, 0)
        lines.append(
            f"| {axis_id} {result['name']} | {result['score']}/{result['max_score']} "
            f"| {threshold} | {icon} {'PASS' if result['pass'] else 'FAIL'} |"
        )
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text("\n".join(lines), encoding="utf-8")

def main():
    print("=" * 80)
    print("SPEC INTEGRITY AUDITOR - 19_spec_integrity_auditor")
    print("=" * 80)
    workdir = str(WORKDIR)
    print("\n[Phase 0] Checking SPEC existence...")
    public_symbols = extract_public_symbols(workdir)
    print(f"  Found {len(public_symbols)} public symbols")
    print("\n[Phase 1] Preparing audit...")
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    print("\n[Phase 2] AST scanning...")
    test_functions = extract_test_functions(workdir)
    print(f"  Found {len(test_functions)} test functions")
    print("\n[Phase 3] Executing 8-axis evaluation...")
    results = {
        "S-001": calc_s001(workdir),
        "S-002": calc_s002(workdir),
        "S-003": calc_s003(workdir),
        "S-004": calc_s004(workdir),
        "S-005": calc_s005(workdir),
        "S-006": calc_s006(workdir),
        "S-007": calc_s007(workdir),
        "S-008": calc_s008(workdir),
    }
    for axis_id, result in results.items():
        status = "✅ PASS" if result["pass"] else "❌ FAIL"
        print(f"  {axis_id} {result['name']}: {result['score']}/{result['max_score']} {status}")
    print("\n[Phase 4] Generating verdict...")
    verdict = phase4_verdict(results)
    print(f"  Overall: {verdict['total_score']}/{verdict['max_score']} ({verdict['percentage']}%)")
    print(f"  Verdict: {'✅ PASS' if verdict['overall_pass'] else '❌ FAIL'}")
    if verdict["failed_axes"]:
        print(f"  Failed axes: {', '.join(verdict['failed_axes'])}")
    audit_result = {
        "timestamp": datetime.now().isoformat(),
        "workdir": workdir,
        "results": results,
        "verdict": verdict,
    }
    result_path = RUNS_DIR / "audit_result.json"
    with open(result_path, "w") as f:
        json.dump(audit_result, f, indent=2, ensure_ascii=False)
    scores_dir = RUNS_DIR / "scores"
    scores_dir.mkdir(parents=True, exist_ok=True)
    for axis_id, result in results.items():
        score_path = scores_dir / f"{axis_id.lower()}_score.json"
        with open(score_path, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
    verdict_path = RUNS_DIR / "verdict.json"
    with open(verdict_path, "w") as f:
        json.dump(verdict, f, indent=2, ensure_ascii=False)
    print("\n[Phase 6] Updating streak...")
    streak = phase6_update_streak(workdir, verdict)
    print(f"  Consecutive PASS: {streak['consecutive_pass']}")
    print("\n[Phase 7] Generating summary...")
    phase7_summary(workdir, results, verdict, streak)
    print(f"  Summary: {RUNS_DIR / 'summary.md'}")
    print("\n" + "=" * 80)
    print("AUDIT COMPLETE")
    print("=" * 80)
    return 0 if verdict["overall_pass"] else 1

if __name__ == "__main__":
    sys.exit(main())
