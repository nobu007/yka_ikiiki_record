import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
} as const;

const COLOR_CLASSES = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white'
} as const;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = '読み込み中'
}) => {
  return (
    <div className={`flex justify-center items-center ${className}`} role="status" aria-label={label}>
      <svg
        className={`animate-spin ${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

/**
 * ローディングオーバーレイコンポーネント
 */
export const LoadingOverlay: React.FC<{ isLoading: boolean; message?: string }> = ({
  isLoading,
  message = '読み込み中...'
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-700 text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * ローディングカードコンポーネント
 */
export const LoadingCard: React.FC<{ message?: string }> = ({
  message = 'データを読み込み中...'
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};