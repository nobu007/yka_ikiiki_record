import { useCallback, useEffect } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { getUserFriendlyMessage, normalizeError, logError } from '@/lib/error-handler';
import { SUCCESS_MESSAGES, LOADING_MESSAGES } from '@/lib/constants/messages';

const GENERATION_CONFIG = { ...DEFAULT_CONFIG, periodDays: 30 } as const;

export function useDashboard() {
  const { generateSeed, isGenerating, error } = useSeedGeneration();
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  // Simplified effect - only handle state changes
  useEffect(() => {
    if (isGenerating) {
      clearNotification();
      return;
    }
    
    if (error && !notification.show) {
      showError(getUserFriendlyMessage(error));
    }
  }, [isGenerating, error, notification.show, showError, clearNotification]);

  const handleInitialGeneration = useCallback(async () => {
    try {
      clearNotification();
      await generateSeed(GENERATION_CONFIG);
      showSuccess(SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE);
    } catch (e) {
      const normalizedError = normalizeError(e);
      logError(normalizedError, 'useDashboard.handleInitialGeneration');
      
      // Only show error if no notification is currently showing
      if (!notification.show) {
        showError(getUserFriendlyMessage(normalizedError));
      }
    }
  }, [generateSeed, showSuccess, showError, clearNotification, notification.show]);

  const isLoadingMessage = isGenerating ? LOADING_MESSAGES.GENERATING_DATA : null;

  return {
    isGenerating,
    notification,
    handleInitialGeneration,
    isLoadingMessage
  };
}