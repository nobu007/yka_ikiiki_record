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
