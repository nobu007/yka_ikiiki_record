# SPEC: AuditService

## 概要
- **モジュール**: src/application/services/AuditService.ts
- **責務**: Application service for automatic audit logging of data mutations, providing middleware for compliance, debugging, and data integrity verification
- **関連する不変条件**: INV-ARCH-001 (Single_Responsibility_Enforcement), INV-REP-001 (Repository_Interface_Contract)

## 入力契約

### logCreate
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| entityType | string | Non-empty string | なし |
| entityId | string | Non-empty string | なし |
| after | Record<string, unknown> | Entity state after creation | なし |
| metadata | AuditLogMetadata | Must contain source field | なし |
| actor | string | Non-empty string | "system" |

### logUpdate
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| entityType | string | Non-empty string | なし |
| entityId | string | Non-empty string | なし |
| before | Record<string, unknown> | Entity state before update | なし |
| after | Record<string, unknown> | Entity state after update | なし |
| metadata | AuditLogMetadata | Must contain source field | なし |
| actor | string | Non-empty string | "system" |

### logDelete
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| entityType | string | Non-empty string | なし |
| entityId | string | Non-empty string | なし |
| before | Record<string, unknown> | Entity state before deletion | なし |
| metadata | AuditLogMetadata | Must contain source field | なし |
| actor | string | Non-empty string | "system" |

### logOperation
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| operation | AuditOperation | "create" | "update" | "delete" | なし |
| entityType | string | Non-empty string | なし |
| entityId | string | Non-empty string | なし |
| before | Record<string, unknown> \| null | null for create, object otherwise | なし |
| after | Record<string, unknown> \| null | null for delete, object otherwise | なし |
| metadata | AuditLogMetadata | Must contain source field | なし |
| actor | string | Non-empty string | "system" |

## 出力契約

### logCreate, logUpdate, logDelete, logOperation
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| void | Promise<void> | - Audit log entry is created with unique ID<br>- Timestamp is set to current time<br>- Repository.save() is called exactly once<br>- All parameters are preserved in the audit log |

### AuditLog Structure (created by all methods)
| フィールド | 型 | 保証する条件 |
|---------|-----|-------------|
| id | string | Format: "audit-{timestamp}-{random}", unique for each call |
| timestamp | number | Unix timestamp in milliseconds, <= Date.now() at call time |
| entityType | string | Matches input parameter |
| entityId | string | Matches input parameter |
| operation | AuditOperation | "create", "update", or "delete" |
| actor | string | Matches input parameter or "system" default |
| changes.before | Record<string, unknown> \| null | null for create, input value for update/delete |
| changes.after | Record<string, unknown> \| null | null for delete, input value for create/update |
| metadata | AuditLogMetadata | Contains all input metadata fields |

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| Repository save operation fails | Error from repository (propagated) | N/A (application layer) |
| Empty entityType | Error (handled by domain layer) | N/A |
| Empty entityId | Error (handled by domain layer) | N/A |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| logCreate with empty after object | AuditLog with after={} | Empty objects are valid |
| logUpdate with identical before/after | AuditLog created | No difference checking performed |
| logDelete with empty before object | AuditLog with before={} | Empty objects are valid |
| metadata with custom fields | All fields preserved | Extensible metadata structure |
| Empty metadata (only source) | AuditLog with metadata={source} | Minimal valid metadata |
| Multiple calls for same entity | Different IDs each time | Unique ID generation |
| Concurrent calls | Unique IDs even with same timestamp | Random component ensures uniqueness |

## 不変条件チェック
- [x] INV-ARCH-001: Single responsibility - only handles audit logging, no business logic
- [x] INV-REP-001: Depends on AuditLogRepository interface, not concrete implementation
- [x] INV-REP-002: Repository operations are isolated (no shared state between calls)

## 実装詳細

### 依存関係
- **Domain Layer**: AuditLog entity (createAuditLogForCreate, createAuditLogForUpdate, createAuditLogForDelete)
- **Repository Interface**: AuditLogRepository (dependency injection)
- **No Framework Dependencies**: Pure TypeScript, no Next.js/React imports

### デザインパターン
- **Middleware Pattern**: Wraps domain operations with audit logging
- **Dependency Injection**: Repository passed via constructor
- **Factory Function Delegation**: Uses domain entity factory functions for log creation
- **Error Propagation**: Repository errors are propagated to caller

### ID生成アルゴリズム
```typescript
// Format: "audit-{timestamp}-{random}"
// timestamp: Date.now() (milliseconds since epoch)
// random: Math.random().toString(36).substring(2, 9) (base36, 7 chars)
// Example: "audit-1672531200000-a1b2c3d"
```

### パフォーマンス特性
- **Time Complexity**: O(1) for all operations (single repository save)
- **Space Complexity**: O(1) for service, O(n) for repository storage
- **ID Collision Probability**: Negligible (timestamp + random components)

### 使用例

#### 基本的な使用法
```typescript
const auditService = new AuditService(auditLogRepository);

// Create operation
await auditService.logCreate("Record", "record-123", {
  id: 1,
  student: "John Doe",
  emotion: 4.5,
}, { source: "api" });

// Update operation
await auditService.logUpdate("Record", "record-123",
  { id: 1, comment: "Old" },
  { id: 1, comment: "New" },
  { source: "api", correlationId: "corr-abc-123" }
);

// Delete operation
await auditService.logDelete("Record", "record-123",
  { id: 1, student: "John Doe" },
  { source: "admin" },
  "admin-user"
);
```

#### カスタムメタデータ
```typescript
await auditService.logCreate("Record", "record-123", recordData, {
  source: "api",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0",
  correlationId: "req-abc-123",
  customField: "custom value",
  numericField: 42,
  booleanField: true,
});
```

## テストカバレッジ

### 既存テスト (AuditService.test.ts)
- ✅ logCreate: Creates audit log with correct structure
- ✅ logCreate: Uses custom actor when provided
- ✅ logCreate: Includes correlation ID in metadata
- ✅ logCreate: Generates unique IDs for each call
- ✅ logCreate: Sets timestamp to current time
- ✅ logUpdate: Creates audit log with before/after states
- ✅ logUpdate: Uses custom actor when provided
- ✅ logUpdate: Includes IP address and user agent
- ✅ logDelete: Creates audit log with before state
- ✅ logDelete: Uses custom actor when provided
- ✅ logOperation: Handles create operation
- ✅ logOperation: Handles update operation
- ✅ logOperation: Handles delete operation
- ✅ logOperation: Uses custom actor when provided
- ✅ Error handling: Propagates repository save errors
- ✅ Error handling: Does not save log if repository throws error
- ✅ Metadata handling: Preserves custom metadata fields
- ✅ Metadata handling: Handles empty metadata
- ✅ ID generation: Generates IDs with audit prefix
- ✅ ID generation: Generates unique IDs even for same entity

### Test Summary
- **Total Tests**: 19 tests
- **Coverage**: 100% of all public methods
- **Boundary Cases**: ID uniqueness, metadata extensibility
- **Error Cases**: Repository error propagation
- **Integration Cases**: Repository interaction via mocks

## PURPOSE.md への関連
- **P2: 優先度2: 運用改善**: 監査ログ機能（操作履歴記録、変更追跡）
- 本サービスはすべてのデータ変異操作の監査証跡を提供する
- コンプライアンス、デバッグ、データ整合性検証を支援する

## Clean Architecture準拠
- **Layer**: Application Service
- **依存方向**: Domain → Repository Interface (OK)
- **禁止事項**: ❌ Infrastructure/Presentationからのimportは禁止
- **許可事項**: ✅ Domain層からのimportはOK
