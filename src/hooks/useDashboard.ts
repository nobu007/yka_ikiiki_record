import { useCallback, useEffect } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { getUserFriendlyMessage, normalizeError, errorTypeGuards } from '@/lib/error-handler';

const DASHBOARD_MESSAGES = {
  generating: 'テストデータを生成中...',
  success: 'テストデータの生成が完了しました',
  error: {
    network: 'ネットワーク接続を確認してください',
    validation: '入力内容を確認してください',
    timeout: 'タイムアウトしました。再度お試しください',
    default: 'データの生成に失敗しました'
  }
} as const;

const getErrorMessage = (error: unknown): string => {
  if (errorTypeGuards.isNetworkError(error)) {
    return DASHBOARD_MESSAGES.error.network;
  }
  if (errorTypeGuards.isValidationError(error)) {
    return DASHBOARD_MESSAGES.error.validation;
  }
  if (errorTypeGuards.isTimeoutError(error)) {
    return DASHBOARD_MESSAGES.error.timeout;
  }
  return DASHBOARD_MESSAGES.error.default;
};

export function useDashboard() {
  const { generateSeed, isGenerating, error } = useSeedGeneration();
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  // Combined effect for error handling and notification clearing
  useEffect(() => {
    // Clear notification when generation starts
    if (isGenerating && notification.show) {
      clearNotification();
      return;
    }

    // Handle errors with specific messages
    if (error && !notification.show) {
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    }
  }, [isGenerating, error, notification.show, clearNotification, showError]);

  // Generate initial data with improved error handling
  const handleInitialGeneration = useCallback(async () => {
    try {
      clearNotification();
      
      // Generate 30 days of test data with default configuration
      await generateSeed({
        ...DEFAULT_CONFIG,
        periodDays: 30
      });
      
      showSuccess(DASHBOARD_MESSAGES.success);
    } catch (e) {
      const normalizedError = normalizeError(e);
      console.error('初期データ生成エラー:', normalizedError);
      
      // Fallback error handling if useEffect doesn't catch it
      if (!notification.show) {
        showError(getUserFriendlyMessage(normalizedError));
      }
    }
  }, [generateSeed, showSuccess, showError, clearNotification, notification.show]);

  return {
    isGenerating,
    notification,
    handleInitialGeneration,
    isLoadingMessage: isGenerating ? DASHBOARD_MESSAGES.generating : null
  };
}