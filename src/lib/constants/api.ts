export const API_ERROR_MESSAGES = {
  VALIDATION: {
    REQUEST: "リクエストの形式が正しくありません",
    RESPONSE: "レスポンスの形式が正しくありません",
  },
  AUTH: {
    UNAUTHORIZED: "認証が必要です",
    FORBIDDEN: "アクセス権限がありません",
  },
  SERVER: {
    INTERNAL: "サーバーエラーが発生しました",
    NOT_FOUND: "リソースが見つかりません",
    BAD_REQUEST: "不正なリクエストです",
  },
  DATA: {
    NOT_FOUND: "データが見つかりません",
    INVALID: "データが不正です",
    CREATE_FAILED: "データの作成に失敗しました",
    UPDATE_FAILED: "データの更新に失敗しました",
    DELETE_FAILED: "データの削除に失敗しました",
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_API_RESPONSE = {
  SUCCESS_MESSAGE: "処理が成功しました",
  ERROR_MESSAGE: "予期せぬエラーが発生しました",
} as const;

export const API_ENDPOINTS = {
  SEED: "/api/seed",
  STATS: "/api/stats",
  EXPORT: "/api/export",
  HEALTH: "/api/health",
  METRICS: "/api/metrics",
  ANALYTICS: "/api/analytics",
  TRENDS: "/api/trends",
  NOTIFICATIONS_SETTINGS: "/api/notifications/settings",
  NOTIFICATIONS_HISTORY: "/api/notifications/history",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_SESSION: "/api/auth/session",
} as const;

export const API_OPERATIONS = {
  GET_STATS: "GET /api/stats",
  GET_HEALTH: "GET /api/health",
  GET_SEED: "GET /api/seed",
  POST_SEED: "POST /api/seed",
  EXPORT_RECORDS: "GET /api/export",
  GET_METRICS: "GET /api/metrics",
  GET_ANALYTICS: "GET /api/analytics",
  GET_TRENDS: "GET /api/trends",
  CREATE_BACKUP: "POST /api/backup",
  LIST_BACKUPS: "GET /api/backup",
  RESTORE_BACKUP: "POST /api/restore",
  GET_NOTIFICATION_SETTINGS: "GET /api/notifications/settings",
  UPDATE_NOTIFICATION_SETTINGS: "POST /api/notifications/settings",
  GET_NOTIFICATION_HISTORY: "GET /api/notifications/history",
  POST_AUTH_LOGIN: "POST /api/auth/login",
  POST_AUTH_LOGOUT: "POST /api/auth/logout",
  GET_AUTH_SESSION: "GET /api/auth/session",
} as const;
