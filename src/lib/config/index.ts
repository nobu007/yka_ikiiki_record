// Consolidated configuration for the IkiIki Record application

export const APP_CONFIG = {
  name: 'イキイキレコード デモ',
  description: '生徒の学習データを生成・管理するダッシュボードです',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    endpoints: {
      seed: '/seed'
    }
  },
  generation: {
    defaultPeriodDays: 30,
    defaultStudentCount: 20,
    defaultPattern: 'normal' as const
  }
} as const;

export const EMOTION_CONFIG = {
  min: 1,
  max: 5,
  defaultStddev: 0.5,
  seasonalImpact: 0.3,
  maxEventImpact: 0.8,
  seasonalFactors: [0.2, 0.1, 0.3, 0.4, 0.5, 0.3, 0.2, 0.1, 0.3, 0.4, 0.3, 0.1],
  baseEmotions: {
    normal: 3.0,
    bimodal: 2.0,
    stress: 2.5,
    happy: 3.5
  }
} as const;

export const UI_CONFIG = {
  timeRanges: {
    morning: { start: 5, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 24 }
  },
  daysOfWeek: ['日', '月', '火', '水', '木', '金', '土'],
  buttonStyles: {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors',
    secondary: 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors'
  }
} as const;

export const MESSAGES = {
  success: {
    dataGeneration: 'テストデータの生成が完了しました',
    DATA_GENERATION_COMPLETE: 'テストデータの生成が完了しました'
  },
  error: {
    network: 'ネットワーク接続に問題があります',
    validation: '入力内容を確認してください',
    generation: 'データ生成に失敗しました',
    unexpected: '予期せぬエラーが発生しました',
    api: (status: number, statusText: string) => `APIエラー: ${status} ${statusText}`,
    UNEXPECTED: '予期せぬエラーが発生しました',
    VALIDATION: '入力内容を確認してください',
    NETWORK: 'ネットワーク接続を確認してください',
    TIMEOUT: 'タイムアウトしました。再度お試しください',
    GENERATION: 'データの生成に失敗しました',
    NOT_FOUND: '要求されたデータが見つかりません',
    PERMISSION: 'この操作を実行する権限がありません',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    DEFAULT_GENERATION: 'データ生成に失敗しました',
    API_ERROR: (status: number, statusText: string) => `APIエラー: ${status} ${statusText}`
  },
  loading: {
    generating: 'データを生成中...',
    processing: '処理中...',
    GENERATING_DATA: 'テストデータを生成中...'
  },
  ui: {
    dashboard: {
      title: 'イキイキレコード - 教師ダッシュボード',
      dataGeneration: 'データ生成',
      dataGenerationDescription: 'テストデータを動的に生成してダッシュボード機能を体験できます。',
      generateButton: '初期データを生成',
      generatingButton: '生成中...',
      helpTextReady: 'ボタンをクリックしてテストデータを生成してください',
      helpTextGenerating: 'データを生成しています。しばらくお待ちください...'
    },
    features: {
      generatedData: [
        '月別感情スコアの統計',
        '曜日別の学習傾向分析',
        '時間帯別の活動パターン',
        '生徒ごとの詳細データ',
        '感情分布の可視化'
      ]
    },
    landing: {
      TITLE: 'イキイキレコード デモ',
      DASHBOARD_BUTTON: '教師ダッシュボードを見る'
    }
  }
} as const;

// Additional constants for backward compatibility
export const SUCCESS_MESSAGES = MESSAGES.success;
export const ERROR_MESSAGES = MESSAGES.error;
export const LOADING_MESSAGES = MESSAGES.loading;
export const UI_TEXT = {
  DASHBOARD: MESSAGES.ui.dashboard,
  LANDING: MESSAGES.ui.landing,
  FEATURES: {
    LEARNING_DATA: '30日分の学習データ',
    EMOTION_ANALYSIS: '感情分析サンプル',
    SEASONAL_FACTORS: '季節要因の考慮',
    EVENT_SIMULATION: 'イベント影響のシミュレーション',
    GENERATED_DATA: '生成されるデータ:',
  }
};

export const API_ENDPOINTS = {
  SEED: '/api/seed',
} as const;

export const DATA_GENERATION_FEATURES = [
  UI_TEXT.FEATURES.LEARNING_DATA,
  UI_TEXT.FEATURES.EMOTION_ANALYSIS,
  UI_TEXT.FEATURES.SEASONAL_FACTORS,
  UI_TEXT.FEATURES.EVENT_SIMULATION,
] as const;

// Error codes are defined in src/lib/error-handler.ts to avoid circular dependency
// Import them directly from there when needed