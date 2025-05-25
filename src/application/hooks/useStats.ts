import useSWR, { KeyedMutator } from 'swr';
import { StatsResponseSchema, StatsResponse } from '@/schemas/api';
import { useState, useCallback } from 'react';
import { validateDataSafe } from '@/lib/api/validation';

const fetcher = async (url: string): Promise<StatsResponse> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('APIリクエストに失敗しました');
    }

    const rawData = await response.json();

    // レスポンスデータの検証
    const [validated, error] = validateDataSafe(rawData, StatsResponseSchema);
    if (error || !validated) {
      throw new Error(error || 'データの検証に失敗しました');
    }

    // success: falseの場合はエラー扱い
    if (!validated.success) {
      throw new Error(validated.error || '不明なエラーが発生しました');
    }

    return validated;
  } catch (e) {
    const error = e instanceof Error ? e : new Error('不明なエラーが発生しました');
    console.error('統計データの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * 統計データを取得・管理するアプリケーションHook
 * - APIとの通信
 * - データの検証
 * - エラーハンドリング
 */
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
    stats: stats?.data,
    error: error || swrError,
    isLoading,
    refetch
  };
}