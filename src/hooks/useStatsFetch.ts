import useSWR from 'swr';
import { StatsResponse, StatsResponseSchema } from '@/types/api';

const RETRY_COUNT = 3;
const RETRY_INTERVAL = 1000;
const REFRESH_INTERVAL = 30000; // 30秒

async function fetcher(url: string): Promise<StatsResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`Error ${response.status}: ${await response.text()}`);
    error.name = 'FetchError';
    throw error;
  }

  const data = await response.json();
  // Zodでバリデーション
  return StatsResponseSchema.parse(data);
}

export function useStatsFetch() {
  const { data, error, isLoading, mutate } = useSWR<StatsResponse>(
    '/api/stats',
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
      onErrorRetry: (error, key, config, revalidate, { retryCount = 0 }) => {
        if (retryCount >= RETRY_COUNT) return;
        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), RETRY_INTERVAL);
      }
    }
  );

  return {
    stats: data,
    error,
    isLoading,
    refetch: mutate
  };
}