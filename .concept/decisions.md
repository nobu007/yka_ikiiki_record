# Active AUTO Decisions (cache) — safe to delete

Regenerate from ambiguities.yml.auto_decision + conflicts.yml.active_workaround. Max 200 lines. History lives in claims.ndjson.

## AUTO:Notification.term:provider_for_domain_ui_for_components
- Status: ACTIVE
- Chosen: ドメイン側は NotificationProvider に正規化、UI側は既存 UIComponents に帰属。新語「Notification」は canonical 化しない
- Policy: bloat_control + naming_convention
- Expires After Runs: 20
- Linked: AMB-001
- Revert Triggers: primary_evidence_contradiction, in_app配信がドメインエンティティとして実装された場合
