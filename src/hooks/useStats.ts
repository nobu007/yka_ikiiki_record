import useSWR, { KeyedMutator } from 'swr';
import { StatsResponseSchema, StatsResponse } from '@/schemas/api';
import { useState, useCallback } from 'react';

const fetcher = async (url: string): Promise<StatsResponse> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('APIリクエストに失敗しました');
    }
    const data = await response.json();
    return StatsResponseSchema.parse(data);
  } catch (e) {
    const error = e instanceof Error ? e : new Error('不明なエラーが発生しました');
    console.error('統計データの取得に失敗しました:', error);
    throw error;
  }
};

export function useStats() {
  const [error, setError] = useState<Error | null>(null);

  const {
    data: stats,
    error: swrError,
    isLoading,
    mutate
  } = useSWR<StatsResponse>('/api/stats', fetcher, {
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
    }
  });

  const refetch = useCallback(() => {
    setError(null);
    return mutate();
  }, [mutate]);

  return {
    stats,
    error: error || swrError,
    isLoading,
    refetch
  };
}