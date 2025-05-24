"use client";

/**
 * DashboardTemplate - ダッシュボード画面の基本レイアウトテンプレート
 *
 * 使用例:
 * ```tsx
 * const YourDashboard = () => {
 *   return (
 *     <DashboardTemplate
 *       buttonProps={{
 *         label: "データを更新",
 *         onClick: () => handleUpdate(),
 *         loading: isLoading
 *       }}
 *       displayProps={{
 *         data: yourData,
 *         error: error
 *       }}
 *     />
 *   );
 * };
 * ```
 */

// ボタンの設定用Props
interface ButtonProps {
  label: string;                  // ボタンのラベル
  onClick: () => void;           // クリック時のハンドラ
  loading?: boolean;             // ローディング状態 (オプション)
  disabled?: boolean;            // 無効状態 (オプション)
  className?: string;            // カスタムクラス (オプション)
}

// データ表示エリアのProps
interface DisplayProps {
  data?: React.ReactNode;        // 表示するコンポーネントまたはデータ
  error?: Error | null;          // エラー情報
  loading?: boolean;             // ローディング状態
}

// テンプレート全体のProps
interface DashboardTemplateProps {
  buttonProps: ButtonProps;
  displayProps: DisplayProps;
  className?: string;            // コンテナのカスタムクラス
}

export default function DashboardTemplate({
  buttonProps,
  displayProps,
  className = "",
}: DashboardTemplateProps) {
  return (
    <div className={`p-4 ${className}`}>
      {/* アクションボタン */}
      <div className="mb-4">
        <button
          onClick={buttonProps.onClick}
          disabled={buttonProps.loading || buttonProps.disabled}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 ${buttonProps.className || ""}`}
        >
          {buttonProps.loading ? (
            <>
              <span className="inline-block animate-spin">⚡</span>
              処理中...
            </>
          ) : (
            buttonProps.label
          )}
        </button>
      </div>

      {/* データ表示エリア */}
      <div className="mt-4">
        {displayProps.loading ? (
          <div className="flex items-center justify-center p-4">
            <span className="inline-block animate-spin mr-2">⚡</span>
            読み込み中...
          </div>
        ) : displayProps.error ? (
          <div className="text-red-600 p-4">
            エラーが発生しました: {displayProps.error.message}
          </div>
        ) : displayProps.data ? (
          <div className="border rounded-lg p-4 bg-white">
            {displayProps.data}
          </div>
        ) : (
          <div className="text-gray-500 p-4">
            データがありません
          </div>
        )}
      </div>
    </div>
  );
}