# SPEC: LoginForm

## 概要
- **モジュール**: `src/components/auth/LoginForm.tsx`
- **責務**: ユーザー認証のためのログインフォームUIを提供し、バリデーション、API通信、成功/エラーハンドリングを行う
- **関連する不変条件**: INV-UI-001, INV-UI-002, INV-UI-003, INV-ERR-001

## 入力契約

### Props
| パラメータ | 型 | 制約 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| onSuccess | (response: LoginResponse) => void | 必須 | - | ログイン成功時のコールバック |
| onError | (error: string) => void | 必須 | - | ログイン失敗時のコールバック |
| className | string | オプション | undefined | フォーム要素に適用するCSSクラス |

### LoginResponse型
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| success | boolean | ログイン成否 |
| token | string (オプション) | セッショントークン |
| user | object (オプション) | ユーザー情報 {id, email, name, role} |
| error | string (オプション) | エラーメッセージ |

### 入力フィールド
| フィールド | 型 | 制約 | バリデーション |
|-----------|-----|------|-------------|
| email | string | Zod emailスキーマ | 有効なメールアドレス形式必須 |
| password | string | 空文字列禁止 | 1文字以上必須 |

## 出力契約

### コールバック呼び出し
| 条件 | 呼び出されるコールバック | 引数 |
|------|---------------------|------|
| API成功 (response.ok && data.success) | onSuccess | LoginResponseオブジェクト |
| API失敗 (response.ok=false) | onError | data.error または "Login failed" |
| ネットワークエラー | onError | Error.message または "An error occurred" |
| バリデーション失敗 | なし | - |

### UI状態変化
| 状態 | 条件 | 挙動 |
|------|------|------|
| isSubmitting | 送信中true | submitボタン無効化、aria-busy="true" |
| error | バリデーション/APIエラー時 | エラーメッセージ表示、role="alert" |

## エラー契約
| 条件 | 例外/レスポンス | UI表示 |
|------|----------------|--------|
| 無効なメール形式 | バリデーションエラー | "Invalid email format" |
| 空パスワード | バリデーションエラー | "Password is required" |
| API 401 | "Invalid email or password" | エラーメッセージ表示 |
| API 400+ | data.error or "Login failed" | エラーメッセージ表示 |
| ネットワークエラー | fetch rejection | エラーメッセージ表示 |
| JSONパースエラー | onError呼び出し | エラーメッセージ表示 |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| email: "" | "Invalid email format" | 空文字列は無効 |
| email: "invalid" | "Invalid email format" | メール形式違反 |
| email: "  test@example.com  " | "test@example.com" | 自動trim |
| password: "" | "Password is required" | 空パスワード禁止 |
| password: " " (スペースのみ) | "Password is required" | trim後の空文字判定 |
| 連続クリック | 1回のみAPI呼び出し | isSubmittingフラグで防止 |

## 不変条件チェック
- [x] INV-UI-001: React.memoによる不要な再レンダリング防止
- [x] INV-UI-002: ARIAラベル付与 (aria-label, aria-invalid, aria-busy, role="alert")
- [x] INV-UI-003: エラーレジリエンス (ネットワークエラー、JSONパースエラー等)
- [x] INV-ERR-001: Error型チェック (err instanceof Error)

## API契約
### POST /api/auth/login
**リクエスト:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**成功レスポンス (200 OK):**
```json
{
  "success": true,
  "token": "session_1_1234567890_abc123",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "role": "TEACHER"
  }
}
```

**失敗レスポンス (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

## パフォーマンス要件
- React.memoによるメモ化必須
- useCallbackによるイベントハンドラー安定化
- 送信中はボタン無効化による二重送信防止

## アクセシビリティ要件
- email入力: aria-label="Email", aria-invalid=!!error
- password入力: aria-label="Password", aria-invalid=!!error
- エラーメッセージ: role="alert", id="email-error"
- ローディング中: aria-busy="true"
- エラー関連付け: aria-describedby={error ? "email-error" : undefined}

## 実装詳細
- **バリデーション**: Zod (z.string().email())
- **状態管理**: useState (email, password, error, isSubmitting)
- **メモ化**: React.memo + useCallback
- **API通信**: fetch API
- **エラー表示**: 条件レンダリング (role="alert")

## テストカバレッジ
- 27テストケース全件パス
- カバレッジ: レンダリング、入力バリデーション、送信成功/失敗、ユーザー操作、アクセシビリティ、パフォーマンス、境界値
