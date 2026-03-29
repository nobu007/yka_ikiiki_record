# SPEC: Notifications History API

## 概要
- **モジュール**: `src/app/api/notifications/history/route.ts`
- **責務**: 通知履歴の取得 APIエンドポイント（フィルタリング・ページネーション対応）
- **関連する不変条件**:
  - INV-API-001: API Response Structure (success/data pattern)
  - INV-ERR-001: AppError Type Guard Contract
  - INV-TIME-001: Timeout Wrapper Standard Durations (API=10s)

## 入力契約

### GET /api/notifications/history

#### クエリパラメータ
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| channel | string | 有効なNotificationChannel列挙値 | undefined（全チャネル） |
| status | string | 有効なNotificationDeliveryStatus列挙値 | undefined（全ステータス） |
| priority | string | 有効なNotificationPriority列挙値 | undefined（全優先度） |
| limit | number | 正の整数 | undefined（全件） |
| offset | number | 非負整数 | 0 |
| startDate | string | ISO 8601日時文字列 | undefined |
| endDate | string | ISO 8601日時文字列 | undefined |

#### クエリパラメータ詳細
```typescript
interface NotificationHistoryQuery {
  channel?: "ANOMALY_DETECTION" | "SYSTEM_ALERTS" | "DATA_BACKUP" | "USER_ACTIVITY" | "REPORTS";
  status?: "PENDING" | "SENT" | "FAILED" | "DELIVERED";
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  limit?: number;
  offset?: number;
  startDate?: string;  // ISO 8601 format
  endDate?: string;    // ISO 8601 format
}
```

#### 有効な列挙値
**NotificationChannel**:
- `ANOMALY_DETECTION`
- `SYSTEM_ALERTS`
- `DATA_BACKUP`
- `USER_ACTIVITY`
- `REPORTS`

**NotificationDeliveryStatus**:
- `PENDING`
- `SENT`
- `FAILED`
- `DELIVERED`

**NotificationPriority**:
- `CRITICAL`
- `HIGH`
- `MEDIUM`
- `LOW`

## 出力契約

### Response (200 OK)
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| data | Notification[] | 通知オブジェクトの配列 |
| | | sentAtの降順でソート済み |
| | | offset/limitでページネーション適用 |
| | | フィルタ条件に一致する項目のみ |

#### Notification オブジェクト構造
| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意識別子 |
| providerId | string | 送信プロバイダID |
| channel | NotificationChannel | 通知チャネル |
| priority | NotificationPriority | 優先度 |
| subject | string | 通知件名 |
| body | string | 通知本文 |
| recipients | string[] | 受信者Email配列 |
| metadata | Record<string, unknown> \| undefined | 追加メタデータ |
| sentAt | Date | 送信日時 |
| status | NotificationDeliveryStatus | 配信ステータス |
| attempts | number | 送信試行回数 |

## エラー契約

### エラーレスポンス
| 条件 | HTTPステータス | error.code | error.message |
|------|---------------|------------|---------------|
| 無効なchannel値 | 400 | BAD_REQUEST | "Invalid channel: {value}" |
| 無効なstatus値 | 400 | BAD_REQUEST | "Invalid status: {value}" |
| 無効なpriority値 | 400 | BAD_REQUEST | "Invalid priority: {value}" |
| limitが負の値 | 400 | BAD_REQUEST | "Invalid limit value" |
| limitがNaN | 400 | BAD_REQUEST | "Invalid limit value" |
| offsetが負の値 | 400 | BAD_REQUEST | "Invalid offset value" |
| offsetがNaN | 400 | BAD_REQUEST | "Invalid offset value" |
| 無効なstartDate | 400 | BAD_REQUEST | "Invalid startDate value" |
| 無効なendDate | 400 | BAD_REQUEST | "Invalid endDate value" |
| サービスエラー | 500 | INTERNAL_ERROR | エラー詳細 |
| タイムアウト | 408 | TIMEOUT | "Operation timeout" (10s) |

## 境界値

### channel フィルタリング
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 指定なし | 全チャネルの通知 | フィルタなし |
| "ANOMALY_DETECTION" | 該当チャネルのみ | 大文字・小文字区別あり |
| "INVALID_CHANNEL" | 400エラー | 無効なチャネル値 |

### status フィルタリング
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 指定なし | 全ステータスの通知 | フィルタなし |
| "SENT" | 配信成功のみ | ステータス完全一致 |
| "INVALID_STATUS" | 400エラー | 無効なステータス値 |

### priority フィルタリング
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 指定なし | 全優先度の通知 | フィルタなし |
| "CRITICAL" | 重要度HIGHのみ | 優先度完全一致 |
| "INVALID_PRIORITY" | 400エラー | 無効な優先度値 |

### limit ページネーション
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 指定なし | 全件返却 | ページネーションなし |
| 0 | 空配列 | 0件返却 |
| 10 | 最大10件 | 最初の10件 |
| 100 | 最大100件 | 大量データ取得可能 |
| -1 | 400エラー | 負の値禁止 |
| "abc" | 400エラー | NaN検出 |

### offset ページネーション
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 指定なし (0) | 先頭から | offset=0と同等 |
| 0 | 先頭から | 最初のページ |
| 10 | 11件目から | 2ページ目（limit=10の場合） |
| -1 | 400エラー | 負の値禁止 |
| "abc" | 400エラー | NaN検出 |

### startDate/endDate 日付フィルタ
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 両方指定なし | 全期間 | 日付フィルタなし |
| startDateのみ | 指定日以降 | 開始日以降の通知 |
| endDateのみ | 指定日以前 | 終了日以前の通知 |
| 両方指定 | 範囲内 | 開始日〜終了日の通知 |
| "invalid-date" | 400エラー | 無効な日付形式 |
| "2026-03-30T00:00:00Z" | 有効な日付 | ISO 8601形式 |

### 複合フィルタ
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| channel + status | 両条件満たす項目のみ | AND条件 |
| channel + limit | 該当チャネルの最初のN件 | フィルタ後ページネーション |
| 全フィルタ指定 | 全条件満たす項目 | 複合AND条件 |

### ソート順序
| 条件 | 期待出力 | 備考 |
|------|---------|------|
| デフォルト | sentAtの降順 | 新しい通知が先頭 |
| 日付が同じ | 不定 | 同一日時内の順序は保証外 |

### 空結果セット
| 条件 | 期待出力 | 備考 |
|------|---------|------|
| フィルタに一致なし | 空配列 [] | 400エラーではなく正常レスポンス |
| offsetが範囲外 | 空配列 [] | ページオーバーはエラーではない |

## 不変条件チェック

### INV-API-001: API Response Structure
- [ ] 200 OK: `{success: true, data: Notification[]}` 構造
- [ ] データ配列: ソート済み（sentAt降順）
- [ ] エラー時: AppError 構造 (code, message, statusCode)

### INV-TIME-001: Timeout Wrapper
- [ ] GET: 10秒タイムアウト適用 (DEFAULT_TIMEOUTS.api)
- [ ] タイムアウト時: TimeoutError 適切な処理

### INV-ERR-001: AppError Type Guard
- [ ] createError.badRequest() 使用時: ValidationErrorインスタンス
- [ ] エラーオブジェクト: isAppError() === true

### Clean Architecture (INV-ARCH-002)
- [ ] APIルート (Presentation) → NotificationService (Application) のみ呼び出し
- [ ] Domain/Infrastructure層を直接呼び出さない

### 入力検証
- [ ] クエリパラメータ: 厳密な型検証（列挙値、数値、日付）
- [ ] NaN検出: `parseInt()` 結果の `isNaN()` チェック
- [ ] 日付検証: `new Date().getTime()` の `isNaN()` チェック

## 実装上の注意点

### リクエスト処理フロー
1. `withResilientHandler` でラップ（タイムアウト、エラーハンドリング）
2. `request.nextUrl.searchParams` でクエリパラメータ取得
3. 各パラメータの型検証とエラー生成
4. `createNotificationService()` でサービス初期化
5. `notificationService.getNotificationHistory(query)` で履歴取得
6. `createSuccessResponse()` で成功レスポンス構築

### パラメータ検証ロジック
```typescript
// channel検証
if (searchParams.get("channel")) {
  const channel = searchParams.get("channel")!;
  if (!Object.values(NotificationChannel).includes(channel as NotificationChannel)) {
    throw createError.badRequest(`Invalid channel: ${channel}`);
  }
  query.channel = channel;
}

// limit検証
if (searchParams.get("limit")) {
  const limitStr = searchParams.get("limit")!;
  const limit = parseInt(limitStr, 10);
  if (isNaN(limit) || limit < 0) {
    throw createError.badRequest("Invalid limit value");
  }
  query.limit = limit;
}

// startDate検証
if (searchParams.get("startDate")) {
  const startDateStr = searchParams.get("startDate")!;
  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) {
    throw createError.badRequest("Invalid startDate value");
  }
  query.startDate = startDate;
}
```

### ページネーション実装
- サービス層で実装（NotificationService.getNotificationHistory）
- offset/limit はメモリ内フィルタリング後に適用
- 大量データ時のパフォーマンス考慮必要（将来: DBクエリレベルで実装）

### ソート順序
- サービス層で実装（`sentAt` 降順）
- API層はソート順を制御しない

### エラーメッセージの一貫性
```typescript
// ✓ 一貫性のあるエラーメッセージ
"Invalid channel: {value}"
"Invalid status: {value}"
"Invalid priority: {value}"
"Invalid limit value"
"Invalid offset value"
"Invalid startDate value"
"Invalid endDate value"
```

### レート制限
- 現在: レート制限なし
- 将来: 認証実装後、ユーザー単位のアクセス頻度制限考慮

### セキュリティ
- 現在: 認証なし（誰でも履歴閲覧可能）
- 将来: 認証ミドルウェア追加、ユーザー権限チェック
- 注意: メタデータに機密情報が含まれる可能性あり

### パフォーマンス
- インメモリストレージ使用（現在の実装）
- 将来: 永続化DBでのページネーション最適化（OFFSET/LIMITまたはカーソルベース）
- 大量履歴時: メモリ消費に注意

## テスト要件

### 正常系テスト
- [ ] 200 OK: フィルタなしで全履歴取得
- [ ] 200 OK: channelフィルタのみ
- [ ] 200 OK: statusフィルタのみ
- [ ] 200 OK: priorityフィルタのみ
- [ ] 200 OK: 複合フィルタ（channel + status）
- [ ] 200 OK: limitページネーション
- [ ] 200 OK: offsetページネーション
- [ ] 200 OK: 日付範囲フィルタ（startDateのみ）
- [ ] 200 OK: 日付範囲フィルタ（endDateのみ）
- [ ] 200 OK: 日付範囲フィルタ（両方指定）
- [ ] 200 OK: 全パラメータ指定
- [ ] 200 OK: 空結果セット（フィルタに一致なし）
- [ ] 200 OK: offsetが範囲外

### 異常系テスト
- [ ] 400: 無効なchannel値
- [ ] 400: 無効なstatus値
- [ ] 400: 無効なpriority値
- [ ] 400: limitが負の値
- [ ] 400: limitがNaN
- [ ] 400: offsetが負の値
- [ ] 400: offsetがNaN
- [ ] 400: 無効なstartDate
- [ ] 400: 無効なendDate
- [ ] 408: タイムアウトシナリオ

### ソート順テスト
- [ ] sentAt降順でソートされている
- [ ] 新しい通知が配列の先頭

### 統合テスト
- [ ] ページネーション一貫性（limit=10で2ページ目取得）
- [ ] フィルタ + ページネーション組み合わせ
- [ ] レスポンス時間 < 200ms（SLA）

## 参考ファイル
- 実装: `src/app/api/notifications/history/route.ts`
- テスト: `src/app/api/notifications/history/route.test.ts`
- 依存サービス: `src/application/services/NotificationService.ts`
- エンティティ: `src/domain/entities/NotificationProvider.ts`
- エラーハンドリング: `src/lib/api/error-handler.ts`
- レスポンス構築: `src/lib/api/response.ts`
