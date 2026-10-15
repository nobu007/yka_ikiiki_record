# Knowledge changes

## Concept contracts and stage 11 acceptance

Verified the five previously queued feature families against their entity/repository tests and implementation paths before admission; extended existing record/user repository mappings without new repository concepts. The dictionary now contains 54 terms (8 core, 21 domain, 25 aux).

Recovered independent invariant clauses and original IDs from commit 0839402ab1d510291542085c61dbc70cdbb6b686, removed duplicate restatements, and attached precise sources. Corrected the distinction between schema generation bounds, a complete default config, and service argument defaults. Seasonal fixtures do not prove runtime validation. Explicit-any prohibition comes from SYSTEM_CONSTITUTION.md; eslint.config.mjs disables its enforcement. Empty-average and concurrent filename guarantees remain provisional rather than stable certifications.

Evidence: `python3 scripts/test_concept_integrity.py -v` checks the persisted documents; `--quality` checks measured Q1-Q8 and fails Q3. The Q3 threshold needs at least 114 invariant records for 227 tests, while ontology_budget.yml permits at most 60; counting clauses as additional records would hide the conflict. MS-001 was reopened accordingly. Full Jest passed 2,490 tests in 227 suites; ESLint failed with 43 errors and zero warnings. No application source, dependencies, constitution, or inter-repository relationships changed. Full-chain completion remains unverified.

## Backup recovery boundary and API mappings

Mapped the five backup/restore, trend and notification route files to their existing concepts after checking the service calls. This raises Q1 from 103/120 to 108/120 directly mapped modules (90%); class coverage remains 33/34. No concepts were added.

The assumption that successful backup metadata proves recoverable data was rejected. `BackupService.createBackup` computes size/checksum without persisting the serialized payload; `InMemoryBackupRepository.restore` returns metadata without restoring entity contents. `createBackupRepository` constructs a new empty repository on each factory call. Existing restore tests check response metadata, not recovered entity contents. Backup is now draft, with CFLT-BACKUP-001 and a reversible, 20-run AUTO decision in AMB-BACKUP-001. MS-008 is active again; its existing acceptance target is unchanged. Recovery requires snapshot payload storage/integrity, entity round-trip tests and retention across separate service instances.

A synthetic probe using the actual in-memory repositories and MockStatsRepository returned:
`{"protected_records":1,"protected_stats_objects":1,"reported_restored_entities":2,"actual_records_after_restore":0,"fresh_backup_repository_has_snapshot":false}`.
This demonstrates a defect, not successful recovery. Reproduce from the repository root with existing dependencies; only synthetic in-memory state is changed:

```sh
node --import tsx --input-type=module <<'JS'
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { BackupService } = require('./src/application/services/BackupService.ts');
const { InMemoryBackupRepository } = require('./src/infrastructure/repositories/InMemoryBackupRepository.ts');
const { InMemoryRecordRepository } = require('./src/infrastructure/storage/InMemoryRecordRepository.ts');
const { InMemoryAuditLogRepository } = require('./src/infrastructure/repositories/InMemoryAuditLogRepository.ts');
const { MockStatsRepository } = require('./src/infrastructure/storage/MockStatsRepository.ts');
const backups = new InMemoryBackupRepository();
const records = new InMemoryRecordRepository();
const service = new BackupService(backups, records, new MockStatsRepository(), new InMemoryAuditLogRepository());
const record = await records.create({ student: 'synthetic-probe', emotion: 3, date: new Date('2026-01-01') });
const backup = await service.createBackup({ source: 'synthetic-probe', triggeredBy: 'probe', formatVersion: '1.0', entities: ['Record', 'Stats'] }, 'probe');
await records.delete(record.id);
const result = await service.restoreBackup(backup.id);
console.log({ reported: result.recordCount, actualRecords: (await records.findAll()).length,
  freshRepositoryHasBackup: await new InMemoryBackupRepository().findById(backup.id) !== null });
JS
```

Full Jest validation passed 2,490 tests in 227 suites; ESLint failed with 43 errors and zero warnings. The concept integrity checks pass, but `--quality` still fails Q3 (60/227, 26.4% versus 50%). The governing stage 11 instruction defines the count ratio, while the adopted budget caps invariants at 60. Neither threshold was changed. Restored the missing uncertainty inputs for AMB-EXPORT-001 from its existing code/test evidence (the 0.216 value is unchanged). Terms remain 54 (8 core, 21 domain, 25 aux), with seven draft terms (13.0%) and zero pending candidates; ages are below GC thresholds. No application source, dependencies, constitution or evidenced repository relationships changed. No other AI clients or API-backed tools were invoked. Full-stage completion remains blocked on Q3 policy reconciliation.
