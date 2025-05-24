import { useState } from 'react';
import { Stats } from '@/domain/entities/Stats';
import { useAsync } from '@/hooks/useAsync';

export const useStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  const { execute: fetchStats, isLoading, error } = useAsync({
    onSuccess: (data: Stats) => {
      setStats(data);
    },
    onError: (error: Error) => {
      console.error('統計データの取得に失敗しました:', error);
    }
  });

  const fetchStatsData = async () => {
    const response = await fetch('/api/stats');
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '統計データの取得に失敗しました');
    }

    return data.data;
  };

  return {
    stats,
    fetchStats: () => fetchStats(fetchStatsData),
    isLoading,
    error
  };
};