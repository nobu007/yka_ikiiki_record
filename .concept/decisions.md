# Active AUTO Decisions

This file contains a cache of active AUTO decisions made during concept synchronization.
Maximum 200 lines - this file can be regenerated and truncated.

## Recent Decisions

### 2026-03-22 - Initial Concept Population
- DECISION-001: Mapped core domain entities (Record, Stats, StatsOverview) from src/domain/entities/
- DECISION-002: Mapped domain services (StatsService, EmotionGenerator) from src/domain/services/
- DECISION-003: Mapped repository interfaces (StatsRepository, IRecordRepository) from src/domain/repositories/
- DECISION-004: Identified Clean Architecture layering from README.md and src/ structure
- DECISION-005: Mapped all stat types (MonthlyStats, StudentStats, DayOfWeekStats, TimeOfDayStats) from Stats.ts
- DECISION-006: Identified SingleResponsibilityPrinciple invariant from invariants.yml INV-ARCH-001

### Evidence Sources
- src/domain/entities/Record.ts
- src/domain/entities/Stats.ts
- src/domain/entities/DataGeneration.ts
- src/domain/services/StatsService.ts
- src/domain/services/EmotionGenerator.ts
- src/domain/repositories/StatsRepository.ts
- src/domain/repositories/IRecordRepository.ts
- README.md
- .concept/invariants.yml
- prisma/schema.prisma

## AUTO:quality.claims:trust_code_evidence (2026-10-13, run 227)
- Status: ACTIVE (expires_after_runs: 10)
- Chosen: 品質主張はコード実測を正とする（409 TS errors / 2490 tests passing 実測）
- Policy: measurement_first + reversibility
- Linked: AMB-QUAL-001 / CFLT-QUAL-001
- Revert Triggers: primary_evidence_contradiction, critical_test_failures

## AUTO:api.endpoints:auth_required (2026-10-13, run 227)
- Status: ACTIVE (expires_after_runs: 10)
- Chosen: データ変更系APIは認証+認可必須として概念上扱う（現在コードは未実装 = OPEN_RISK）
- Policy: safety + reversibility
- Linked: AMB-AUTH-001 / CFLT-AUTH-001
- Revert Triggers: primary_evidence_contradiction, security_risk

## AUTO:AuditLog.operation:include_restore (2026-10-13, run 227)
- Status: ACTIVE (expires_after_runs: 20)
- Chosen: 'restore' を正当な監査対象操作に含める（union型拡張を推奨）
- Policy: reversibility + industry_convention
- Linked: AMB-AUDIT-001 / CFLT-AUDIT-001
- Revert Triggers: primary_evidence_contradiction
