# SPEC: UserRepository

## 概要
- **モジュール**: `src/domain/repositories/UserRepository.ts`
- **責務**: ユーザーアカウントの永続化とクエリを担当し、認証（メールアドレス検索）とロールベースアクセス制御をサポートする
- **関連する不変条件**: INV-REP-001 (Repository_Interface_Contract), INV-REP-003 (Repository_Sequential_ID_Assignment)

## インターフェース契約

### メソッド定義

#### findByEmail(email: string): Promise<User | null>
| パラメータ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| email | string | 有効なメールアドレス形式 | 検索するメールアドレス（大文字小文字は区別しない） |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<User \| null> | User \| null | 見つかったユーザー、または存在しない場合はnull |

**使用例**:
```typescript
const user = await userRepository.findByEmail("teacher@example.com");
if (user) {
  // 認証成功
}
```

#### findById(id: number): Promise<User | null>
| パラメータ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | number | 正の整数 | ユーザーの一意識別子 |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<User \| null> | User \| null | 見つかったユーザー、または存在しない場合はnull |

#### findAll(): Promise<User[]>
| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<User[]> | User[] | すべてのユーザーの配列（空の場合あり） |

#### findByRole(role: "TEACHER" | "ADMIN"): Promise<User[]>
| パラメータ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| role | "TEACHER" \| "ADMIN" | 有効なロール値のみ | フィルタするユーザーロール |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<User[]> | User[] | 指定されたロールを持つすべてのユーザー |

#### save(user: User): Promise<User>
| パラメータ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| user | User | バリデーション済み | 保存するユーザーオブジェクト |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<User> | User | 保存されたユーザー（IDとタイムスタンプが設定されている） |

**動作**:
- user.idが存在する場合: 既存ユーザーを更新
- user.idが存在しない場合: 新規ユーザーを作成し、IDを採番

#### delete(id: number): Promise<void>
| パラメータ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | number | 正の整数 | 削除するユーザーのID |

**動作**:
- 指定されたIDのユーザーを削除
- 存在しないIDの場合は何もしない（例外を投げない）

#### count(): Promise<number>
| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<number> | number | リポジトリ内のユーザー総数 |

#### emailExists(email: string): Promise<boolean>
| パラメータ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| email | string | 有効なメールアドレス形式 | 確認するメールアドレス |

| 戻り値 | 型 | 説明 |
|--------|-----|------|
| Promise<boolean> | boolean | メールアドレスが存在する場合はtrue |

**使用例**:
```typescript
const exists = await userRepository.emailExists("new@example.com");
if (exists) {
  // エラー: メールアドレスは既に登録されています
}
```

#### disconnect(): Promise<void>
**動作**:
- データベース接続を閉じる
- キャッシュをクリアする
- リソースを解放する

## エラー契約

| 条件 | 例外 | 説明 |
|------|------|------|
| データベース接続失敗 | Error | 実装依存のエラー |
| クエリタイムアウト | TimeoutError | クエリが時間内に完了しない |
| 制約違反（重複メール等） | Error | 実装依存のエラー |

## 不変条件

### INV-REP-001: Repository_Interface_Contract
- すべてのメソッドは非同期（Promiseを返す）
- すべてのメソッドは適切な型シグネチャを持つ

### INV-REP-003: Repository_Sequential_ID_Assignment
- 新規ユーザー作成時、IDは連続した正の整数で採番される
- save()で新規ユーザーを作成した場合、戻り値のuser.idは前回のID+1

### データ分離
- 各リポジトリ呼び出しは独立しており、状態が漏洩しない（INV-REP-002）

### メールアドレスの一意性
- 同じメールアドレスで複数のユーザーは作成できない
- findByEmailは大文字小文字を区別しない

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| findByEmail("") | null | 無効なメールアドレス |
| findByEmail("nonexistent@example.com") | null | 存在しないユーザー |
| findById(0) | null | 無効なID |
| findById(-1) | null | 無効なID |
| findById(999999) | null | 存在しないID |
| save(user) with id=1 | User with id=1 | 更既存ユーザー |
| save(user) without id | User with new id | 新規ユーザー作成 |
| delete(999999) | 何もしない | 存在しないIDでの削除 |
| count() on empty repo | 0 | 空のリポジトリ |
| emailExists("new@example.com") | false | 存在しないメール |

## 実装要件

### PrismaUserRepository（本番環境）
- PostgreSQLを使用した永続化
- トランザクション処理
- コネクションプール管理

### InMemoryUserRepository（テスト環境）
- インメモリストレージ
- テスト用のモック実装

## 使用例

### 典型的な認証フロー
```typescript
// 1. メールアドレスでユーザー検索
const user = await userRepository.findByEmail(email);
if (!user) {
  throw new Error("認証に失敗しました");
}

// 2. パスワード検証（アプリケーション層で実装）
const isValid = await bcrypt.compare(password, user.passwordHash);
if (!isValid) {
  throw new Error("認証に失敗しました");
}

// 3. 認証成功
return user;
```

### 新規ユーザー登録
```typescript
// 1. メールアドレスの重複チェック
const exists = await userRepository.emailExists(newUser.email);
if (exists) {
  throw new Error("このメールアドレスは既に登録されています");
}

// 2. パスワードハッシュ化
const passwordHash = await bcrypt.hash(password, 10);

// 3. ユーザー作成
const user: User = {
  email: newUser.email,
  passwordHash,
  name: newUser.name,
  role: "TEACHER"
};

// 4. 保存
const savedUser = await userRepository.save(user);
```

### ロールベースのユーザー検索
```typescript
// すべての教員を取得
const teachers = await userRepository.findByRole("TEACHER");

// すべての管理者を取得
const admins = await userRepository.findByRole("ADMIN");
```

## 関連インターフェース

- **IRecordRepository**: 生徒記録のリポジトリ（Userとの将来の関連）
- **StatsRepository**: 統計データのリポジトリ
- **BackupRepository**: バックアップ機能との連携
