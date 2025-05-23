'use client';

import { ReactNode } from 'react';

interface ChartWrapperProps {
  title?: string;
  height?: number;
  isLoading?: boolean;
  error?: Error | null;
  children: ReactNode;
  isDark?: boolean;
}

export default function ChartWrapper({
  title,
  height = 300,
  isLoading,
  error,
  children,
  isDark = false
}: ChartWrapperProps) {
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
}