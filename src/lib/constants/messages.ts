// Success messages
export const SUCCESS_MESSAGES = {
  DATA_GENERATION_COMPLETE: 'テストデータの生成が完了しました',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  GENERATING_DATA: 'テストデータを生成中...',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNEXPECTED: '予期せぬエラーが発生しました',
  VALIDATION: '入力内容を確認してください',
  NETWORK: 'ネットワーク接続を確認してください',
  TIMEOUT: 'タイムアウトしました。再度お試しください',
  GENERATION: 'データの生成に失敗しました',
  NOT_FOUND: '要求されたデータが見つかりません',
  PERMISSION: 'この操作を実行する権限がありません',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  DEFAULT_GENERATION: 'データ生成に失敗しました',
  API_ERROR: (status: number, statusText: string) => `APIエラー: ${status} ${statusText}`,
} as const;

// UI text
export const UI_TEXT = {
  DASHBOARD: {
    TITLE: 'イキイキレコード - 教師ダッシュボード',
    DESCRIPTION: '生徒の学習データを生成・管理するダッシュボードです',
    DATA_GENERATION: 'テストデータ生成',
    DATA_GENERATION_DESCRIPTION: 'ダッシュボードの機能を確認するために、サンプルデータを生成します。',
    GENERATE_BUTTON: 'テストデータを生成',
    GENERATING_BUTTON: '生成中...',
    HELP_TEXT_GENERATING: 'データ生成には数秒かかる場合があります。',
    HELP_TEXT_READY: 'ボタンをクリックしてテストデータを生成してください。',
    CLOSE_NOTIFICATION: '通知を閉じる',
  },
  LANDING: {
    TITLE: 'イキイキレコード デモ',
    DASHBOARD_BUTTON: '教師ダッシュボードを見る',
  },
  FEATURES: {
    LEARNING_DATA: '30日分の学習データ',
    EMOTION_ANALYSIS: '感情分析サンプル',
    SEASONAL_FACTORS: '季節要因の考慮',
    EVENT_SIMULATION: 'イベント影響のシミュレーション',
    GENERATED_DATA: '生成されるデータ:',
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SEED: '/api/seed',
} as const;

// Feature list
export const DATA_GENERATION_FEATURES = [
  UI_TEXT.FEATURES.LEARNING_DATA,
  UI_TEXT.FEATURES.EMOTION_ANALYSIS,
  UI_TEXT.FEATURES.SEASONAL_FACTORS,
  UI_TEXT.FEATURES.EVENT_SIMULATION,
] as const;