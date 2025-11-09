/**
 * 標準化されたエラーハンドリングユーティリティ
 */

// エラーコードの定数を抽出
export const ERROR_CODES = {
  UNKNOWN: 'UNKNOWN_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  GENERATION: 'GENERATION_ERROR'
} as const;

// ユーザーフレンドリーメッセージのマップ
const USER_MESSAGES = {
  [ERROR_CODES.VALIDATION]: '入力内容を確認してください',
  [ERROR_CODES.NETWORK]: 'ネットワーク接続を確認してください',
  [ERROR_CODES.TIMEOUT]: 'タイムアウトしました。再度お試しください',
  [ERROR_CODES.GENERATION]: 'データの生成に失敗しました'
} as const;

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = ERROR_CODES.UNKNOWN,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.VALIDATION, 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message, ERROR_CODES.NETWORK, 0);
    this.name = 'NetworkError';
  }
}

/**
 * エラーを標準化された形式に変換
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, ERROR_CODES.UNKNOWN, 500);
  }

  if (typeof error === 'string') {
    return new AppError(error, ERROR_CODES.UNKNOWN, 500);
  }

  return new AppError('予期せぬエラーが発生しました', ERROR_CODES.UNKNOWN, 500);
}

/**
 * ユーザー向けのエラーメッセージを生成
 */
export function getUserFriendlyMessage(error: AppError): string {
  return USER_MESSAGES[error.code as keyof typeof USER_MESSAGES] || 
         error.message || 
         'エラーが発生しました';
}

/**
 * エラーログを出力
 */
export function logError(error: unknown, context?: string): void {
  const normalizedError = normalizeError(error);
  const contextStr = context ? `[${context}]` : '[APP]';
  console.error(`${contextStr} ${normalizedError.code}:`, normalizedError);
}

/**
 * エラーがネットワーク関連か判定
 */
export function isNetworkError(error: unknown): boolean {
  const normalized = normalizeError(error);
  return normalized.code === ERROR_CODES.NETWORK || normalized.statusCode === 0;
}

/**
 * エラーが検証エラーか判定
 */
export function isValidationError(error: unknown): boolean {
  return normalizeError(error).code === ERROR_CODES.VALIDATION;
}