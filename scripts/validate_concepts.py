from collections import Counter
from pathlib import Path
import argparse
import json
import re

import yaml


class UniqueKeyLoader(yaml.SafeLoader):
    pass


def unique_mapping(loader: UniqueKeyLoader, node: yaml.MappingNode) -> dict:
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node)
        if key in result:
            raise ValueError(f"Duplicate YAML key: {key}")
        result[key] = loader.construct_object(value_node)
    return result


UniqueKeyLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping)


def validate(root: Path) -> dict:
    concept = root / ".concept"
    documents = {
        p.stem: yaml.load(p.read_text(), Loader=UniqueKeyLoader)
        for p in concept.glob("*.yml")
    }
    terms = documents["ontology"]["canonical_terms"]
    mappings = documents["mappings"]["mappings"]
    invariants = documents["invariants"]["invariants"]
    ambiguities = documents["ambiguities"]["ambiguities"]
    conflicts = documents["conflicts"]["conflicts"]
    queue = documents["term_queue"]["queue"]
    budget = documents["ontology_budget"]
    state = json.loads((concept / "run_state.json").read_text())
    errors = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    def source_exists(source: str) -> bool:
        path = re.split(r"::|#L|:\d", source)[0]
        target = (root / path).resolve()
        if not target.is_relative_to(root.resolve()) or not target.exists():
            return False
        if "::" in source and target.is_file():
            symbol = source.split("::", 1)[1].split(" ", 1)[-1]
            return bool(re.search(r"\b" + re.escape(symbol) + r"\b", target.read_text()))
        return True

    layers = Counter(t["layer"] for t in terms.values())
    check(set(layers) <= {"core", "domain", "aux"}, "Invalid concept layer")
    check(len({t["id"] for t in terms.values()}) == len(terms), "Duplicate term ID")
    check(set(terms) == set(mappings), "Term/mapping keys differ")
    synonyms = [s for t in terms.values() for s in t.get("synonyms", [])]
    check(len(synonyms) == len(set(synonyms)), "Ambiguous synonym ownership")
    check(not set(synonyms) & set(terms), "Synonym shadows a canonical term")
    for name, term in terms.items():
        check(term["status"] in {"stable", "draft"}, f"Invalid status: {name}")
        check(all(term["boundaries"].get(k) for k in ["includes", "excludes"]), f"Empty boundary: {name}")
        check(set(term.get("related_terms", [])) <= set(terms), f"Dangling term reference: {name}")
        check(bool(term.get("evidence")), f"Missing evidence: {name}")
        for e in term.get("evidence", []):
            check(source_exists(e["source"]), f"Missing evidence source: {name}: {e['source']}")
            path = root / e["source"].split("#L")[0]
            if path.is_file() and e.get("quote"):
                check(e["quote"] in path.read_text(), f"Nonverbatim quote: {name}")
    for name, mapping in mappings.items():
        check(bool(mapping.get("code_symbols")), f"Unmapped concept: {name}")
        for source in mapping.get("code_symbols", []) + mapping.get("db", []):
            check(source_exists(source), f"Missing mapping: {name}: {source}")
        for endpoint in mapping.get("api", []):
            method, route = endpoint.split(" ", 1)
            path = root / "src/app" / route.lstrip("/") / "route.ts"
            check(path.is_file() and bool(re.search(r"function\s+" + method + r"\b", path.read_text())), f"Missing API: {endpoint}")
    invariant_ids = []
    for invariant in invariants:
        invariant_ids.append(invariant["id"])
        invariant_ids.extend(c["id"] for c in invariant.get("merged_constraints", []))
        check(set(invariant.get("related_terms", [])) <= set(terms), f"Dangling invariant: {invariant['id']}")
        check(invariant.get("strength") in {"hard", "soft"}, f"Missing strength: {invariant['id']}")
    check(len(invariant_ids) == len(set(invariant_ids)), "Duplicate invariant/merged ID")
    decisions = {a["auto_decision"]["decision_key"] for a in ambiguities if a.get("auto_decision", {}).get("status") == "applied"}
    conflict_ids = {c["id"] for c in conflicts}
    for a in ambiguities:
        check(a["term"] in terms, f"Dangling ambiguity: {a['id']}")
        check(set(a.get("linked_conflicts", [])) <= conflict_ids, f"Dangling conflict link: {a['id']}")
        decision = a.get("auto_decision", {})
        check(bool(decision.get("revert_triggers")) and decision.get("expires_after_runs", 0) > 0, f"Unbounded AUTO: {a['id']}")
        for evidence in a.get("evidence", []):
            check(source_exists(evidence["source"]), f"Missing ambiguity evidence: {a['id']}")
    for c in conflicts:
        check(c["term"] in terms, f"Dangling conflict: {c['id']}")
        check(c.get("active_workaround", {}).get("decision_key") in decisions, f"Unlinked workaround: {c['id']}")
    for term in terms.values():
        for assumption in term.get("assumptions", []):
            check(assumption["decision_key"] in decisions, "Dangling assumption")
    for tombstone in documents["tombstones"]["tombstones"]:
        replacement = tombstone.get("replacement", tombstone.get("consolidated_into"))
        check(not replacement or replacement in terms, f"Dangling tombstone: {tombstone['term']}")
    claims = [json.loads(line) for line in (concept / "claims.ndjson").read_text().splitlines() if line.strip()]
    runs = Counter(c["run_id"] for c in claims)
    check(all(n <= 300 for n in runs.values()), "Claims exceed 300/run")
    for claim in claims:
        check(source_exists(claim["source"]), f"Missing claim source: {claim['source']}")
        check(claim["claim_type"] != "hypothesis" or claim["confidence"] <= 0.4, "Overconfident hypothesis")
    check(state["claims_retained_lines"] == len(claims), "Claim cursor is stale")
    cache = (concept / "decisions.md").read_text()
    cache_keys = set(re.findall(r"^## (AUTO:\S+)$", cache, re.MULTILINE))
    check(cache_keys == decisions, "Active AUTO cache differs from source")
    observed = dict(total_terms=len(terms), **{f"{k}": layers[k] for k in ["core", "domain", "aux"]}, invariants=len(invariants), ambiguities=len(ambiguities), conflicts=len(conflicts), mappings=len(mappings), queue=len(queue), claims_lines=len(claims), claims_bytes=(concept / "claims.ndjson").stat().st_size, decisions_lines=len(cache.splitlines()))
    for key, limit in budget["limits"].items():
        metric = key.removesuffix("_max")
        check(observed[metric] <= limit, f"Budget exceeded: {metric}")
    draft_ratio = sum(t["status"] == "draft" for t in terms.values()) / max(1, len(terms))
    pending = sum(q["decision"] == "pending" for q in queue)
    check(draft_ratio <= budget["ratios"]["draft_ratio_max"], "Draft budget exceeded")
    check(pending <= budget["ratios"]["queue_pending_max"], "Queue budget exceeded")
    return dict(run_id=state["last_run_id"], **observed, by_layer=dict(layers), draft_ratio=draft_ratio, queue_pending=pending, claims_retained_lines=len(claims), decisions_md_lines=len(cache.splitlines()), gc_actions=dict(merged=0, deleted=0, deprecated=0), invariant_groups_merged=len(invariant_ids)-len(invariants), represented_invariants=len(invariant_ids), structural_quality="FAIL" if errors else "PASS", open_conflicts=sum(c["status"] == "open" for c in conflicts), errors=errors)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-metrics", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    result = validate(root)
    if args.write_metrics:
        (root / ".concept/ontology_metrics.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(bool(result["errors"]))
