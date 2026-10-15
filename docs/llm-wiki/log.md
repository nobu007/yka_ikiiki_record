# Knowledge changes

## Concept contracts and stage 11 acceptance

Verified the five previously queued feature families against their entity/repository tests and implementation paths before admission; extended existing record/user repository mappings without new repository concepts. The dictionary now contains 54 terms (8 core, 21 domain, 25 aux).

Recovered independent invariant clauses and original IDs from commit 0839402ab1d510291542085c61dbc70cdbb6b686, removed duplicate restatements, and attached precise sources. Corrected the distinction between schema generation bounds, a complete default config, and service argument defaults. Seasonal fixtures do not prove runtime validation. Explicit-any prohibition comes from SYSTEM_CONSTITUTION.md; eslint.config.mjs disables its enforcement. Empty-average and concurrent filename guarantees remain provisional rather than stable certifications.

Evidence: `python3 scripts/test_concept_integrity.py -v` checks the persisted documents; `--quality` checks measured Q1-Q8 and fails Q3. The Q3 threshold needs at least 114 invariant records for 227 tests, while ontology_budget.yml permits at most 60; counting clauses as additional records would hide the conflict. MS-001 was reopened accordingly. Full Jest passed 2,490 tests in 227 suites; ESLint failed with 43 errors and zero warnings. No application source, dependencies, constitution, or inter-repository relationships changed. Full-chain completion remains unverified.
