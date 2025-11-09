import { useState, useCallback } from 'react';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const NOTIFICATION_TIMEOUTS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000
} as const;

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = useCallback((
    message: string, 
    type: NotificationState['type'], 
    autoClose: boolean = true
  ) => {
    setNotification({ show: true, message, type });
    
    if (autoClose) {
      const timeout = NOTIFICATION_TIMEOUTS[type];
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, timeout);
    }
  }, []);

  const showSuccess = useCallback((message: string, autoClose: boolean = true) => {
    showNotification(message, 'success', autoClose);
  }, [showNotification]);

  const showError = useCallback((message: string, autoClose: boolean = true) => {
    showNotification(message, 'error', autoClose);
  }, [showNotification]);

  const showWarning = useCallback((message: string, autoClose: boolean = true) => {
    showNotification(message, 'warning', autoClose);
  }, [showNotification]);

  const showInfo = useCallback((message: string, autoClose: boolean = true) => {
    showNotification(message, 'info', autoClose);
  }, [showNotification]);

  const clearNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  // Alias for backward compatibility
  const hideNotification = clearNotification;

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearNotification,
    hideNotification
  };
}