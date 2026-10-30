import json
import re
from collections import Counter
from pathlib import Path

import yaml


class UniqueKeysLoader(yaml.SafeLoader):
    def construct_mapping(self, node: yaml.MappingNode, deep: bool = False) -> dict:
        keys = [self.construct_object(key, deep=deep) for key, _ in node.value]
        if len(keys) != len(set(keys)):
            raise ValueError(f"Duplicate YAML keys at line {node.start_mark.line + 1}")
        return super().construct_mapping(node, deep=deep)


def validate(root: Path) -> dict:
    concept = root / ".concept"
    errors: list[str] = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    def source(ref: str, quote: str | None = None) -> None:
        path, _, location = ref.partition("#L")
        path = path.split("::")[0]
        target = root / path
        if not target.resolve().is_relative_to(root.resolve()) or target.suffix not in {".ts", ".tsx", ".md", ".yml", ".prisma"} and not target.is_dir():
            errors.append(f"Source outside permitted repository files: {ref}")
            return
        check(target.exists(), f"Missing source: {ref}")
        if not target.is_file():
            return
        content = target.read_text()
        if location:
            first = int(location.split("-")[0])
            last = int(location.split("-L")[-1])
            lines = content.splitlines()
            check(0 < first <= last <= len(lines), f"Invalid source lines: {ref}")
            content = "\n".join(lines[first - 1:last])
        if quote:
            check(quote in content, f"Quote does not match source: {ref}")
        if "::" in ref:
            declaration = ref.split("::", 1)[1]
            kind, name = declaration.split(" ", 1)
            pattern = rf"\b{re.escape(kind)}\s+{re.escape(name)}\b"
            check(bool(re.search(pattern, content)), f"Missing declaration: {ref}")

    data = {p.stem: yaml.load(p.read_text(), Loader=UniqueKeysLoader)
            for p in concept.glob("*.yml")}
    terms = data["ontology"]["canonical_terms"]
    mappings = data["mappings"]["mappings"]
    invariants = data["invariants"]["invariants"]
    ambiguities = data["ambiguities"]["ambiguities"]
    conflicts = data["conflicts"]["conflicts"]
    queue = data["term_queue"]["queue"]
    budget = data["ontology_budget"]
    check(set(terms) == set(mappings), "Terms and mappings differ")
    ids: list[str] = []
    for term, definition in terms.items():
        ids.append(definition["id"])
        check(definition["layer"] in {"core", "domain", "aux"}, f"Invalid layer: {term}")
        check(definition["status"] in {"draft", "stable"}, f"Invalid status: {term}")
        check(bool(definition["evidence"]), f"Missing evidence: {term}")
        for related in definition.get("related_terms", []):
            check(related in terms, f"Unknown related term: {term}/{related}")
        for evidence in definition["evidence"]:
            source(evidence["source"], evidence["quote"])
    check(len(ids) == len(set(ids)), "Duplicate term IDs")
    for mapping in mappings.values():
        check(bool(mapping["code_symbols"]), "Empty code mapping")
        for ref in mapping["code_symbols"] + mapping["db"]:
            source(ref)
        for endpoint in mapping["api"]:
            method, route = endpoint.split(" ", 1)
            path = root / "src/app" / route.lstrip("/") / "route.ts"
            check(path.is_file(), f"Missing API route: {endpoint}")
            if path.is_file():
                check(bool(re.search(rf"export async function {method}\b", path.read_text())),
                      f"Missing HTTP method: {endpoint}")
    invariant_ids: list[str] = []
    for invariant in invariants:
        for rule in [invariant] + invariant.get("clauses", []):
            invariant_ids.append(rule["id"])
            check(bool(rule["statement"]), f"Empty invariant: {rule['id']}")
            check(rule["strength"] in {"hard", "soft"}, f"Invalid strength: {rule['id']}")
        check(invariant["status"] in {"stable", "draft"}, "Invalid invariant status")
        for term in invariant["related_terms"]:
            check(term in terms, f"Unknown invariant term: {term}")
        for evidence in invariant["evidence"]:
            source(evidence["source"], evidence["quote"])
        for test in invariant["checks"]:
            source(test["target"])
    check(len(invariant_ids) == len(set(invariant_ids)), "Duplicate invariant/clause IDs")
    decisions = {a["auto_decision"]["decision_key"]: a["auto_decision"] for a in ambiguities}
    for ambiguity in ambiguities:
        check(ambiguity["term"] in terms, "Unknown ambiguity term")
        basis = ambiguity["uncertainty_inputs"]
        strength = min(1, .2 * basis["independent_sources"]) * sum(basis["artifact_weights"]) / len(basis["artifact_weights"])
        expected = min(1, .45 * (basis["unknown"] + basis["contradictions"]) / (basis["related_claims"] + 1) + .1 * (1 - strength))
        check(abs(ambiguity["uncertainty"] - expected) < .000001, "Uncertainty formula differs")
        decision = ambiguity["auto_decision"]
        check(decision["expires_after_runs"] > 0 and bool(decision["revert_triggers"]),
              "AUTO decision missing expiry/revert triggers")
        check(set(ambiguity["linked_conflicts"]) <= {c["id"] for c in conflicts},
              "Unknown linked conflict")
        for evidence in ambiguity["evidence"]:
            source(evidence["source"], evidence["quote"])
    for definition in list(terms.values()) + invariants:
        for assumption in definition.get("assumptions", []):
            check(assumption["decision_key"] in decisions, "Dangling assumption decision")
    for conflict in conflicts:
        check(conflict["term"] in terms, "Unknown conflict term")
        if conflict["status"] == "open":
            check(conflict["active_workaround"]["decision_key"] in decisions,
                  "Open conflict missing active workaround")
    tombstones = data["tombstones"]["tombstones"]
    check(len({(t["term"], t["former_id"]) for t in tombstones}) == len(tombstones),
          "Duplicate tombstone composite identity")
    for tombstone in tombstones:
        check(tombstone.get("replacement") in set(terms) | {None}, "Unknown tombstone replacement")
    claims = [json.loads(line) for line in (concept / "claims.ndjson").read_text().splitlines()]
    for claim in claims:
        check(claim["term_canonical"] in set(terms) | {"__UNMAPPED__"}, "Unmapped claim term")
        check(claim["claim_type"] != "hypothesis" or claim["confidence"] <= .4,
              "Overconfident hypothesis")
    check(all(n <= 300 for n in Counter(c["run_id"] for c in claims).values()), "Claims/run > 300")
    layers = Counter(v["layer"] for v in terms.values())
    measured = {
        "total_terms": len(terms), "by_layer": dict(layers),
        "draft_ratio": sum(v["status"] == "draft" for v in terms.values()) / max(1, len(terms)),
        "invariants": len(invariants), "invariant_ids": len(invariant_ids),
        "mappings": len(mappings), "ambiguities": len(ambiguities), "conflicts": len(conflicts),
        "queue_pending": sum(t["decision"] == "pending" for t in queue),
        "claims_retained_lines": len(claims),
        "decisions_md_lines": len((concept / "decisions.md").read_text().splitlines()),
    }
    counts = {"total_terms_max": len(terms), "invariants_max": len(invariants),
              "ambiguities_max": len(ambiguities), "conflicts_max": len(conflicts),
              "mappings_max": len(mappings), "term_queue_max": len(queue),
              "claims_lines_max": len(claims), "claims_bytes_max": (concept / "claims.ndjson").stat().st_size,
              "decisions_lines_max": measured["decisions_md_lines"]}
    counts.update({layer + "_max": layers[layer] for layer in ["core", "domain", "aux"]})
    for key, count in counts.items():
        check(count <= budget["limits"][key], f"Budget exceeded: {key} ({count})")
    check(measured["draft_ratio"] <= budget["ratios"]["draft_ratio_max"], "Draft ratio exceeded")
    check(measured["queue_pending"] <= budget["ratios"]["queue_pending_max"], "Queue pending exceeded")
    cache = (concept / "decisions.md").read_text()
    active_keys = {key for key, value in decisions.items() if value["status"] == "applied"}
    check(set(re.findall(r"^## (AUTO:.+)$", cache, re.M)) == active_keys, "AUTO cache differs from SOT")
    state = json.loads((concept / "run_state.json").read_text())
    check(state["claims_retained_lines"] == len(claims), "Run state claim count differs")
    metrics = json.loads((concept / "ontology_metrics.json").read_text())
    for key, value in measured.items():
        check(metrics.get(key) == value, f"Stale metric: {key}")
    return {"status": "FAIL" if errors else "PASS", "measured": measured, "errors": errors}


if __name__ == "__main__":
    report = validate(Path(__file__).resolve().parents[1])
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(report["status"] != "PASS")
