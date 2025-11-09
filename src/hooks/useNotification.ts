import { useState, useCallback } from 'react';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showSuccess = useCallback((message: string) => {
    setNotification({ show: true, message, type: 'success' });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setNotification({ show: true, message, type: 'error' });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    hideNotification
  };
}