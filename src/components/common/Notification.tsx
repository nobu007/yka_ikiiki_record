import React, { useEffect, useRef } from 'react';
import { NotificationIcon } from './Icons';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  show: boolean;
  message: string;
  type: NotificationType;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NOTIFICATION_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

export const Notification: React.FC<NotificationProps> = ({
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

  return (
    <div 
      className={`mb-4 p-4 border rounded-lg shadow-sm transition-all duration-300 ${NOTIFICATION_STYLES[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <NotificationIcon type={type} />
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            aria-label="通知を閉じる"
            type="button"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
};