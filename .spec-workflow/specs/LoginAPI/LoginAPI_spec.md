# SPEC: LoginAPI

## 概要
- **モジュール**: `src/app/api/auth/login/route.ts`
- **エンドポイント**: `POST /api/auth/login`
- **責務**: ユーザーのメールアドレスとパスワードを認証し、セッショントークンとユーザー情報を返す
- **関連する不変条件**: INV-API-001 (API Response Structure), INV-DOM-004 (User Required Fields)

## 入力契約

### リクエストボディ
| フィールド | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| email | string | 有効なメールアドレス形式 | なし |
| password | string | 1文字以上 | なし |

### 入力バリデーション
| 条件 | 結果 | HTTPステータス |
|------|------|---------------|
| emailが存在しない | 検証エラー | 400 |
| emailが無効な形式 | 検証エラー | 400 |
| passwordが存在しない | 検証エラー | 400 |
| passwordが空文字列 | 検証エラー | 400 |
| リクエストボディが無効なJSON | 検証エラー | 400 |

## 出力契約

### 成功時のレスポンス (HTTP 200)
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| token | string | "session_{userId}_{timestamp}_{random}" 形式 |
| user | SafeUser | passwordHashを除く完全なユーザー情報 |

### SafeUserオブジェクト
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| id | number | 正の整数 |
| email | string | 有効なメールアドレス形式 |
| name | string | 1-100文字 |
| role | "TEACHER" \| "ADMIN" | 有効なロール値 |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

### 失敗時のレスポンス
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | false |
| error | string | エラーメッセージ |
| token | string | undefined |
| user | object | undefined |

## エラー契約

| 条件 | HTTPステータス | エラーメッセージ |
|------|---------------|-----------------|
| リクエストボディが無効なJSON | 400 | "Invalid request body" |
| emailが欠落 | 400 | "email: Invalid email format" を含む |
| email形式が無効 | 400 | "email: Invalid email format" を含む |
| passwordが欠落 | 400 | "password: Password is required" を含む |
| passwordが空文字列 | 400 | "password: Password is required" を含む |
| ユーザーが存在しない | 401 | "Invalid email or password" または同様のメッセージ |
| パスワードが不一致 | 401 | "Invalid email or password" または同様のメッセージ |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| email: "TEACHER@EXAMPLE.COM" + 正しいパスワード | 200, 認証成功 | 大文字小文字を区別しないメール検索 |
| email: "not-an-email" + 任意のパスワード | 400, 検証エラー | メール形式が無効 |
| password: "" + 有効なメール | 400, 検証エラー | 空文字列は不可 |
| 存在しないメール + 任意のパスワード | 401, 認証失敗 | ユーザーが見つからない |
| 有効なメール + 間違ったパスワード | 401, 認証失敗 | パスワードが不一致 |

## ドメインルール

### 認証フロー
1. **リクエスト検証**: emailとpasswordが存在し、有効な形式であることを確認
2. **ユーザー検索**: メールアドレス（大文字小文字を区別せず）でユーザーを検索
3. **パスワード検証**: ハッシュ化されたパスワードと比較
4. **トークン生成**: 一意のセッショントークンを生成
5. **レスポンス構築**: トークンと安全なユーザー情報（passwordHashなし）を返す

### セキュリティ要件
- **パスワードハッシュ**: 検証時にのみ使用し、レスポンスには含めない
- **大文字小文字区別なし**: メールアドレスの比較で大文字小文字を区別しない
- **トークン形式**: `session_{userId}_{timestamp}_{random}` の形式で一意性を保証

### タイムアウト
- APIタイムアウト: 10秒 (DEFAULT_TIMEOUTS.api)
- サーキットブレーカー: 有効（デフォルト設定）

## 不変条件チェック

- [x] **INV-API-001**: レスポンスは success, token, user/error プロパティを含む
- [x] **INV-DOM-004**: Userオブジェクトは必須フィールド（email, name, role）を含む
- [x] **型安全**: すべてのレスポンスはZodスキーマで検証される
- [x] **エラー処理**: withResilientHandlerでラップされ、タイムアウトとエラーを処理

## 使用例

### 正常なログイン（TEACHER）
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'

# Response (200):
{
  "success": true,
  "token": "session_1_1712345678901_abc123def456",
  "user": {
    "id": 1,
    "email": "teacher@example.com",
    "name": "田中先生",
    "role": "TEACHER",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### 正常なログイン（ADMIN）
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Response (200):
{
  "success": true,
  "token": "session_2_1712345678901_xyz789abc012",
  "user": {
    "id": 2,
    "email": "admin@example.com",
    "name": "管理者",
    "role": "ADMIN",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### 認証失敗（ユーザーが存在しない）
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'

# Response (401):
{
  "success": false,
  "error": "Invalid email or password"
}
```

### 検証エラー（メール形式が無効）
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "password123"
  }'

# Response (400):
{
  "success": false,
  "error": "Invalid request body: email: Invalid email format"
}
```

## 関連エンティティ

- **AuthenticationService**: 認証ロジックを担当（loginメソッド）
- **UserRepository**: ユーザーの永続化と検索
- **PasswordHasher**: パスワードのハッシュ化と検証
- **TokenGenerator**: セッショントークンの生成
- **User**: ユーザーエンティティ（ドメインモデル）

## 依存関係

### 外部依存
- `z`: Zodスキーマバリデーション
- `withResilientHandler`: APIエラーハンドラー
- `globalCircuitBreaker`: サーキットブレーカー
- `DEFAULT_TIMEOUTS`: タイムアウト設定
- `AuthenticationService`: ドメインサービス
- `InMemoryUserRepository`: ユーザーリポジトリ（開発環境）
- `BcryptPasswordHasher`: パスワードハッシャー（実装）
- `SimpleTokenGenerator`: トークン生成器（実装）

### テストモック
- `InMemoryUserRepository.findByEmail`: モック実装
- テストデータ: teacher@example.com, admin@example.com, user123@example.com
