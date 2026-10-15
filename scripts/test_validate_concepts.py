import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validate_concepts", ROOT / "scripts/validate_concepts.py")
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


class ConceptValidationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / ".concept", self.root / ".concept")
        for name in ["src", "prisma", "AGENTS.md", "SYSTEM_CONSTITUTION.md", "LOOP.md"]:
            target = ROOT / name
            if target.is_dir():
                shutil.copytree(target, self.root / name)
            else:
                shutil.copy2(target, self.root / name)

    def result(self) -> dict:
        return VALIDATOR.validate(self.root)

    def replace(self, name: str, old: str, new: str) -> None:
        path = self.root / ".concept" / name
        self.assertIn(old, path.read_text())
        path.write_text(path.read_text().replace(old, new, 1))

    def test_current_model_keeps_all_original_ids(self) -> None:
        result = self.result()
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["measured"]["total_terms"], 49)
        self.assertEqual(result["measured"]["invariant_ids"], 100)
        self.assertEqual(result["measured"]["invariants"], 60)

    def test_duplicate_yaml_key_is_rejected(self) -> None:
        path = self.root / ".concept/charter.yml"
        path.write_text(path.read_text() + '\nversion: duplicate\n')
        with self.assertRaisesRegex(ValueError, "Duplicate YAML keys"):
            self.result()

    def test_budgets_are_enforced(self) -> None:
        self.replace("ontology_budget.yml", "total_terms_max: 80", "total_terms_max: 48")
        self.assertTrue(any("Budget exceeded" in e for e in self.result()["errors"]))

    def test_mapping_symbol_must_exist(self) -> None:
        self.replace("mappings.yml", "class StatsService", "class MissingStatsService")
        self.assertTrue(any("Missing declaration" in e for e in self.result()["errors"]))

    def test_unknown_canonical_reference_is_rejected(self) -> None:
        self.replace("ontology.yml", "related_terms: [Stats, StatsOverview]", "related_terms: [Unknown]")
        self.assertTrue(any("Unknown related term" in e for e in self.result()["errors"]))

    def test_cache_must_be_derived_from_active_decisions(self) -> None:
        path = self.root / ".concept/decisions.md"
        path.write_text(path.read_text() + '\n## AUTO:unknown\n')
        self.assertIn("AUTO cache differs from SOT", self.result()["errors"])

    def test_stale_metrics_are_rejected(self) -> None:
        path = self.root / ".concept/ontology_metrics.json"
        data = json.loads(path.read_text())
        data["total_terms"] = 43
        path.write_text(json.dumps(data))
        self.assertIn("Stale metric: total_terms", self.result()["errors"])

    def test_claim_run_limit_is_enforced(self) -> None:
        path = self.root / ".concept/claims.ndjson"
        claim = json.loads(path.read_text().splitlines()[0])
        with path.open("a") as handle:
            handle.write((json.dumps(claim) + '\n') * 301)
        self.assertIn("Claims/run > 300", self.result()["errors"])


if __name__ == "__main__":
    unittest.main()
