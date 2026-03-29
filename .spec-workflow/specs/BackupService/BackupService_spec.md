# SPEC: BackupService

## 概要
- **モジュール**: src/application/services/BackupService.ts
- **責務**: バックアップ作成・復元のオーケストレーション（全リポジトリのデータを一元的に管理）
- **関連する不変条件**:
  - INV-REP-001: Repository_Interface_Contract
  - INV-SVC-001: StatsService_Complete_Stats_Structure
  - INV-LOG-001: Structured_Logging_Required_Fields

## 入力契約

### createBackup(metadata, triggeredBy?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| metadata | BackupMetadata | 必須。source, entitiesを含む | - |
| triggeredBy | string | 任意。実行者識別子 | "system" |

### restoreBackup(backupId)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| backupId | string | 必須。存在するバックアップID | - |

### listBackups(query?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| query | Partial<BackupQuery> | 任意。フィルタ条件 | {} |

### deleteOldBackups(beforeTimestamp)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| beforeTimestamp | number | 必須。Unixミリ秒タイムスタンプ | - |

### getBackupById(id)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | 必須。バックアップID | - |

## 出力契約

### createBackup
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Promise<Backup> | status="completed", checksumにSHA-256ハッシュ, recordCountは全エンティティ合計 |

### restoreBackup
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | Promise<{backupId, backupTimestamp, recordCount, size}> | 復元元バックアップの情報を含む |

### listBackups
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backups | Promise<Backup[]> | タイムスタンプ降順（最新順） |

### deleteOldBackups
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| deletedCount | Promise<number> | 削除されたバックアップ数 |

### getBackupById
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Promise<Backup \| null> | 見つからない場合はnull |

### getLatestBackup
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Promise<Backup \| null> | status="completed"の最新バックアップ、なければnull |

### getBackupStats
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| stats | Promise<BackupStats> | totalCount, totalSize, completedCount, failedCount, pendingCountを含む |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| backupIdが存在しない（restoreBackup） | Error: "Backup with id '{id}' not found" | N/A (application layer) |
| backupIdのstatusが"completed"でない（restoreBackup） | Error: "Cannot restore backup with status '{status}'" | N/A |
| バックアップ作成失敗（createBackup） | Error: 元のエラーを再スロー、status="failed"で記録 | N/A |
| リポジトリ操作失敗 | 依存リポジトリからの例外をそのまま伝播 | N/A |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 空のリポジトリ状態でのcreateBackup | recordCount=0, size=JSON文字列長, checksum有効 | データ0件も正常にバックアップ |
| metadata.entities=[] | 正常にバックアップ作成 | 空エンティティリストも許容 |
| restoreBackup: 存在しないID | Errorをスロー | 404的挙動 |
| listBackups: query.limit=0 | 空配列[] | 0件制限も正常動作 |
| deleteOldBackups: 未来のタイムスタンプ | 0（削除なし） | 全バックアップが未来のため |
| deleteOldBackups: 過去のタイムスタンプ | 全バックアップ削除 | 全バックアップが古い場合 |
| getBackupById: 存在しないID | null | 404的挙動 |
| getLatestBackup: 完了済みバックアップなし | null | 空状態 |

## 不変条件チェック

- [ ] INV-REP-001: 依存する全リポジトリ（BackupRepository, RecordRepository, StatsRepository, AuditLogRepository）のインターフェース契約を遵守
- [ ] INV-LOG-001: 全操作でAuditLogRepository.create()を呼び出し、構造化ログを記録
- [ ] INV-SVC-001: createBackupで全エンティティ（Record, Stats, AuditLog）を収集し、完全なバックアップを保証
- [ ] データ整合性: createBackupはトランザクション的にpending→completed状態遷移を保証
- [ ] チェックサム検証: SHA-256ハッシュでデータ整合性を保証
- [ ] 復元可能性: status="completed"のみ復元可能

## 副作用

### createBackup
1. BackupRepository.save()を2回呼び出し（pending→completed状態遷移）
2. AuditLogRepository.create()を呼び出し（operation="create"）
3. 失敗時: BackupRepository.save()でstatus="failed"を記録

### restoreBackup
1. BackupRepository.restore()を呼び出し（データ復元）
2. AuditLogRepository.create()を呼び出し（operation="restore"）

### deleteOldBackups
1. BackupRepository.deleteOlderThan()を呼び出し（古いバックアップ削除）

## 依存関係

### 依存するリポジトリ
- BackupRepository: バックアップメタデータの永続化
- RecordRepository: Recordエンティティの収集・復元
- StatsRepository: Statsエンティティの収集・復元
- AuditLogRepository: AuditLogエンティティの収集・復元と操作ログの記録

### 依存されるコンポーネント
- APIルート（/api/backup/*）
- 管理UIバックアップパネル
- 定期バックアップジョブスケジューラ

## パフォーマンス特性

- createBackup: 全リポジトリのfindAll()を順次実行するため、データ量に比例して遅延
- restoreBackup: 復元操作は単一のBackupRepository.restore()呼び出しに委譲
- listBackups: クエリ条件に基づくフィルタリングをBackupRepository.query()に委譲
- getBackupStats: 全バックアップのスキャンを2回実行（query + getTotalSize）

## セキュリティ考慮事項

- triggeredByパラメータで監査証跡を追跡
- restore操作は破壊的であるため、AuditLogで必ず記録
- チェックサム検証でデータ改ざんを検出

## テストカバレッジ

### BackupService.test.tsで検証される項目
- createBackup: 正常系、空リポジトリ、エラー時のfailed状態記録
- restoreBackup: 正常系、存在しないID、非完了状態バックアップ
- listBackups: フィルタ条件（status, source）、ページネーション（limit, offset）
- deleteOldBackups: 古いバックアップ削除、境界値
- getBackupById: 存在するID、存在しないID
- getLatestBackup: 完了済みバックアップあり、なし
- getBackupStats: 正常系、空状態

## 実装ノート

### 設計パターン
- **Orchestration Pattern**: 複数リポジトリの操作を調整
- **Dependency Injection**: コンストラクタで全リポジトリを受け取る
- **Factory Pattern**: createBackup, createPendingBackup等のエンティティ生成関数を使用

### エラーハンドリング戦略
- createBackup失敗時: try-catchでエラーをキャッチし、failed状態のバックアップを記録
- restoreBackup失敗時: 事前バリデーションで明示的なエラーメッセージ
- その他の操作: 依存リポジトリからの例外をそのまま伝播

### 拡張ポイント
- 新しいエンティティタイプのバックアップ: createBackupで収集対象を追加
- カスタムリストアロジック: BackupRepository.restore()実装で制御
- バックアップ圧縮: createBackupでデータ文字列化前に圧縮追加
