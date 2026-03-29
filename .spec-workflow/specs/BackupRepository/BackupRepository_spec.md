# SPEC: BackupRepository (Interface)

## 概要
- **モジュール**: src/domain/repositories/BackupRepository.ts
- **責務**: バックアップメタデータの永続化とクエリ（抽象化レイヤー）
- **関連する不変条件**:
  - INV-REP-001: Repository_Interface_Contract
  - INV-REP-002: Repository_Data_Isolation
  - INV-REP-008: Repository_Count_Accuracy

## 入力契約

### save(backup)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| backup | Backup | 必須。有効なBackupエンティティ | - |

### findById(id)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | 必須。バックアップID | - |

### query(query)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| query | BackupQuery | 必須。フィルタ・ページネーション条件 | {} |

### deleteOlderThan(beforeTimestamp)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| beforeTimestamp | number | 必須。Unixミリ秒タイムスタンプ | - |

### delete(id)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | 必須。バックアップID | - |

### restore(id)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | 必須。バックアップID | - |

### findLatestCompleted()
| パラメータ | なし | - | - |

### count(query)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| query | Omit<BackupQuery, "limit" \| "offset"> | 必須。フィルタ条件 | {} |

### getTotalSize()
| パラメータ | なし | - | - |

## 出力契約

### save
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| - | Promise<void> | 指定したbackupが永続化される（idが存在すれば更新、なければ新規作成） |

### findById
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Promise<Backup \| null> | 指定したidのバックアップ、存在しなければnull |

### query
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | Promise<BackupQueryResult> | backups（タイムスタンプ降順）, totalCount（limit/offset適用前） |

### deleteOlderThan
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| deletedCount | Promise<number> | 削除されたバックアップ数（0以上） |

### delete
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| - | Promise<void> | 指定したidのバックアップが削除される |

### restore
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | Promise<RestoreResult> | recordCount, size, backupTimestamp, backupIdを含む |

### findLatestCompleted
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Promise<Backup \| null> | 最も新しいstatus="completed"のバックアップ、なければnull |

### count
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| count | Promise<number> | クエリ条件に一致するバックアップ数 |

### getTotalSize
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| totalSize | Promise<number> | 全バックアップの合計サイズ（バイト単位） |

## エラー契約

| 条件 | 例外/レスポンス | 備考 |
|------|----------------|------|
| delete: idが存在しない | Error: "Backup with id '{id}' not found" | 実装依存のメッセージ形式 |
| restore: idが存在しない | Error: "Backup not found" | 実装依存のメッセージ形式 |
| restore: statusが"completed"でない | Error: "Cannot restore backup with status..." | 実装依存のメッセージ形式 |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| findById: 存在しないID | null | 404的挙動 |
| query: limit=0 | backups=[], totalCount=実際の件数 | 0件制限も正常動作 |
| query: offset >= totalCount | backups=[], totalCount=実際の件数 | 範囲外も正常動作 |
| deleteOlderThan: 未来のタイムスタンプ | deletedCount=0 | 全バックアップが未来のため |
| deleteOlderThan: 過去のタイムスタンプ | deletedCount=総バックアップ数 | 全バックアップが古い場合 |
| findLatestCompleted: 完了済みバックアップなし | null | 空状態 |
| getTotalSize: 空リポジトリ | totalSize=0 | 合計サイズ0 |

## 不変条件チェック

- [ ] **INV-REP-001**: 全メソッドはasyncで適切な型を返す
- [ ] **INV-REP-002**: 各操作は独立し、状態漏れしない（スレッドセーフでない実装も許容）
- [ ] **INV-REP-008**: count()は正確な件数を返す
- [ ] **一意性制約**: save()は同じidのバックアップを上書き（upsert semantics）
- [ ] **順序保証**: query()はタイムスタンプ降順でソート（最新優先）
- [ ] **原子性**: restore()は全エンティティの復元を保証（部分失敗は実装依存）

## クエリフィルタリング仕様

### BackupQuery
| フィールド | 型 | マッチング条件 | 結合 |
|-----------|-----|----------------|------|
| status | BackupStatus \| undefined | backup.status === status | AND |
| source | string \| undefined | backup.metadata.source === source | AND |
| triggeredBy | string \| undefined | backup.metadata.triggeredBy === triggeredBy | AND |
| startTime | number \| undefined | backup.timestamp >= startTime | AND |
| endTime | number \| undefined | backup.timestamp <= endTime | AND |
| limit | number \| undefined | 結果を先頭N件に制限 | - |
| offset | number \| undefined | 先頭N件をスキップ | - |

### 結合例
```typescript
// status="completed" かつ source="manual"
query({ status: "completed", source: "manual" })

// 過去7日間のバックアップ（タイムスタンプ範囲）
const now = Date.now();
const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
query({ startTime: weekAgo, endTime: now })

// ページネーション（2ページ目、1ページ10件）
query({ limit: 10, offset: 10 })
```

## RestoreResult仕様

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| recordCount | number | 復元されたレコード総数 |
| size | number | 復元データのサイズ（バイト単位） |
| backupTimestamp | number | 復元元バックアップのタイムスタンプ |
| backupId | string | 復元元バックアップのID |

## 依存関係

### 依存されるコンポーネント
- BackupService: バックアップ操作のオーケストレーション
- APIルート: バックアップ管理エンドポイント

### 実装クラス
- InMemoryBackupRepository: インメモリ実装（テスト・開発用）
- （将来）PrismaBackupRepository: PostgreSQL永続化
- （将来）S3BackupRepository: AWS S3クラウドストレージ

## テストカバレッジ

### BackupRepository.test.tsで検証される項目
- save: 新規作成、更新（upsert semantics）
- findById: 存在するID、存在しないID
- query: フィルタ条件（status, source, triggeredBy）、ページネーション（limit, offset）、タイムスタンプ範囲
- deleteOlderThan: 古いバックアップ削除、境界値
- delete: 存在するID、存在しないID
- restore: 正常系、存在しないID、非完了状態
- findLatestCompleted: 完了済みあり、なし
- count: フィルタ条件、空状態
- getTotalSize: 複数バックアップの合計、空状態

### InMemoryBackupRepository.test.tsで検証される項目
- 全インターフェースメソッドのインメモリ実装仕様
- マルチスレッド安全性は保証しない（シングルスレッド前提）

## 実装ノート

### 設計パターン
- **Repository Pattern**: 永続化の抽象化レイヤー
- **Interface Segregation**: 単一責務のインターフェース
- **Dependency Inversion**: ドメイン層がインフラ層に依存しない

### インメモリ実装の特性
- **揮発性**: プロセス終了でデータ消失
- **非スレッドセーフ**: 並行操作での競合可能性
- **簡易実装**: テストダブルとして最適

### 将来の拡張
- **PostgreSQL実装**: PrismaBackupRepositoryで永続化
- **クラウド実装**: S3BackupRepositoryでスケーラブル保存
- **圧縮サポート**: restore()で自動展開
- **暗号化**: save()で自動暗号化、restore()で自動復号

## パフォーマンス考慮事項

### インメモリ実装
- save: O(1)（配列プッシュ）
- findById: O(n)（線形探索）
- query: O(n log n)（フィルタ + ソート）
- deleteOlderThan: O(n)（フィルタ + 配列再構築）
- getTotalSize: O(n)（全スキャン）

### PostgreSQL実装（将来）
- save: O(1)（UPSERT）
- findById: O(log n)（インデックス検索）
- query: O(log n + k)（インデックス + LIMIT/OFFSET）
- deleteOlderThan: O(n)（範囲削除）
- getTotalSize: O(1)（集計インデックス）
