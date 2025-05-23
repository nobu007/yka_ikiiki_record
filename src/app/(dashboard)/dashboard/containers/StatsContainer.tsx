'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { Stats } from '@/types/stats';
import StatsDisplay from '../components/stats/StatsDisplay';

const fetcher = (url: string) =>
  fetch(url).then(async res => {
    if (!res.ok) {
      const error = new Error(`Error ${res.status}: ${await res.text()}`);
      error.name = 'FetchError';
      throw error;
    }
    return res.json();
  });

const RETRY_COUNT = 3;
const RETRY_INTERVAL = 1000;

export default function StatsContainer() {
  const { data: stats, error, isLoading, mutate } = useSWR<Stats>(
    '/api/stats',
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとに自動更新
      onErrorRetry: (error, key, config, revalidate, { retryCount = 0 }) => {
        if (retryCount >= RETRY_COUNT) return;
        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), RETRY_INTERVAL);
      }
    }
  );

  const retryFetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <StatsDisplay
      stats={stats as Stats}
      isLoading={isLoading}
      error={error as Error}
      onRetry={retryFetch}
    />
  );
}