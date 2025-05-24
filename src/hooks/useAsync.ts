import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T = any>(options: UseAsyncOptions = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await asyncFunction();
        setState(prev => ({ ...prev, data, isLoading: false }));
        options.onSuccess?.(data);
        return data;
      } catch (e) {
        const error = e instanceof Error ? e : new Error('不明なエラーが発生しました');
        setState(prev => ({ ...prev, error, isLoading: false }));
        options.onError?.(error);
        throw error;
      }
    },
    [options]
  );

  return {
    ...state,
    execute,
  };
}