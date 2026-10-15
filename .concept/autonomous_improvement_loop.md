# Concept maintenance

This is a reference for the repository's concept model, not a separate driver.
`SYSTEM_CONSTITUTION.md`, `PURPOSE.md`, `LOOP.md`, and `.concept/autopilot.yml`
retain their governing roles. Task scope and publication restrictions come from
those sources and the current dispatch.

## Sources of truth

- `ontology.yml`: canonical definitions, layers, boundaries, and evidence.
- `invariants.yml`: contracts; the statement and every nested clause must hold.
  Clause IDs retain the original invariant identifiers after consolidation.
- `mappings.yml`: existing code symbols, database models, and API routes.
- `ambiguities.yml`: provisional AUTO decisions, expiry, and reversal conditions.
- `conflicts.yml`: unresolved contradictions remain open with workarounds.
- `term_queue.yml`: admission required before adding a new canonical concept.
- `ontology_budget.yml`: limits, ratios, and retention thresholds.
- `tombstones.yml`: former IDs and replacement concepts.

`claims.ndjson` is append-only. `decisions.md` is a disposable cache of applied
AUTO decisions. Metrics and run state are observations, not proof of correctness.
Legacy terms without update ages use the explicit GC baseline in `run_state.json`;
do not invent inactivity to delete them.

## Local checks

Run from the repository root with Python 3 and PyYAML installed:

```bash
python3 scripts/validate_concepts.py
python3 -m unittest discover -s scripts -p 'test_validate_concepts.py'
LC_ALL=ja_JP.UTF-8 TZ=Asia/Tokyo npm test -- --runInBand
node_modules/.bin/eslint .
```

The concept validator is read-only and exits nonzero on structural, reference,
quote, budget, cache, or metric drift. It does not establish semantic correctness,
production security, test coverage, or compliance of all application code.
Open conflicts may coexist with a structural PASS; inspect their actual evidence.
Repository lint/test results must be reported separately, including baseline failures.
