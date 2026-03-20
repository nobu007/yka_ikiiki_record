import { useState, useCallback } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

/**
 * State object returned by useAsync hook
 *
 * @template T - The type of data being loaded
 */
export interface AsyncState<T> {
  /** The loaded data, or null if not yet loaded */
  data: T | null;
  /** True while the async operation is in progress */
  isLoading: boolean;
  /** Error object if the async operation failed */
  error: Error | null;
}

/**
 * Options for configuring useAsync hook behavior
 *
 * @template T - The type of data being loaded
 */
export interface UseAsyncOptions<T> {
  /** Callback invoked when async operation succeeds */
  onSuccess?: (data: T) => void;
  /** Callback invoked when async operation fails */
  onError?: (error: Error) => void;
}

/**
 * Return type for useAsync hook
 *
 * @template T - The type of data being loaded
 */
export type UseAsyncResult<T> = AsyncState<T> & {
  /** Function to execute an async operation */
  execute: (asyncFunction: () => Promise<T>) => Promise<T>;
};

/**
 * React hook for managing async operation state and callbacks.
 *
 * Provides a convenient way to handle async operations with automatic
 * loading state management, error handling, and success/error callbacks.
 *
 * @template T - The type of data returned by the async operation
 * @param {UseAsyncOptions<T>} options - Optional callbacks for success/error handling
 * @returns {UseAsyncResult<T>} Object containing state and execute function
 *
 * @example
 * ```tsx
 * function DataComponent() {
 *   const { data, isLoading, error, execute } = useAsync<Data>({
 *     onSuccess: (data) => console.log('Loaded:', data),
 *     onError: (error) => console.error('Failed:', error),
 *   });
 *
 *   const loadData = () => {
 *     execute(() => fetch('/api/data').then(r => r.json()));
 *   };
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!data) return <button onClick={loadData}>Load Data</button>;
 *
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useAsync<T = unknown>(
  options: UseAsyncOptions<T> = {},
): UseAsyncResult<T> {
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
        const error =
          e instanceof Error ? e : new Error(ERROR_MESSAGES.UNKNOWN);
        setState({ data: null, isLoading: false, error });
        options.onError?.(error);
        throw error;
      }
    },
    [options],
  );

  return { ...state, execute };
}
