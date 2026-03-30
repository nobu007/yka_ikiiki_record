# SPEC: SessionAPI

## 概要
- **モジュール**: `src/app/api/auth/session/route.ts`
- **エンドポイント**: `GET /api/auth/session`
- **責務**: セッショントークンを検証し、現在の認証状態とユーザー情報を返す
- **関連する不変条件**: INV-API-001 (API Response Structure), INV-DOM-004 (User Required Fields)

## 入力契約

### リクエストヘッダー
| ヘッダー | 型 | 制約 | デフォルト |
|---------|-----|------|-----------|
| Authorization | string | "Bearer {token}" 形式 | なし（省略可） |

### トークン形式
| フォーマット | 説明 |
|------------|------|
| `session_{userId}_{timestamp}_{random}` | 有効なセッショントークン |
| それ以外 | 無効なトークンとして処理 |

## 出力契約

### 認証成功時のレスポンス (HTTP 200)
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| authenticated | boolean | true |
| user | SafeUser | passwordHashを除く完全なユーザー情報 |

### 認証失敗時のレスポンス (HTTP 200)
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| authenticated | boolean | false |
| user | object | undefined |

### SafeUserオブジェクト
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| id | number | 正の整数 |
| email | string | 有効なメールアドレス形式 |
| name | string | 1-100文字 |
| role | "TEACHER" \| "ADMIN" | 有効なロール値 |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

## エラー契約

このエンドポイントはエラーをHTTP 200で返し、`authenticated: false` を設定します。エラーが発生した場合でもクライアントに200ステータスを返します。

| 条件 | HTTPステータス | authenticated |
|------|---------------|--------------|
| Authorizationヘッダーが欠落 | 200 | false |
| Authorizationヘッダーが"Bearer "で始まらない | 200 | false |
| トークン形式が無効 | 200 | false |
| トークンから抽出されたuserIdに対応するユーザーが存在しない | 200 | false |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| Authorizationヘッダーなし | 200, authenticated: false | 未認証状態 |
| Authorization: "Bearer invalid_token" | 200, authenticated: false | 無効なトークン形式 |
| Authorization: "Bearer session_999_..." | 200, authenticated: false | 存在しないユーザーID |
| Authorization: "Bearer session_1_..." | 200, authenticated: true | 有効なトークン |
| Authorization: "InvalidFormat session_1_..." | 200, authenticated: false | Bearerプレフィックスなし |

## ドメインルール

### セッション検証フロー
1. **Authorizationヘッダー確認**: "Bearer "プレフィックスの有無を確認
2. **トークン抽出**: ヘッダーからトークン部分を抽出
3. **トークン形式検証**: `session_{userId}_...` 形式であることを確認
4. **ユーザーID抽出**: トークンからuserIdを抽出し、整数に変換
5. **ユーザー検索**: userIdでユーザーを検索
6. **レスポンス構築**: 認証状態とユーザー情報（またはundefined）を返す

### セキュリティ要件
- **パスワードハッシュ除外**: レスポンスにpasswordHashを含めない
- **トークン形式緩和**: 完全なトークン検証ではなく、形式チェックのみ実施
- **常に200を返す**: エラーを401で返さず、authenticatedフラグで示す

### タイムアウト
- APIタイムアウト: 10秒 (DEFAULT_TIMEOUTS.api)

## 不変条件チェック

- [x] **INV-API-001**: レスポンスは success, authenticated, user プロパティを含む
- [x] **INV-DOM-004**: Userオブジェクトは必須フィールドを含む
- [x] **型安全**: すべてのレスポンスはZodスキーマで検証される
- [x] **エラー処理**: withResilientHandlerでラップされ、タイムアウトとエラーを処理

## 使用例

### 認証済みセッションの確認
```bash
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer session_1_1712345678901_abc123"

# Response (200):
{
  "success": true,
  "authenticated": true,
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

### 未認証セッション（Authorizationヘッダーなし）
```bash
curl -X GET http://localhost:3000/api/auth/session

# Response (200):
{
  "success": true,
  "authenticated": false
}
```

### 無効なトークン形式
```bash
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer invalid_token"

# Response (200):
{
  "success": true,
  "authenticated": false
}
```

### 存在しないユーザーID
```bash
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer session_999_1712345678901_xyz"

# Response (200):
{
  "success": true,
  "authenticated": false
}
```

## 関連エンティティ

- **UserRepository**: ユーザーの検索
- **User**: ユーザーエンティティ（ドメインモデル）
- **LoginAPI**: このエンドポイントを使用するログインエンドポイント

## 依存関係

### 外部依存
- `z`: Zodスキーマバリデーション
- `withResilientHandler`: APIエラーハンドラー
- `DEFAULT_TIMEOUTS`: タイムアウト設定
- `InMemoryUserRepository`: ユーザーリポジトリ（開発環境）
