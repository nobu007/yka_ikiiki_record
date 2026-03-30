# SPEC: User

## 概要
- **モジュール**: `src/domain/entities/User.ts`
- **責務**: ユーザーアカウントのデータ構造とバリデーションを定義し、認証と認可の基盤を提供する
- **関連する不変条件**: INV-DOM-004 (Record_Required_Fieldsのパターンに従う)

## 入力契約

### User作成時の必須フィールド
| フィールド | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| email | string | 有効なメールアドレス形式, 1-255文字 | なし |
| passwordHash | string | 60-255文字（bcryptハッシュ） | なし |
| name | string | 1-100文字 | なし |
| role | UserRole | "TEACHER" または "ADMIN" | なし |

### User作成時のオプションフィールド
| フィールド | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | number | 正の整数 | 未設定時は自動採番 |
| createdAt | Date | 有効なDateオブジェクト | 未設定時は現在時刻 |
| updatedAt | Date | 有効なDateオブジェクト | 未設定時は現在時刻 |

## 出力契約

### Userオブジェクト
| プロパティ | 型 | 保証する条件 |
|-----------|-----|-------------|
| id | number \| undefined | 作成時はundefined、保存後は正の整数 |
| email | string | 有効なメールアドレス形式、一意 |
| passwordHash | string | 60-255文字のハッシュ値 |
| name | string | 1-100文字 |
| role | "TEACHER" \| "ADMIN" | 有効なロール値のみ |
| createdAt | Date \| undefined | 保存後は必ず設定 |
| updatedAt | Date \| undefined | 保存後は必ず設定 |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| emailが空文字列 | ZodValidationError | 400 |
| emailが無効な形式 | ZodValidationError | 400 |
| emailが255文字超 | ZodValidationError | 400 |
| passwordHashが60文字未満 | ZodValidationError | 400 |
| passwordHashが255文字超 | ZodValidationError | 400 |
| nameが空文字列 | ZodValidationError | 400 |
| nameが100文字超 | ZodValidationError | 400 |
| roleが無効な値 | ZodValidationError | 400 |
| idが0または負の値 | ZodValidationError | 400 |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| email: "" | 検証失敗 | 空文字列は不可 |
| email: "a@b.co" | 検証成功 | 最小限の有効メール形式（Zodのemail()バリデータに準拠） |
| email: 300文字 | 検証失敗 | 最大長超過 |
| passwordHash: 59文字 | 検証失敗 | 最小長未満 |
| passwordHash: 60文字 | 検証成功 | 最小長 |
| passwordHash: 255文字 | 検証成功 | 最大長 |
| passwordHash: 256文字 | 検証失敗 | 最大長超過 |
| name: "" | 検証失敗 | 空文字列は不可 |
| name: 1文字 | 検証成功 | 最小長 |
| name: 100文字 | 検証成功 | 最大長 |
| name: 101文字 | 検証失敗 | 最大長超過 |
| id: 0 | 検証失敗 | 正の整数のみ |
| id: -1 | 検証失敗 | 正の整数のみ |
| id: 1 | 検証成功 | 最小有効値 |
| role: "TEACHER" | 検証成功 | 有効なロール |
| role: "ADMIN" | 検証成功 | 有効なロール |
| role: "INVALID" | 検証失敗 | 無効なロール |

## ドメインルール

### 認証関連
- **メールアドレス一意性**: 同じメールアドレスで複数のユーザーは作成できない
- **パスワードハッシュ保存**: 平文パスワードは保存せず、必ずハッシュ値を保存する
- **メールアドレス大文字小文字区別**: メールアドレスの比較は大文字小文字を区別しない

### ロールベースアクセス制御
- **TEACHERロール**: 通常の教員アカウント、生徒記録の作成・閲覧が可能
- **ADMINロール**: 管理者アカウント、システム全体の管理が可能

### タイムスタンプ管理
- **createdAt**: ユーザー作成時の時刻、変更不可
- **updatedAt**: ユーザー更新時の時刻、更新のたびに現在時刻に設定

## 不変条件チェック

- [x] **INV-DOM-004パターン**: id, createdAt, updatedAtはオプション、email/passwordHash/name/roleは必須
- [x] **型安全**: すべてのフィールドはTypeScriptのstrict modeで型チェックされる
- [x] **Zodバリデーション**: UserSchemaによる実行時バリデーションが必須

## 使用例

### TEACHERユーザーの作成
```typescript
const teacher: User = {
  email: "teacher@example.com",
  passwordHash: "$2b$10$hashed_password_here_60_chars_minimum",
  name: "田中先生",
  role: "TEACHER"
};
```

### ADMINユーザーの作成
```typescript
const admin: User = {
  id: 1,
  email: "admin@example.com",
  passwordHash: "$2b$10$hashed_password_here_60_chars_minimum",
  name: "システム管理者",
  role: "ADMIN",
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## 関連エンティティ

- **UserRepository**: Userの永続化とクエリを担当
- **Record**: ユーザーが作成した生徒の記録（将来的な関連）
- **AuditLog**: ユーザーの操作履歴（将来的な関連）
