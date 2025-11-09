import { useCallback } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { getUserFriendlyMessage } from '@/lib/error-handler';

export function useDashboard() {
  const { generateSeed, isGenerating, error } = useSeedGeneration();
  const { notification, showSuccess, showError } = useNotification();

  // エラーが発生した場合は通知を表示
  if (error && !notification.show) {
    showError(getUserFriendlyMessage(error));
  }

  // 初期データの生成
  const handleInitialGeneration = useCallback(async () => {
    try {
      // デフォルト設定で30日分のデータを生成
      await generateSeed({
        ...DEFAULT_CONFIG,
        periodDays: 30
      });
      showSuccess('テストデータの生成が完了しました');
    } catch (e) {
      console.error('初期データ生成エラー:', e);
      showError('データの生成に失敗しました');
    }
  }, [generateSeed, showSuccess, showError]);

  return {
    isGenerating,
    notification,
    handleInitialGeneration
  };
}