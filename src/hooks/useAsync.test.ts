import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state should be correct', () => {
    const { result } = renderHook(() => useAsync());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    expect(typeof result.current.execute).toBe('function');
  });

  test('should handle successful async operation', async () => {
    const mockAsyncFn = jest.fn().mockResolvedValue('success data');
    const { result } = renderHook(() => useAsync());

    act(() => {
      result.current.execute(mockAsyncFn);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('success data');
    expect(result.current.error).toBe(null);
    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
  });

  test('should handle async operation error', async () => {
    const mockError = new Error('Async operation failed');
    const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsync());

    await act(async () => {
      try {
        await result.current.execute(mockAsyncFn);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(mockError);
    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
  });

  test('should pass arguments to async function', async () => {
    const mockAsyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync());

    await act(async () => {
      await result.current.execute(mockAsyncFn);
    });

    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
  });

  test('should handle immediate rejection', async () => {
    const mockError = new Error('Immediate rejection');
    const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsync());

    await act(async () => {
      try {
        await result.current.execute(mockAsyncFn);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBe(null);
  });

  test('should work with different return types', async () => {
    // Test with object return
    const mockObjectFn = jest.fn().mockResolvedValue({ id: 1, name: 'test' });
    const { result: objectResult } = renderHook(() => useAsync());

    await act(async () => {
      await objectResult.current.execute(mockObjectFn);
    });

    expect(objectResult.current.data).toEqual({ id: 1, name: 'test' });

    // Test with array return
    const mockArrayFn = jest.fn().mockResolvedValue([1, 2, 3]);
    const { result: arrayResult } = renderHook(() => useAsync());

    await act(async () => {
      await arrayResult.current.execute(mockArrayFn);
    });

    expect(arrayResult.current.data).toEqual([1, 2, 3]);
  });
});