# Active AUTO Decisions (cache) — safe to delete

## AUTO:StatsOverview.data_constraint:empty_sentinel_provisional
- Status: ACTIVE
- Chosen: Keep the zero sentinel provisional at the domain boundary; record API schema incompatibility as unresolved.
- Policy: reversibility + locality; no implementation or requirement weakening
- Expires After Runs: 20
- Linked: AMB-STATS-001
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:AuthenticationService.boundary:prototype_only
- Status: ACTIVE
- Chosen: 認証関連はプロトタイプとして扱い、本番の認証・認可の保証に使わない
- Policy: security_safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-AUTH-001
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:APIRouteHandler.invariant:filename_uniqueness_unverified
- Status: ACTIVE
- Chosen: Retain uniqueness as a draft requirement; current timestamp naming remains uncertified for simultaneous exports.
- Policy: reversibility + locality; no implementation or requirement weakening
- Expires After Runs: 20
- Linked: AMB-EXPORT-001
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure
