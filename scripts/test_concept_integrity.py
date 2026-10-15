"""Validate concept integrity; Q1-Q8 acceptance is reported separately (requires PyYAML)."""
import collections
import json
from pathlib import Path
import re
import subprocess
import sys
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
        contracts = [*self.terms.values(), *self.invariants,
                     *(c for inv in self.invariants for c in inv.get("clauses", []))]
        for contract in contracts:
            for assumption in contract.get("assumptions", []):
                self.assertIn(assumption["decision_key"], active)
                self.assertEqual(contract["status"], "draft")
        cache = (CONCEPT / "decisions.md").read_text()
        self.assertEqual(set(re.findall(r"^## (AUTO:.+)$", cache, re.M)), set(active))

    def test_independent_clauses_and_conflicts(self) -> None:
        by_id = {i["id"]: i for i in self.invariants}
        conflicts = {c["id"]: c for c in self.documents["conflicts.yml"]["conflicts"]}
        for ident in ("INV-LOOP-001", "INV-MEM-001", "INV-ERR-001", "INV-API-001",
                      "INV-API-009", "INV-UTIL-001", "INV-UTL-004", "INV-INF-001",
                      "INV-HOOK-001", "INV-HOOK-004", "INV-API-006"):
            self.assertTrue(by_id[ident].get("clauses"), ident)
        for inv in self.invariants:
            clauses = inv.get("clauses", [])
            if clauses:
                ids = [c["id"] for c in clauses]
                self.assertEqual(set(ids), {inv["id"], *inv.get("merged_ids", [])})
                self.assertEqual(len(ids), len(set(ids)))
                for clause in clauses:
                    self.assertTrue(clause["constraint"], clause["id"])
                    self.assertTrue(clause["evidence"], clause["id"])
            for contract in [inv, *clauses]:
                for ident in contract.get("linked_conflicts", []):
                    self.assertIn(ident, conflicts)
                    self.assertIn(inv["id"], conflicts[ident]["related_invariants"])
                    if conflicts[ident]["status"] == "open":
                        self.assertEqual(contract["verification_status"], "contradicted")
        for conflict in conflicts.values():
            for ident in conflict.get("related_invariants", []):
                self.assertIn(ident, by_id)
                self.assertIn(conflict["id"], by_id[ident]["linked_conflicts"])
        # These unresolved interpretations cannot silently become certified contracts.
        for ident in ("INV-DOM-011", "INV-API-009"):
            self.assertEqual(by_id[ident]["status"], "draft")
            self.assertTrue(by_id[ident]["assumptions"])
            self.assertTrue(by_id[ident]["linked_conflicts"])
        # A stable policy can remain valid while its enforcement is contradicted.
        self.assertTrue(by_id["INV-QUAL-001"]["evidence"])
        self.assertEqual(by_id["INV-QUAL-001"]["verification_status"], "contradicted")

    def test_new_terms_admission(self) -> None:
        for entry in self.documents["term_queue.yml"]["queue"]:
            if entry["decision"] != "accepted":
                continue
            term = entry["proposed_canonical"]
            self.assertIn(term, self.terms)
            primary = {e["source"] for e in entry["evidence"]
                       if re.search(r"\.test\.tsx?$", e["source"])}
            self.assertGreaterEqual(len(primary), 2, term)
            self.assertTrue(self.terms[term]["boundaries"]["includes"])
            self.assertTrue(self.terms[term]["boundaries"]["excludes"])
            self.assertTrue(self.mappings[term]["code_symbols"])

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

    def test_stage_11_measurements(self) -> None:
        quality = json.loads((CONCEPT / "ontology_metrics.json").read_text())["stage_11_quality"]
        modules, classes = set(), []
        for path in (ROOT / "src").rglob("*"):
            if path.suffix not in (".ts", ".tsx") or path.name.endswith(".d.ts"):
                continue
            if path.stem == "index" or "test-utils" in path.parts or re.search(
                    r"\.(test|spec|setup|helpers|types)(\.|$)", path.name):
                continue
            source = path.read_text()
            relative = str(path.relative_to(ROOT))
            if re.search(r"^export (?:default |async |abstract )?(?:class|function|const|interface|type)\b",
                         source, re.M):
                modules.add(relative)
            classes.extend(relative for _ in re.findall(r"^export (?:abstract )?class \w+", source, re.M))
        mapped = {re.sub(r":\d+(?:-\d+)?$", "", s.split("::")[0])
                  for m in self.mappings.values() for s in m["code_symbols"]}
        q1 = quality["Q1"]
        self.assertEqual(q1["production_modules"], len(modules))
        self.assertEqual(q1["production_classes"], len(classes))
        self.assertEqual(q1["unmapped_modules"], sorted(modules - mapped))
        self.assertEqual(q1["mapped_modules"], len(modules & mapped))
        self.assertEqual(q1["mapped_classes"], sum(c in mapped for c in classes))
        expected = {
            "Q1": min(len(modules & mapped) / len(modules), sum(c in mapped for c in classes) / len(classes)),
            "Q2": sum(bool(self.mappings.get(t, {}).get("code_symbols")) for t in self.terms) / len(self.terms),
            "Q3": json.loads((CONCEPT / "ontology_metrics.json").read_text())["stage_11_q3"]["ratio"],
            "Q4": sum(t["status"] == "draft" for t in self.terms.values()) / len(self.terms),
            "Q5": sum(c["term_canonical"] == "__UNMAPPED__" for c in self.claims) / len(self.claims),
            "Q6": len(self.terms),
            "Q7": bool(self.documents["charter.yml"]["product_goal"]["north_star"] and
                       self.documents["charter.yml"]["milestones"]),
            "Q8": sum(bool(t.get("evidence")) for t in self.terms.values()) / len(self.terms),
        }
        for key, threshold in zip(expected, (.8, .9, .5, .3, .2, 80, True, 1.0)):
            self.assertEqual(quality[key]["value"], expected[key], key)
            self.assertEqual(quality[key]["threshold"], threshold, key)
            passed = expected[key] <= threshold if key in ("Q4", "Q5", "Q6") else expected[key] >= threshold
            self.assertEqual(quality[key]["status"], "PASS" if passed else "FAIL", key)


if __name__ == "__main__":
    if "--quality" in sys.argv:
        result = unittest.main(argv=[sys.argv[0]], exit=False).result
        quality = json.loads((CONCEPT / "ontology_metrics.json").read_text())["stage_11_quality"]
        print("| 指標 | 現在値 | 基準 | 判定 |\n|---|---:|---:|---|")
        for key, metric in quality.items():
            print(f"| {key} | {metric['value']} | {metric['threshold']} | {metric['status']} |")
        sys.exit(not result.wasSuccessful() or any(m["status"] == "FAIL" for m in quality.values()))
    unittest.main()
