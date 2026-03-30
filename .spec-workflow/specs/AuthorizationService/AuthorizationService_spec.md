# SPEC: AuthorizationService

## 概要
- **モジュール**: `src/application/services/AuthorizationService.ts`
- **責務**: アプリケーション層での認可チェックを担当し、ロールベースアクセス制御（RBAC）を提供する
- **関連する不変条件**:
  - INV-ARCH-002: Layer_Separation (Application層に属す)
  - Single_Responsibility_Enforcement: 認可ロジックのみを担当

## 入力契約

### コンストラクタ
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| userRepository | UserRepository | 有効なRepository実装であること | なし |

### hasRole / hasAtLeastRole
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| userId | number | 正の整数 | なし |
| role | UserRole | "TEACHER" または "ADMIN" | なし |

### can / require
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| userId | number | 正の整数 | なし |
| resource | string | PERMISSIONSに定義済み、空文字以外 | なし |
| action | string | PERMISSIONSに定義済み、空文字以外 | なし |

## 出力契約

### hasRole(userId, role): Promise<boolean>
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | boolean | ユーザーが指定されたロールを持つ場合はtrue、それ以外はfalse |

### hasAtLeastRole(userId, minRole): Promise<boolean>
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | boolean | ユーザーがminRole以上のロールを持つ場合はtrue（ADMIN > TEACHER） |

### can(userId, resource, action): Promise<boolean>
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | boolean | ユーザーがリソースに対するアクションを実行可能な場合はtrue、未定義の権限はfalse（fail-closed） |

### requireRole / requireAtLeastRole / require: Promise<void>
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| - | void | 認可されている場合は正常終了、認可されていない場合はAuthorizationErrorをスロー |

## エラー契約

| 条件 | 例外 | HTTPステータス |
|------|----------------|---------------|
| ユーザーが存在しない | falseを返す（hasRole/can系）または AuthorizationError | 403 |
| ロールが不足している | AuthorizationError | 403 |
| 権限が定義されていない | falseを返す（fail-closed） | N/A |
| 無効なuserId（0、負数、999） | falseを返す | N/A |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| userId = 0 | false | 存在しないユーザー |
| userId = -1 | false | 負のID |
| userId = 999 | false | 存在しないユーザー |
| resource = "" | false | 空文字列 |
| action = "" | false | 空文字列 |
| 大文字小文字が異なる | false | "Records" vs "records" |

## ロール階層

```
ADMIN > TEACHER
```

- ADMIN: すべての権限を持つ
- TEACHER: レコードの読み書きと統計の閲覧が可能

## 権限定義 (PERMISSIONS)

### Record管理
| リソース | アクション | 必要ロール |
|---------|-----------|-----------|
| records | read | TEACHER |
| records | write | TEACHER |
| records | delete | ADMIN |

### 統計・分析
| リソース | アクション | 必要ロール |
|---------|-----------|-----------|
| stats | read | TEACHER |

### ユーザー管理（管理者のみ）
| リソース | アクション | 必要ロール |
|---------|-----------|-----------|
| users | read | ADMIN |
| users | write | ADMIN |
| users | delete | ADMIN |

### システム管理（管理者のみ）
| リソース | アクション | 必要ロール |
|---------|-----------|-----------|
| system | admin | ADMIN |

## 公開メソッド

### ロールチェック
- `hasRole(userId, role)`: 指定されたロールを直接チェック
- `hasAtLeastRole(userId, minRole)`: 最小ロールレベルをチェック
- `requireRole(userId, role)`: ロールチェック、失敗時にエラー
- `requireAtLeastRole(userId, minRole)`: 最小ロールチェック、失敗時にエラー

### 権限チェック
- `can(userId, resource, action)`: リソース-アクションペアの権限をチェック
- `require(userId, resource, action)`: 権限チェック、失敗時にエラー

### 便利メソッド
- `canReadRecords(userId)`: レコード読み取り権限
- `canWriteRecords(userId)`: レコード書き込み権限
- `canDeleteRecords(userId)`: レコード削除権限
- `canReadStats(userId)`: 統計閲覧権限
- `canManageUsers(userId)`: ユーザー管理権限
- `isAdmin(userId)`: 管理者チェック
- `isTeacher(userId)`: 教員チェック

## 不変条件チェック

- [ ] INV-ARCH-001: Single_Responsibility_Enforcement - 認可ロジックのみを担当（実装完了）
- [ ] INV-ARCH-002: Layer_Separation - Application層に配置、Domain層への依存のみ（実装完了）
- [ ] Fail-Closed: 未定義の権限はデフォルトで拒否（実装完了）
- [ ] Role Hierarchy: ADMIN > TEACHER の階層を遵守（実装完了）

## テストカバレッジ要件

### 正常系
- [x] hasRole: TEACHERロールのチェック
- [x] hasRole: ADMINロールのチェック
- [x] hasAtLeastRole: ロール階層のチェック
- [x] can: すべての定義済み権限についてのチェック
- [x] 便利メソッド: すべてのショートカットメソッドの動作

### 境界値
- [x] userId = 0: falseを返す
- [x] userId = -1: falseを返す
- [x] userId = 999: falseを返す（存在しないユーザー）
- [x] 空文字列: resource="" / action="" でfalseを返す
- [x] 大文字小文字の区別: "Records" は "records" と異なる

### エラー系
- [x] requireRole: 権限不足でAuthorizationError
- [x] requireAtLeastRole: 権限不足でAuthorizationError
- [x] require: 権限不足でAuthorizationError
- [x] AuthorizationError: 正しいエラーメッセージとスタックトレース

### 統合テスト
- [x] すべてのPERMISSIONSについてADMINがアクセス可能
- [x] TEACHERがADMIN専用権限にアクセスできない
- [x] TEACHERがTEACHERレベル権限にアクセス可能

## 実装のステータス

- [x] コア実装完了
- [x] テスト完了 (48 tests, 100% passing)
- [x] 境界値テスト完了
- [x] エラーハンドリング完了
- [ ] SPEC文書作成（このドキュメント）

## 使用例

### APIルートでの使用
```typescript
// src/app/api/records/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
  context: { user?: User }
) {
  if (!context.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 認可チェック
  await authService.require(context.user.id, "records", "delete");

  // 削除処理続行...
}
```

### ロールベースのUI表示
```typescript
// admin-only component
async function AdminPanel({ userId }: { userId: number }) {
  const isAdmin = await authService.isAdmin(userId);

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <AdminDashboard />;
}
```

## 依存関係

- `UserRepository` (Domain層インターフェース)
- `User`, `UserRole` (schemas/api)

## 履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-03-30 | 1.0.0 | 初版作成 |
