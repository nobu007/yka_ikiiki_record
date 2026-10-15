# Active AUTO Decisions (cache) — safe to delete

## AUTO:AuthenticationService.boundary:prototype_only
- Status: ACTIVE
- Chosen: 認証関連はプロトタイプとして扱い、本番の認証・認可の保証に使わない
- Policy: security_safety + reversibility + locality
- Expires After Runs: 20
- Linked: AMB-AUTH-001
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure
