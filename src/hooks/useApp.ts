// Consolidated application hooks

import { useState, useCallback, useEffect } from 'react';
import { APP_CONFIG, MESSAGES } from '@/lib/config';
import { AppError, normalizeError, getUserFriendlyMessage, logError } from '@/lib/error-handler';

// Notification state
interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// API state
interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

// Simplified notification hook
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((message: string, type: NotificationState['type'] = 'info') => {
    setNotification({ show: true, message, type });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setNotification({ show: true, message, type: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setNotification({ show: true, message, type: 'error' });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    clearNotification
  };
}

// Simplified data generation hook
export function useDataGeneration() {
  const [state, setState] = useState<ApiState>({
    data: null,
    loading: false,
    error: null
  });

  const generate = useCallback(async (config: any): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
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

      setState({ data, loading: false, error: null });
    } catch (e) {
      const error = normalizeError(e);
      logError(error, 'useDataGeneration.generate');
      setState(prev => ({ ...prev, loading: false, error }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    generate,
    reset,
    isGenerating: state.loading
  };
}

// Simplified dashboard hook
export function useDashboard() {
  const { generate, isGenerating, error } = useDataGeneration();
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  // Handle error display
  useEffect(() => {
    if (error && !isGenerating && !notification.show) {
      showError(getUserFriendlyMessage(error));
    }
  }, [error, isGenerating, notification.show, showError]);

  // Clear notification when generating
  useEffect(() => {
    if (isGenerating) {
      clearNotification();
    }
  }, [isGenerating, clearNotification]);

  const handleGenerate = useCallback(async () => {
    try {
      clearNotification();
      const config = {
        periodDays: APP_CONFIG.generation.defaultPeriodDays,
        studentCount: APP_CONFIG.generation.defaultStudentCount,
        distributionPattern: APP_CONFIG.generation.defaultPattern
      };
      
      await generate(config);
      showSuccess(MESSAGES.success.dataGeneration);
    } catch (e) {
      const error = normalizeError(e);
      logError(error, 'useDashboard.handleGenerate');
      showError(getUserFriendlyMessage(error));
    }
  }, [generate, showSuccess, showError, clearNotification]);

  return {
    isGenerating,
    notification,
    handleGenerate,
    isLoadingMessage: isGenerating ? MESSAGES.loading.generating : null
  };
}