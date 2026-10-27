# Active AUTO Decisions (cache) — safe to delete

## AUTO:SessionToken.definition:stateless
- Status: ACTIVE
- Chosen: SessionToken is stateless; server keeps no session state, validation = token format + user lookup
- Policy: safety + industry_convention (opaque bearer token)
- Expires After Runs: 20
- Linked: TERM-125 (ontology.yml assumptions ASM-SESSIONTOKEN-001) / INV-AUTH-101 / INV-AUTH-102
- Revert Triggers: primary_evidence_contradiction, security_risk

## Accepted via term_queue (2026-10-14T18:49:28Z, run 227)
- TP-000227-01 SessionToken → ontology TERM-125 (aux/draft; 3 primary sources)
- TP-000227-02 PlaywrightE2eConfig → pending (1 primary source, TTL 10 runs)

## AUTO:term_queue.accepted_lifecycle:consume_on_landing (run 228)
- Status: ACTIVE
- Chosen: queue entry accepted+landed (term exists in ontology) は queue から削除して消費扱い。queue は pending 審査中のみ保持（merged/rejected も記録後に削除可）。履歴は git 履歴 + decisions.md 要約 + claims.ndjson が保持
- Policy: queue=入国審査ゲート（registry ではない）。肥大化抑制（統合・削除優先）に整合
- Expires After Runs: 20
- Linked: TP-000227-01 removed at run 228 (landed as TERM-125, run 227)
- Revert Triggers: sub-instruction 10_concept_sync_system が accepted 残置を要求するよう改正された場合

## Initial Concept Population (2026-03-22, run 226 — cache retained)
- Mapped core domain entities (Record, Stats, StatsOverview), services (StatsService, EmotionGenerator), repositories (StatsRepository, IRecordRepository, UserRepository)
- Mapped auth domain (User, AuthenticationService, AuthorizationService, LoginForm, InMemoryUserRepository)
- Evidence base: src/domain/, src/application/, src/infrastructure/, prisma/schema.prisma

## Evidence Sources (primary)
- src/app/api/auth/{login,session,logout}/route.ts + route.test.ts
- src/domain/services/AuthenticationService.ts
- LOOP.md / .npmrc (ops claims, claims.ndjson run 2026-10-14T18:49:28Z)
