import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, withErrorHandler, parseRequestBody, createError } from './error-handler';
import { AppError, NetworkError, logError } from '@/lib/error-handler';

// Mock the logError function
jest.mock('@/lib/error-handler', () => ({
  ...jest.requireActual('@/lib/error-handler'),
  logError: jest.fn()
}));

const mockedLogError = logError as jest.MockedFunction<typeof logError>;

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
      expect(mockedLogError).not.toHaveBeenCalled();
    });

    test('handles JSON parse error correctly', () => {
      const syntaxError = new SyntaxError('Unexpected token in JSON') as SyntaxError & { body: boolean };
      syntaxError.body = true;

      const response = handleApiError(syntaxError);
      
      // Check that response is created (SyntaxError with body doesn't log to API)
      expect(response).toBeDefined();
      expect(mockedLogError).not.toHaveBeenCalled();
    });

    test('handles AppError correctly', () => {
      const appError = new AppError('Test error', 'TEST_ERROR', 422);

      const response = handleApiError(appError);
      
      expect(response).toBeDefined();
      expect(mockedLogError).toHaveBeenCalledWith(appError, 'API');
    });

    test('handles NetworkError correctly', () => {
      const networkError = new NetworkError('Network failed');

      const response = handleApiError(networkError);
      
      expect(response).toBeDefined();
      expect(mockedLogError).toHaveBeenCalledWith(networkError, 'API');
    });

    test('handles generic Error correctly', () => {
      const genericError = new Error('Generic error');

      const response = handleApiError(genericError);
      
      expect(response).toBeDefined();
      expect(mockedLogError).toHaveBeenCalledWith(genericError, 'API');
    });

    test('handles string error correctly', () => {
      const stringError = 'String error';

      const response = handleApiError(stringError);
      
      expect(response).toBeDefined();
      expect(mockedLogError).toHaveBeenCalledWith(stringError, 'API');
    });

    test('handles unknown error correctly', () => {
      const unknownError = { some: 'object' };

      const response = handleApiError(unknownError);
      
      expect(response).toBeDefined();
      expect(mockedLogError).toHaveBeenCalledWith(unknownError, 'API');
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
      expect(mockedLogError).toHaveBeenCalledWith(new Error('Handler error'), 'API');
    });
  });

  describe('parseRequestBody', () => {
    test('parses valid JSON successfully', async () => {
      const mockReq = {
        json: jest.fn().mockResolvedValue({ test: 'data' })
      } as unknown as Request;

      const result = await parseRequestBody(mockReq);
      
      expect(mockReq.json).toHaveBeenCalled();
      expect(result).toEqual({ test: 'data' });
    });

    test('throws bad request error on JSON parse failure', async () => {
      const mockReq = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request;

      await expect(parseRequestBody(mockReq)).rejects.toThrow('リクエストボディの解析に失敗しました');
      expect(mockReq.json).toHaveBeenCalled();
    });
  });
});