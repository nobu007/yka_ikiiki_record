import { useCallback, useMemo } from 'react';
import { useStats as useApplicationStats } from '@/application/hooks/useStats';
import { Stats } from '@/domain/entities/Stats';

/**
 * 統計データを表示するためのプレゼンテーションHook
 * - UIの状態管理
 * - データの整形
 * - エラーメッセージの表示制御
 */
export const useStats = () => {
  const { stats, error, isLoading, refetch } = useApplicationStats();

  // エラーメッセージの整形
  const displayError = useMemo(() => {
    if (!error) return null;
    return {
      title: 'エラーが発生しました',
      message: error.message
    };
  }, [error]);

  // 表示用データの整形
  const displayStats = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
      // 必要に応じて表示用のデータ整形を追加
    } as Stats;
  }, [stats]);

  // リフェッチのラッパー
  const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('データの更新に失敗しました:', err);
    }
  }, [refetch]);

  return {
    stats: displayStats,
    error: displayError,
    isLoading,
    refetch: handleRefetch
  };
};