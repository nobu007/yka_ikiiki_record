# Active AUTO Decisions

This file contains a cache of active AUTO decisions made during concept synchronization.
Maximum 200 lines - this file can be regenerated and truncated.

## Recent Decisions

### 2026-10-16 - Post-sync domain registration (cycle 227)
- DECISION-010: Accepted 10 new domain terms via term_queue (B-8 met: entity+test sources, boundaries, mappings):
  Anomaly, AnomalyDetectionService, AuditLog, AuditService, Backup, BackupService,
  NotificationProvider, NotificationService, TrendAnalysis, TrendAnalysisService (TERM-125..134)
- DECISION-011: NotificationProvider kept distinct from UI toast Notification (UIComponents synonym);
  TrendAnalysis kept distinct from StatsCalculator trend util — similarity below merge threshold 0.78
- DECISION-012: New domains use InMemory repositories (no Prisma models); db mappings left empty
- DECISION-013: Backfilled missing mappings for 6 auth terms (User, UserRepository, AuthenticationService,
  AuthorizationService, InMemoryUserRepository, LoginForm) to restore mapping saturation 100%
- Budget: 59/80 terms, draft_ratio 0%, unmapped 0% — HEALTHY

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
