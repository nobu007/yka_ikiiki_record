import { useCallback, useEffect } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { getUserFriendlyMessage, normalizeError } from '@/lib/error-handler';

const DASHBOARD_MESSAGES = {
  generating: 'テストデータを生成中...',
  success: 'テストデータの生成が完了しました'
} as const;

export function useDashboard() {
  const { generateSeed, isGenerating, error } = useSeedGeneration();
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  // Simplified effect for error handling and notification clearing
  useEffect(() => {
    if (isGenerating && notification.show) {
      clearNotification();
      return;
    }

    if (error && !notification.show) {
      showError(getUserFriendlyMessage(error));
    }
  }, [isGenerating, error, notification.show, clearNotification, showError]);

  // Simplified data generation with error handling
  const handleInitialGeneration = useCallback(async () => {
    try {
      clearNotification();
      
      await generateSeed({
        ...DEFAULT_CONFIG,
        periodDays: 30
      });
      
      showSuccess(DASHBOARD_MESSAGES.success);
    } catch (e) {
      const normalizedError = normalizeError(e);
      console.error('初期データ生成エラー:', normalizedError);
      
      if (!notification.show) {
        showError(getUserFriendlyMessage(normalizedError));
      }
    }
  }, [generateSeed, showSuccess, showError, clearNotification]);

  return {
    isGenerating,
    notification,
    handleInitialGeneration,
    isLoadingMessage: isGenerating ? DASHBOARD_MESSAGES.generating : null
  };
}