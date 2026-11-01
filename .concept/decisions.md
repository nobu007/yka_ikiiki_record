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

### 2026-10-16 - Layer field semantics and ID notation
- DECISION-007: ontology.yml の `layer` は 10_concept_sync_system B-7 の重要度階層（core/domain/aux）を意味し、Clean Architecture の物理レイヤ（domain/application/infrastructure）を意味しない。物理配置は evidence/mappings の source パスで表現する。AuthorizationService (TERM-122) は物理配置が src/application/services/ だが、概念の重要度階層として layer: domain を維持する
- DECISION-008: term_queue.yml の accepted_as_term_id は ontology.yml の正規 ID 表記（TERM-<n>、ゼロ埋めなし）に一致させる（例: TERM-125。TERM-000125 不可）
