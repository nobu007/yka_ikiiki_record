import { useCallback, useMemo } from 'react';
import { useStats as useApplicationStats } from '@/application/hooks/useStats';

export const useStats = () => {
  const { stats, error, isLoading, refetch } = useApplicationStats();

  const displayError = useMemo(() => {
    if (!error) return null;
    return {
      title: 'エラーが発生しました',
      message: error.message
    };
  }, [error]);

  const displayStats = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
    };
  }, [stats]);

  const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch {
    }
  }, [refetch]);

  return {
    stats: displayStats,
    error: displayError,
    isLoading,
    refetch: handleRefetch
  };
};