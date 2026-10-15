"""Validate the stage 10 concept model without external services (requires PyYAML)."""
import collections
import json
from pathlib import Path
import re
import subprocess
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONCEPT = ROOT / ".concept"


class UniqueKeyLoader(yaml.SafeLoader):
    pass


def unique_mapping(loader: yaml.SafeLoader, node: yaml.MappingNode) -> dict:
    keys = [loader.construct_object(key) for key, _ in node.value]
    if len(keys) != len(set(keys)):
        raise ValueError(f"Duplicate YAML key: {keys}")
    return loader.construct_mapping(node)


UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping
)


def read_source(source: str) -> str | None:
    path = source.split("#")[0]
    if path.startswith("git:"):
        return subprocess.check_output(
            ["git", "show", path[4:]], cwd=ROOT, text=True
        )
    target = ROOT / path
    if not target.exists():
        raise ValueError(f"Missing evidence: {source}")
    return target.read_text() if target.is_file() else None


class ConceptIntegrityTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.documents = {
            p.name: yaml.load(p.read_text(), Loader=UniqueKeyLoader)
            for p in CONCEPT.glob("*.yml")
        }
        cls.terms = cls.documents["ontology.yml"]["canonical_terms"]
        cls.mappings = cls.documents["mappings.yml"]["mappings"]
        cls.invariants = cls.documents["invariants.yml"]["invariants"]
        cls.budget = cls.documents["ontology_budget.yml"]
        cls.claims = [json.loads(line) for line in
                      (CONCEPT / "claims.ndjson").read_text().splitlines()]

    def test_schema_and_references(self) -> None:
        aliases = [s for t in self.terms.values() for s in t.get("synonyms", [])]
        self.assertEqual(len(aliases), len(set(aliases)), "Ambiguous synonyms")
        self.assertFalse(set(aliases) & set(self.terms), "Canonical term shadowed")
        ids = [t["id"] for t in self.terms.values()]
        self.assertEqual(len(ids), len(set(ids)))
        for name, term in self.terms.items():
            with self.subTest(term=name):
                self.assertIn(term["layer"], ("core", "domain", "aux"))
                self.assertIn(term["status"], ("stable", "draft"))
                self.assertTrue(term["evidence"])
                self.assertTrue(set(term.get("related_terms", [])) <= set(self.terms))
        invariant_ids = [i for inv in self.invariants
                         for i in [inv["id"], *inv.get("merged_ids", [])]]
        self.assertEqual(len(invariant_ids), len(set(invariant_ids)))
        for inv in self.invariants:
            self.assertTrue(inv["constraint"], inv["id"])
            self.assertTrue(set(inv.get("related_terms", [])) <= set(self.terms))

    def test_mapping_targets(self) -> None:
        self.assertEqual(set(self.terms), set(self.mappings))
        for term, mapping in self.mappings.items():
            self.assertTrue(mapping["code_symbols"], term)
            for target in mapping["code_symbols"] + mapping.get("db", []):
                path, _, symbol = target.partition("::")
                path = re.sub(r":\d+(?:-\d+)?$", "", path)
                text = read_source(path)
                if symbol:
                    self.assertIsNotNone(text, target)
                    self.assertTrue(re.search(r"\b" + re.escape(symbol) + r"\b", text), target)
            for route in mapping.get("api", []):
                method, url = route.split(" ", 1)
                path = ROOT / "src/app" / url.lstrip("/") / "route.ts"
                self.assertTrue(path.is_file(), route)
                self.assertRegex(path.read_text(), r"export (?:async )?function " + method)

    def test_budget(self) -> None:
        limits = self.budget["limits"]
        self.assertLessEqual(len(self.terms), limits["total_terms_max"])
        for layer in ("core", "domain", "aux"):
            self.assertLessEqual(sum(t["layer"] == layer for t in self.terms.values()),
                                 limits[layer + "_max"])
        draft = sum(t["status"] == "draft" for t in self.terms.values()) / len(self.terms)
        self.assertLessEqual(draft, self.budget["ratios"]["draft_ratio_max"])
        for name, key in (("invariants", "invariants"), ("ambiguities", "ambiguities"),
                          ("conflicts", "conflicts"), ("mappings", "mappings"),
                          ("term_queue", "queue")):
            self.assertLessEqual(len(self.documents[name + ".yml"][key]),
                                 limits[key + "_max"])
        pending = sum(t["decision"] == "pending" for t in
                      self.documents["term_queue.yml"]["queue"])
        self.assertLessEqual(pending, self.budget["ratios"]["queue_pending_max"])
        self.assertLessEqual(len(self.claims), limits["claims_max_lines"])
        self.assertLessEqual((CONCEPT / "claims.ndjson").stat().st_size, limits["claims_max_bytes"])
        self.assertTrue(all(n <= 300 for n in collections.Counter(
            c["run_id"] for c in self.claims).values()))
        unmapped = sum(c["term_canonical"] == "__UNMAPPED__" for c in self.claims)
        self.assertLessEqual(unmapped / max(1, len(self.claims)),
                             self.budget["ratios"]["unmapped_ratio_max"])
        self.assertLessEqual(len((CONCEPT / "decisions.md").read_text().splitlines()),
                             limits["decisions_max_lines"])

    def test_evidence_and_claims(self) -> None:
        def check(node: object) -> None:
            if isinstance(node, dict):
                if "source" in node:
                    text = read_source(node["source"])
                    if "quote" in node:
                        self.assertIsNotNone(text, node["source"])
                        self.assertTrue(node["quote"] in text, node["source"])
                for value in node.values():
                    check(value)
            elif isinstance(node, list):
                for value in node:
                    check(value)
        for document in self.documents.values():
            check(document)
        check(self.claims)
        for claim in self.claims:
            self.assertIn(claim["term_canonical"], [*self.terms, "__UNMAPPED__"])
            if claim["claim_type"] == "hypothesis":
                self.assertLessEqual(claim["confidence"], 0.4)

    def test_auto_decisions(self) -> None:
        ambiguities = self.documents["ambiguities.yml"]["ambiguities"]
        conflicts = self.documents["conflicts.yml"]["conflicts"]
        conflict_ids = {c["id"] for c in conflicts}
        active = {a["auto_decision"]["decision_key"]: a["auto_decision"]
                  for a in ambiguities if a.get("auto_decision", {}).get("status") == "applied"}
        for a in ambiguities:
            self.assertIn(a["term"], self.terms)
            self.assertTrue(set(a["linked_conflicts"]) <= conflict_ids)
        for c in conflicts:
            self.assertIn(c["term"], self.terms)
            if "active_workaround" in c:
                self.assertIn(c["active_workaround"]["decision_key"], active)
        for key, decision in active.items():
            self.assertGreater(decision["expires_after_runs"], 0)
            self.assertTrue(decision["revert_triggers"])
        for term in self.terms.values():
            for assumption in term.get("assumptions", []):
                self.assertIn(assumption["decision_key"], active)
                self.assertEqual(term["status"], "draft")
        cache = (CONCEPT / "decisions.md").read_text()
        self.assertEqual(set(re.findall(r"^## (AUTO:.+)$", cache, re.M)), set(active))

    def test_measured_state(self) -> None:
        metrics = json.loads((CONCEPT / "ontology_metrics.json").read_text())
        state = json.loads((CONCEPT / "run_state.json").read_text())
        self.assertEqual(metrics["run_id"], state["last_run_id"])
        self.assertEqual(metrics["total_terms"], len(self.terms))
        self.assertEqual(metrics["by_layer"], dict(collections.Counter(
            t["layer"] for t in self.terms.values())))
        self.assertEqual(metrics["draft_ratio"], sum(t["status"] == "draft"
                         for t in self.terms.values()) / len(self.terms))
        self.assertEqual(metrics["invariants_count"], len(self.invariants))
        self.assertEqual(metrics["claims_retained_lines"], len(self.claims))
        self.assertEqual(state["claims_retained_lines"], len(self.claims))
        self.assertEqual(metrics["mappings_count"], len(self.mappings))
        self.assertEqual(metrics["queue_pending"], sum(t["decision"] == "pending"
                         for t in self.documents["term_queue.yml"]["queue"]))
        test_files = list((ROOT / "src").rglob("*.test.ts")) + list(
            (ROOT / "src").rglob("*.test.tsx")) + list((ROOT / "scripts").glob("*.test.ts"))
        self.assertEqual(metrics["stage_11_q3"]["test_files"], len(test_files))
        self.assertEqual(metrics["stage_11_q3"]["ratio"], len(self.invariants) / len(test_files))
        self.assertEqual(metrics["stage_11_q3"]["status"],
                         "PASS" if len(self.invariants) / len(test_files) >= 0.5 else "FAIL")


if __name__ == "__main__":
    unittest.main()
