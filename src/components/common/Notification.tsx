import React, { useEffect, useRef } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  show: boolean;
  message: string;
  type: NotificationType;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NOTIFICATION_CONFIG = {
  success: {
    style: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-500',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
  },
  error: {
    style: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
  },
  warning: {
    style: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
    iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
  },
  info: {
    style: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
    iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
  }
} as const;

const NotificationIcon = ({ type }: { type: NotificationType }) => (
  <svg 
    className={`h-5 w-5 mr-3 flex-shrink-0 ${NOTIFICATION_CONFIG[type].iconColor}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path fillRule="evenodd" d={NOTIFICATION_CONFIG[type].iconPath} clipRule="evenodd" />
  </svg>
);

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    className="ml-4 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
    aria-label="通知を閉じる"
    type="button"
  >
    閉じる
  </button>
);

export const Notification: React.FC<NotificationProps> = React.memo(({
  show,
  message,
  type,
  onClose,
  autoClose = false,
  duration = 5000
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (show && autoClose && onClose) {
      timeoutRef.current = setTimeout(onClose, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  const config = NOTIFICATION_CONFIG[type];

  return (
    <div 
      className={`mb-4 p-4 border rounded-lg shadow-sm transition-all duration-300 ${config.style}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <NotificationIcon type={type} />
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        
        {onClose && <CloseButton onClose={onClose} />}
      </div>
    </div>
  );
});

Notification.displayName = 'Notification';