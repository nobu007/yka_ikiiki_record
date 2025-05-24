import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * APIエラーをハンドリングする
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return createErrorResponse(error.message, error.statusCode);
  }

  if (error instanceof z.ZodError) {
    const message = error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    return createErrorResponse(message, 400);
  }

  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }

  return createErrorResponse('予期せぬエラーが発生しました');
}

/**
 * 特定のエラーを生成する
 */
export const createError = {
  badRequest: (message: string) => new AppError(message, 400),
  unauthorized: (message: string) => new AppError(message, 401),
  forbidden: (message: string) => new AppError(message, 403),
  notFound: (message: string) => new AppError(message, 404),
  internal: (message: string) => new AppError(message, 500)
};

/**
 * APIハンドラーをエラーハンドリングで包む
 */
export function withErrorHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch(handleApiError);
}