#!/usr/bin/env python3
"""
SPEC Integrity Auditor - 8-axis evaluation script
Evaluates SPEC documents against codebase, constitution, and tests
"""
import ast
import json
import re
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import subprocess

# Configuration
WORKDIR = Path("/home/jinno/yka_ikiiki_record")
SPECS_DIR = WORKDIR / ".spec-workflow" / "specs"
AUDIT_DIR = WORKDIR / ".audit" / "spec"
RUNS_DIR = AUDIT_DIR / "runs"
CURRENT_DIR = RUNS_DIR / "current"
OLD_DIR = RUNS_DIR / "old"
REVISIONS_DIR = AUDIT_DIR / "revisions"
PENDING_DIR = REVISIONS_DIR / "pending"

class SpecAuditor:
    def __init__(self, workdir: Path):
        self.workdir = workdir
        self.specs_dir = workdir / ".spec-workflow" / "specs"
        self.src_dir = workdir / "src"
        self.tests_dir = workdir / "tests"

    def extract_public_symbols(self) -> List[Dict]:
        """Extract public symbols from TypeScript codebase"""
        symbols = []
        ts_files = list(self.src_dir.rglob("*.ts")) + list(self.src_dir.rglob("*.tsx"))

        for ts_file in ts_files:
            try:
                content = ts_file.read_text(encoding='utf-8')
                rel_path = ts_file.relative_to(self.src_dir)

                # Extract exports
                # export function/functionName
                func_matches = re.finditer(
                    r'export\s+(?:async\s+)?function\s+(\w+)',
                    content
                )
                for match in func_matches:
                    func_name = match.group(1)
                    if not func_name.startswith('_'):
                        symbols.append({
                            "type": "function",
                            "name": func_name,
                            "qualified_name": f"{rel_path}.{func_name}",
                            "file": str(ts_file),
                            "line": content[:match.start()].count('\n') + 1,
                        })

                # export const constName = ...
                const_matches = re.finditer(
                    r'export\s+(?:const|let|var)\s+(\w+)',
                    content
                )
                for match in const_matches:
                    const_name = match.group(1)
                    if not const_name.startswith('_'):
                        symbols.append({
                            "type": "constant",
                            "name": const_name,
                            "qualified_name": f"{rel_path}.{const_name}",
                            "file": str(ts_file),
                            "line": content[:match.start()].count('\n') + 1,
                        })

                # export class ClassName
                class_matches = re.finditer(
                    r'export\s+class\s+(\w+)',
                    content
                )
                for match in class_matches:
                    class_name = match.group(1)
                    if not class_name.startswith('_'):
                        symbols.append({
                            "type": "class",
                            "name": class_name,
                            "qualified_name": f"{rel_path}.{class_name}",
                            "file": str(ts_file),
                            "line": content[:match.start()].count('\n') + 1,
                        })

                # export interface InterfaceName
                interface_matches = re.finditer(
                    r'export\s+interface\s+(\w+)',
                    content
                )
                for match in interface_matches:
                    interface_name = match.group(1)
                    if not interface_name.startswith('_'):
                        symbols.append({
                            "type": "interface",
                            "name": interface_name,
                            "qualified_name": f"{rel_path}.{interface_name}",
                            "file": str(ts_file),
                            "line": content[:match.start()].count('\n') + 1,
                        })

                # export type TypeName
                type_matches = re.finditer(
                    r'export\s+type\s+(\w+)',
                    content
                )
                for match in type_matches:
                    type_name = match.group(1)
                    if not type_name.startswith('_'):
                        symbols.append({
                            "type": "type",
                            "name": type_name,
                            "qualified_name": f"{rel_path}.{type_name}",
                            "file": str(ts_file),
                            "line": content[:match.start()].count('\n') + 1,
                        })

            except Exception as e:
                print(f"Warning: Could not parse {ts_file}: {e}")

        return symbols

    def extract_test_functions(self) -> List[Dict]:
        """Extract test functions from test files"""
        test_functions = []
        if not self.tests_dir.exists():
            return test_functions

        test_files = list(self.tests_dir.rglob("*.ts")) + list(self.tests_dir.rglob("*.tsx"))

        for test_file in test_files:
            try:
                content = test_file.read_text(encoding='utf-8')

                # test() or it() blocks
                test_matches = re.finditer(
                    r'(?:test|it|describe)\s*\(\s*["\']([^"\']+)["\']',
                    content
                )
                for match in test_matches:
                    test_name = match.group(1)
                    test_functions.append({
                        "name": test_name,
                        "file": str(test_file),
                        "line": content[:match.start()].count('\n') + 1,
                    })

            except Exception as e:
                print(f"Warning: Could not parse test file {test_file}: {e}")

        return test_functions

    def load_all_specs(self) -> List[Dict]:
        """Load all SPEC documents"""
        specs = []
        index_path = self.specs_dir / "_index.yml"

        if not index_path.exists():
            return specs

        import yaml
        try:
            index_data = yaml.safe_load(index_path.read_text())
            for spec_name, spec_info in index_data.get("specs", {}).items():
                spec_path = self.workdir / spec_info["path"]
                if spec_path.exists():
                    specs.append({
                        "name": spec_name,
                        "path": str(spec_path),
                        "content": spec_path.read_text(encoding='utf-8')
                    })
        except Exception as e:
            print(f"Warning: Could not load index: {e}")

        return specs

    def extract_section(self, content: str, pattern: str) -> Optional[str]:
        """Extract a section from SPEC content"""
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        return match.group(0) if match else None

    def calc_s001(self) -> Dict:
        """S-001: SPEC存在確認"""
        public_symbols = self.extract_public_symbols()
        specs = self.load_all_specs()

        score = 0
        details = []

        # S-001-1: ディレクトリ存在（3点）
        dir_exists = self.specs_dir.exists()
        s001_1_score = 3 if dir_exists else 0
        score += s001_1_score
        details.append({
            "id": "S-001-1", "name": "SPEC出力ディレクトリ",
            "score": s001_1_score, "max": 3,
            "evidence": f"exists={dir_exists}"
        })

        # S-001-2: _index.ymlの整合性（3点）
        index_path = self.specs_dir / "_index.yml"
        if index_path.exists():
            import yaml
            index_data = yaml.safe_load(index_path.read_text())
            spec_dirs = [d.name for d in self.specs_dir.iterdir() if d.is_dir() and not d.name.startswith('_')]
            indexed = set(index_data.get("specs", {}).keys())
            actual = set(spec_dirs)
            consistency = len(indexed & actual) / max(len(indexed | actual), 1)
            s001_2_score = int(3 * consistency)
        else:
            s001_2_score = 0
        score += s001_2_score
        details.append({
            "id": "S-001-2", "name": "_index.yml整合性",
            "score": s001_2_score, "max": 3
        })

        # S-001-3: 公開シンボルカバレッジ（9点）
        coverage_map_path = self.specs_dir / "_coverage_map.yml"
        covered_symbols = set()

        if coverage_map_path.exists():
            import yaml
            coverage_map = yaml.safe_load(coverage_map_path.read_text())
            covered_symbols = set(coverage_map.keys()) if coverage_map else set()

        covered = sum(1 for s in public_symbols if s["name"] in covered_symbols)
        coverage_rate = covered / max(len(public_symbols), 1)
        s001_3_score = int(9 * coverage_rate)
        score += s001_3_score
        details.append({
            "id": "S-001-3", "name": "公開シンボルカバレッジ",
            "score": s001_3_score, "max": 9,
            "evidence": f"covered={covered}/{len(public_symbols)} ({coverage_rate:.0%})"
        })

        return {
            "axis": "S-001", "name": "SPEC存在確認",
            "score": score, "max_score": 15,
            "pass": score >= 12, "details": details
        }

    def calc_s002(self) -> Dict:
        """S-002: 入出力定義の厳密性"""
        specs = self.load_all_specs()
        if not specs:
            return {"axis": "S-002", "name": "入出力定義の厳密性",
                    "score": 0, "max_score": 15, "pass": False,
                    "details": [{"note": "SPECが存在しない"}]}

        score = 0
        details = []
        total_specs = len(specs)

        # S-002-1: 入力パラメータの型定義（4点）
        typed_params_rate = 0
        for spec in specs:
            input_section = self.extract_section(spec["content"], r"入力仕様|Input|Properties")
            if input_section:
                rows = re.findall(r"\|[^|]+\|([^|]+)\|", input_section)
                typed = sum(1 for r in rows if r.strip() and r.strip() not in ["-", "型", "Type", ""])
                total = max(len(rows) - 1, 1)
                typed_params_rate += typed / total if total > 0 else 0
        typed_params_rate /= max(total_specs, 1)
        s002_1_score = int(4 * typed_params_rate)
        score += s002_1_score
        details.append({"id": "S-002-1", "name": "入力型定義", "score": s002_1_score, "max": 4})

        # S-002-2: 入力パラメータの制約定義（4点）
        constraint_rate = 0
        for spec in specs:
            input_section = self.extract_section(spec["content"], r"入力仕様|Input|Properties")
            if input_section:
                has_constraints = bool(re.search(
                    r"(?:制約|constraint|範囲|range|必須|required|>=|<=|>|<)", input_section, re.I
                ))
                if has_constraints:
                    constraint_rate += 1
        constraint_rate /= max(total_specs, 1)
        s002_2_score = int(4 * constraint_rate)
        score += s002_2_score
        details.append({"id": "S-002-2", "name": "入力制約定義", "score": s002_2_score, "max": 4})

        # S-002-3: 出力の型・制約定義（4点）
        output_rate = 0
        for spec in specs:
            output_section = self.extract_section(spec["content"], r"出力仕様|Output|Returns|Type")
            if output_section:
                has_type = bool(re.search(r"(?:型|type|Type|:)", output_section, re.I))
                has_constraint = bool(re.search(r"(?:制約|constraint|null|optional|必須)", output_section, re.I))
                output_rate += (0.5 if has_type else 0) + (0.5 if has_constraint else 0)
        output_rate /= max(total_specs, 1)
        s002_3_score = int(4 * output_rate)
        score += s002_3_score
        details.append({"id": "S-002-3", "name": "出力型・制約", "score": s002_3_score, "max": 4})

        # S-002-4: 前提条件・事後条件（3点）
        condition_rate = 0
        for spec in specs:
            has_pre = bool(re.search(r"前提条件|Precondition", spec["content"], re.I))
            has_post = bool(re.search(r"事後条件|Postcondition", spec["content"], re.I))
            condition_rate += (0.5 if has_pre else 0) + (0.5 if has_post else 0)
        condition_rate /= max(total_specs, 1)
        s002_4_score = int(3 * condition_rate)
        score += s002_4_score
        details.append({"id": "S-002-4", "name": "前提/事後条件", "score": s002_4_score, "max": 3})

        return {
            "axis": "S-002", "name": "入出力定義の厳密性",
            "score": score, "max_score": 15,
            "pass": score >= 12, "details": details
        }

    def calc_s003(self) -> Dict:
        """S-003: 境界値分析"""
        specs = self.load_all_specs()
        if not specs:
            return {"axis": "S-003", "name": "境界値分析",
                    "score": 0, "max_score": 15, "pass": False,
                    "details": [{"note": "SPECが存在しない"}]}

        score = 0
        details = []
        total_specs = len(specs)

        # S-003-1: 境界値セクションの存在（3点）
        bv_section_rate = sum(
            1 for s in specs
            if re.search(r"境界値|Boundary", s["content"], re.I)
        ) / max(total_specs, 1)
        s003_1_score = int(3 * bv_section_rate)
        score += s003_1_score
        details.append({"id": "S-003-1", "name": "境界値セクション存在", "score": s003_1_score, "max": 3})

        # S-003-2: 境界値ケースの網羅性（5点）
        required_categories = ["最小", "最大", "ゼロ", "空", "min", "max", "zero", "empty"]
        category_coverage = 0
        for spec in specs:
            bv_section = self.extract_section(spec["content"], r"境界値|Boundary")
            if bv_section:
                found_categories = sum(
                    1 for cat in required_categories
                    if cat.lower() in bv_section.lower()
                )
                category_coverage += found_categories / len(required_categories)
        category_coverage /= max(total_specs, 1)
        s003_2_score = int(5 * min(1.0, category_coverage * 2))
        score += s003_2_score
        details.append({"id": "S-003-2", "name": "境界値網羅性", "score": s003_2_score, "max": 5})

        # S-003-3: boundary_values.ymlの存在（4点）
        bv_yml_count = 0
        if self.specs_dir.exists():
            for spec_dir in self.specs_dir.iterdir():
                if spec_dir.is_dir() and (spec_dir / "boundary_values.yml").exists():
                    import yaml
                    try:
                        bv_data = yaml.safe_load((spec_dir / "boundary_values.yml").read_text())
                        if bv_data and len(bv_data) > 0:
                            bv_yml_count += 1
                    except:
                        pass
        bv_yml_rate = bv_yml_count / max(total_specs, 1)
        s003_3_score = int(4 * bv_yml_rate)
        score += s003_3_score
        details.append({"id": "S-003-3", "name": "boundary_values.yml", "score": s003_3_score, "max": 4})

        # S-003-4: 境界値の根拠明示（3点）
        rationale_rate = 0
        for spec in specs:
            bv_section = self.extract_section(spec["content"], r"境界値|Boundary")
            if bv_section:
                has_rationale = bool(re.search(r"根拠|Rationale|理由|Reason", bv_section, re.I))
                if has_rationale:
                    rationale_rate += 1
        rationale_rate /= max(total_specs, 1)
        s003_4_score = int(3 * rationale_rate)
        score += s003_4_score
        details.append({"id": "S-003-4", "name": "境界値根拠", "score": s003_4_score, "max": 3})

        return {
            "axis": "S-003", "name": "境界値分析",
            "score": score, "max_score": 15,
            "pass": score >= 12, "details": details
        }

    def calc_s004(self) -> Dict:
        """S-004: エラーシナリオ網羅性"""
        specs = self.load_all_specs()
        if not specs:
            return {"axis": "S-004", "name": "エラーシナリオ網羅性",
                    "score": 0, "max_score": 15, "pass": False,
                    "details": [{"note": "SPECが存在しない"}]}

        score = 0
        details = []
        total_specs = len(specs)

        # S-004-1: エラーシナリオセクション存在（3点）
        err_section_rate = sum(
            1 for s in specs
            if re.search(r"エラーシナリオ|Error.*Scenario|異常系", s["content"], re.I)
        ) / max(total_specs, 1)
        s004_1_score = int(3 * err_section_rate)
        score += s004_1_score
        details.append({"id": "S-004-1", "name": "エラーセクション存在", "score": s004_1_score, "max": 3})

        # S-004-2: 例外型の明示（4点）
        exception_type_rate = 0
        exception_patterns = [
            r"TypeError", r"ValueError", r"Error", r"Exception",
            r"throw", r"raise", r"invalid"
        ]
        for spec in specs:
            err_section = self.extract_section(spec["content"], r"エラーシナリオ|Error|異常系")
            if err_section:
                found_types = sum(1 for p in exception_patterns if re.search(p, err_section, re.I))
                exception_type_rate += min(1.0, found_types / 3)
        exception_type_rate /= max(total_specs, 1)
        s004_2_score = int(4 * exception_type_rate)
        score += s004_2_score
        details.append({"id": "S-004-2", "name": "例外型明示", "score": s004_2_score, "max": 4})

        # S-004-3: error_scenarios.ymlの存在（4点）
        err_yml_count = 0
        if self.specs_dir.exists():
            for spec_dir in self.specs_dir.iterdir():
                if spec_dir.is_dir() and (spec_dir / "error_scenarios.yml").exists():
                    import yaml
                    try:
                        err_data = yaml.safe_load((spec_dir / "error_scenarios.yml").read_text())
                        if err_data and len(err_data) > 0:
                            err_yml_count += 1
                    except:
                        pass
        err_yml_rate = err_yml_count / max(total_specs, 1)
        s004_3_score = int(4 * err_yml_rate)
        score += s004_3_score
        details.append({"id": "S-004-3", "name": "error_scenarios.yml", "score": s004_3_score, "max": 4})

        # S-004-4: エッジケースの質（4点）
        advanced_edge_cases = [
            r"null", r"undefined", r"empty",
            r"timeout", r"concurrent", r"大量"
        ]
        edge_quality = 0
        for spec in specs:
            err_section = self.extract_section(spec["content"], r"エラーシナリオ|Error|異常系")
            if err_section:
                found = sum(1 for p in advanced_edge_cases if re.search(p, err_section, re.I))
                edge_quality += min(1.0, found / 4)
        edge_quality /= max(total_specs, 1)
        s004_4_score = int(4 * edge_quality)
        score += s004_4_score
        details.append({"id": "S-004-4", "name": "エッジケース品質", "score": s004_4_score, "max": 4})

        return {
            "axis": "S-004", "name": "エラーシナリオ網羅性",
            "score": score, "max_score": 15,
            "pass": score >= 12, "details": details
        }

    def calc_s005(self) -> Dict:
        """S-005: テスト-SPEC対応率"""
        specs = self.load_all_specs()
        test_functions = self.extract_test_functions()

        if not specs:
            return {"axis": "S-005", "name": "テスト-SPEC対応率",
                    "score": 0, "max_score": 15, "pass": False,
                    "details": [{"note": "SPECが存在しない"}]}

        score = 0
        details = []

        # S-005-1: テスト関数とSPECケースの明示的対応（5点）
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
        details.append({"id": "S-005-1", "name": "テスト-SPECケース対応",
                         "score": s005_1_score, "max": 5,
                         "evidence": f"referenced={referenced_in_tests}/{len(set(spec_case_ids))}"})

        # S-005-2: 正常系テストカバレッジ（4点）
        normal_cases = sum(len(re.findall(r"TC-\d+", s["content"])) for s in specs)
        normal_tested = sum(
            1 for tf in test_functions
            if not re.search(r"error|fail|invalid|exception", tf["name"], re.I)
        )
        normal_rate = min(1.0, normal_tested / max(normal_cases, 1))
        s005_2_score = int(4 * normal_rate)
        score += s005_2_score
        details.append({"id": "S-005-2", "name": "正常系カバレッジ", "score": s005_2_score, "max": 4})

        # S-005-3: 異常系テストカバレッジ（4点）
        error_cases = sum(len(re.findall(r"ERR-\d+", s["content"])) for s in specs)
        error_tested = sum(
            1 for tf in test_functions
            if re.search(r"error|fail|invalid|exception", tf["name"], re.I)
        )
        error_rate = min(1.0, error_tested / max(error_cases, 1))
        s005_3_score = int(4 * error_rate)
        score += s005_3_score
        details.append({"id": "S-005-3", "name": "異常系カバレッジ", "score": s005_3_score, "max": 4})

        # S-005-4: test_matrix.ymlの存在（2点）
        matrix_count = 0
        if self.specs_dir.exists():
            for spec_dir in self.specs_dir.iterdir():
                if spec_dir.is_dir() and (spec_dir / "test_matrix.yml").exists():
                    matrix_count += 1
        matrix_rate = matrix_count / max(len(specs), 1)
        s005_4_score = int(2 * matrix_rate)
        score += s005_4_score
        details.append({"id": "S-005-4", "name": "test_matrix.yml", "score": s005_4_score, "max": 2})

        return {
            "axis": "S-005", "name": "テスト-SPEC対応率",
            "score": score, "max_score": 15,
            "pass": score >= 12, "details": details
        }

    def calc_s006(self) -> Dict:
        """S-006: 憲法準拠性"""
        constitution_path = self.workdir / "SYSTEM_CONSTITUTION.md"
        purpose_path = self.workdir / "PURPOSE.md"
        specs = self.load_all_specs()

        if not constitution_path.exists() or not specs:
            return {"axis": "S-006", "name": "憲法準拠性",
                    "score": 0, "max_score": 10, "pass": False,
                    "details": [{"note": "憲法またはSPECが存在しない"}]}

        constitution = constitution_path.read_text()
        purpose = purpose_path.read_text() if purpose_path.exists() else ""

        score = 0
        details = []

        # S-006-1: 責務範囲内のSPEC（5点）
        # Check if SPECs respect constitution constraints
        prohibition_keywords = re.findall(r"shall NOT\s*:?\s*\n((?:\s*\d+\..+\n)+)", constitution, re.I)
        non_responsibilities = re.findall(r"❌\s*\*\*([^*]+)\*\*", purpose)

        spec_violations = 0
        for spec in specs:
            for prohibition in prohibition_keywords:
                if prohibition.lower() in spec["content"].lower():
                    spec_violations += 1
                    break

        compliance_rate = 1 - (spec_violations / max(len(specs), 1))
        s006_1_score = int(5 * compliance_rate)
        score += s006_1_score
        details.append({"id": "S-006-1", "name": "責務範囲内", "score": s006_1_score, "max": 5})

        # S-006-2: 禁止事項の非侵害（3点）
        prohibited_libs = re.findall(
            r"(?:tensorflow|torch|sklearn|opencv|detectron)",
            constitution, re.I
        )
        lib_violations = sum(
            1 for spec in specs
            for lib in prohibited_libs
            if lib.lower() in spec["content"].lower()
        )
        s006_2_score = 3 if lib_violations == 0 else max(0, 3 - lib_violations)
        score += s006_2_score
        details.append({"id": "S-006-2", "name": "禁止事項非侵害", "score": s006_2_score, "max": 3})

        # S-006-3: 技術スタック準拠（2点）
        allowed_deps = re.findall(r"\*\*([A-Za-z]+)\*\*.*(?:allowed|許可)", constitution, re.I)
        s006_3_score = 2 if allowed_deps else 1
        score += s006_3_score
        details.append({"id": "S-006-3", "name": "技術スタック準拠", "score": s006_3_score, "max": 2})

        return {
            "axis": "S-006", "name": "憲法準拠性",
            "score": score, "max_score": 10,
            "pass": score >= 8, "details": details
        }

    def calc_s007(self) -> Dict:
        """S-007: 回帰テスト設計"""
        specs = self.load_all_specs()
        if not specs:
            return {"axis": "S-007", "name": "回帰テスト設計",
                    "score": 0, "max_score": 5, "pass": False,
                    "details": [{"note": "SPECが存在しない"}]}

        score = 0
        details = []

        # S-007-1: 回帰テスト要件セクション（2点）
        regression_rate = sum(
            1 for s in specs
            if re.search(r"回帰テスト|Regression", s["content"], re.I)
        ) / max(len(specs), 1)
        s007_1_score = int(2 * regression_rate)
        score += s007_1_score
        details.append({"id": "S-007-1", "name": "回帰テストセクション", "score": s007_1_score, "max": 2})

        # S-007-2: 影響範囲の明示（2点）
        impact_rate = sum(
            1 for s in specs
            if re.search(r"影響範囲|Impact|依存", s["content"], re.I)
        ) / max(len(specs), 1)
        s007_2_score = int(2 * impact_rate)
        score += s007_2_score
        details.append({"id": "S-007-2", "name": "影響範囲明示", "score": s007_2_score, "max": 2})

        # S-007-3: _coverage_map.ymlの存在（1点）
        coverage_map_path = self.specs_dir / "_coverage_map.yml"
        s007_3_score = 1 if coverage_map_path.exists() else 0
        score += s007_3_score
        details.append({"id": "S-007-3", "name": "_coverage_map.yml", "score": s007_3_score, "max": 1})

        return {
            "axis": "S-007", "name": "回帰テスト設計",
            "score": score, "max_score": 5,
            "pass": score >= 4, "details": details
        }

    def calc_s008(self) -> Dict:
        """S-008: SPEC鮮度"""
        specs = self.load_all_specs()
        if not specs:
            return {"axis": "S-008", "name": "SPEC鮮度",
                    "score": 0, "max_score": 10, "pass": False,
                    "details": [{"note": "SPECが存在しない"}]}

        score = 0
        details = []

        # S-008-1: 最終更新日の妥当性（3点）
        from datetime import datetime, timedelta
        fresh_count = 0
        for spec in specs:
            date_match = re.search(r"Last\s*Updated?:?\s*(\d{4}[-/]\d{2}[-/]\d{2})", spec["content"])
            if date_match:
                try:
                    update_date = datetime.strptime(date_match.group(1).replace("/", "-"), "%Y-%m-%d")
                    days_since = (datetime.now() - update_date).days
                    if days_since <= 90:
                        fresh_count += 1
                except ValueError:
                    pass
        fresh_rate = fresh_count / max(len(specs), 1)
        s008_1_score = int(3 * fresh_rate)
        score += s008_1_score
        details.append({"id": "S-008-1", "name": "更新日妥当性", "score": s008_1_score, "max": 3})

        # S-008-2: コードシグネチャ変更検知（4点）
        # Simplified: check if SPEC names match exported symbols
        public_symbols = self.extract_public_symbols()
        symbol_names = set(s["name"] for s in public_symbols)
        spec_names = set(s["name"] for s in specs)

        matched = len(symbol_names & spec_names)
        sig_rate = matched / max(len(spec_names), 1)
        s008_2_score = int(4 * sig_rate)
        score += s008_2_score
        details.append({"id": "S-008-2", "name": "シグネチャ一致", "score": s008_2_score, "max": 4,
                         "evidence": f"matched={matched}/{len(spec_names)}"})

        # S-008-3: バージョン管理（3点）
        versioned = sum(
            1 for s in specs if re.search(r"Version?:?\s*\d+\.\d+", s["content"], re.I)
        )
        version_rate = versioned / max(len(specs), 1)
        s008_3_score = int(3 * version_rate)
        score += s008_3_score
        details.append({"id": "S-008-3", "name": "バージョン管理", "score": s008_3_score, "max": 3})

        return {
            "axis": "S-008", "name": "SPEC鮮度",
            "score": score, "max_score": 10,
            "pass": score >= 8, "details": details
        }

    def run_full_audit(self) -> Dict:
        """Execute complete SPEC integrity audit"""
        print("[19] Starting SPEC Integrity Audit...")
        print(f"[19] Workdir: {self.workdir}")

        # Phase 0-2: Collect data
        print("[19] Phase 0-2: Collecting symbols and specs...")
        public_symbols = self.extract_public_symbols()
        print(f"[19]   Found {len(public_symbols)} public symbols")

        specs = self.load_all_specs()
        print(f"[19]   Loaded {len(specs)} SPEC documents")

        # Phase 3: 8-axis evaluation
        print("[19] Phase 3: Executing 8-axis evaluation...")
        results = {}
        results["S-001"] = self.calc_s001()
        print(f"[19]   S-001: {results['S-001']['score']}/{results['S-001']['max_score']}")
        results["S-002"] = self.calc_s002()
        print(f"[19]   S-002: {results['S-002']['score']}/{results['S-002']['max_score']}")
        results["S-003"] = self.calc_s003()
        print(f"[19]   S-003: {results['S-003']['score']}/{results['S-003']['max_score']}")
        results["S-004"] = self.calc_s004()
        print(f"[19]   S-004: {results['S-004']['score']}/{results['S-004']['max_score']}")
        results["S-005"] = self.calc_s005()
        print(f"[19]   S-005: {results['S-005']['score']}/{results['S-005']['max_score']}")
        results["S-006"] = self.calc_s006()
        print(f"[19]   S-006: {results['S-006']['score']}/{results['S-006']['max_score']}")
        results["S-007"] = self.calc_s007()
        print(f"[19]   S-007: {results['S-007']['score']}/{results['S-007']['max_score']}")
        results["S-008"] = self.calc_s008()
        print(f"[19]   S-008: {results['S-008']['score']}/{results['S-008']['max_score']}")

        # Phase 4: Verdict
        print("[19] Phase 4: Calculating verdict...")
        total_score = sum(r["score"] for r in results.values())
        max_score = sum(r["max_score"] for r in results.values())
        all_pass = all(r["pass"] for r in results.values())
        s001_above_threshold = results["S-001"]["score"] >= 12

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

        print(f"[19]   Verdict: {total_score}/{max_score} ({verdict['percentage']}%) - {'PASS' if overall_pass else 'FAIL'}")

        return {
            "timestamp": datetime.now().isoformat(),
            "workdir": str(self.workdir),
            "public_symbols_count": len(public_symbols),
            "specs_count": len(specs),
            "results": results,
            "verdict": verdict
        }

def main():
    workdir = Path("/home/jinno/yka_ikiiki_record")
    auditor = SpecAuditor(workdir)

    # Run full audit
    audit_result = auditor.run_full_audit()

    # Save results
    output_dir = Path("/home/jinno/yka_ikiiki_record/.audit/spec/runs/current")
    output_dir.mkdir(parents=True, exist_ok=True)

    with open(output_dir / "audit_result.json", "w") as f:
        json.dump(audit_result, f, indent=2, ensure_ascii=False)

    with open(output_dir / "verdict.json", "w") as f:
        json.dump(audit_result["verdict"], f, indent=2, ensure_ascii=False)

    print(f"\n[19] Audit complete. Results saved to {output_dir}")
    print(f"[19] Overall: {audit_result['verdict']['overall_pass']}")

    return 0 if audit_result["verdict"]["overall_pass"] else 1

if __name__ == "__main__":
    sys.exit(main())
