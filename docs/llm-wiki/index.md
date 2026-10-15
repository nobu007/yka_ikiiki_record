# Repository knowledge

- [Repository relations](relations.md)
- [Concept model](../../.concept/ontology.yml): 49 canonical terms; all have source mappings in [mappings.yml](../../.concept/mappings.yml).
- [Open semantic conflicts](../../.concept/conflicts.yml): empty averages and export filename uniqueness.
- [Authentication ambiguity](../../.concept/ambiguities.yml): a conservative AUTO decision treats the current authentication as a prototype; this is not a production security certification.
- [Concept metrics](../../.concept/ontology_metrics.json) contain measured values and explicitly separate stage 10 checks from broader quality gates. Historical milestone progress notes in charter.yml are not current verification evidence.

Run `python3 scripts/test_concept_integrity.py -v` from the repository root (requires PyYAML). The checks cover YAML uniqueness, budgets, sources, symbols/routes, references, AUTO decisions and measured state.

Unit tests: `LC_ALL=ja_JP.UTF-8 LANG=ja_JP.UTF-8 npm test -- --runInBand` passed 2,490 tests in 227 suites. The default en-US locale fails the existing EventManager date-format expectation. Full ESLint currently reports 43 errors; neither lint nor coverage is certified by concept validation. Stage 11 Q3 is reported as a reference value (60 / 227); it is not a stage 10 gate, and the 60-invariant cap comes from the v0.3 recommendation.
