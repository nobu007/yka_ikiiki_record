/**
 * APIエラーメッセージ
 */
export const API_ERROR_MESSAGES = {
  VALIDATION: {
    REQUEST: 'リクエストの形式が正しくありません',
    RESPONSE: 'レスポンスの形式が正しくありません'
  },
  AUTH: {
    UNAUTHORIZED: '認証が必要です',
    FORBIDDEN: 'アクセス権限がありません'
  },
  SERVER: {
    INTERNAL: 'サーバーエラーが発生しました',
    NOT_FOUND: 'リソースが見つかりません',
    BAD_REQUEST: '不正なリクエストです'
  },
  DATA: {
    NOT_FOUND: 'データが見つかりません',
    INVALID: 'データが不正です',
    CREATE_FAILED: 'データの作成に失敗しました',
    UPDATE_FAILED: 'データの更新に失敗しました',
    DELETE_FAILED: 'データの削除に失敗しました'
  }
} as const;

/**
 * HTTPステータスコード
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * APIレスポンスのデフォルト値
 */
export const DEFAULT_API_RESPONSE = {
  SUCCESS_MESSAGE: '処理が成功しました',
  ERROR_MESSAGE: '予期せぬエラーが発生しました'
} as const;

/**
 * APIのエンドポイント
 */
export const API_ENDPOINTS = {
  SEED: '/api/seed',
  STATS: '/api/stats'
} as const;