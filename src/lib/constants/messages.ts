export const SUCCESS_MESSAGES = {
  DATA_GENERATION_COMPLETE: "テストデータの生成が完了しました",
  NO_DATA: "データがありません。まずPOSTリクエストでデータを生成してください。",
} as const;

export const LOADING_MESSAGES = {
  GENERATING_DATA: "テストデータを生成中...",
  DEFAULT: "読み込み中",
  OVERLAY: "読み込み中...",
  CARD: "データを読み込み中...",
} as const;

export const ERROR_MESSAGES = {
  TITLE: "エラーが発生しました",
  UNEXPECTED: "予期せぬエラーが発生しました",
  UNKNOWN: "不明なエラーが発生しました",
  VALIDATION: "入力内容を確認してください",
  NETWORK: "ネットワーク接続を確認してください",
  TIMEOUT: "タイムアウトしました。再度お試しください",
  GENERATION: "データ生成に失敗しました",
  NOT_FOUND: "要求されたデータが見つかりません",
  NOT_FOUND_SHORT: "データが見つかりません",
  PERMISSION: "この操作を実行する権限がありません",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  DEFAULT_GENERATION: "データ生成に失敗しました",
  DATA_TRANSFORMATION: "Data transformation failed",
  API_ERROR: (status: number, statusText: string) =>
    `APIエラー: ${status} ${statusText}`,
} as const;

export const UI_TEXT = {
  DASHBOARD: {
    TITLE: "イキイキレコード - 教師ダッシュボード",
    DESCRIPTION: "生徒の学習データを生成・管理するダッシュボードです",
    DATA_GENERATION: "データ生成",
    DATA_GENERATION_DESCRIPTION:
      "ダッシュボードの機能を確認するために、サンプルデータを生成します。",
    GENERATE_BUTTON: "初期データを生成",
    GENERATING_BUTTON: "生成中...",
    HELP_TEXT_GENERATING: "データを生成しています。しばらくお待ちください...",
    HELP_TEXT_READY: "ボタンをクリックしてテストデータを生成してください。",
    CLOSE_NOTIFICATION: "通知を閉じる",
    RETRY_BUTTON: "再試行",
  },
  LANDING: {
    TITLE: "イキイキレコード デモ",
    DASHBOARD_BUTTON: "教師ダッシュボードを見る",
  },
  FEATURES: {
    LEARNING_DATA: "30日分の学習データ",
    EMOTION_ANALYSIS: "感情分析サンプル",
    SEASONAL_FACTORS: "季節要因の考慮",
    EVENT_SIMULATION: "イベント影響のシミュレーション",
    GENERATED_DATA: "生成されるデータ:",
  },
} as const;

export const DATA_GENERATION_FEATURES = [
  UI_TEXT.FEATURES.LEARNING_DATA,
  UI_TEXT.FEATURES.EMOTION_ANALYSIS,
  UI_TEXT.FEATURES.SEASONAL_FACTORS,
  UI_TEXT.FEATURES.EVENT_SIMULATION,
] as const;

export const CHART_TITLES = {
  TOTAL_RECORDS: "総記録数",
  AVERAGE_EMOTION_SCORE: "平均感情スコア",
  MONTHLY_AVERAGE_EMOTION: "月別平均感情スコア",
  DAY_OF_WEEK_AVERAGE_EMOTION: "曜日別平均感情スコア",
  TIME_OF_DAY_AVERAGE_EMOTION: "時間帯別平均感情スコア",
  MONTHLY_EMOTION_TREND: "月別感情スコア推移",
  EMOTION_DISTRIBUTION: "感情スコア分布",
  EMOTION_TREND_TOP_STUDENTS: "感情スコア推移（上位5名）",
  STUDENT_EMOTION_SCORES: "生徒別感情スコア",
} as const;

export const DASHBOARD_FEATURES = [
  "月別感情スコアの統計",
  "曜日別の学習傾向分析",
  "時間帯別の活動パターン",
  "生徒ごとの詳細データ",
  "感情分布の可視化",
] as const;

export const HELP_TEXT = {
  READY: "ボタンをクリックしてテストデータを生成してください。",
  GENERATING: "データを生成しています。しばらくお待ちください...",
} as const;

export const CONTEXT_ERROR_MESSAGES = {
  THEME_PROVIDER: "useTheme must be used within a ThemeProvider",
  SIDEBAR_PROVIDER: "useSidebar must be used within a SidebarProvider",
} as const;

export const ERROR_BOUNDARY_MESSAGES = {
  TITLE: "エラーが発生しました",
  DESCRIPTION: "アプリケーションで予期せぬエラーが発生しました。",
  ACTION: "ページを更新するか、後でもう一度お試しください。",
  BUTTON_TEXT: "ページを更新",
  DEV_DETAILS: "エラー詳細（開発モード）",
} as const;

export const USAGE_INSTRUCTIONS = {
  TITLE: "使い方",
  STEPS: [
    "「初期データを生成」ボタンをクリックしてテストデータを作成します",
    "生成が完了すると統計データが表示されます",
    "グラフやチャートで生徒の感情データを確認できます",
    "何度でもデータを再生成して異なるパターンを試せます",
  ] as const,
} as const;

export const BREADCRUMB_MESSAGES = {
  HOME: "Home",
} as const;

export const ACCESSIBILITY_MESSAGES = {
  GRID_SHAPE_ALT: "grid",
  CHART_LOADING: "グラフローディング中",
  CHART_ERROR: "グラフエラー",
  CHART_DEFAULT: "統計グラフ",
  NO_DATA: "データなし",
  CLOSE_NOTIFICATION: "通知を閉じる",
  CHART_ERROR_MESSAGE: "グラフの表示中にエラーが発生しました",
  NO_DATA_MESSAGE: "表示するデータがありません",
  CLOSE_BUTTON: "閉じる",
} as const;

export const CHART_AXIS_LABELS = {
  TIME_OF_DAY: ["朝", "昼", "夜"],
  LAST_7_DAYS: ["7日前", "6日前", "5日前", "4日前", "3日前", "2日前", "1日前"],
};

export const DASHBOARD_CONTROLS = {
  STUDENT_COUNT_LABEL: "生徒数",
  PERIOD_DAYS_LABEL: "記録期間",
  EMOTION_DISTRIBUTION_PATTERN: "感情分布パターン",
  SEASONAL_EFFECTS_CHECKBOX: "季節変動を有効にする",
  ADD_EVENT_SECTION: "イベントの追加",
  EVENT_NAME_PLACEHOLDER: "イベント名",
  EVENT_IMPACT_PLACEHOLDER: "影響度 (-1.0 〜 1.0)",
  ADD_EVENT_BUTTON: "イベントを追加",
  REMOVE_EVENT_BUTTON: "削除",
  DISTRIBUTION_PATTERNS: {
    NORMAL: "正規分布",
    BIMODAL: "二峰分布",
    STRESS: "ストレス型",
    HAPPY: "ハッピー型",
  },
} as const;

export const API_ERROR_MESSAGES = {
  VALIDATION_FAILED_PREFIX: "入力データの検証に失敗しました: ",
  INVALID_JSON_BODY: "リクエストボディのJSON形式が正しくありません",
  BAD_REQUEST: "リクエストが正しくありません",
  UNAUTHORIZED: "認証が必要です",
  FORBIDDEN: "アクセスが拒否されました",
  NOT_FOUND: "リソースが見つかりません",
  TIMEOUT: "リクエストがタイムアウトしました",
  GENERATION_FAILED: "データ生成に失敗しました",
  INTERNAL_SERVER_ERROR: "サーバーエラーが発生しました",
  REQUEST_BODY_PARSE_FAILED: "リクエストボディの解析に失敗しました",
} as const;
