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
