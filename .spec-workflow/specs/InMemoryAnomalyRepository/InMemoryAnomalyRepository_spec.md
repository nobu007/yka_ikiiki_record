# SPEC: InMemoryAnomalyRepository

## 概要
- **モジュール**: `src/infrastructure/storage/InMemoryAnomalyRepository.ts`
- **責務**: In-memory storage implementation for anomaly persistence in development/testing environments
- **関連する不変条件**: INV-REP-001 (Repository_Interface_Contract), INV-REP-002 (Repository_Data_Isolation)

## 入力契約

### Constructor
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| (なし) | - | - | - |

### Method Parameters
| メソッド | パラメータ | 型 | 制約 |
|---------|-----------|-----|------|
| save | anomaly | AnomalyEntity | Must have valid type, severity, context |
| findById | id | string | Must be non-empty string |
| findAll | - | - | - |
| findByType | type | AnomalyType | Must be valid AnomalyType enum value |
| findBySeverity | severity | AnomalySeverity | Must be valid AnomalySeverity enum value |
| findRecent | days | number | Must be positive integer |
| delete | id | string | Must be non-empty string |
| clear | - | - | - |

## 出力契約

### save
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| saved anomaly | Promise<AnomalyEntity> | Returns anomaly with generated ID if new, updates if id exists |

### findById
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| anomaly | Promise<AnomalyEntity \| null> | Returns anomaly if found, null otherwise |

### findAll
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| anomalies | Promise<AnomalyEntity[]> | Returns all stored anomalies (empty array if none) |

### findByType
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| anomalies | Promise<AnomalyEntity[]> | Returns all anomalies matching type (empty array if none) |

### findBySeverity
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| anomalies | Promise<AnomalyEntity[]> | Returns all anomalies matching severity (empty array if none) |

### findRecent
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| anomalies | Promise<AnomalyEntity[]> | Returns anomalies detected within last N days (empty array if none) |

### delete
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| success | Promise<boolean> | Returns true if deleted, false if not found |

### clear
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| void | void | Clears all storage and resets counter |

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| (None - in-memory implementation throws no errors) | - | - |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| save with no id | Generates ID "anomaly-1", "anomaly-2", etc. | Auto-incrementing counter |
| save with existing id | Updates existing anomaly | Active Record pattern |
| findById with non-existent id | null | Graceful handling |
| findAll with no storage | Empty array [] | No errors |
| findRecent(0) | Empty array [] | Cutoff date = now |
| delete with non-existent id | false | Idempotent |

## 不変条件チェック
- [x] INV-REP-001: Implements complete AnomalyRepository interface contract
- [x] INV-REP-002: Each repository operation is independent and isolated
- [ ] INV-REP-003: Sequential ID assignment (auto-incrementing "anomaly-N" format)
- [ ] INV-REP-004: Create vs Update behavior (save without id creates, with id updates)

## 実装ステータス
- ✅ save: 実装済み
- ✅ findById: 実装済み
- ✅ findAll: 実装済み
- ✅ findByType: 実装済み
- ✅ findBySeverity: 実装済み
- ✅ findRecent: 実装済み
- ✅ delete: 実装済み
- ✅ clear: 実装済み

## 備考
- This is a development/testing implementation
- Production should use PrismaAnomalyRepository with PostgreSQL
- clear() method is for test cleanup only
- Storage is not persistent across process restarts
- Thread-safety: Not designed for concurrent access (single-threaded Node.js environment)
