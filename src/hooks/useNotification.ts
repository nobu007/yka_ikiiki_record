import { useState, useCallback, useRef, useEffect } from 'react';

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
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const clearNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const showNotification = useCallback((
    message: string, 
    type: NotificationState['type'], 
    autoClose: boolean = true
  ) => {
    clearNotification();
    setNotification({ show: true, message, type });
    
    if (autoClose) {
      timeoutRef.current = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, NOTIFICATION_TIMEOUTS[type]);
    }
  }, [clearNotification]);

  const showSuccess = useCallback((message: string, autoClose = true) => {
    showNotification(message, 'success', autoClose);
  }, [showNotification]);

  const showError = useCallback((message: string, autoClose = true) => {
    showNotification(message, 'error', autoClose);
  }, [showNotification]);

  const showWarning = useCallback((message: string, autoClose = true) => {
    showNotification(message, 'warning', autoClose);
  }, [showNotification]);

  const showInfo = useCallback((message: string, autoClose = true) => {
    showNotification(message, 'info', autoClose);
  }, [showNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearNotification,
    hideNotification: clearNotification
  };
}