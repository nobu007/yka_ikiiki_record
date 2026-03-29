Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: Notification

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|------------|------|
| N/A | - | - | - | - | (パラメータなし) |
## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| N/A | - | - | (戻り値なし) |
## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|------------|------|
| N/A | - | - | - | - | (パラメータなし) |
## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| N/A | - | - | (戻り値なし) |
## 概要
- **モジュール**: `src/components/common/Notification.tsx`
- **責務**: ユーザーに成功、エラー、警告、情報メッセージを表示する通知バナーコンポーネント
- **関連する不変条件**:
  - INV-HOOK-004: useNotification_Initial_State
  - INV-HOOK-005: useNotification_Type_Support

## コンポーネント定義

### NotificationType
通知タイプを表す型定義。

```typescript
type NotificationType = "success" | "error" | "warning" | "info"
```

| タイプ | 説明 | 使用例 |
|-------|------|-------|
| success | 成功メッセージ | データ保存完了、操作成功 |
| error | エラーメッセージ | API エラー、バリデーション失敗 |
| warning | 警告メッセージ | データ損失の警告、確認要求 |
| info | 情報メッセージ | ヒント、補足情報 |

### NotificationProps
Notification コンポーネントのプロパティ。

```typescript
interface NotificationProps {
  /** 通知を表示するかどうか */
  show: boolean;
  /** 表示するメッセージ内容 */
  message: string;
  /** 通知タイプ（アイコンとスタイリングを決定） */
  type: NotificationType;
  /** 閉じるボタンがクリックされた時のコールバック（オプション） */
  onClose?: () => void;
}
```

## 入力契約
| プロパティ | 型 | 制約 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| show | `boolean` | true \| false | - | 通知の表示/非表示 |
| message | `string` | 空文字列可 | - | 表示するメッセージ |
| type | `NotificationType` | "success" \| "error" \| "warning" \| "info" | - | 通知タイプ |
| onClose | `(() => void) \| undefined` | 関数または undefined | undefined | 閉じるボタンのハンドラ |

## 出力契約
| 条件 | 出力 | 説明 |
|------|------|------|
| show = false | `null` | コンポーネントは何も描画しない |
| show = true | JSX.Element | ARIA属性付きの通知バナー |

## レンダリングロジック

### 1. 表示条件
```tsx
if (!show) return null;
```
- `show` が `false` の場合、`null` を返してDOMを汚染しない

### 2. スタイリング適用
```tsx
className={`${UI_CONSTANTS.NOTIFICATION.BASE_CLASSES} ${UI_CONSTANTS.NOTIFICATION.STYLES[type]}`}
```
- 基本クラス + タイプ固有のスタイルクラスを適用
- 各タイプに対応する色とアイコン

### 3. アイコン表示
```tsx
<NotificationIcon type={type} />
```
- `type` に対応するアイコンを表示

### 4. メッセージ表示
```tsx
<p className="text-sm font-medium break-words">{message}</p>
```
- `break-words` クラスで長い単語も折り返す

### 5. 閉じるボタン（条件付き）
```tsx
{onClose && (
  <button onClick={handleClose} ...>
    {ACCESSIBILITY_MESSAGES.CLOSE_BUTTON}
  </button>
)}
```
- `onClose` が提供されている場合のみ閉じるボタンを表示

## アクセシビリティ

### ARIA属性
| 属性 | 値 | 説明 |
|------|-----|------|
| role | "alert" | スクリーンリーダーに重要なメッセージを通知 |
| aria-live | "polite" | ユーザーの操作を中断せずに通知 |
| aria-label (閉じるボタン) | ACCESSIBILITY_MESSAGES.CLOSE_NOTIFICATION | 閉じるボタンの説明 |

### キーボードナビゲーション
- 閉じるボタンは `Tab` キーでフォーカス可能
- フォーカス時のリング表示: `focus:ring-2 focus:ring-blue-500`

## パフォーマンス特性

### メモ化
```tsx
export const Notification = memo<NotificationProps>(...)
```
- `React.memo` でラップされ、propsが変更された場合のみ再レンダリング
- `handleClose` は `useCallback` でメモ化

### レンダリング条件
- `show = false` の場合、早期returnでレンダリングコストを最小化

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| show = false | null | コンポーネントは何も描画しない |
| show = true, message = "" | 空メッセージの通知 | 空のp要素が描画される |
| show = true, type = "success" | 緑色の成功通知 | チェックマークアイコン |
| show = true, type = "error" | 赤色のエラー通知 | エラーアイコン |
| show = true, type = "warning" | 黄色の警告通知 | 警告アイコン |
| show = true, type = "info" | 青色の情報通知 | 情報アイコン |
| show = true, onClose = undefined | 閉じるボタンなし | 閉じるボタンは描画されない |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | NULL入力 | null/undefined | 適切なデフォルト値または例外 | TypeError |
| ERR-002 | 型不正 | 不正な型の値 | 例外発生 | TypeError |
| ERR-003 | 範囲外 | 負の値、過大な値 | 例外発生 | RangeError |
| ERR-004 | 不正なフォーマット | フォーマット違反 | 例外発生 | ValueError |
| ERR-005 | リソース枯渇 | 大量データリクエスト | 適切なエラー処理 | Error |
| ERR-006 | 並行実行競合 | 同時実行 | 排他制御またはエラー | Error |
| ERR-007 | タイムアウト | 長時間処理 | タイムアウトエラー | TimeoutError |

## 不変条件チェック
- [x] INV-HOOK-004: Notification コンポーネントは useNotification フックと統合される
- [x] INV-HOOK-005: すべての通知タイプ (success, error, warning, info) をサポート

## 依存関係
- `./Icons`: NotificationIcon コンポーネント
- `@/lib/constants/ui`: UI_CONSTANTS (スタイル定義)
- `@/lib/constants/messages`: ACCESSIBILITY_MESSAGES

## テスト戦略
1. **表示テスト**: show = true/false で適切に描画/非描画されることを検証
2. **タイプテスト**: 各タイプ (success, error, warning, info) で正しいスタイルとアイコンが適用されることを検証
3. **メッセージテスト**: message prop が正しく表示されることを検証
4. **閉じるボタンテスト**: onClose prop の有無でボタンの表示/非表示が切り替わることを検証
5. **コールバックテスト**: 閉じるボタンクリックで onClose が呼ばれることを検証
6. **アクセシビリティテスト**: ARIA属性が正しく設定されることを検証
7. **メモ化テスト**: React.memo により不要な再レンダリングが防止されることを検証

## 使用例
```tsx
import { Notification } from '@/components/common';
import { useNotification } from '@/hooks/useNotification';

function MyComponent() {
  const { notification, showNotification, hideNotification } = useNotification();

  const handleSave = async () => {
    try {
      await saveData();
      showNotification("Data saved successfully!", "success");
    } catch (error) {
      showNotification("Failed to save data.", "error");
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save</button>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
}
```

## 統合
- `src/hooks/useNotification.ts`: 通知状態管理フック
- `src/components/common/Icons.tsx`: NotificationIcon アイコンコンポーネント

## 履歴
- 2026-03-29: SPEC作成 - 実装は既に存在、テストは未実装


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)


## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| useNotification.test.ts | (詳細未実装) | TC-001, BV-001, ERR-001 |
| useDashboard.loading-notifications.test.ts | (詳細未実装) | TC-001, BV-001, ERR-001 |
