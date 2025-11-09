import React from 'react';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

const NOTIFICATION_STYLES = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700'
} as const;

const ICON_PATHS = {
  success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
  error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
} as const;

export const Notification: React.FC<NotificationProps> = ({
  show,
  message,
  type,
  onClose
}) => {
  if (!show) return null;

  const bgColor = NOTIFICATION_STYLES[type];
  const iconPath = ICON_PATHS[type];

  return (
    <div 
      className={`mb-4 p-4 border rounded-md ${bgColor}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg 
            className="h-5 w-5 mr-2" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
          </svg>
          <span className="font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            aria-label="通知を閉じる"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
};