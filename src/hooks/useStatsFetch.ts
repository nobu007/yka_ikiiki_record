import { useState, useCallback } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { StatsResponseSchema, StatsResponse } from '@/schemas/stats';

const fetcher = async (url: string): Promise<StatsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('APIリクエストに失敗しました');
  }
  const data = await response.json();
  return StatsResponseSchema.parse(data);
};

export function useStatsFetch() {
  const [error, setError] = useState<Error | null>(null);

  const {
    data: stats,
    error: swrError,
    isLoading,
    mutate
  } = useSWR<StatsResponse>('/api/stats', fetcher, {
    onError: (err) => {
      console.error('統計データの取得に失敗しました:', err);
      setError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
    }
  });

  const refetch: KeyedMutator<StatsResponse> = useCallback(() => {
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