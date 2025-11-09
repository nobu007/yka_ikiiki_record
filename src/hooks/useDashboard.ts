import { useCallback, useEffect } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { getUserFriendlyMessage, normalizeError } from '@/lib/error-handler';

const GENERATION_CONFIG = { ...DEFAULT_CONFIG, periodDays: 30 } as const;

export function useDashboard() {
  const { generateSeed, isGenerating, error } = useSeedGeneration();
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  useEffect(() => {
    if (isGenerating) {
      clearNotification();
    } else if (error && !notification.show) {
      showError(getUserFriendlyMessage(error));
    }
  }, [isGenerating, error, notification.show, clearNotification, showError]);

  const handleInitialGeneration = useCallback(async () => {
    try {
      clearNotification();
      await generateSeed(GENERATION_CONFIG);
      showSuccess('テストデータの生成が完了しました');
    } catch (e) {
      const normalizedError = normalizeError(e);
      console.error('初期データ生成エラー:', normalizedError);
      if (!notification.show) {
        showError(getUserFriendlyMessage(normalizedError));
      }
    }
  }, [generateSeed, showSuccess, showError, clearNotification, notification.show]);

  return {
    isGenerating,
    notification,
    handleInitialGeneration,
    isLoadingMessage: isGenerating ? 'テストデータを生成中...' : null
  };
}