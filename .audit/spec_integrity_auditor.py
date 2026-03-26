#!/usr/bin/env python3
"""
SPEC Integrity Auditor (19_spec_integrity_auditor)
Evaluates codebase × constitution × purpose × concept × tests 5-way integrity
"""

import ast
import json
import re
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import yaml


@dataclass
class SymbolInfo:
    """Information about a public symbol (function/class)"""
    type: str  # 'function' | 'class' | 'interface' | 'type'
    name: str
    qualified_name: str
    file: str
    line: int
    args: List[Dict[str, str]]
    returns: Optional[str]
    docstring: Optional[str]
    exports: List[str]


@dataclass
class ScoreResult:
    """Result of an evaluation axis"""
    axis: str
    name: str
    score: int
    max_score: int
    passed: bool
    details: List[Dict]


class TypeScriptExtractor:
    """Extract public symbols from TypeScript/TSX files"""

    def __init__(self, workdir: str):
        self.workdir = Path(workdir)
        self.src_dir = self.workdir / "src"

    def extract_public_symbols(self) -> List[SymbolInfo]:
        """Extract all public functions, classes, interfaces, types from src/"""
        symbols = []

        for ts_file in self.src_dir.rglob("*.ts"):
            if "test" in ts_file.name or "setup" in ts_file.name:
                continue
            symbols.extend(self._extract_from_file(ts_file))

        for tsx_file in self.src_dir.rglob("*.tsx"):
            if "test" in tsx_file.name or "setup" in tsx_file.name:
                continue
            symbols.extend(self._extract_from_file(tsx_file))

        return symbols

    def _extract_from_file(self, file_path: Path) -> List[SymbolInfo]:
        """Extract symbols from a single file using regex-based parsing"""
        symbols = []
        content = file_path.read_text(encoding="utf-8")
        module_path = file_path.relative_to(self.src_dir).with_suffix("")
        module_name = str(module_path).replace("/", ".")

        # Extract exports
        exports = re.findall(r'export\s+(?:const|function|class|interface|type|enum)\s+(\w+)', content)
        exports.extend(re.findall(r'export\s+\{[^}]+\}', content))

        # Extract function declarations: export function name(args): return_type
        func_pattern = r'export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([\w<>\[\]|&]+))?'
        for match in re.finditer(func_pattern, content):
            name = match.group(1)
            args_str = match.group(2) or ""
            return_type = match.group(3)

            # Skip if starts with underscore (private)
            if name.startswith("_"):
                continue

            args = self._parse_args(args_str)

            symbols.append(SymbolInfo(
                type="function",
                name=name,
                qualified_name=f"{module_name}.{name}",
                file=str(file_path.relative_to(self.workdir)),
                line=self._get_line_number(match, content),
                args=args,
                returns=return_type,
                docstring=self._extract_docstring(match, content),
                exports=exports
            ))

        # Extract arrow function exports: export const name = (args): type =>
        arrow_pattern = r'export\s+(?:const|let|var)\s+(\w+)\s*(?:<[^>]+>)?\s*=\s*(?:\(([^)]*)\)|([^=>=]+))\s*=>'
        for match in re.finditer(arrow_pattern, content):
            name = match.group(1)
            if name.startswith("_") or name.upper() == name:  # Skip constants
                continue

            args_str = match.group(2) or match.group(3) or ""
            args = self._parse_args(args_str)

            # Try to find return type from the arrow function
            return_match = re.search(r':\s*([\w<>\[\]|&\{\}]+)\s*=>', content[match.start():match.start()+100])
            return_type = return_match.group(1) if return_match else None

            symbols.append(SymbolInfo(
                type="function",
                name=name,
                qualified_name=f"{module_name}.{name}",
                file=str(file_path.relative_to(self.workdir)),
                line=self._get_line_number(match, content),
                args=args,
                returns=return_type,
                docstring=self._extract_docstring(match, content),
                exports=exports
            ))

        # Extract class declarations: export class Name
        class_pattern = r'export\s+(?:abstract\s+)?class\s+(\w+)(?:\s*<[^>]+>)?(?:\s+extends\s+(\w+))?'
        for match in re.finditer(class_pattern, content):
            name = match.group(1)
            if name.startswith("_"):
                continue

            # Extract methods from the class
            class_content = self._extract_class_body(match, content)
            methods = re.findall(r'(?:public|protected|private)?\s*(\w+)\s*(?:<[^>]+>)?\(([^)]*)\)', class_content)
            public_methods = [m for m in methods if not m[0].startswith("_")]

            symbols.append(SymbolInfo(
                type="class",
                name=name,
                qualified_name=f"{module_name}.{name}",
                file=str(file_path.relative_to(self.workdir)),
                line=self._get_line_number(match, content),
                args=[{"name": m[0], "type": m[1]} for m in public_methods],
                returns=None,
                docstring=self._extract_docstring(match, content),
                exports=exports
            ))

        # Extract interface declarations: export interface Name
        interface_pattern = r'export\s+interface\s+(\w+)(?:\s*<[^>]+>)?(?:\s+extends\s+([\w,\s&]+))?'
        for match in re.finditer(interface_pattern, content):
            name = match.group(1)
            if name.startswith("_"):
                continue

            symbols.append(SymbolInfo(
                type="interface",
                name=name,
                qualified_name=f"{module_name}.{name}",
                file=str(file_path.relative_to(self.workdir)),
                line=self._get_line_number(match, content),
                args=[],
                returns=None,
                docstring=self._extract_docstring(match, content),
                exports=exports
            ))

        # Extract type declarations: export type Name
        type_pattern = r'export\s+(?:type)\s+(\w+)(?:\s*<[^>]+>)?\s*='
        for match in re.finditer(type_pattern, content):
            name = match.group(1)
            if name.startswith("_"):
                continue

            symbols.append(SymbolInfo(
                type="type",
                name=name,
                qualified_name=f"{module_name}.{name}",
                file=str(file_path.relative_to(self.workdir)),
                line=self._get_line_number(match, content),
                args=[],
                returns=None,
                docstring=self._extract_docstring(match, content),
                exports=exports
            ))

        # Extract React components (export const Component = ...)
        component_pattern = r'export\s+(?:const)\s+([A-Z]\w+)\s*=\s*(?:React\.memo\()?(?:\(([^)]*)\)|\{([^}]+)\})?\s*=>'
        for match in re.finditer(component_pattern, content):
            name = match.group(1)
            if name.startswith("_"):
                continue

            props_str = match.group(2) or match.group(3) or ""
            args = self._parse_args(props_str) if props_str else []

            symbols.append(SymbolInfo(
                type="component",
                name=name,
                qualified_name=f"{module_name}.{name}",
                file=str(file_path.relative_to(self.workdir)),
                line=self._get_line_number(match, content),
                args=args,
                returns="JSX.Element",
                docstring=self._extract_docstring(match, content),
                exports=exports
            ))

        return symbols

    def _parse_args(self, args_str: str) -> List[Dict[str, str]]:
        """Parse function arguments string"""
        args = []
        if not args_str or args_str.strip() == "":
            return args

        # Split by comma, but handle nested generics and objects
        parts = [p.strip() for p in args_str.split(",")]
        for part in parts:
            if not part:
                continue

            # Parse: name: type or name?: type
            arg_match = re.match(r'(\w+)(\?)?:\s*(.+)', part)
            if arg_match:
                args.append({
                    "name": arg_match.group(1),
                    "type": arg_match.group(3),
                    "optional": arg_match.group(2) == "?"
                })
            elif re.match(r'^\w+$', part):
                args.append({"name": part, "type": "any", "optional": False})

        return args

    def _get_line_number(self, match: re.Match, content: str) -> int:
        """Get line number of a regex match"""
        return content[:match.start()].count("\n") + 1

    def _extract_docstring(self, match: re.Match, content: str) -> Optional[str]:
        """Extract JSDoc comment before a symbol"""
        before = content[:match.start()]

        # Look for JSDoc comment /** ... */
        jsdoc_match = re.search(r'/\*\*\s*(.*?)\s*\*/', before[-500:])
        if jsdoc_match:
            return jsdoc_match.group(1).strip()

        # Look for regular comment // ...
        comment_match = re.search(r'//\s*([^\n]+)', before[-200:])
        if comment_match:
            return comment_match.group(1).strip()

        return None

    def _extract_class_body(self, match: re.Match, content: str) -> str:
        """Extract class body content"""
        start = match.end()
        # Find the opening brace
        while start < len(content) and content[start] != "{":
            start += 1

        if start >= len(content):
            return ""

        # Find matching closing brace
        depth = 0
        end = start
        for i, char in enumerate(content[start:], start):
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break

        return content[start:end]


class SPECIntegrityAuditor:
    """Main auditor for SPEC integrity"""

    def __init__(self, workdir: str):
        self.workdir = Path(workdir)
        self.specs_dir = self.workdir / ".spec-workflow" / "specs"
        self.audit_dir = self.workdir / ".audit" / "spec"
        self.extractor = TypeScriptExtractor(workdir)

    def run_full_audit(self) -> Dict:
        """Execute the complete 8-axis audit workflow"""
        print("[19] Starting SPEC Integrity Audit...")

        # Phase 0: Check if SPECs exist
        bootstrap_status = self._phase0_check_or_bootstrap()
        print(f"[19] Phase 0: Bootstrap={'REQUIRED' if bootstrap_status['needs_bootstrap'] else 'SKIPPED'}")

        # Phase 1: Rotation & input collection
        inputs = self._phase1_prepare()
        print(f"[19] Phase 1: Collected {len(inputs['public_symbols'])} public symbols")

        # Phase 2: AST scan
        scan_result = self._phase2_scan()
        print(f"[19] Phase 2: Found {scan_result['symbol_count']} symbols, {scan_result['test_count']} tests")

        # Phase 3: 8-axis evaluation
        results = self._phase3_evaluate(inputs)
        print(f"[19] Phase 3: Evaluated {len(results)} axes")

        # Phase 4: Verdict
        verdict = self._phase4_verdict(results)
        print(f"[19] Phase 4: Score={verdict['total_score']}/{verdict['max_score']} ({verdict['percentage']}%) - {'PASS' if verdict['overall_pass'] else 'FAIL'}")

        # Phase 5: Generate revisions
        revisions = self._phase5_generate_revisions(results, verdict)
        if revisions:
            print(f"[19] Phase 5: Generated {len(revisions)} revision proposals")

        # Phase 6: Update streak
        streak = self._phase6_update_streak(verdict)
        print(f"[19] Phase 6: Consecutive passes: {streak['consecutive_pass']}")

        # Phase 7: Summary
        self._phase7_summary(results, verdict, revisions, streak)
        print(f"[19] Phase 7: Summary written to {self.audit_dir / 'runs/current/summary.md'}")

        # Phase 8: Improvement cycle (if FAILED)
        if not verdict["overall_pass"]:
            print("[19] Phase 8: Starting improvement cycle...")
            improvement = self._phase8_improvement_cycle(results, verdict)
            print(f"[19] Phase 8: Completed {improvement['iterations']} iterations")

        return {
            "verdict": verdict,
            "results": results,
            "revisions": revisions,
            "streak": streak
        }

    def _phase0_check_or_bootstrap(self) -> Dict:
        """Check if SPECs exist, bootstrap if needed"""
        if not self.specs_dir.exists():
            return {"needs_bootstrap": True, "reason": "specs_dir_missing"}

        symbols = self.extractor.extract_public_symbols()

        # Check coverage map
        coverage_map_path = self.specs_dir / "_coverage_map.yml"
        if not coverage_map_path.exists():
            return {"needs_bootstrap": True, "reason": "coverage_map_missing", "uncovered_symbols": symbols}

        with open(coverage_map_path) as f:
            coverage_map = yaml.safe_load(f) or {}

        covered = sum(1 for s in symbols if s["qualified_name"] in coverage_map)
        coverage_rate = covered / max(len(symbols), 1)

        if coverage_rate < 0.5:
            return {
                "needs_bootstrap": True,
                "reason": "low_coverage",
                "coverage_rate": coverage_rate,
                "covered": covered,
                "total": len(symbols),
                "uncovered_symbols": [s for s in symbols if s["qualified_name"] not in coverage_map]
            }

        return {"needs_bootstrap": False, "coverage_rate": coverage_rate}

    def _phase1_prepare(self) -> Dict:
        """Rotation and input collection"""
        # Rotate spec runs
        self._rotate_spec_runs()

        # Load constitution and purpose
        constitution_path = self.workdir / "SYSTEM_CONSTITUTION.md"
        purpose_path = self.workdir / "PURPOSE.md"

        constitution = constitution_path.read_text() if constitution_path.exists() else ""
        purpose = purpose_path.read_text() if purpose_path.exists() else ""

        # Load invariants if exists
        invariants_path = self.workdir / ".concept" / "invariants.yml"
        invariants = yaml.safe_load(invariants_path.read_text()) if invariants_path.exists() else {}

        return {
            "constitution": constitution,
            "purpose": purpose,
            "invariants": invariants,
            "public_symbols": [asdict(s) for s in self.extractor.extract_public_symbols()],
        }

    def _phase2_scan(self) -> Dict:
        """AST scan for public symbols and test functions"""
        symbols = self.extractor.extract_public_symbols()

        # Count test files
        test_files = list(self.workdir.rglob("*.test.ts")) + list(self.workdir.rglob("*.test.tsx"))

        return {
            "public_symbols": [asdict(s) for s in symbols],
            "symbol_count": len(symbols),
            "test_count": len(test_files)
        }

    def _phase3_evaluate(self, inputs: Dict) -> Dict[str, ScoreResult]:
        """Execute all 8 evaluation axes"""
        return {
            "S-001": self._calc_s001(inputs),
            "S-002": self._calc_s002(inputs),
            "S-003": self._calc_s003(inputs),
            "S-004": self._calc_s004(inputs),
            "S-005": self._calc_s005(inputs),
            "S-006": self._calc_s006(inputs),
            "S-007": self._calc_s007(inputs),
            "S-008": self._calc_s008(inputs),
        }

    def _calc_s001(self, inputs: Dict) -> ScoreResult:
        """S-001: SPEC Existence"""
        score = 0
        details = []

        # S-001-1: Directory exists (3 points)
        dir_exists = self.specs_dir.exists()
        s001_1 = 3 if dir_exists else 0
        score += s001_1
        details.append({"id": "S-001-1", "name": "SPEC directory", "score": s001_1, "max": 3})

        # S-001-2: _index.yml exists (3 points)
        index_path = self.specs_dir / "_index.yml"
        index_exists = index_path.exists()
        s001_2 = 3 if index_exists else 0
        score += s001_2
        details.append({"id": "S-001-2", "name": "_index.yml", "score": s001_2, "max": 3})

        # S-001-3: Public symbol coverage (9 points)
        symbols = inputs["public_symbols"]
        coverage_map_path = self.specs_dir / "_coverage_map.yml"

        if coverage_map_path.exists():
            with open(coverage_map_path) as f:
                coverage_map = yaml.safe_load(f) or {}
            covered = sum(1 for s in symbols if s["qualified_name"] in coverage_map)
        else:
            covered = 0

        coverage_rate = covered / max(len(symbols), 1)
        s001_3 = int(9 * coverage_rate)
        score += s001_3
        details.append({
            "id": "S-001-3",
            "name": "Symbol coverage",
            "score": s001_3,
            "max": 9,
            "evidence": f"covered={covered}/{len(symbols)} ({coverage_rate:.0%})"
        })

        return ScoreResult(
            axis="S-001",
            name="SPEC存在確認",
            score=score,
            max_score=15,
            passed=score >= 12,
            details=details
        )

    def _calc_s002(self, inputs: Dict) -> ScoreResult:
        """S-002: Input/Output Definition Strictness"""
        # This requires parsing existing SPECs
        specs = self._load_all_specs()

        if not specs:
            return ScoreResult(
                axis="S-002",
                name="入出力定義の厳密性",
                score=0,
                max_score=15,
                passed=False,
                details=[{"note": "No SPECs exist yet"}]
            )

        # Simplified evaluation - count specs with input/output sections
        score = 0
        details = []

        # S-002-1: Input type definitions (4 points)
        input_types = sum(1 for s in specs if "入力仕様" in s["content"] or "Input" in s["content"])
        s002_1 = int(4 * (input_types / max(len(specs), 1)))
        score += s002_1
        details.append({"id": "S-002-1", "name": "Input type defs", "score": s002_1, "max": 4})

        # S-002-2: Input constraints (4 points)
        constraints = sum(1 for s in specs if re.search(r'制約|constraint|範囲', s["content"], re.I))
        s002_2 = int(4 * (constraints / max(len(specs), 1)))
        score += s002_2
        details.append({"id": "S-002-2", "name": "Input constraints", "score": s002_2, "max": 4})

        # S-002-3: Output definitions (4 points)
        outputs = sum(1 for s in specs if "出力仕様" in s["content"] or "Output" in s["content"])
        s002_3 = int(4 * (outputs / max(len(specs), 1)))
        score += s002_3
        details.append({"id": "S-002-3", "name": "Output defs", "score": s002_3, "max": 4})

        # S-002-4: Preconditions/Postconditions (3 points)
        conditions = sum(1 for s in specs if re.search(r'前提条件|事後条件|Precondition|Postcondition', s["content"], re.I))
        s002_4 = int(3 * (conditions / max(len(specs), 1)))
        score += s002_4
        details.append({"id": "S-002-4", "name": "Pre/Post conditions", "score": s002_4, "max": 3})

        return ScoreResult(
            axis="S-002",
            name="入出力定義の厳密性",
            score=score,
            max_score=15,
            passed=score >= 12,
            details=details
        )

    def _calc_s003(self, inputs: Dict) -> ScoreResult:
        """S-003: Boundary Value Analysis"""
        specs = self._load_all_specs()

        if not specs:
            return ScoreResult(
                axis="S-003",
                name="境界値分析",
                score=0,
                max_score=15,
                passed=False,
                details=[{"note": "No SPECs exist yet"}]
            )

        score = 0
        details = []

        # S-003-1: Boundary section exists (3 points)
        bv_sections = sum(1 for s in specs if re.search(r'境界値|Boundary', s["content"], re.I))
        s003_1 = int(3 * (bv_sections / max(len(specs), 1)))
        score += s003_1
        details.append({"id": "S-003-1", "name": "Boundary sections", "score": s003_1, "max": 3})

        # S-003-2: Boundary case coverage (5 points)
        required_cats = ["最小", "最大", "ゼロ", "空", "min", "max", "zero", "empty"]
        coverage = 0
        for s in specs:
            found = sum(1 for cat in required_cats if cat.lower() in s["content"].lower())
            coverage += found / len(required_cats)
        s003_2 = int(5 * min(1.0, (coverage / max(len(specs), 1)) * 2))
        score += s003_2
        details.append({"id": "S-003-2", "name": "Boundary coverage", "score": s003_2, "max": 5})

        # S-003-3: boundary_values.yml (4 points)
        bv_ymls = 0
        for spec_dir in self.specs_dir.iterdir():
            if spec_dir.is_dir() and (spec_dir / "boundary_values.yml").exists():
                bv_ymls += 1
        s003_3 = int(4 * (bv_ymls / max(len(specs), 1)))
        score += s003_3
        details.append({"id": "S-003-3", "name": "boundary_values.yml", "score": s003_3, "max": 4})

        # S-003-4: Rationale (3 points)
        rationale = sum(1 for s in specs if re.search(r'根拠|Rationale|理由', s["content"], re.I))
        s003_4 = int(3 * (rationale / max(len(specs), 1)))
        score += s003_4
        details.append({"id": "S-003-4", "name": "Rationale", "score": s003_4, "max": 3})

        return ScoreResult(
            axis="S-003",
            name="境界値分析",
            score=score,
            max_score=15,
            passed=score >= 12,
            details=details
        )

    def _calc_s004(self, inputs: Dict) -> ScoreResult:
        """S-004: Error Scenario Coverage"""
        specs = self._load_all_specs()

        if not specs:
            return ScoreResult(
                axis="S-004",
                name="エラーシナリオ網羅性",
                score=0,
                max_score=15,
                passed=False,
                details=[{"note": "No SPECs exist yet"}]
            )

        score = 0
        details = []

        # S-004-1: Error section exists (3 points)
        err_sections = sum(1 for s in specs if re.search(r'エラーシナリオ|Error.*Scenario|異常系', s["content"], re.I))
        s004_1 = int(3 * (err_sections / max(len(specs), 1)))
        score += s004_1
        details.append({"id": "S-004-1", "name": "Error sections", "score": s004_1, "max": 3})

        # S-004-2: Exception types (4 points)
        exception_patterns = [r"TypeError", r"ValueError", r"Error", r"Exception"]
        exc_coverage = 0
        for s in specs:
            found = sum(1 for p in exception_patterns if re.search(p, s["content"]))
            exc_coverage += min(1.0, found / 3)
        s004_2 = int(4 * (exc_coverage / max(len(specs), 1)))
        score += s004_2
        details.append({"id": "S-004-2", "name": "Exception types", "score": s004_2, "max": 4})

        # S-004-3: error_scenarios.yml (4 points)
        err_ymls = 0
        for spec_dir in self.specs_dir.iterdir():
            if spec_dir.is_dir() and (spec_dir / "error_scenarios.yml").exists():
                err_ymls += 1
        s004_3 = int(4 * (err_ymls / max(len(specs), 1)))
        score += s004_3
        details.append({"id": "S-004-3", "name": "error_scenarios.yml", "score": s004_3, "max": 4})

        # S-004-4: Edge case quality (4 points)
        edge_patterns = [r"None", r"null", r"空", r"並行", r"timeout", r"権限"]
        edge_quality = 0
        for s in specs:
            found = sum(1 for p in edge_patterns if re.search(p, s["content"], re.I))
            edge_quality += min(1.0, found / 4)
        s004_4 = int(4 * (edge_quality / max(len(specs), 1)))
        score += s004_4
        details.append({"id": "S-004-4", "name": "Edge quality", "score": s004_4, "max": 4})

        return ScoreResult(
            axis="S-004",
            name="エラーシナリオ網羅性",
            score=score,
            max_score=15,
            passed=score >= 12,
            details=details
        )

    def _calc_s005(self, inputs: Dict) -> ScoreResult:
        """S-005: Test-SPEC Mapping"""
        specs = self._load_all_specs()

        if not specs:
            return ScoreResult(
                axis="S-005",
                name="テスト-SPEC対応率",
                score=0,
                max_score=15,
                passed=False,
                details=[{"note": "No SPECs exist yet"}]
            )

        score = 0
        details = []

        # Extract test case IDs from SPECs
        case_ids = []
        for s in specs:
            case_ids.extend(re.findall(r"(TC-\d+|BV-\d+|ERR-\d+)", s["content"]))

        # S-005-1: Test-SPEC case correspondence (5 points)
        test_files = list(self.workdir.rglob("*.test.ts")) + list(self.workdir.rglob("*.test.tsx"))
        referenced = 0
        for case_id in set(case_ids):
            for test_file in test_files:
                content = test_file.read_text()
                if case_id.lower().replace("-", "_") in content.lower():
                    referenced += 1
                    break

        ref_rate = referenced / max(len(set(case_ids)), 1)
        s005_1 = int(5 * ref_rate)
        score += s005_1
        details.append({
            "id": "S-005-1",
            "name": "Test-SPEC mapping",
            "score": s005_1,
            "max": 5,
            "evidence": f"referenced={referenced}/{len(set(case_ids))}"
        })

        # S-005-2: Normal test coverage (4 points)
        normal_cases = sum(len(re.findall(r"TC-\d+", s["content"])) for s in specs)
        normal_tests = sum(1 for f in test_files if not re.search(r"error|fail|invalid", f.name, re.I))
        s005_2 = int(4 * min(1.0, normal_tests / max(normal_cases, 1)))
        score += s005_2
        details.append({"id": "S-005-2", "name": "Normal coverage", "score": s005_2, "max": 4})

        # S-005-3: Error test coverage (4 points)
        error_cases = sum(len(re.findall(r"ERR-\d+", s["content"])) for s in specs)
        error_tests = sum(1 for f in test_files if re.search(r"error|fail|exception", f.name, re.I))
        s005_3 = int(4 * min(1.0, error_tests / max(error_cases, 1)))
        score += s005_3
        details.append({"id": "S-005-3", "name": "Error coverage", "score": s005_3, "max": 4})

        # S-005-4: test_matrix.yml (2 points)
        matrix_count = 0
        for spec_dir in self.specs_dir.iterdir():
            if spec_dir.is_dir() and (spec_dir / "test_matrix.yml").exists():
                matrix_count += 1
        s005_4 = int(2 * (matrix_count / max(len(specs), 1)))
        score += s005_4
        details.append({"id": "S-005-4", "name": "test_matrix.yml", "score": s005_4, "max": 2})

        return ScoreResult(
            axis="S-005",
            name="テスト-SPEC対応率",
            score=score,
            max_score=15,
            passed=score >= 12,
            details=details
        )

    def _calc_s006(self, inputs: Dict) -> ScoreResult:
        """S-006: Constitution Compliance"""
        constitution = inputs.get("constitution", "")
        purpose = inputs.get("purpose", "")
        specs = self._load_all_specs()

        if not constitution or not specs:
            return ScoreResult(
                axis="S-006",
                name="憲法準拠性",
                score=0,
                max_score=10,
                passed=False,
                details=[{"note": "Constitution or SPECs missing"}]
            )

        score = 0
        details = []

        # S-006-1: Within responsibility scope (5 points)
        shall_nots = re.findall(r"shall NOT:?\s*\n((?:\s*\d+\..+\n)+)", constitution)
        violations = 0
        for s in specs:
            for section in shall_nots:
                if section.lower() in s["content"].lower():
                    violations += 1
                    break

        compliance_rate = 1 - (violations / max(len(specs), 1))
        s006_1 = int(5 * compliance_rate)
        score += s006_1
        details.append({
            "id": "S-006-1",
            "name": "Responsibility scope",
            "score": s006_1,
            "max": 5,
            "evidence": f"violations={violations}"
        })

        # S-006-2: Prohibition compliance (3 points)
        prohibited_libs = ["tensorflow", "torch", "sklearn", "opencv"]
        lib_violations = sum(
            1 for s in specs
            for lib in prohibited_libs
            if lib.lower() in s["content"].lower()
        )
        s006_2 = 3 if lib_violations == 0 else max(0, 3 - lib_violations)
        score += s006_2
        details.append({
            "id": "S-006-2",
            "name": "Prohibition compliance",
            "score": s006_2,
            "max": 3
        })

        # S-006-3: Tech stack compliance (2 points)
        allowed_deps = re.findall(r"\*\*([A-Za-z]+)\*\*.*(?:allowed|許可)", constitution, re.I)
        s006_3 = 2 if allowed_deps else 1
        score += s006_3
        details.append({"id": "S-006-3", "name": "Tech stack", "score": s006_3, "max": 2})

        return ScoreResult(
            axis="S-006",
            name="憲法準拠性",
            score=score,
            max_score=10,
            passed=score >= 8,
            details=details
        )

    def _calc_s007(self, inputs: Dict) -> ScoreResult:
        """S-007: Regression Test Design"""
        specs = self._load_all_specs()

        if not specs:
            return ScoreResult(
                axis="S-007",
                name="回帰テスト設計",
                score=0,
                max_score=5,
                passed=False,
                details=[{"note": "No SPECs exist yet"}]
            )

        score = 0
        details = []

        # S-007-1: Regression section (2 points)
        regression = sum(1 for s in specs if re.search(r"回帰テスト|Regression", s["content"], re.I))
        s007_1 = int(2 * (regression / max(len(specs), 1)))
        score += s007_1
        details.append({"id": "S-007-1", "name": "Regression section", "score": s007_1, "max": 2})

        # S-007-2: Impact scope (2 points)
        impact = sum(1 for s in specs if re.search(r"影響範囲|Impact|依存", s["content"], re.I))
        s007_2 = int(2 * (impact / max(len(specs), 1)))
        score += s007_2
        details.append({"id": "S-007-2", "name": "Impact scope", "score": s007_2, "max": 2})

        # S-007-3: _coverage_map.yml (1 point)
        coverage_map = (self.specs_dir / "_coverage_map.yml").exists()
        s007_3 = 1 if coverage_map else 0
        score += s007_3
        details.append({"id": "S-007-3", "name": "_coverage_map.yml", "score": s007_3, "max": 1})

        return ScoreResult(
            axis="S-007",
            name="回帰テスト設計",
            score=score,
            max_score=5,
            passed=score >= 4,
            details=details
        )

    def _calc_s008(self, inputs: Dict) -> ScoreResult:
        """S-008: SPEC Freshness"""
        specs = self._load_all_specs()

        if not specs:
            return ScoreResult(
                axis="S-008",
                name="SPEC鮮度",
                score=0,
                max_score=10,
                passed=False,
                details=[{"note": "No SPECs exist yet"}]
            )

        score = 0
        details = []

        # S-008-1: Update date validity (3 points)
        fresh_count = 0
        for s in specs:
            date_match = re.search(r"Last\s*Updated?:?\s*(\d{4}[-/]\d{2}[-/]\d{2})", s["content"])
            if date_match:
                try:
                    update_date = datetime.strptime(date_match.group(1).replace("/", "-"), "%Y-%m-%d")
                    days_since = (datetime.now() - update_date).days
                    if days_since <= 90:
                        fresh_count += 1
                except ValueError:
                    pass

        s008_1 = int(3 * (fresh_count / max(len(specs), 1)))
        score += s008_1
        details.append({
            "id": "S-008-1",
            "name": "Update validity",
            "score": s008_1,
            "max": 3,
            "evidence": f"fresh={fresh_count}/{len(specs)}"
        })

        # S-008-2: Signature match (4 points)
        symbols = inputs["public_symbols"]
        sig_match = 0
        total_checked = 0
        for s in specs:
            spec_target = re.search(r"SPEC:\s*(\S+)", s["content"])
            if spec_target:
                qualified = spec_target.group(1)
                matching_sym = next((sym for sym in symbols if sym["qualified_name"] == qualified), None)
                if matching_sym:
                    total_checked += 1
                    # Check if args match
                    input_section = self._extract_section(s["content"], r"入力仕様|Input")
                    if input_section and matching_sym.get("args"):
                        code_args = set(a["name"] for a in matching_sym["args"] if a["name"] != "self")
                        spec_params = set(re.findall(r"\|\s*(\w+)\s*\|", input_section))
                        if code_args & spec_params:
                            sig_match += 1

        s008_2 = int(4 * (sig_match / max(total_checked, 1)))
        score += s008_2
        details.append({
            "id": "S-008-2",
            "name": "Signature match",
            "score": s008_2,
            "max": 4,
            "evidence": f"matched={sig_match}/{total_checked}"
        })

        # S-008-3: Version management (3 points)
        versioned = sum(1 for s in specs if re.search(r"Version:?\s*\d+\.\d+", s["content"], re.I))
        s008_3 = int(3 * (versioned / max(len(specs), 1)))
        score += s008_3
        details.append({"id": "S-008-3", "name": "Version mgmt", "score": s008_3, "max": 3})

        return ScoreResult(
            axis="S-008",
            name="SPEC鮮度",
            score=score,
            max_score=10,
            passed=score >= 8,
            details=details
        )

    def _phase4_verdict(self, results: Dict[str, ScoreResult]) -> Dict:
        """Generate PASS/FAIL verdict"""
        total_score = sum(r.score for r in results.values())
        max_score = sum(r.max_score for r in results.values())
        all_pass = all(r.passed for r in results.values())
        s001_above = results["S-001"].score >= 12

        overall_pass = (total_score >= 80) and s001_above and all_pass

        return {
            "total_score": total_score,
            "max_score": max_score,
            "percentage": round(total_score / max_score * 100, 1),
            "overall_pass": overall_pass,
            "s001_threshold_met": s001_above,
            "all_thresholds_met": all_pass,
            "failed_axes": [k for k, v in results.items() if not v.passed]
        }

    def _phase5_generate_revisions(self, results: Dict[str, ScoreResult], verdict: Dict) -> List[Dict]:
        """Generate SPEC revision proposals for gaps"""
        revisions = []

        for axis_id, result in results.items():
            if not result.passed:
                revision = {
                    "id": f"REV-{datetime.now().strftime('%Y%m%d')}-{axis_id}",
                    "axis": axis_id,
                    "axis_name": result.name,
                    "current_score": result.score,
                    "required_score": self._calculate_threshold(axis_id),
                    "gap": self._calculate_threshold(axis_id) - result.score,
                    "type": self._classify_revision_type(axis_id),
                    "details": result.details,
                    "recommendation": self._generate_recommendation(axis_id, result),
                    "priority": "P0" if axis_id in ["S-001", "S-003", "S-004"] else "P1"
                }
                revisions.append(revision)

        # Save revisions to files
        if revisions:
            rev_dir = self.audit_dir / "revisions" / "pending"
            for rev in revisions:
                rev_path = rev_dir / f"{rev['id']}.yml"
                with open(rev_path, "w") as f:
                    yaml.dump(revision, f, allow_unicode=True, default_flow_style=False)

        return revisions

    def _phase6_update_streak(self, verdict: Dict) -> Dict:
        """Update consecutive pass counter"""
        streak_path = self.audit_dir / "streak.json"

        if streak_path.exists():
            with open(streak_path) as f:
                streak = json.load(f)
        else:
            streak = {"consecutive_pass": 0, "total_audits": 0, "history": []}

        streak["total_audits"] += 1
        if verdict["overall_pass"]:
            streak["consecutive_pass"] += 1
        else:
            streak["consecutive_pass"] = 0

        streak["history"].append({
            "timestamp": datetime.now().isoformat(),
            "passed": verdict["overall_pass"],
            "score": verdict["total_score"]
        })
        streak["history"] = streak["history"][-10:]
        streak["spec_stable"] = streak["consecutive_pass"] >= 3

        with open(streak_path, "w") as f:
            json.dump(streak, f, indent=2, ensure_ascii=False)

        return streak

    def _phase7_summary(self, results: Dict[str, ScoreResult], verdict: Dict, revisions: List, streak: Dict):
        """Generate summary markdown"""
        summary_path = self.audit_dir / "runs" / "current" / "summary.md"
        pass_icon = "✅" if verdict["overall_pass"] else "❌"

        lines = [
            "# SPEC整合性監査サマリ\n",
            f"**監査日時**: {datetime.now().isoformat()}",
            f"**対象リポジトリ**: {self.workdir}\n",
            "## 総合結果\n",
            "| 指標 | 値 |",
            "|-----|-----|",
            f"| **総合判定** | {pass_icon} {'PASS' if verdict['overall_pass'] else 'FAIL'} |",
            f"| **スコア** | {verdict['total_score']}/{verdict['max_score']} ({verdict['percentage']}%) |",
            f"| **連続PASS** | {streak['consecutive_pass']}回 |",
            f"| **SPEC安定** | {'✅ 安定' if streak.get('spec_stable') else '⚠️ 不安定'} |\n",
            "## 各軸のスコア\n",
            "| 軸 | スコア | 閾値 | 判定 |",
            "|----|-------|------|------|"
        ]

        for axis_id, result in results.items():
            icon = "✅" if result.passed else "❌"
            threshold = self._calculate_threshold(axis_id)
            lines.append(
                f"| {axis_id} {result.name} | {result.score}/{result.max_score} "
                f"| {threshold} | {icon} {'PASS' if result.passed else 'FAIL'} |"
            )

        if revisions:
            lines.append("\n## SPEC更新案\n")
            for rev in revisions:
                lines.append(f"### {rev['id']}: {rev['axis_name']}\n")
                lines.append(f"- **タイプ**: {rev['type']}")
                lines.append(f"- **優先度**: {rev['priority']}")
                lines.append(f"- **推奨アクション**: {rev['recommendation']}")
                lines.append("")

        summary_path.parent.mkdir(parents=True, exist_ok=True)
        summary_path.write_text("\n".join(lines), encoding="utf-8")

    def _phase8_improvement_cycle(self, results: Dict, verdict: Dict, max_iterations: int = 3) -> Dict:
        """Execute improvement cycle if FAILED"""
        if verdict["overall_pass"]:
            return {"improved": False, "final_verdict": verdict}

        current_results = results
        current_verdict = verdict
        iteration = 0

        while not current_verdict["overall_pass"] and iteration < max_iterations:
            iteration += 1
            print(f"[19] Improvement cycle {iteration}/{max_iterations}")

            # Apply improvements for each failed axis
            for axis_id in current_verdict["failed_axes"]:
                result = current_results[axis_id]
                print(f"  Improving: {axis_id} ({result.name}) current={result.score}/{result.max_score}")
                self._apply_improvements(axis_id, result)

            # Re-evaluate
            inputs = self._phase1_prepare()
            current_results = self._phase3_evaluate(inputs)
            current_verdict = self._phase4_verdict(current_results)
            print(f"  Re-evaluation: {current_verdict['total_score']} points ({'PASS' if current_verdict['overall_pass'] else 'FAIL'})")

        return {
            "improved": True,
            "iterations": iteration,
            "final_verdict": current_verdict
        }

    def _apply_improvements(self, axis_id: str, result: ScoreResult):
        """Apply SPEC improvements for a failed axis"""
        if axis_id == "S-001":
            self._bootstrap_missing_specs()
        elif axis_id in ["S-002", "S-003", "S-004"]:
            self._enhance_spec_content(axis_id, result)
        elif axis_id == "S-005":
            self._update_test_spec_mapping(result)
        elif axis_id == "S-008":
            self._refresh_stale_specs(result)

    def _bootstrap_missing_specs(self):
        """Generate SPECs for uncovered symbols"""
        symbols = self.extractor.extract_public_symbols()
        coverage_map_path = self.specs_dir / "_coverage_map.yml"

        if coverage_map_path.exists():
            with open(coverage_map_path) as f:
                coverage_map = yaml.safe_load(f) or {}
        else:
            coverage_map = {}

        for symbol in symbols:
            if symbol.qualified_name not in coverage_map:
                spec_dir = self.specs_dir / symbol.name
                spec_dir.mkdir(exist_ok=True)
                self._generate_spec_from_symbol(symbol, spec_dir)
                coverage_map[symbol.qualified_name] = {
                    "spec_file": f"{symbol.name}/{symbol.name}_spec.md",
                    "generated": datetime.now().isoformat()
                }

        # Update coverage map
        with open(coverage_map_path, "w") as f:
            yaml.dump(coverage_map, f, allow_unicode=True, default_flow_style=False)

        # Update index
        self._generate_index_yml()

    def _generate_spec_from_symbol(self, symbol: SymbolInfo, spec_dir: Path):
        """Generate SPEC document from symbol info"""
        spec_content = f"""# SPEC: {symbol.qualified_name}

**Version**: 1.0.0
**Last Updated**: {datetime.now().strftime('%Y-%m-%d')}
**Source**: {symbol.file}:{symbol.line}
**Type**: {symbol.type}

---

## 1. 概要

{symbol.docstring or f"{symbol.type}の実装"}

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
{self._generate_input_table(symbol)}

## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| result | {symbol.returns or 'void'} | - | {symbol.type}の戻り値 |

## 4. 前提条件（Preconditions）

- 入力パラメータが適切に型チェックされていること

## 5. 事後条件（Postconditions）

- 戻り値が定義された型であること

## 6. 不変条件（Invariants）

- なし

## 7. 境界値テストケース

| ID | 入力 | 期待出力 | カテゴリ | 根拠 |
|----|------|----------|----------|------|
| BV-001 | 正常値 | 正常動作 | 正常系 | 標準入力 |
| BV-002 | 最小値 | 正常動作 | 最小境界 | 型の下限 |
| BV-003 | 最大値 | 正常動作 | 最大境界 | 型の上限 |
| BV-004 | 空入力 | エラー | 空入力 | 空コレクション |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | 型不正 | 不正な型 | エラー発生 | TypeError |
| ERR-002 | None入力 | null | エラー発生 | TypeError |
| ERR-003 | 範囲外 | 範囲外の値 | エラー発生 | RangeError |

## 9. 正常系テストケース

| ID | 入力 | 期待出力 | 説明 |
|----|------|----------|------|
| TC-001 | 正常入力 | 正常出力 | 基本動作 |

## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: この{symbol.type}に依存する全コンポーネント
- 影響範囲: {symbol.file}からimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
"""
        spec_file = spec_dir / f"{symbol.name}_spec.md"
        spec_file.write_text(spec_content, encoding="utf-8")

        # Generate supporting YAML files
        self._generate_boundary_values_yml(spec_dir)
        self._generate_error_scenarios_yml(spec_dir)
        self._generate_test_matrix_yml(spec_dir)

    def _generate_input_table(self, symbol: SymbolInfo) -> str:
        """Generate input spec table rows"""
        if not symbol.args:
            return "| (なし) | - | - | - | - | 引数なし |"

        rows = []
        for arg in symbol.args:
            opt = "No" if not arg.get("optional") else "Yes"
            rows.append(
                f"| {arg['name']} | {arg.get('type', 'any')} | {opt} | - | - | パラメータ |"
            )
        return "\n".join(rows)

    def _generate_boundary_values_yml(self, spec_dir: Path):
        """Generate boundary_values.yml"""
        content = {
            "boundary_cases": [
                {"id": "BV-001", "category": "正常系", "input": "正常値", "expected": "正常動作"},
                {"id": "BV-002", "category": "最小境界", "input": "最小値", "expected": "正常動作"},
                {"id": "BV-003", "category": "最大境界", "input": "最大値", "expected": "正常動作"},
                {"id": "BV-004", "category": "空入力", "input": "空/null", "expected": "エラー"},
            ]
        }
        with open(spec_dir / "boundary_values.yml", "w") as f:
            yaml.dump(content, f, allow_unicode=True, default_flow_style=False)

    def _generate_error_scenarios_yml(self, spec_dir: Path):
        """Generate error_scenarios.yml"""
        content = {
            "error_scenarios": [
                {"id": "ERR-001", "scenario": "型不正", "input": "不正な型", "expected": "TypeError"},
                {"id": "ERR-002", "scenario": "None入力", "input": "null", "expected": "TypeError"},
                {"id": "ERR-003", "scenario": "範囲外", "input": "範囲外の値", "expected": "RangeError"},
            ]
        }
        with open(spec_dir / "error_scenarios.yml", "w") as f:
            yaml.dump(content, f, allow_unicode=True, default_flow_style=False)

    def _generate_test_matrix_yml(self, spec_dir: Path):
        """Generate test_matrix.yml"""
        content = {
            "test_cases": [
                {"id": "TC-001", "type": "正常系", "input": "正常入力", "expected": "正常出力"}
            ],
            "coverage": {
                "normal": 1,
                "error": 0,
                "boundary": 0
            }
        }
        with open(spec_dir / "test_matrix.yml", "w") as f:
            yaml.dump(content, f, allow_unicode=True, default_flow_style=False)

    def _generate_index_yml(self):
        """Generate _index.yml"""
        spec_dirs = [d for d in self.specs_dir.iterdir() if d.is_dir() and not d.name.startswith("_")]

        index = {
            "generated": datetime.now().isoformat(),
            "total_specs": len(spec_dirs),
            "specs": {}
        }

        for spec_dir in spec_dirs:
            spec_file = list(spec_dir.glob("*_spec.md"))
            if spec_file:
                index["specs"][spec_dir.name] = {
                    "spec_file": str(spec_file[0].relative_to(self.specs_dir)),
                    "name": spec_dir.name
                }

        with open(self.specs_dir / "_index.yml", "w") as f:
            yaml.dump(index, f, allow_unicode=True, default_flow_style=False)

    def _enhance_spec_content(self, axis_id: str, result: ScoreResult):
        """Enhance SPEC content for specific axis"""
        # This would analyze missing content and add it
        # For now, it's a placeholder
        pass

    def _update_test_spec_mapping(self, result: ScoreResult):
        """Update test-SPEC mapping"""
        # This would analyze test files and update SPEC references
        # For now, it's a placeholder
        pass

    def _refresh_stale_specs(self, result: ScoreResult):
        """Refresh stale SPECs"""
        # This would update Last Updated dates and verify signatures
        # For now, it's a placeholder
        pass

    def _rotate_spec_runs(self):
        """Rotate audit runs (keep 2 generations)"""
        current = self.audit_dir / "runs" / "current"
        old = self.audit_dir / "runs" / "old"

        if current.exists():
            if old.exists():
                import shutil
                shutil.rmtree(old)
            current.rename(old)

        current.mkdir(parents=True, exist_ok=True)

    def _load_all_specs(self) -> List[Dict]:
        """Load all SPEC documents"""
        if not self.specs_dir.exists():
            return []

        specs = []
        for spec_file in self.specs_dir.rglob("*_spec.md"):
            content = spec_file.read_text(encoding="utf-8")
            specs.append({
                "name": spec_file.parent.name,
                "file": str(spec_file),
                "content": content
            })

        return specs

    def _extract_section(self, content: str, pattern: str) -> Optional[str]:
        """Extract a section from markdown content"""
        match = re.search(pattern, content, re.I)
        if match:
            # Get lines until next ##
            lines = content[match.end():].split("\n")
            section_lines = []
            for line in lines:
                if line.startswith("##"):
                    break
                section_lines.append(line)
            return "\n".join(section_lines)
        return None

    def _calculate_threshold(self, axis_id: str) -> int:
        """Calculate passing threshold for an axis"""
        thresholds = {
            "S-001": 12, "S-002": 12, "S-003": 12, "S-004": 12,
            "S-005": 12, "S-006": 8, "S-007": 4, "S-008": 8
        }
        return thresholds.get(axis_id, 12)

    def _classify_revision_type(self, axis_id: str) -> str:
        """Classify revision type"""
        types = {
            "S-001": "spec_missing",
            "S-002": "io_definition_incomplete",
            "S-003": "boundary_analysis_insufficient",
            "S-004": "error_coverage_gap",
            "S-005": "test_spec_mismatch",
            "S-006": "constitution_violation",
            "S-007": "regression_design_missing",
            "S-008": "spec_stale",
        }
        return types.get(axis_id, "unknown")

    def _generate_recommendation(self, axis_id: str, result: ScoreResult) -> str:
        """Generate improvement recommendation"""
        recommendations = {
            "S-001": f"SPECが不足しています。未カバーの公開シンボルに対してSPECを生成してください。",
            "S-002": f"入出力定義が不完全です。型・制約・前条件・後条件の記載を強化してください。",
            "S-003": f"境界値分析が不足しています。最小値・最大値・ゼロ値・空入力等のケースを追加してください。",
            "S-004": f"エラーシナリオが不足しています。異常系・例外パスの網羅性を高めてください。",
            "S-005": f"テストとSPECの対応が不十分です。テスト関数がSPECケースIDを参照するように修正してください。",
            "S-006": f"憲法違反の可能性があります。禁止事項・責務範囲を再確認してください。",
            "S-007": f"回帰テスト設計が不足しています。変更時の影響範囲を明記してください。",
            "S-008": f"SPECが古い可能性があります。コードの現状に合わせて更新してください。",
        }
        return recommendations.get(axis_id, "改善が必要です")


def main():
    """Main entry point"""
    import sys
    workdir = sys.argv[1] if len(sys.argv) > 1 else "/home/jinno/yka_ikiiki_record"

    auditor = SPECIntegrityAuditor(workdir)
    result = auditor.run_full_audit()

    # Save audit result
    audit_dir = Path(workdir) / ".audit" / "spec"
    result_path = audit_dir / "runs" / "current" / "audit_result.json"

    with open(result_path, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "workdir": workdir,
            "verdict": result["verdict"],
            "results": {k: asdict(v) for k, v in result["results"].items()},
            "revisions": result["revisions"],
            "streak": result["streak"]
        }, f, indent=2, ensure_ascii=False)

    print(f"\n[19] Audit complete. Results saved to {result_path}")
    print(f"[19] Summary: {result['verdict']['total_score']}/{result['verdict']['max_score']} - {'PASS' if result['verdict']['overall_pass'] else 'FAIL'}")


if __name__ == "__main__":
    main()
