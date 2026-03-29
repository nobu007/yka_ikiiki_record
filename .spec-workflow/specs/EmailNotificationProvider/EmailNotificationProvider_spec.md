# SPEC: EmailNotificationProvider

## 概要
- **モジュール**: `src/infrastructure/services/EmailNotificationProvider.ts`
- **責務**: SMTPプロトコルを使用してEmail通知を送信するインフラストラクチャ層の実装
- **関連する不変条件**:
  - INV-ARCH-002: Layer_Separation（Infrastructure層）
  - INV-QUAL-001: TypeScript_Strict_Mode
  - INV-NOTIF-002: Recipient Email Validation

## 入力契約

### コンストラクタ
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| provider | NotificationProvider | typeがEMAILである必須 | 必須 |

### send() メソッド
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| notification | Notification | providerIdがこのプロバイダーのID | 必須 |

### validateConfig() メソッド
入力パラメータなし（インスタンスのconfigを使用）

### isAvailable() メソッド
入力パラメータなし（インスタンスのstatusを使用）

### supportsChannel() メソッド
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| channel | NotificationChannel | | 必須 |

### isChannelEnabled() メソッド
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| channel | NotificationChannel | | 必須 |

### healthCheck() メソッド
入力パラメータなし

## 出力契約

### send() → SendResult
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true: 送信成功, false: 送信失敗 |
| notificationId | string | 通知ID |
| recipientsCount | number | success=trueの場合のみ有効、送信先の数 |
| attempts | number | 試行回数（元のattempts + 1） |
| error.code | string | success=falseの場合のみ存在 |
| error.message | string | エラーの詳細 |
| error.details | unknown | 追加のエラー情報 |

### validateConfig() → ValidationResult
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| valid | boolean | true: 設定有効, false: 設定無効 |
| errors | string[] | バリデーションエラーのリスト |
| warnings | string[] | バリデーション警告のリスト |

### isAvailable() → boolean
| 戻り値 | 条件 |
|--------|------|
| true | provider.status === ACTIVE |
| false | provider.status !== ACTIVE |

### supportsChannel() → boolean
| 戻り値 | 条件 |
|--------|------|
| true | channelがprovider.channelsに含まれる |
| false | channelがprovider.channelsに含まれない |

### isChannelEnabled() → boolean
| 戻り値 | 条件 |
|--------|------|
| true | channelがprovider.enabledChannelsに含まれる |
| false | channelがprovider.enabledChannelsに含まれない |

### getConfig() → EmailProviderConfig
プロバイダーの設定オブジェクト（不変）

### getMetadata() → ProviderMetadata
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| id | string | プロバイダーID |
| name | string | プロバイダー名 |
| type | NotificationProviderType | EMAIL |
| status | NotificationProviderStatus | プロバイダーステータス |
| channels | NotificationChannel[] | サポート済みチャンネル |
| enabledChannels | NotificationChannel[] | 有効なチャンネル |
| lastUsedAt | Date | 最終使用日時（オプション） |

### healthCheck() → HealthCheckResult
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| healthy | boolean | true: 正常, false: 異常 |
| latencyMs | number | チェックにかかった時間（ミリ秒） |
| error | string | unhealthyの場合のエラーメッセージ |
| details | Record<string, unknown> | 追加の詳細情報 |

## エラー契約

### コンストラクタ
| 条件 | 例外 | メッセージ |
|------|------|----------|
| provider.type !== EMAIL | Error | "Invalid provider type: expected EMAIL, got {type}" |

### send()
| 条件 | error.code | error.message | HTTPステータス |
|------|-----------|---------------|---------------|
| !isAvailable() | PROVIDER_UNAVAILABLE | "Provider is {status}" | 503 |
| !isChannelEnabled() | CHANNEL_DISABLED | "Channel {channel} is not enabled" | 400 |
| recipients.length === 0 | NO_RECIPIENTS | "At least one recipient is required" | 400 |
| 無効なemailアドレス | INVALID_EMAIL | "Invalid email address: {email}" | 400 |
| SMTP送信失敗 | SEND_FAILED | エラーメッセージ | 500 |

### validateConfig()
| 条件 | errors | warnings |
|------|--------|----------|
| !host || host.trim() === 0 | ["host is required"] | |
| port < 1 || port > 65535 | ["port must be between 1 and 65535"] | |
| !auth | ["auth is required"] | |
| !auth.user || auth.user.trim() === 0 | ["auth.user is required"] | |
| !auth.pass || auth.pass.trim() === 0 | ["auth.pass is required"] | |
| from && 無効なemail | ["from must be a valid email address"] | |
| replyTo && 無効なemail | ["replyTo must be a valid email address"] | |
| secure && port !== 465 | | ["secure=true typically uses port 465 (SMTPS)"] |
| !secure && port !== 587 && port !== 25 | | ["secure=false typically uses port 587 (STARTTLS) or 25 (SMTP)"] |

### healthCheck()
| 条件 | healthy | error |
|------|---------|-------|
| !validateConfig().valid | false | "Invalid configuration: {errors}" |
| testConnection()失敗 | false | エラーメッセージ |

## 境界値

### validateConfig() - portバリデーション
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| port = 0 | errors: ["port must be between 1 and 65535"] | 最小値未満 |
| port = 1 | 有効 | 最小値 |
| port = 587 | 有効 | STARTTLS標準ポート |
| port = 465 | 有効 | SMTPS標準ポート |
| port = 25 | 有効 | SMTP標準ポート |
| port = 65535 | 有効 | 最大値 |
| port = 65536 | errors: ["port must be between 1 and 65535"] | 最大値超過 |

### send() - recipientsバリデーション
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| recipients = [] | success: false, error.code: "NO_RECIPIENTS" | 空配列 |
| recipients = ["valid@example.com"] | success: true | 単一の有効なrecipient |
| recipients = ["a@b", "x@y.z"] * 100 | success: true | 大量のrecipients |
| recipients = ["invalid-email"] | success: false, error.code: "INVALID_EMAIL" | 無効なemail形式 |
| recipients = ["test@"] | success: false, error.code: "INVALID_EMAIL" | 不完全なemail |
| recipients = ["@example.com"] | success: false, error.code: "INVALID_EMAIL" | ユーザー名なし |
| recipients = ["test@example"] | success: false, error.code: "INVALID_EMAIL" | TLDなし |

### send() - provider status
| provider.status | isAvailable() | send() result |
|----------------|---------------|---------------|
| ACTIVE | true | 正常に送信試行 |
| INACTIVE | false | success: false, error.code: "PROVIDER_UNAVAILABLE" |
| SUSPENDED | false | success: false, error.code: "PROVIDER_UNAVAILABLE" |

### send() - channel check
| 条件 | 結果 |
|------|------|
| channel in channels && channel in enabledChannels | 送信試行 |
| channel in channels && channel not in enabledChannels | success: false, error.code: "CHANNEL_DISABLED" |
| channel not in channels | success: false, error.code: "CHANNEL_DISABLED" |

### healthCheck() - latency
| 条件 | latencyMs | 備考 |
|------|-----------|------|
| 設定有効、接続成功 | 10-50ms | 通常の範囲 |
| 設定無効 | <5ms | バリデーションのみ |
| 接続失敗 | <20ms | エラー検出 |

## 不変条件チェック

- [x] INV-ARCH-002: Layer_Separation - Infrastructure層に配置、Domain/Entityをimport可
- [x] INV-QUAL-001: TypeScript_Strict_Mode - any型なし
- [x] INV-NOTIF-002: Recipient Email Validation - regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`でバリデーション

## 導出された不変条件

### INV-EMAIL-001: Provider Type Validation
- **カテゴリ**: infrastructure
- **重要度**: CRITICAL
- **説明**: EmailNotificationProviderはEMAILタイプのプロバイダーのみ受け入れる
- **制約**: `provider.type === NotificationProviderType.EMAIL`
- **検証**: コンストラクタでTypeErrorをスロー
- **根拠**: タイプミスによる実行時エラーを防止

### INV-EMAIL-002: SMTP Port Range
- **カテゴリ**: infrastructure
- **重要度**: HIGH
- **説明**: SMTPポートは1-65535の範囲内である必要がある
- **制約**: `port >= 1 && port <= 65535`
- **検証**: validateConfig()でチェック
- **根拠**: 有効なTCPポート範囲を保証

### INV-EMAIL-003: Email Format Validation
- **カテゴリ**: infrastructure
- **重要度**: CRITICAL
- **説明**: Emailアドレスは基本的な形式検証に合格する必要がある
- **制約**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`パターンに一致
- **検証**: send()とvalidateConfig()でチェック
- **根拠**: 無効なemailアドレスによる送信失敗を防止

### INV-EMAIL-004: Auth Credentials Required
- **カテゴリ**: infrastructure
- **重要度**: CRITICAL
- **説明**: SMTP認証情報は必須
- **制約**: `auth.user && auth.pass` が存在し、空文字列でない
- **検証**: validateConfig()でチェック
- **根拠**: 認証なしのSMTP接続を防止

### INV-EMAIL-005: Provider Availability Check
- **カテゴリ**: infrastructure
- **重要度**: HIGH
- **説明**: 送信前にプロバイダーの可用性を確認
- **制約**: `provider.status === NotificationProviderStatus.ACTIVE`
- **検証**: send()の最初のチェック
- **根拠**: 利用不可のプロバイダーへの送信試行を防止

## 実装の検証

### テストカバレッジ
- ✅ コンストラクタ：インスタンス作成、設定の保存
- ✅ send()：正常送信、複数recipients、HTML本文、メタデータ
- ✅ send()エラーハンドリング：空recipients、無効なemail、無効なプロバイダーステータス、無効なチャンネル
- ✅ send()再試行：retry attemptsの尊重
- ✅ validateConfig()：有効な設定、欠落したhost、無効なport、欠落したauth、無効なfrom
- ✅ isAvailable()：ACTIVE、INACTIVE、SUSPENDEDステータス
- ✅ supportsChannel()：サポート済み/未サポートチャンネル
- ✅ isChannelEnabled()：有効/無効チャンネル
- ✅ getConfig()：設定の返却
- ✅ getMetadata()：メタデータの返却
- ✅ healthCheck()：正常、異常

### 依存関係
- **内部依存**: `@/domain/entities/NotificationProvider`（Domain層）
- **外部依存**: なし（純粋なTypeScript実装）

### 特殊な実装詳細
- `simulateSmtpSend()`: 本番環境ではnodemailer等に置き換え
- `testConnection()`: 本番環境では実際のSMTP接続テスト
- 50msの遅延でSMTP操作をシミュレート
- `console.log`によるデバッグ出力（本番では削除予定）

## 使用例

### 基本的な使用方法
```typescript
const provider: NotificationProvider = {
  id: "email-prov-123",
  type: NotificationProviderType.EMAIL,
  status: NotificationProviderStatus.ACTIVE,
  name: "Primary Email Provider",
  config: {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: {
      user: "notifications@example.com",
      pass: "password",
    },
  },
  channels: [NotificationChannel.ANOMALY_DETECTION],
  enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const emailProvider = new EmailNotificationProvider(provider);

const notification: Notification = {
  id: "notif-123",
  providerId: "email-prov-123",
  channel: NotificationChannel.ANOMALY_DETECTION,
  priority: NotificationPriority.HIGH,
  subject: "Anomaly Detected",
  body: "Unusual pattern detected",
  recipients: ["admin@example.com"],
  sentAt: new Date(),
  status: NotificationDeliveryStatus.PENDING,
  attempts: 0,
};

const result = await emailProvider.send(notification);
if (result.success) {
  console.log(`Sent to ${result.recipientsCount} recipients`);
}
```

### 設定バリデーション
```typescript
const validation = emailProvider.validateConfig();
if (!validation.valid) {
  console.error("Configuration errors:", validation.errors);
  console.warn("Configuration warnings:", validation.warnings);
}
```

### ヘルスチェック
```typescript
const health = await emailProvider.healthCheck();
if (!health.healthy) {
  console.error(`Provider unhealthy: ${health.error}`);
} else {
  console.log(`Provider healthy, latency: ${health.latencyMs}ms`);
}
```

## リファクタリングの考慮事項

### 本番環境での実装
1. **SMTPライブラリの統合**: `nodemailer`または同等のライブラリを使用
2. **ロギングの改善**: `console.log`をStructuredLoggerに置き換え
3. **タイムアウトの追加**: SMTP操作に適切なタイムアウトを設定
4. **再試行ロジック**: 指数バックオフ付きの再試行を実装
5. **テンプレートエンジン**: Email本文のフォーマットにテンプレートを使用

### セキュリティの考慮事項
1. **認証情報の保護**: 環境変数またはシークレット管理サービスを使用
2. **TLS/SSLの強制**: 本番ではsecure=trueを推奨
3. **レート制限**: SMTPサーバーの制限を尊重
4. **送信者検証**: fromアドレスの検証を実施

### パフォーマンスの最適化
1. **接続プーリング**: SMTP接続の再利用
2. **バッチ送信**: 複数の通知を一括送信
3. **非同期キュー**: 送信操作をバックグラウンドで実行
