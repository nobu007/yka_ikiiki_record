import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';
import { AppError, normalizeError, logError, ERROR_CODES } from '@/lib/error-handler';

/**
 * APIエラーをハンドリングする
 */
export function handleApiError(error: unknown): NextResponse {
  const normalizedError = normalizeError(error);
  logError(error, 'API');

  if (error instanceof z.ZodError) {
    const message = error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    return createErrorResponse(message, 400);
  }

  return createErrorResponse(
    normalizedError.message,
    normalizedError.statusCode || 500
  );
}

/**
 * 特定のエラーを生成する
 */
export const createError = {
  badRequest: (message: string) => new AppError(message, 400, ERROR_CODES.VALIDATION),
  unauthorized: (message: string = '認証が必要です') => new AppError(message, 401),
  forbidden: (message: string = 'アクセスが拒否されました') => new AppError(message, 403),
  notFound: (message: string = 'リソースが見つかりません') => new AppError(message, 404),
  internal: (message: string = 'サーバーエラーが発生しました') => new AppError(message, 500, ERROR_CODES.UNKNOWN),
  timeout: (message: string = 'リクエストがタイムアウトしました') => new AppError(message, 408, ERROR_CODES.TIMEOUT),
  generation: (message: string = 'データ生成に失敗しました') => new AppError(message, 500, ERROR_CODES.GENERATION)
};

/**
 * APIハンドラーをエラーハンドリングで包む
 */
export function withErrorHandler<T extends Promise<NextResponse>>(
  handler: () => T
): T {
  return handler().catch(handleApiError) as T;
}