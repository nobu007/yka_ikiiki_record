# Active AUTO Decisions (cache) — safe to delete

## AUTO:AuthenticationService.transition:keep_demo_only
- Status: ACTIVE
- Chosen: 認証はデモ実装として扱い、本番対応・トークン互換性を保証しない
- Policy: security_safety + reversibility + local_change
- Expires After Runs: 20
- Linked: AMB-AUTH-001 / CFLT-AUTH-001
- Revert Triggers: primary_evidence_contradiction, security_risk, verified_session_contract
