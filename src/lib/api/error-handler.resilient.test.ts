import { NextResponse } from 'next/server';

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

import { withResilientHandler, parseRequestBody, JsonReadable } from './error-handler';
import { globalCircuitBreaker, globalLogger } from '@/lib/resilience';

describe('Resilient API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withResilientHandler', () => {
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

    test('logs non-Error errors and converts to API response', async () => {
      const mockHandler = jest.fn().mockRejectedValue('String error');

      const result = await withResilientHandler(mockHandler, {
        operationName: 'TEST_STRING_ERROR'
      });

      expect(globalLogger.error).toHaveBeenCalledWith(
        'API',
        'HANDLER_ERROR',
        expect.objectContaining({
          operation: 'TEST_STRING_ERROR',
          error: 'String error'
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
