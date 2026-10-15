# Active AUTO Decisions (cache) — safe to delete

## AUTO:StatsOverview.data_constraint:empty_sentinel_provisional
- Status: ACTIVE
- Chosen: Keep the zero sentinel provisional at the domain boundary; record API schema incompatibility as unresolved.
- Policy: reversibility + locality; no implementation or requirement weakening
- Expires After Runs: 20
- Linked: AMB-STATS-001 / CFLT-STATS-001
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
- Linked: AMB-EXPORT-001 / CFLT-EXPORT-001
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure

## AUTO:Backup.boundary:metadata_only_prototype
- Status: ACTIVE
- Chosen: 現実装はメタデータのプロトタイプとして扱い、記録本体の復旧やリクエスト間共有を保証しない。MS-008は未完了とする。
- Policy: destructive_safety + reversibility + locality; no data mutation or acceptance weakening
- Expires After Runs: 20
- Linked: AMB-BACKUP-001 / CFLT-BACKUP-001
- Revert Triggers: primary_evidence_contradiction, security_risk, repeated_critical_test_failure
