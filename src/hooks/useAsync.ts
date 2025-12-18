import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T = unknown>(options: UseAsyncOptions<T> = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState({ data: null, isLoading: true, error: null });
      
      try {
        const data = await asyncFunction();
        setState({ data, isLoading: false, error: null });
        options.onSuccess?.(data);
        return data;
      } catch (e) {
        const error = e instanceof Error ? e : new Error('不明なエラーが発生しました');
        setState({ data: null, isLoading: false, error });
        options.onError?.(error);
        throw error;
      }
    },
    [options]
  );

  return { ...state, execute };
}