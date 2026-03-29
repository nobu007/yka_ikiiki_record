# SPEC: Notifications Settings API

## 概要
- **モジュール**: `src/app/api/notifications/settings/route.ts`
- **責務**: 通知設定の取得 (GET) および更新 (POST) APIエンドポイント
- **関連する不変条件**:
  - INV-API-001: API Response Structure (success/data pattern)
  - INV-ERR-001: AppError Type Guard Contract
  - INV-TIME-001: Timeout Wrapper Standard Durations (API=10s)

## 入力契約

### GET /api/notifications/settings
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| なし | - | - | - |

### POST /api/notifications/settings
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| enabled | boolean | オプション | 現在値 |
| channels | string[] | 有効なNotificationChannel値配列 | 現在値 |
| priorities | Record<string, string> | キーはチャネル名、値は優先度 | 現在値 |
| quietHours.enabled | boolean | 必須 | - |
| quietHours.start | string | HH:MM形式 | - |
| quietHours.end | string | HH:MM形式 | - |
| quietHours.timezone | string | 有効なタイムゾーン文字列 | - |
| rateLimits.maxPerHour | number | 正の整数 | - |
| rateLimits.maxPerDay | number | 正の整数 | - |

### Request Body (POST)
```typescript
interface UpdateSettingsRequest {
  enabled?: boolean;
  channels?: string[];
  priorities?: Record<string, string>;
  quietHours?: {
    enabled: boolean;
    start: string;  // "HH:MM"
    end: string;    // "HH:MM"
    timezone: string;
  };
  rateLimits?: {
    maxPerHour: number;
    maxPerDay: number;
  };
}
```

## 出力契約

### GET Response (200 OK)
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| data | NotificationConfig | 完全な通知設定オブジェクト |
| data.enabled | boolean | 通知が有効かどうか |
| data.channels | NotificationChannel[] | 有効なチャネル配列 |
| data.priorities | Record<string, NotificationPriority> | チャネル別優先度 |
| data.quietHours | object | 静止時間設定 |
| data.rateLimits | object | レート制限設定 |

### POST Response (200 OK)
| フィールド | 型 | 保証する条件 |
|-----------|-----|-------------|
| success | boolean | true |
| data | NotificationConfig | 更新後の完全な通知設定 |
| データ検証 | - | Zodスキーマ検証パス |

## エラー契約

### POST エラーレスポンス
| 条件 | HTTPステータス | error.code | error.message |
|------|---------------|------------|---------------|
| リクエストボディがJSONでない | 400 | BAD_REQUEST | "Invalid request body" |
| Zod検証失敗 | 400 | BAD_REQUEST | "Invalid settings: {詳細}" |
| quietHours.startが無効な時刻 | 400 | BAD_REQUEST | 時刻フォーマットエラー |
| rateLimitsが負の値 | 400 | BAD_REQUEST | 数値範囲エラー |
| タイムアウト | 408 | TIMEOUT | "Operation timeout" (10s) |

### GET エラーレスポンス
| 条件 | HTTPステータス | error.code | error.message |
|------|---------------|------------|---------------|
| サービス初期化失敗 | 500 | INTERNAL_ERROR | "Failed to initialize service" |
| タイムアウト | 408 | TIMEOUT | "Operation timeout" (10s) |

## 境界値

### enabled フィールド
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| true | 設定保存 | 通知有効化 |
| false | 設定保存 | 通知無効化 |
| undefined | 現在値維持 | 変更なし |

### channels 配列
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| [] | 400エラー | "channels"必須 |
| ["ANOMALY_DETECTION"] | 設定保存 | 有効なチャネル |
| ["INVALID_CHANNEL"] | 400エラー | 無効なチャネル値 |

### quietHours 時刻フォーマット
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| start: "22:00", end: "08:00" | 設定保存 | 夜間静止時間（深夜跨ぎ） |
| start: "08:00", end: "22:00" | 設定保存 | 日中時間帯 |
| start: "25:00" | 400エラー | 無効な時刻 |
| start: "8:00" | 検証結果次第 | Zodスキーマ依存 |

### rateLimits 数値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| maxPerHour: 100, maxPerDay: 1000 | 設定保存 | デフォルト値 |
| maxPerHour: 0 | 400エラー | 正の整数必須 |
| maxPerHour: -10 | 400エラー | 負の値禁止 |
| maxPerHour: 1 | 設定保存 | 最小値 |

### timezone 検証
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| "UTC" | 設定保存 | 有効なタイムゾーン |
| "Asia/Tokyo" | 設定保存 | 有効なタイムゾーン |
| "Invalid/Timezone" | Zod検証次第 | スキーマ定義依存 |

## 不変条件チェック

### INV-API-001: API Response Structure
- [ ] GET 200: `{success: true, data: NotificationConfig}` 構造
- [ ] POST 200: `{success: true, data: NotificationConfig}` 構造
- [ ] エラー時: AppError 構造 (code, message, statusCode)

### INV-TIME-001: Timeout Wrapper
- [ ] GET: 10秒タイムアウト適用 (DEFAULT_TIMEOUTS.api)
- [ ] POST: 10秒タイムアウト適用 (DEFAULT_TIMEOUTS.api)
- [ ] タイムアウト時: TimeoutError 適切な処理

### INV-ERR-001: AppError Type Guard
- [ ] createError.badRequest() 使用時: ValidationErrorインスタンス
- [ ] エラーオブジェクト: isAppError() === true

### Clean Architecture (INV-ARCH-002)
- [ ] APIルート (Presentation) → NotificationService (Application) のみ呼び出し
- [ ] Domain/Infrastructure層を直接呼び出さない
- [ ] Repository Factory経由でサービス初期化

### 依存関係
```typescript
// ✓ 正しい依存方向
import { NotificationService } from "@/application/services/NotificationService";
import { createNotificationService } from "@/infrastructure/factories/repositoryFactory";

// ✓ エラーハンドリング
import { withResilientHandler, createError } from "@/lib/api/error-handler";
import { createSuccessResponse } from "@/lib/api/response";
```

## 実装上の注意点

### リクエスト処理フロー (GET)
1. `withResilientHandler` でラップ（タイムアウト、エラーハンドリング）
2. `createNotificationService()` でサービス初期化
3. `notificationService.getNotificationSettings()` で設定取得
4. `createSuccessResponse()` で成功レスポンス構築

### リクエスト処理フロー (POST)
1. `withResilientHandler` でラップ
2. `request.json()` でリクエストボディパース
3. JSONパース失敗時: `createError.badRequest("Invalid request body")`
4. `notificationService.updateConfig(body)` で設定更新
5. Zod検証失敗時: 400エラー返却
6. 更新後の設定を `getNotificationSettings()` で取得
7. `createSuccessResponse()` で成功レスポンス

### エラー処理
```typescript
// リクエストボディパースエラー
try {
  body = await request.json();
} catch {
  throw createError.badRequest("Invalid request body");
}

// 設定検証エラー
try {
  notificationService.updateConfig(body as NotificationConfig);
} catch (error) {
  if (error instanceof Error) {
    throw createError.badRequest(`Invalid settings: ${error.message}`);
  }
  throw createError.badRequest("Invalid settings");
}
```

### レート制限
- このエンドポイント自体はレート制限対象外（通知送信とは異なる）
- 将来: 認証実装後、ユーザー単位の設定アクセス制限考慮

### セキュリティ
- 現在: 認証なし（誰でも設定取得・更新可能）
- 将来: 認証ミドルウェア追加、管理者権限チェック

## テスト要件

### GET テストケース
- [ ] 200 OK: 正常に設定取得
- [ ] 200 OK: デフォルト設定構造確認
- [ ] 408: タイムアウトシナリオ
- [ ] 500: サービス初期化失敗

### POST テストケース
- [ ] 200 OK: 正常に設定更新
- [ ] 200 OK: 部分更新（enabledのみ）
- [ ] 200 OK: 全設定更新
- [ ] 400: JSONパースエラー
- [ ] 400: 無効なchannels値
- [ ] 400: 無効なquietHours時刻
- [ ] 400: 負のrateLimits値
- [ ] 400: 空のchannels配列
- [ ] 408: タイムアウトシナリオ

### 統合テスト
- [ ] POST後、GETで更新内容確認
- [ ] 複数クライアントからの同時更新（競合状態）
- [ ] レスポンス時間 < 100ms（SLA）

## 参考ファイル
- 実装: `src/app/api/notifications/settings/route.ts`
- テスト: `src/app/api/notifications/settings/route.test.ts`
- 依存サービス: `src/application/services/NotificationService.ts`
- エンティティ: `src/domain/entities/NotificationProvider.ts`
- エラーハンドリング: `src/lib/api/error-handler.ts`
- レスポンス構築: `src/lib/api/response.ts`
