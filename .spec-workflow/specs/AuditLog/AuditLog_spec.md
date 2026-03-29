# SPEC: AuditLog

## 概要
- **モジュール**: `src/domain/entities/AuditLog.ts`
- **責務**: ドメインエンティティの作成・更新・削除操作を追跡し、監査証跡を提供する
- **関連する不変条件**: INV-DOM-001 (ドメインエンティティの純粋性)、INV-TYPE-001 (型安全性)

## 説明

AuditLogはデータ変更の完全な履歴を記録するドメインエンティティである。コンプライアンス、デバッグ、データ整合性検証のために、すべてのデータ変異操作をキャプチャする。

### 主要な型と関数

1. **AuditOperation**: `"create" | "update" | "delete"` - 監査対象の操作タイプ
2. **AuditLog interface**: 監査ログエントリの構造
3. **createAuditLogForCreate**: 作成操作の監査ログを生成
4. **createAuditLogForUpdate**: 更新操作の監査ログを生成
5. **createAuditLogForDelete**: 削除操作の監査ログを生成

## 入力契約

### AuditLog interface

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | string | パターン: `^audit-\d+-[a-z0-9]+$` | 一意識別子 |
| timestamp | number | 範囲: 過去の有効なUnixタイムスタンプ(ms) | 操作発生時刻 |
| entityType | string | 非空、有効なエンティティ型名 | 変更されたエンティティ型 |
| entityId | string | 非空 | 変更されたエンティティID |
| operation | AuditOperation | "create" \| "update" \| "delete" | 操作タイプ |
| actor | string | 非空 | 操作実行者IDまたは"system" |
| changes.before | Record\<string, unknown\> \| null | create時はnull | 変更前の状態 |
| changes.after | Record\<string, unknown\> \| null | delete時はnull | 変更後の状態 |
| metadata.source | string | 必須、非空 | 操作元("api", "seed", "migration"等) |
| metadata.ipAddress | string | オプション | リクエスト元IPアドレス |
| metadata.userAgent | string | オプション | リクエスト元ユーザーエージェント |
| metadata.correlationId | string | オプション | 関連操作追跡用ID |
| metadata.[custom] | unknown | オプション | カスタムメタデータ |

### createAuditLogForCreate

| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| entityType | string | 非空 | - |
| entityId | string | 非空 | - |
| after | Record\<string, unknown\> | 作成後のエンティティ状態 | - |
| metadata | AuditLog["metadata"] | source必須 | - |
| actor | string | 非空 | "system" |

### createAuditLogForUpdate

| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| entityType | string | 非空 | - |
| entityId | string | 非空 | - |
| before | Record\<string, unknown\> | 更新前のエンティティ状態 | - |
| after | Record\<string, unknown\> | 更新後のエンティティ状態 | - |
| metadata | AuditLog["metadata"] | source必須 | - |
| actor | string | 非空 | "system" |

### createAuditLogForDelete

| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| entityType | string | 非空 | - |
| entityId | string | 非空 | - |
| before | Record\<string, unknown\> | 削除前のエンティティ状態 | - |
| metadata | AuditLog["metadata"] | source必須 | - |
| actor | string | 非空 | "system" |

## 出力契約

| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| AuditLog | AuditLog interface | - idが一意である<br>- timestampが現在時刻に近い(±1秒以内)<br>- operationが対応する操作タイプである<br>- changes.before/afterが操作タイプに応じて正しく設定されている<br>- metadataが入力値を保持している |

## エラー契約

このモジュールの関数は例外をスローしない。入力値のバリデーションは呼び出し元の責任である。

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 空文字列のentityType | 正常に動作（バリデーションなし） | 呼び出し元でのバリデーション推奨 |
| 空オブジェクトのbefore/after | 正常に記録 | 空の状態も有効な状態として扱う |
| metadataにsourceのみ | 正常に動作 | 最小限のメタデータ |
| metadataに全フィールド | 正常に動作 | すべてのオプショナルフィールドを保持 |
| actor省略 | actor="system" | デフォルト値適用 |
| actor明示指定 | 指定された値 | ユーザー操作等の追跡 |

## ID生成仕様

- **フォーマット**: `audit-{timestamp}-{random}`
  - timestamp: Unixタイムスタンプ(ミリ秒)
  - random: 7文字のランダムな英数字([a-z0-9])
- **一意性**: 同一ミリ秒内でも呼び出し毎に異なるIDを生成
- **例**: `audit-1711881234567-a3b9f2c`

## タイムスタンプ生成仕様

- **精度**: ミリ秒単位のUnixタイムスタンプ
- **範囲**: 関数呼び出し時のDate.now()の戻り値
- **単調性**: 連続呼び出しで単調増加する保証なし（システム時刻に依存）

## 不変条件チェック

- [x] **INV-DOM-001**: ドメインエンティティの純粋性を遵守
  - 外部依存(Prisma, Next.js等)なし
  - 純粋なTypeScript型と関数のみで構成
- [x] **INV-TYPE-001**: 型安全性を完全保証
  - any型不使用
  - 厳格な型定義
  - インデックスシグネチャによる型安全な拡張性

## 使用例

```typescript
// 作成操作の監査
const createLog = createAuditLogForCreate(
  "Record",
  "record-123",
  { id: "record-123", studentName: "Test Student", emotion: 75 },
  { source: "api", ipAddress: "127.0.0.1" },
  "user-456"
);

// 更新操作の監査
const updateLog = createAuditLogForUpdate(
  "Record",
  "record-123",
  { id: "record-123", studentName: "Old Name" },
  { id: "record-123", studentName: "New Name" },
  { source: "api", correlationId: "req-789" },
  "user-456"
);

// 削除操作の監査
const deleteLog = createAuditLogForDelete(
  "Record",
  "record-123",
  { id: "record-123", studentName: "Deleted Student" },
  { source: "migration" },
  "admin-001"
);

// システム操作（actor省略）
const systemLog = createAuditLogForCreate(
  "Stats",
  "stats-global",
  { totalRecords: 100 },
  { source: "seed" }
);
// systemLog.actor === "system"
```

## テストカバレッジ

- ✅ createAuditLogForCreate: 正常系、デフォルトactor、ID一意性
- ✅ createAuditLogForUpdate: 正常系、デフォルトactor
- ✅ createAuditLogForDelete: 正常系、デフォルトactor
- ✅ AuditLog型構造: 全メタデータフィールド、最小メタデータ
- ✅ 操作タイプ: create, update, delete
- ✅ タイムスタンプ生成: 合理的な範囲、連続呼び出し

## 関連モジュール

- **AuditService**: AuditLogを使用して監査操作を実行
- **AuditLogRepository**: AuditLogの永続化を担当
- **PrismaRecordRepository**: データ操作時にAuditLogを生成
