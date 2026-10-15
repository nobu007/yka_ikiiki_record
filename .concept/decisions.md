# Active AUTO Decisions (cache) — safe to delete

## AUTO:AuthenticationService.boundary:demo_only
- Status: ACTIVE
- Chosen: Treat as prototype only; do not infer production access protection from the presence of auth classes
- Policy: safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-AUTH-BOUNDARY / CFLT-AUTH-TOKEN
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:StatsOverview.data_constraint:empty_schema_unverified
- Status: ACTIVE
- Chosen: Keep INV-DOM-011 draft; transport compatibility remains unresolved
- Policy: safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-EMPTY-STATS / CFLT-EMPTY-STATS
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:CleanArchitecture.lifecycle:gc_baseline
- Status: ACTIVE
- Chosen: Start TTL accounting at run_index 227 for legacy terms lacking update markers; existing IDs/mappings retained
- Policy: safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-GC-BASELINE
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:Record.boundary:download_filename_scope
- Status: ACTIVE
- Chosen: Keep repository artifacts fixed; record download behavior without granting a repository-policy exception
- Policy: safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-EXPORT-FILENAME
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:IRecordRepository.boundary:fixture_not_implementation
- Status: ACTIVE
- Chosen: Keep the four affected invariants draft; do not assert sequential IDs, save assignment, filtering or ordering behavior across implementations
- Policy: safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-REPOSITORY-CONTRACT / CFLT-REPOSITORY-CONTRACT
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:CleanArchitecture.boundary:historical_id_namespace
- Status: ACTIVE
- Chosen: Preserve existing IDs; identify tombstones by term plus former_id and current concepts by ontology ID. Do not infer identity across the two namespaces
- Policy: reversibility + locality
- Expires After Runs: 20
- Linked: AMB-HISTORICAL-IDS
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure
