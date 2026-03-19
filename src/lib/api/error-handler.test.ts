import { NextResponse } from 'next/server';
import { z } from 'zod';

// Mock modules BEFORE imports
jest.mock('@/lib/error-handler', () => ({
  ...jest.requireActual('@/lib/error-handler'),
  logError: jest.fn()
}));

jest.mock('@/lib/resilience', () => {
  const actual = jest.requireActual('@/lib/resilience');
  return {
    ...actual,
    globalCircuitBreaker: {
      execute: jest.fn(<T>(operation: () => Promise<T>, _config?: unknown) => operation())
    },
    globalLogger: {
      info: jest.fn(),
      error: jest.fn()
    }
  };
});

import { handleApiError, withErrorHandler, withResilientHandler, parseRequestBody, createError, JsonReadable } from './error-handler';
import { AppError, NetworkError, logError, ERROR_CODES } from '@/lib/error-handler';
import { globalCircuitBreaker, globalLogger } from '@/lib/resilience';

describe('API Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiError', () => {
    test('handles ZodError correctly', () => {
      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: z.ZodParsedType.string,
          received: z.ZodParsedType.number,
          path: ['field1'],
          message: 'Expected string, received number'
        }
      ]);

      const response = handleApiError(zodError);
      
      // Check that response is created (ZodError doesn't log to API)
      expect(response).toBeDefined();
      expect(logError).not.toHaveBeenCalled();
    });

    test('handles JSON parse error correctly', () => {
      const syntaxError = new SyntaxError('Unexpected token in JSON');
      Object.assign(syntaxError, { body: true });

      const response = handleApiError(syntaxError);

      // Check that response is created (SyntaxError with body doesn't log to API)
      expect(response).toBeDefined();
      expect(logError).not.toHaveBeenCalled();
    });

    test('handles AppError correctly', () => {
      const appError = new AppError('Test error', ERROR_CODES.VALIDATION, 422);

      const response = handleApiError(appError);

      expect(response).toBeDefined();
      expect(logError).toHaveBeenCalledWith(appError, 'API');
    });

    test('handles NetworkError correctly', () => {
      const networkError = new NetworkError('Network failed');

      const response = handleApiError(networkError);
      
      expect(response).toBeDefined();
      expect(logError).toHaveBeenCalledWith(networkError, 'API');
    });

    test('handles generic Error correctly', () => {
      const genericError = new Error('Generic error');

      const response = handleApiError(genericError);
      
      expect(response).toBeDefined();
      expect(logError).toHaveBeenCalledWith(genericError, 'API');
    });

    test('handles string error correctly', () => {
      const stringError = 'String error';

      const response = handleApiError(stringError);
      
      expect(response).toBeDefined();
      expect(logError).toHaveBeenCalledWith(stringError, 'API');
    });

    test('handles unknown error correctly', () => {
      const unknownError = { some: 'object' };

      const response = handleApiError(unknownError);
      
      expect(response).toBeDefined();
      expect(logError).toHaveBeenCalledWith(unknownError, 'API');
    });
  });

  describe('createError', () => {
    test('creates bad request error with default message', () => {
      const error = createError.badRequest();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('リクエストが正しくありません');
      expect(error.statusCode).toBe(400);
    });

    test('creates bad request error with custom message', () => {
      const error = createError.badRequest('Custom bad request');
      expect(error.message).toBe('Custom bad request');
      expect(error.statusCode).toBe(400);
    });

    test('creates unauthorized error with default message', () => {
      const error = createError.unauthorized();
      expect(error.message).toBe('認証が必要です');
      expect(error.statusCode).toBe(401);
    });

    test('creates forbidden error with default message', () => {
      const error = createError.forbidden();
      expect(error.message).toBe('アクセスが拒否されました');
      expect(error.statusCode).toBe(403);
    });

    test('creates not found error with default message', () => {
      const error = createError.notFound();
      expect(error.message).toBe('リソースが見つかりません');
      expect(error.statusCode).toBe(404);
    });

    test('creates timeout error with default message', () => {
      const error = createError.timeout();
      expect(error.message).toBe('リクエストがタイムアウトしました');
      expect(error.statusCode).toBe(408);
    });

    test('creates generation error with default message', () => {
      const error = createError.generation();
      expect(error.message).toBe('データ生成に失敗しました');
      expect(error.statusCode).toBe(500);
    });

    test('creates internal error with default message', () => {
      const error = createError.internal();
      expect(error.message).toBe('サーバーエラーが発生しました');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('withErrorHandler', () => {
    test('wraps successful handler', async () => {
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const result = await withErrorHandler(mockHandler);

      expect(mockHandler).toHaveBeenCalled();
      const data = await result.json();
      expect(data).toEqual({ success: true });
    });

    test('catches and handles errors from handler', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Handler error'));

      const result = await withErrorHandler(mockHandler);

      expect(mockHandler).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(logError).toHaveBeenCalledWith(new Error('Handler error'), 'API');
    });
  });

  describe('withResilientHandler', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('executes handler successfully with resilience patterns', async () => {
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const result = await withResilientHandler(mockHandler, {
        operationName: 'TEST_SUCCESS'
      });

      expect(mockHandler).toHaveBeenCalled();
      expect(globalCircuitBreaker.execute).toHaveBeenCalled();
      expect(globalLogger.info).toHaveBeenCalledWith(
        'API',
        'SUCCESS',
        expect.objectContaining({
          operation: 'TEST_SUCCESS'
        })
      );

      const data = await result.json();
      expect(data).toEqual({ success: true });
    });

    test('applies timeout enforcement', async () => {
      const mockHandler = jest.fn().mockImplementation(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 200)
        )
      );

      const result = await withResilientHandler(mockHandler, {
        timeoutMs: 100,
        operationName: 'TEST_TIMEOUT'
      });

      expect(globalLogger.error).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.json).toBeDefined();
    });

    test('logs errors and converts to API response', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Handler error'));

      const result = await withResilientHandler(mockHandler, {
        operationName: 'TEST_ERROR'
      });

      expect(globalLogger.error).toHaveBeenCalledWith(
        'API',
        'HANDLER_ERROR',
        expect.objectContaining({
          operation: 'TEST_ERROR',
          error: 'Handler error'
        })
      );

      expect(result).toBeDefined();
    });

    test('uses custom circuit breaker config', async () => {
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const customConfig = {
        failureThreshold: 3,
        resetTimeout: 10000,
        monitoringPeriod: 30000
      };

      await withResilientHandler(mockHandler, {
        circuitBreakerConfig: customConfig
      });

      expect(globalCircuitBreaker.execute).toHaveBeenCalledWith(
        expect.any(Function),
        customConfig
      );
    });

    test('uses default timeout when not specified', async () => {
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));

      await withResilientHandler(mockHandler);

      expect(globalCircuitBreaker.execute).toHaveBeenCalled();
      expect(globalLogger.info).toHaveBeenCalledWith(
        'API',
        'SUCCESS',
        expect.objectContaining({
          timeoutMs: 10000
        })
      );
    });
  });

  describe('parseRequestBody', () => {
    test('parses valid JSON successfully', async () => {
      const mockSource: JsonReadable = {
        json: jest.fn().mockResolvedValue({ test: 'data' })
      };

      const result = await parseRequestBody(mockSource);

      expect(mockSource.json).toHaveBeenCalled();
      expect(result).toEqual({ test: 'data' });
    });

    test('throws bad request error on JSON parse failure', async () => {
      const mockSource: JsonReadable = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      await expect(parseRequestBody(mockSource)).rejects.toThrow('リクエストボディの解析に失敗しました');
      expect(mockSource.json).toHaveBeenCalled();
    });
  });
});