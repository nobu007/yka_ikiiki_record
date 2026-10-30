# Repository knowledge

- [Concept model](../../.concept/ontology.yml): 49 existing canonical concepts;
  [mappings](../../.concept/mappings.yml) link all 49 to actual repository files.
- [Contracts](../../.concept/invariants.yml): 60 contracts retain all 100 original IDs
  through conjunctive clauses. Stable rules do not certify runtime compliance.
- [Open discrepancies](../../.concept/conflicts.yml): token formats, empty-stat
  schema compatibility, and repository fixture/implementation differences.
  Historical IDs are scoped separately for active concepts and tombstones.
  Provisional interpretations live in [ambiguities](../../.concept/ambiguities.yml).
- Checks: `python3 scripts/validate_concepts.py` (Python 3 + PyYAML), then
  `python3 -m unittest discover -s scripts -p 'test_validate_concepts.py'`.
  These validate concept structure and references; they do not certify security.
- The application suite requires a Japanese default locale for its current
  EventManager date assertion:
  `LC_ALL=ja_JP.UTF-8 TZ=Asia/Tokyo npm test -- --runInBand`.
- [Repository relations](relations.md)
- [Verified changes](log.md)

Use the constitution, purpose, charter, and current task for authority.
Historical milestone notes and passing fixture tests are not current runtime evidence.
