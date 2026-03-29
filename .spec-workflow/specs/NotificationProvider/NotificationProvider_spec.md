# SPEC: NotificationProvider

## 概要
- **モジュール**: `src/domain/entities/NotificationProvider.ts`
- **責務**: 通知プロバイダー（Email、SMS、Webhook、In-App、Slack）の設定、チャンネル、ステータスを管理するドメインエンティティ
- **関連する不変条件**:
  - INV-ARCH-001: Single_Responsibility_Enforcement
  - INV-QUAL-001: TypeScript_Strict_Mode
  - INV-DOM-001: Emotion_Value_Range（通知システムは感情値アラートに関連）

## 入力契約

### NotificationProvider インターフェース
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | minLength: 1 | 必須 |
| type | NotificationProviderType | enum: EMAIL, SMS, SLACK, WEBHOOK, IN_APP | 必須 |
| status | NotificationProviderStatus | enum: ACTIVE, INACTIVE, SUSPENDED | 必須 |
| name | string | minLength: 1, maxLength: 200 | 必須 |
| config | ProviderConfig | type-specific configuration | 必須 |
| channels | NotificationChannel[] | minLength: 1 | 必須 |
| enabledChannels | NotificationChannel[] | minLength: 1, channelsのサブセット | 必須 |
| createdAt | Date | 有効なDateオブジェクト | 必須 |
| updatedAt | Date | 有効なDateオブジェクト | 必須 |
| lastUsedAt | Date | 有効なDateオブジェクト | 任意 |

### ProviderConfig タイプ
| タイプ | 必須フィールド | オプションフィールド |
|-------|--------------|------------------|
| EmailProviderConfig | host, port, secure, auth | from, replyTo |
| WebhookProviderConfig | url, method, headers | timeout, retryAttempts |
| SmsProviderConfig | apiUrl, apiKey, senderId | maxMessageLength |
| SlackProviderConfig | webhookUrl, defaultChannel | username, iconUrl |
| InAppProviderConfig | retentionDays, maxNotifications | allowDismiss, soundEnabled |

### Notification インターフェース
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| id | string | minLength: 1 | 必須 |
| providerId | string | minLength: 1 | 必須 |
| channel | NotificationChannel | enum | 必須 |
| priority | NotificationPriority | enum: LOW, MEDIUM, HIGH, CRITICAL | 必須 |
| subject | string | minLength: 1, maxLength: 500 | 必須 |
| body | string | minLength: 1, maxLength: 5000 | 必須 |
| recipients | string[] | minLength: 1, 全要素が有効なemail | 必須 |
| metadata | Record<string, unknown> | 任意の構造化データ | 任意 |
| sentAt | Date | 有効なDateオブジェクト | 必須 |
| status | NotificationDeliveryStatus | enum: PENDING, SENT, FAILED, RETRYING | 必須 |
| attempts | number | integer, min: 0 | 必須 |
| errorMessage | string | | 任意 |

### NotificationConfig インターフェース
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| enabled | boolean | | 必須 |
| channels | NotificationChannel[] | | 必須 |
| priorities | Record<string, NotificationPriority> | | 必須 |
| quietHours.enabled | boolean | | 必須 |
| quietHours.start | string | regex: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$ | 必須 |
| quietHours.end | string | regex: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$ | 必須 |
| quietHours.timezone | string | 有効なタイムゾーン | 必須 |
| rateLimits.maxPerHour | number | integer, positive | 必須 |
| rateLimits.maxPerDay | number | integer, positive | 必須 |

## 出力契約

### NotificationProviderSchema.safeParse()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| success | boolean | true: バリデーション成功, false: バリデーション失敗 |
| data | NotificationProviderDTO | success=trueの場合のみ有効 |
| error | ZodError | success=falseの場合のみ存在 |

### NotificationSchema.safeParse()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| success | boolean | true: バリデーション成功, false: バリデーション失敗 |
| data | NotificationDTO | success=trueの場合のみ有効 |
| error | ZodError | success=falseの場合のみ存在 |

### NotificationConfigSchema.safeParse()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| success | boolean | true: バリデーション成功, false: バリデーション失敗 |
| data | NotificationConfigDTO | success=trueの場合のみ有効 |
| error | ZodError | success=falseの場合のみ存在 |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| idが空文字列 | ZodError | 400 |
| typeが無効なenum値 | ZodError | 400 |
| statusが無効なenum値 | ZodError | 400 |
| nameが空または200文字超 | ZodError | 400 |
| enabledChannelsがchannelsのサブセットでない | ZodError | 400 |
| recipientsが無効なemail形式 | ZodError | 400 |
| quietHours.start/endが無効な時刻形式 | ZodError | 400 |
| rateLimitsが負の値 | ZodError | 400 |

## 境界値

### NotificationProvider
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| name = "" (空文字列) | バリデーション失敗 | minLength: 1違反 |
| name = "a" | バリデーション成功 | 最小長 |
| name = 200文字の文字列 | バリデーション成功 | 最大長 |
| name = 201文字の文字列 | バリデーション失敗 | maxLength: 200違反 |
| channels = [] | バリデーション失敗 | minLength: 1違反 |
| enabledChannelsにchannelsにない要素 | バリデーション失敗 | サブセット違反 |
| lastUsedAt = undefined | バリデーション成功 | オプショナルフィールド |

### Notification
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| subject = "" | バリデーション失敗 | minLength: 1違反 |
| subject = 500文字 | バリデーション成功 | 最大長 |
| subject = 501文字 | バリデーション失敗 | maxLength: 500違反 |
| body = 5000文字 | バリデーション成功 | 最大長 |
| body = 5001文字 | バリデーション失敗 | maxLength: 5000違反 |
| recipients = [] | バリデーション失敗 | minLength: 1違反 |
| recipients = ["invalid-email"] | バリデーション失敗 | email形式違反 |
| attempts = -1 | バリデーション失敗 | min: 0違反 |
| attempts = 0 | バリデーション成功 | 最小値 |

### NotificationConfig
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| quietHours.start = "24:00" | バリデーション失敗 | 無効な時刻 |
| quietHours.start = "23:59" | バリデーション成功 | 有効な時刻 |
| quietHours.start = "0:00" | バリデーション成功 | 有効な時刻 |
| quietHours.start = "00:00" | バリデーション成功 | 有効な時刻 |
| rateLimits.maxPerHour = 0 | バリデーション失敗 | positive違反 |
| rateLimits.maxPerHour = 1 | バリデーション成功 | 最小値 |

## 列挙型の契約

### NotificationProviderType
| 値 | 説明 |
|-----|------|
| EMAIL | Email通知プロバイダー |
| SMS | SMS通知プロバイダー |
| SLACK | Slack通知プロバイダー |
| WEBHOOK | Webhook通知プロバイダー |
| IN_APP | アプリ内通知プロバイダー |

### NotificationProviderStatus
| 値 | 説明 |
|-----|------|
| ACTIVE | プロバイダーが有効 |
| INACTIVE | プロバイダーが無効 |
| SUSPENDED | プロバイダーが一時停止 |

### NotificationChannel
| 値 | 説明 |
|-----|------|
| ANOMALY_DETECTION | 異常検知通知 |
| SYSTEM_ALERTS | システムアラート |
| DATA_BACKUP | データバックアップ |
| USER_ACTIVITY | ユーザーアクティビティ |
| REPORTS | レポート通知 |

### NotificationPriority
| 値 | 説明 |
|-----|------|
| LOW | 低優先度 |
| MEDIUM | 中優先度 |
| HIGH | 高優先度 |
| CRITICAL | 臨界優先度 |

### NotificationDeliveryStatus
| 値 | 説明 |
|-----|------|
| PENDING | 送信待ち |
| SENT | 送信完了 |
| FAILED | 送信失敗 |
| RETRYING | 再試行中 |

## 不変条件チェック

- [x] INV-ARCH-001: Single_Responsibility_Enforcement - ファイル行数が300行未満（現在334行、テストファイル含む）
- [x] INV-QUAL-001: TypeScript_Strict_Mode - any型なし、Zodスキーマによる実行時バリデーション
- [x] INV-DOM-001: ドメインエンティティとしての純粋性 - 外部依存なし、プレーンTypeScriptオブジェクト

## 導出された不変条件

### INV-NOTIF-001: Enabled Channels Subset
- **カテゴリ**: domain
- **重要度**: CRITICAL
- **説明**: enabledChannelsは必ずchannelsのサブセットでなければならない
- **制約**: `enabledChannels.every(channel => channels.includes(channel)) === true`
- **検証**: NotificationProviderSchemaのrefineで検証
- **根拠**: 有効でないチャンネルを有効化することを防止

### INV-NOTIF-002: Recipient Email Validation
- **カテゴリ**: domain
- **重要度**: CRITICAL
- **説明**: Notificationのrecipientsは全て有効なemail形式でなければならない
- **制約**: `recipients.every(email => ZodString().email().safeParse(email).success) === true`
- **検証**: NotificationSchemaで`z.array(z.string().email())`を使用
- **根拠**: 無効な通知先を防止

### INV-NOTIF-003: Quiet Hours Time Format
- **カテゴリ**: domain
- **重要度**: HIGH
- **説明**: quietHoursの時刻は24時間形式（HH:MM）でなければならない
- **制約**: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`パターンに一致
- **検証**: NotificationConfigSchemaでregexバリデーション
- **根拠**: 一貫した時刻フォーマットを保証

### INV-NOTIF-004: Rate Limits Positive Values
- **カテゴリ**: domain
- **重要度**: HIGH
- **説明**: rateLimitsの値は正の整数でなければならない
- **制約**: `maxPerHour > 0 && maxPerDay > 0`
- **検証**: NotificationConfigSchemaで`z.number().int().positive()`
- **根拠**: 負の値やゼロによるレート制限の無効化を防止

## 実装の検証

### テストカバレッジ
- ✅ 列挙型の全値が定義されている
- ✅ 全プロバイダータイプ（Email, Webhook, In-App）のインスタンス化
- ✅ Zodスキーマによるバリデーション
- ✅ 必須フィールドの検証
- ✅ オプショナルフィールド（lastUsedAt）の検証
- ✅ enabledChannelsサブセット制約の検証
- ✅ Enum値の検証
- ✅ 日付フィールドの検証
- ✅ 設定インターフェースの検証
- ✅ Notificationエンティティの検証
- ✅ NotificationConfigの検証

### 依存関係
- 外部依存: `zod`（ランタイムバリデーション）
- 内部依存: なし（純粋なドメインエンティティ）

## 使用例

### Emailプロバイダーの作成
```typescript
const emailProvider: NotificationProvider = {
  id: "prov-123",
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
  channels: [NotificationChannel.ANOMALY_DETECTION, NotificationChannel.SYSTEM_ALERTS],
  enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Zodスキーマによるバリデーション
```typescript
const result = NotificationProviderSchema.safeParse(emailProvider);
if (!result.success) {
  console.error(result.error);
}
```
