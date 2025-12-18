import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';
import { AppError, normalizeError, logError, ERROR_CODES } from '@/lib/error-handler';

/**
 * Zodエラーからユーザーフレンドリーなメッセージを生成
 */
const formatZodError = (error: z.ZodError): string => {
  return error.errors
    .map((err) => {
      const field = err.path.join('.');
      const message = err.message;
      return field ? `${field}: ${message}` : message;
    })
    .join(', ');
};

/**
 * Enhanced API error handler with better type safety
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    const message = formatZodError(error);
    return createErrorResponse(`入力データの検証に失敗しました: ${message}`, 400);
  }

  // JSON parse errors
  if (error instanceof SyntaxError && 'body' in error) {
    return createErrorResponse('リクエストボディのJSON形式が正しくありません', 400);
  }

  // Application errors
  const normalizedError = normalizeError(error);
  logError(error, 'API');

  return createErrorResponse(
    normalizedError.message,
    normalizedError.statusCode || 500
  );
}

/**
 * 特定のエラーを生成するファクトリー関数
 */
export const createError = {
  badRequest: (message: string = 'リクエストが正しくありません') => 
    new AppError(message, ERROR_CODES.VALIDATION, 400),
  unauthorized: (message: string = '認証が必要です') => 
    new AppError(message, ERROR_CODES.PERMISSION, 401),
  forbidden: (message: string = 'アクセスが拒否されました') => 
    new AppError(message, ERROR_CODES.PERMISSION, 403),
  notFound: (message: string = 'リソースが見つかりません') => 
    new AppError(message, ERROR_CODES.NOT_FOUND, 404),
  timeout: (message: string = 'リクエストがタイムアウトしました') => 
    new AppError(message, ERROR_CODES.TIMEOUT, 408),
  generation: (message: string = 'データ生成に失敗しました') => 
    new AppError(message, ERROR_CODES.GENERATION, 500),
  internal: (message: string = 'サーバーエラーが発生しました') => 
    new AppError(message, ERROR_CODES.UNKNOWN, 500)
} as const;

/**
 * APIハンドラーをエラーハンドリングで包む
 * 型安全なエラーハンドリングラッパー
 */
export function withErrorHandler<T extends NextResponse>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  return handler().catch(handleApiError);
}

/**
 * リクエストデータの安全なパース
 */
export async function parseRequestBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw createError.badRequest('リクエストボディの解析に失敗しました');
  }
}