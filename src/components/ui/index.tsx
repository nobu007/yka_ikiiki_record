// Simplified UI components

import React from 'react';
import { MESSAGES, UI_CONFIG } from '@/lib/config';

// Loading spinner component
export const LoadingSpinner = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md'; color?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6'
  };
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-${color}-500 ${sizeClasses[size]}`}
      role="status"
      aria-label="読み込み中"
    />
  );
};

// Icon components
export const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export const PlusIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const NotificationIcon = ({ type }: { type: 'success' | 'error' | 'warning' | 'info' }) => {
  const iconConfig = {
    success: { color: 'text-green-500', path: 'M5 13l4 4L19 7' },
    error: { color: 'text-red-500', path: 'M6 18L18 6M6 6l12 12' },
    warning: { color: 'text-yellow-500', path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    info: { color: 'text-blue-500', path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  };

  const config = iconConfig[type];

  return (
    <svg className={`w-5 h-5 ${config.color} mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.path} />
    </svg>
  );
};

// Notification component
export const Notification = ({ show, message, type, onClose }: {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}) => {
  if (!show) return null;

  const styleClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div 
      className={`mb-4 p-4 border rounded-lg shadow-sm transition-all duration-300 ${styleClasses[type]}`}
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

// Loading overlay component
export const LoadingOverlay = ({ isLoading, message }: { isLoading: boolean; message?: string }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <LoadingSpinner size="md" />
        <p className="mt-4 text-gray-700">{message || MESSAGES.loading.generating}</p>
      </div>
    </div>
  );
};

// Error boundary component
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">ページを再読み込みしてください</p>
            <button 
              onClick={() => window.location.reload()}
              className={UI_CONFIG.buttonStyles.primary}
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Button component
export const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  type = 'button',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
}) => {
  const baseClasses = UI_CONFIG.buttonStyles[variant];
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={combinedClasses}
    >
      {children}
    </button>
  );
};