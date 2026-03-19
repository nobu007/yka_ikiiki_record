import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';
import { AppError, normalizeError, logError, ERROR_CODES } from '@/lib/error-handler';

const formatZodError = (error: z.ZodError): string => {
  return error.errors
    .map((err) => {
      const field = err.path.join('.');
      const message = err.message;
      return field ? `${field}: ${message}` : message;
    })
    .join(', ');
};

function isSyntaxErrorWithBody(error: unknown): error is SyntaxError & { body: boolean } {
  if (!(error instanceof SyntaxError)) {
    return false;
  }
  const syntaxError = error;
  return 'body' in syntaxError && syntaxError.body === true;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    const message = formatZodError(error);
    return createErrorResponse(`入力データの検証に失敗しました: ${message}`, 400);
  }

  if (isSyntaxErrorWithBody(error)) {
    return createErrorResponse('リクエストボディのJSON形式が正しくありません', 400);
  }

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
 * Interface for objects that can provide JSON data
 * Follows Dependency Inversion Principle - depends on abstraction, not concretion
 */
export interface JsonReadable {
  json(): Promise<unknown>;
}

/**
 * リクエストデータの安全なパース
 * Works with any JsonReadable (Request, mock, etc.) - Dependency Inversion Principle
 */
export async function parseRequestBody(source: JsonReadable): Promise<unknown> {
  try {
    return await source.json();
  } catch {
    throw createError.badRequest('リクエストボディの解析に失敗しました');
  }
}