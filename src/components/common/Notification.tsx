import React from 'react';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  show,
  message,
  type,
  onClose
}) => {
  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
  const iconPath = type === 'success' 
    ? 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
    : 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';

  return (
    <div className={`mb-4 p-4 border rounded-md ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className={`h-5 w-5 mr-2 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-sm underline hover:no-underline"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
};