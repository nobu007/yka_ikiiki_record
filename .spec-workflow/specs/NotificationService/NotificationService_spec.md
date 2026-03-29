# SPEC: NotificationService

## 概要
- **モジュール**: `src/application/services/NotificationService.ts`
- **責務**: ユーザー通知の送信、履歴管理、プロバイダ設定のアプリケーションロジックを調整する
- **関連する不変条件**:
  - INV-ARCH-001: Single Responsibility Enforcement (1責務)
  - INV-ARCH-002: Layer Separation (Application層 → Domain層のみ依存)
  - INV-QUAL-001: TypeScript Strict Mode (any型禁止)

## 入力契約

### コンストラクタ
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| providerRepository | NotificationProviderRepository | 必須、非null | なし |
| anomalyDetectionService | AnomalyDetectionService | 必須、非null | なし |

### sendNotification()
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| channel | NotificationChannel | 有効なチャネル値 | なし |
| priority | NotificationPriority | CRITICAL/HIGH/MEDIUM/LOW | なし |
| subject | string | 非空文字列 | なし |
| body | string | 非空文字列 | なし |
| recipients | string[] | 1件以上、有効なEmail形式 | なし |
| metadata | Record<string, unknown> | オプション | undefined |

### updateConfig()
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| newConfig | NotificationConfig | Zodスキーマ検証通過 | なし |

### sendAnomalyAlert()
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| anomaly | Anomaly | 必須、有効なAnomalyエンティティ | なし |
| recipients | string[] | 1件以上、有効なEmail形式 | なし |

### getNotificationHistory()
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| channel | NotificationChannel | オプション | undefined |
| status | NotificationDeliveryStatus | オプション | undefined |
| priority | NotificationPriority | オプション | undefined |
| limit | number | 正の整数 | 全件 |
| offset | number | 非負整数 | 0 |
| startDate | Date | オプション | undefined |
| endDate | Date | オプション | undefined |

### validateProviderConfiguration()
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| config | Partial<NotificationProvider> | type, name, config, channels必須 | なし |

### enableChannel() / disableChannel()
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| providerId | string | 有効なプロバイダID | なし |
| channel | NotificationChannel | プロバイダがサポートするチャネル | なし |

## 出力契約

### sendNotification() → SendNotificationResult
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| success | boolean | trueの場合、通知は正常に送信された |
| notificationId | string \| undefined | success=trueの場合のみ存在 |
| recipientsCount | number \| undefined | 送信された受信者数 |
| attempts | number | 送信試行回数 (1-3) |
| error.code | string \| undefined | 失敗理由のエラーコード |
| error.message | string \| undefined | 人間可読なエラーメッセージ |
| error.details | unknown \| undefined | 追加エラー詳細 |

### getNotificationHistory() → Notification[]
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| Notification[] | 配列 | sentAtの降順でソート済み |
| | | offset/limitでページネーション適用 |
| | | フィルタ条件に一致する項目のみ |

### getProviderStatus() → ProviderStatusInfo[]
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| id | string | プロバイダの一意識別子 |
| name | string | プロバイダ名 |
| type | NotificationProviderType | EMAIL/WEBHOOK/SMS/SLACK/IN_APP |
| status | NotificationProviderStatus | ACTIVE/INACTIVE/ERROR |
| channels | NotificationChannel[] | サポートする全チャネル |
| enabledChannels | NotificationChannel[] | 有効なチャネルのサブセット |
| lastUsedAt | Date \| undefined | 最終使用日時 |
| healthy | boolean | status===ACTIVEの場合true |

### validateProviderConfiguration() → ValidationResult
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| valid | boolean | errors.length===0の場合true |
| errors | string[] | 致命的なエラーメッセージの配列 |
| warnings | string[] | 警告メッセージの配列 |

## エラー契約

### sendNotification() エラーコード
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| 通知が無効化されている | error.code: "NOTIFICATIONS_DISABLED" | N/A (アプリケーション層) |
| 受信者Emailが無効 | error.code: "VALIDATION_ERROR" | N/A |
| チャネルが有効でない | error.code: "CHANNEL_DISABLED" | N/A |
| 静止時間内 | error.code: "QUIET_HOURS" | N/A |
| レート制限超過 | error.code: "RATE_LIMIT_EXCEEDED" | N/A |
| 利用可能なプロバイダなし | error.code: "NO_PROVIDER_AVAILABLE" | N/A |
| 送信失敗（リトライ後） | error.code: "SEND_FAILED" | N/A |

### enableChannel() / disableChannel() エラー
| 条件 | 例外 | HTTPステータス |
|------|----------------|---------------|
| プロバイダが存在しない | Error("Provider not found") | N/A |
| チャネルがサポート外 | Error("Channel not supported by provider") | N/A |

## 境界値

### Email検証 (validateRecipients)
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 空配列 | valid: false | "At least one recipient is required" |
| ["invalid-email"] | valid: false | "Invalid email address: invalid-email" |
| ["test@example.com"] | valid: true | 正常なEmail |
| ["test@example.com", "user@test.co.jp"] | valid: true | 複数の有効Email |

### 静止時間判定 (isWithinQuietHours)
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| quietHours.enabled=false | false | 常に送信許可 |
| 22:00-08:00 範囲内の時刻 | true | 静止時間内 |
| 08:00-22:00 範囲外の時刻 | false | 通常時間 |
| タイムゾーン考慮 | boolean | config.quietHours.timezone使用 |

### レート制限 (checkRateLimit)
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| maxPerHour未到達 | true | 送信許可 |
| maxPerHour到達 | false | "RATE_LIMIT_EXCEEDED" |
| maxPerDay未到達 | true | 送信許可 |
| maxPerDay到達 | false | "RATE_LIMIT_EXCEEDED" |
| 期限切れトラッカー | クリア | 古いエントリ削除 |

### 通知履歴フィルタリング (getNotificationHistory)
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| limit=10, offset=0 | 最初の10件 | ページネーション |
| limit=5, offset=10 | 11-15件目 | ページネーション |
| startDate/endDate指定 | 範囲内の通知 | 日付フィルタ |
| 複数フィルタ指定 | AND条件適用 | 全フィルタ満たす項目のみ |

### プロバイダ設定検証 (validateProviderConfiguration)
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| name="" | valid: false | "Provider name is required" |
| channels=[] | valid: false | "At least one channel must be specified" |
| enabledChannels∉channels | valid: false | "Enabled channels must be a subset" |
| EMAIL: host="" | valid: false | "requires a valid SMTP host" |
| EMAIL: port=0 | valid: false | "requires a valid SMTP port (1-65535)" |
| WEBHOOK: url="invalid" | valid: false | "requires a valid URL" |
| IN_APP: retentionDays<=0 | valid: false | "requires positive retention days" |

### リトライロジック (sendNotification)
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 1回目失敗 | 1000ms待機→リトライ | 指数バックオフ |
| 2回目失敗 | 2000ms待機→リトライ | 指数バックオフ |
| 3回目失敗 | error返却 | 最大3回リトライ |

## 不変条件チェック

### INV-ARCH-001: Single Responsibility Enforcement
- [ ] NotificationServiceは通知調-coordinationのみ担当（送信、履歴、設定）
- [ ] ファイル行数が300行未満であること（現在: 655行 → 違反）
  - **注**: このファイルはINV-ARCH-001違反状態。リファクタリングが必要。

### INV-ARCH-002: Layer Separation
- [ ] NotificationService (Application) は Domain層のみimport
  - ✓ NotificationProviderRepository (Domain)
  - ✓ AnomalyDetectionService (Domain)
  - ✓ NotificationProvider, Notification (Domain entities)
- [ ] Infrastructure/Presentation層を直接importしない

### INV-QUAL-001: TypeScript Strict Mode
- [ ] `any` 型を使用しない（現在: 3箇所で `as any` 使用 → 違反）
  - Line 358, 371, 383, 393, 402: `const xxxConfig = config.config as any`
  - **修正案**: Type guards または discriminated unions 使用

### 関連ドメイン不変条件
- [ ] INV-DOM-001: Emotion values (このサービスには非適用)
- [ ] Email検証: EMAIL_REGEX /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- [ ] レート制限: maxPerHour (デフォルト: 100), maxPerDay (デフォルト: 1000)
- [ ] リトライ: MAX_RETRY_ATTEMPTS=3, RETRY_DELAY_MS=1000

## 実装上の注意点

### メモリ管理
- `notificationStorage: Map<string, Notification>` はインメモリストレージ
- 本番環境ではRepositoryパターンにより永続化ストレージに置換
- `rateLimitTracker: Map<string, {...}>` は自動期限切れクリア実装済み

### 並行性制御
- 通知送信は非同期だが、プロバイダ選択は競合しない
- レート制限トラッカーはMapベースで簡易実装（本番ではRedis推奨）

### タイムアウト
- 現在、タイムアウト設定なし
- 将来: `withApiTimeout` ラッパーでプロバイダ呼び出しを保護

### テスト要件
- Email検証の境界値テスト
- 静止時間のタイムゾーン考慮テスト
- レート制限の期限切れクリアテスト
- リトライの指数バックオフ検証
- プロバイダ設定の全タイプ検証
- 通知履歴のフィルタリング・ページネーションテスト

## 参考ファイル
- 実装: `src/application/services/NotificationService.ts`
- テスト: `src/application/services/NotificationService.test.ts`
- 依存:
  - `src/domain/repositories/NotificationProviderRepository.ts`
  - `src/domain/services/AnomalyDetectionService.ts`
  - `src/domain/entities/NotificationProvider.ts`
