# SPEC: Backup (Entity)

## 概要
- **モジュール**: src/domain/entities/Backup.ts
- **責務**: バックアップデータの不変的な表現（時点スナップショット）
- **関連する不変条件**:
  - INV-DOM-001: Record_Required_Fields（entityとしての構造）
  - INV-REC-001: Record_Optional_Fields_Flexibility（metadata拡張性）

## 入力契約

### Backupインターフェース
| プロパティ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | 必須。一意識別子 | - |
| timestamp | number | 必須。Unixミリ秒タイムスタンプ | - |
| size | number | 必須。バイト単位のサイズ | - |
| recordCount | number | 必須。含まれるレコード数 | - |
| checksum | string | 必須。SHA-256ハッシュ（"sha256:..."形式） | - |
| status | BackupStatus | 必須。"pending" \| "in_progress" \| "completed" \| "failed" | - |
| error | string \| undefined | 任意。status="failed"時のエラーメッセージ | - |
| metadata | BackupMetadata | 必須。追加メタデータ | - |

### BackupMetadata
| プロパティ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| source | string | 必須。トリガー元（"scheduled", "manual", "pre-deployment"等） | - |
| triggeredBy | string | 必須。実行者（ユーザーIDまたは"system"） | - |
| formatVersion | string | 必須。フォーマットバージョン | "1.0" |
| entities | string[] | 必須。含まれるエンティティタイプリスト | - |
| correlationId | string \| undefined | 任意。関連操作の相関ID | - |
| [key: string] | unknown | 任意。拡張フィールド | - |

### createBackup(size, recordCount, checksum, metadata, triggeredBy?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| size | number | 必須。>= 0 | - |
| recordCount | number | 必須。>= 0 | - |
| checksum | string | 必須。"sha256:"プレフィックス付き | - |
| metadata | BackupMetadata | 必須。source, entitiesを含む | - |
| triggeredBy | string | 任意。実行者識別子 | "system" |

### createPendingBackup(metadata, triggeredBy?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| metadata | BackupMetadata | 必須。source, entitiesを含む | - |
| triggeredBy | string | 任意。実行者識別子 | "system" |

### markBackupCompleted(backup, size, recordCount, checksum)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| backup | Backup | 必須。任意の状態のバックアップ | - |
| size | number | 必須。>= 0 | - |
| recordCount | number | 必須。>= 0 | - |
| checksum | string | 必須。"sha256:"プレフィックス付き | - |

### markBackupFailed(backup, error)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| backup | Backup | 必須。任意の状態のバックアップ | - |
| error | string | 必須。エラーメッセージ | - |

## 出力契約

### createBackup
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Backup | status="completed", idが一意, timestamp=現在時刻 |

### createPendingBackup
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Backup | status="pending", size=0, recordCount=0, checksum="" |

### markBackupCompleted
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Backup | status="completed", size/recordCount/checksumが更新 |

### markBackupFailed
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| backup | Backup | status="failed", errorプロパティが設定 |

### isBackupTerminal
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| isTerminal | boolean | statusが"completed"または"failed"の場合true |

### isBackupRestorable
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| canRestore | boolean | statusが"completed"の場合のみtrue |

## エラー契約

| 条件 | 例外/レスポンス | 備考 |
|------|----------------|------|
| なし（ファクトリ関数は常に成功） | - | 入力バリデーションは呼び出し元の責任 |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| size=0, recordCount=0 | 正常にBackup作成 | 空バックアップも有効 |
| checksum=""（createPendingBackup） | status="pending"で作成 | 未完了状態を許容 |
| error=空文字列（markBackupFailed） | status="failed"で作成 | 空エラーメッセージも許容 |
| metadata.entities=[] | 正常にBackup作成 | 空エンティティリストも有効 |

## 不変条件チェック

- [ ] **ID一意性**: createBackup/createPendingBackupで生成されるIDはタイムスタンプ+ランダム文字列で一意
- [ ] **状態遷移**: pending → completed（markBackupCompleted）またはfailed（markBackupFailed）
- [ ] **完了状態不変性**: completed状態のバックアップはサイズ/チェックサムが確定
- [ ] **復元可能性**: completed状態のみ復元可能（isBackupRestorable）
- [ ] **拡張性**: metadataオブジェクトは追加フィールドを許容（[key: string]: unknown）

## 状態遷移図

```
[createPendingBackup]
        ↓
    pending
        ↓
        ├─→ [markBackupCompleted] → completed（終端状態）
        └─→ [markBackupFailed] → failed（終端状態）
```

## 不変的な性質

- **イミュータブル性**: ファクトリ関数は新しいオブジェクトを返す（既存オブジェクトを変更しない）
- **IDの安定性**: 一度生成されたIDは変更されない
- **タイムスタンプの安定性**: 作成時のタイムスタンプは変更されない

## 依存関係

### 依存されるコンポーネント
- BackupRepository: バックアップの永続化
- BackupService: バックアップ作成・復元のオーケストレーション
- APIルート: バックアップ情報のJSONシリアライズ

## テストカバレッジ

### Backup.test.tsで検証される項目
- createBackup: 正常系、全プロパティの値検証
- createPendingBackup: status="pending"の検証
- markBackupCompleted: pending→completed遷移、プロパティ更新
- markBackupFailed: pending→failed遷移、errorプロパティ設定
- isBackupTerminal: completed/failed→true, pending/in_progress→false
- isBackupRestorable: completed→true, それ以外→false

## 実装ノート

### 設計パターン
- **Value Object**: 不変なデータ構造
- **Factory Pattern**: createBackup, createPendingBackupでインスタンス生成
- **State Pattern**: statusフィールドで状態を表現

### ID生成戦略
- フォーマット: `backup-{timestamp}-{random}`
- タイムスタンプ: ミリ秒単位のUnix時刻
- ランダム部分: 36進数7文字（Math.random()由来）
- 例: `backup-1711276800000-a1b2c3d`

### チェックサム形式
- プレフィックス: `sha256:`
- ハッシュ値: 16進数64文字（SHA-256出力）
- 例: `sha256:a1b2c3d4e5f6...`

### 拡張ポイント
- 新しいステータスの追加: BackupStatus型を拡張
- カスタムメタデータ: metadataのインデックスシグネチャで任意フィールド追加可能
