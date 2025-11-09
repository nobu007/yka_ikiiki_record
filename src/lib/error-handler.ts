/**
 * 標準化されたエラーハンドリングユーティリティ
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message, 'NETWORK_ERROR', 0);
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
    return new AppError(error.message, 'UNKNOWN_ERROR', 500);
  }

  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_ERROR', 500);
  }

  return new AppError('予期せぬエラーが発生しました', 'UNKNOWN_ERROR', 500);
}

/**
 * ユーザー向けのエラーメッセージを生成
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return '入力内容を確認してください';
    case 'NETWORK_ERROR':
      return 'ネットワーク接続を確認してください';
    case 'TIMEOUT_ERROR':
      return 'タイムアウトしました。再度お試しください';
    default:
      return error.message || 'エラーが発生しました';
  }
}

/**
 * エラーログを出力
 */
export function logError(error: unknown, context?: string) {
  const normalizedError = normalizeError(error);
  console.error(`[${context || 'APP'}] ${normalizedError.code}:`, normalizedError);
}