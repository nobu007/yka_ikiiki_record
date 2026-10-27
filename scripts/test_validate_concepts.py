from pathlib import Path
import unittest
from unittest.mock import patch

import yaml

from validate_concepts import UniqueKeyLoader, validate


ROOT = Path(__file__).resolve().parents[1]


class ConceptValidationTests(unittest.TestCase):
    def test_rejects_duplicate_yaml_keys(self) -> None:
        with self.assertRaisesRegex(ValueError, "Duplicate YAML key"):
            yaml.load("rules: 1\nrules: 2\n", Loader=UniqueKeyLoader)

    def test_rejects_broken_references_and_over_budget_state(self) -> None:
        original_read = Path.read_text
        for filename, before, after, expected in [
            ("ontology.yml", 'layer: "core"', 'layer: "invalid"', "Invalid concept layer"),
            ("mappings.yml", "src/domain/entities/Record.ts", "src/missing.ts", "Missing mapping"),
            ("ontology_budget.yml", "total_terms_max: 80", "total_terms_max: 1", "Budget exceeded"),
            ("ontology.yml", 'related_terms: ["Stats", "StatsOverview"]', 'related_terms: ["MissingTerm"]', "Dangling term"),
        ]:
            with self.subTest(filename=filename, error=expected):
                target = ROOT / ".concept" / filename
                original = original_read(target)
                self.assertIn(before, original)
                changed = original.replace(before, after, 1)

                def read_text(path: Path, *args: object, **kwargs: object) -> str:
                    return changed if path == target else original_read(path, *args, **kwargs)

                with patch.object(Path, "read_text", read_text):
                    result = validate(ROOT)
                self.assertEqual(result["structural_quality"], "FAIL")
                self.assertTrue(any(expected in error for error in result["errors"]))


if __name__ == "__main__":
    unittest.main()
