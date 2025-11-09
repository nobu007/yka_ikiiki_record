import { useCallback, useEffect, useMemo } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { getUserFriendlyMessage, normalizeError, logError } from '@/lib/error-handler';
import { SUCCESS_MESSAGES, LOADING_MESSAGES } from '@/lib/constants/messages';

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
      showSuccess(SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE);
    } catch (e) {
      const normalizedError = normalizeError(e);
      logError(normalizedError, 'useDashboard.handleInitialGeneration');
      if (!notification.show) {
        showError(getUserFriendlyMessage(normalizedError));
      }
    }
  }, [generateSeed, showSuccess, showError, clearNotification, notification.show]);

  const isLoadingMessage = useMemo(() => 
    isGenerating ? LOADING_MESSAGES.GENERATING_DATA : null, 
    [isGenerating]
  );

  return {
    isGenerating,
    notification,
    handleInitialGeneration,
    isLoadingMessage
  };
}