# SPEC: LogoutAPI

## 概要
- **モジュール**: `src/app/api/auth/logout/route.ts`
- **エンドポイント**: `POST /api/auth/logout`
- **責務**: ユーザーログアウトを処理し、セッションを無効化する
- **関連する不変条件**: INV-API-001 (API Response Structure)

## 入力契約

### リクエストヘッダー
| ヘッダー | 型 | 制約 | デフォルト |
|---------|-----|------|-----------|
| Authorization | string | "Bearer {token}" 形式 | なし（必須） |

### リクエストボディ
なし（空のPOSTリクエスト）

## 出力契約

### 成功時のレスポンス (HTTP 200)
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| message | string | "Logged out successfully" |

### 失敗時のレスポンス (HTTP 401)
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | false |
| error | string | エラーメッセージ |
| message | string | undefined |

## エラー契約

| 条件 | HTTPステータス | エラーメッセージ |
|------|---------------|-----------------|
| Authorizationヘッダーが欠落 | 401 | "Unauthorized" または同様のメッセージ |
| Authorizationヘッダーが"Bearer "で始まらない | 401 | "Unauthorized" または同様のメッセージ |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| Authorization: "Bearer session_1_..." | 200, ログアウト成功 | 有効なトークン |
| Authorizationヘッダーなし | 401, 認証エラー | 未認証状態 |
| Authorization: "InvalidFormat" | 401, 認証エラー | Bearerプレフィックスなし |

## ドメインルール

### ログアウトフロー
1. **Authorizationヘッダー確認**: "Bearer "プレフィックスの有無を確認
2. **トークン抽出**: ヘッダーからトークン部分を抽出（現在は使用せず）
3. **ログアウト処理**: 将来的にはトークンを無効リストに追加
4. **成功レスポンス**: ログアウト成功メッセージを返す

### 現在の実装メモ
- **トークン検証なし**: Authorizationヘッダーの形式チェックのみ実施
- **トークン無効化なし**: 現在はトークンを無効リストに追加しない（将来的な実装）
- **ステートレス**: クライアント側でトークンを削除することでログアウト

### セキュリティ要件
- **Authorization必須**: ヘッダーが存在しない場合は401を返す
- **Bearerプレフィックス必須**: "Bearer "で始まらない場合は401を返す

### タイムアウト
- APIタイムアウト: 10秒 (DEFAULT_TIMEOUTS.api)

## 不変条件チェック

- [x] **INV-API-001**: レスポンスは success, message/error プロパティを含む
- [x] **型安全**: すべてのレスポンスはZodスキーマで検証される
- [x] **エラー処理**: withResilientHandlerでラップされ、タイムアウトとエラーを処理

## 使用例

### 正常なログアウト
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer session_1_1712345678901_abc123"

# Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Authorizationヘッダーなし（認証エラー）
```bash
curl -X POST http://localhost:3000/api/auth/logout

# Response (401):
{
  "success": false,
  "error": "Unauthorized"
}
```

### 無効なAuthorization形式（認証エラー）
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: InvalidFormat token"

# Response (401):
{
  "success": false,
  "error": "Unauthorized"
}
```

## 関連エンティティ

- **LoginAPI**: ログインエンドポイント（対になる操作）
- **SessionAPI**: セッション確認エンドポイント

## 依存関係

### 外部依存
- `z`: Zodスキーマバリデーション
- `withResilientHandler`: APIエラーハンドラー
- `DEFAULT_TIMEOUTS`: タイムアウト設定
- `API_ERROR_MESSAGES`: エラーメッセージ定数
- `HTTP_STATUS`: HTTPステータス定数

## 将来的な拡張

### トークン無効リスト（将来実装）
- 現在はトークンを無効にしていない
- 将来的には以下の機能が検討される:
  - Redis/データベースを使用した無効トークンリスト
  - トークンの有効期限チェック
  - ログアウト時にトークンをブラックリストに追加

### セッション管理（将来実装）
- 複数デバイスでの同時ログイン管理
- 強制ログアウト機能
- セッション履歴の追跡
