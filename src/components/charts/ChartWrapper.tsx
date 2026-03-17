'use client';

import { ReactNode, memo } from 'react';

// Define chart constants to avoid magic numbers
const DEFAULT_CHART_HEIGHT = 300;

interface ChartWrapperProps {
  title?: string;
  height?: number;
  isLoading?: boolean;
  error?: Error | null;
  children: ReactNode;
  isDark?: boolean;
}

export const ChartWrapper = memo<ChartWrapperProps>(({
  title,
  height = DEFAULT_CHART_HEIGHT,
  isLoading,
  error,
  children,
  isDark = false
}) => {
  const headingColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const chartId = `chart-${title?.replace(/\s+/g, '-') ?? 'default'}`;

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center"
        role="status"
        aria-label="グラフローディング中"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center text-red-500"
        role="alert"
        aria-label="グラフエラー"
      >
        <p>グラフの表示中にエラーが発生しました: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{ height }}
      role="region"
      aria-label={title || '統計グラフ'}
    >
      {title && (
        <h3
          className={`text-lg font-semibold mb-4 ${headingColor}`}
          id={`${chartId}-title`}
        >
          {title}
        </h3>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
});

ChartWrapper.displayName = 'ChartWrapper';

export default ChartWrapper;