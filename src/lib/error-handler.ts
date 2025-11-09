export const ERROR_CODES = {
  UNKNOWN: 'UNKNOWN_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  GENERATION: 'GENERATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  PERMISSION: 'PERMISSION_ERROR'
} as const;

type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES];

const USER_MESSAGES: Record<ErrorCodeType, string> = {
  [ERROR_CODES.UNKNOWN]: '予期せぬエラーが発生しました',
  [ERROR_CODES.VALIDATION]: '入力内容を確認してください',
  [ERROR_CODES.NETWORK]: 'ネットワーク接続を確認してください',
  [ERROR_CODES.TIMEOUT]: 'タイムアウトしました。再度お試しください',
  [ERROR_CODES.GENERATION]: 'データの生成に失敗しました',
  [ERROR_CODES.NOT_FOUND]: '要求されたデータが見つかりません',
  [ERROR_CODES.PERMISSION]: 'この操作を実行する権限がありません'
};

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCodeType = ERROR_CODES.UNKNOWN,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace?.(this, AppError);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ERROR_CODES.VALIDATION, 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'ネットワークエラーが発生しました', statusCode: number = 0) {
    super(message, ERROR_CODES.NETWORK, statusCode);
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '要求されたリソースが見つかりません') {
    super(message, ERROR_CODES.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'リクエストがタイムアウトしました') {
    super(message, ERROR_CODES.TIMEOUT, 408);
    this.name = 'TimeoutError';
  }
}

const isNetworkRelated = (error: Error): boolean => 
  error.name === 'TypeError' || 
  error.message.includes('fetch') || 
  error.message.includes('network') ||
  error.message.includes('connection');

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (isNetworkRelated(error)) {
      return new NetworkError(error.message);
    }
    return new AppError(error.message, ERROR_CODES.UNKNOWN, 500);
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError('予期せぬエラーが発生しました');
}

export function getUserFriendlyMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return USER_MESSAGES[normalized.code] || normalized.message;
}

export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error);
  const contextStr = context ? `[${context}]` : '[APP]';
  
  console.group(`${contextStr} Error Details`);
  console.error('Code:', normalized.code);
  console.error('Message:', normalized.message);
  console.error('Status:', normalized.statusCode);
  
  if (normalized.details) {
    console.error('Details:', normalized.details);
  }
  
  console.error('Stack:', normalized.stack);
  console.groupEnd();
}

export const errorTypeGuards = {
  isNetworkError: (error: unknown): boolean => {
    const normalized = normalizeError(error);
    return normalized.code === ERROR_CODES.NETWORK || normalized.statusCode === 0;
  },
  
  isValidationError: (error: unknown): boolean => {
    return normalizeError(error).code === ERROR_CODES.VALIDATION;
  },
  
  isNotFoundError: (error: unknown): boolean => {
    return normalizeError(error).code === ERROR_CODES.NOT_FOUND;
  },
  
  isTimeoutError: (error: unknown): boolean => {
    return normalizeError(error).code === ERROR_CODES.TIMEOUT;
  },
  
  isServerError: (error: unknown): boolean => {
    const normalized = normalizeError(error);
    return normalized.statusCode >= 500;
  }
} as const;