// Simplified application hooks

import { useState, useCallback } from 'react';
import { APP_CONFIG, MESSAGES } from '@/lib/config';
import { normalizeError, getUserFriendlyMessage, logError } from '@/lib/error-handler';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Simple notification hook
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((message: string, type: NotificationState['type'] = 'info') => {
    setNotification({ show: true, message, type });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  return { notification, showNotification, clearNotification };
}

// Simplified dashboard hook
export function useDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((message: string, type: NotificationState['type'] = 'info') => {
    setNotification({ show: true, message, type });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const handleGenerate = useCallback(async () => {
    try {
      setIsGenerating(true);
      clearNotification();

      const config = {
        periodDays: APP_CONFIG.generation.defaultPeriodDays,
        studentCount: APP_CONFIG.generation.defaultStudentCount,
        distributionPattern: APP_CONFIG.generation.defaultPattern
      };

      const response = await fetch(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.seed}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error(MESSAGES.error.api(response.status, response.statusText));
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || MESSAGES.error.generation);
      }

      showNotification(MESSAGES.success.dataGeneration, 'success');
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError, 'useDashboard.handleGenerate');
      showNotification(getUserFriendlyMessage(appError), 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [clearNotification, showNotification]);

  return {
    isGenerating,
    notification,
    handleGenerate,
    isLoadingMessage: isGenerating ? MESSAGES.loading.generating : null
  };
}