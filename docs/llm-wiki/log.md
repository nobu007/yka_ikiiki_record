# Verified changes

## Concept synchronization

Reconciled the existing 49 concepts against code, schema, and tests. Added the
six missing auth mappings, repaired obsolete symbols and the nonexistent Stats
DB model reference, and preserved 100 invariant IDs within 60 contracts.
Historical reused tombstone IDs retain a composite (term, former_id) identity;
no canonical ID was renumbered.
Removed three unsupported current-metric assertions from the charter and the
obsolete maintenance commands from the concept reference.

Validation: the read-only concept validator checks YAML duplicates, source quotes,
code/DB/API references, IDs, budgets, AUTO cache, and measured counts. Its negative
regression cases exercise missing declarations, unknown terms, duplicate keys,
budget violations, stale metrics/cache, and excessive claims.

Application Jest: 227 suites / 2490 tests passed with LC_ALL=ja_JP.UTF-8 and
TZ=Asia/Tokyo. Default C.UTF-8 exposes one existing locale-sensitive date test.
Read-only ESLint: 43 existing errors, zero warnings; application code was unchanged.
These results do not establish coverage or production readiness.

Remaining: open conflicts in .concept/conflicts.yml need bounded application
work for shared auth-token semantics, empty-stat transport, and real repository
contracts. This concept sync records them; it does not implement those fixes.
