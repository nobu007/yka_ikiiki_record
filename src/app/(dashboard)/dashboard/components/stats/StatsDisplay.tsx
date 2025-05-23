'use client';

import DynamicBarChart, { ChartData } from '@/components/charts/DynamicBarChart';

interface ChartDataSet {
  monthly: ChartData[];
  dayOfWeek: ChartData[];
  timeOfDay: ChartData[];
  overview: {
    count: number;
    avgEmotion: number;
  };
}

interface StatsDisplayProps {
  data: ChartDataSet | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isDark: boolean;
}

export default function StatsDisplay({ data, isLoading, error, onRetry, isDark }: StatsDisplayProps) {
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-500';
  const headingColor = isDark ? 'text-white' : 'text-gray-900';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">エラーが発生しました: {error.message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!data) return <p className="text-center">データが見つかりません</p>;

  return (
    <div className="space-y-6">
      {/* 概要統計 */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 ${bgColor} rounded-lg shadow transition-colors`}>
          <div className={`text-sm ${textColor}`}>総記録数</div>
          <div className={`text-2xl font-bold ${headingColor}`}>{data.overview.count}</div>
        </div>
        <div className={`p-4 ${bgColor} rounded-lg shadow transition-colors`}>
          <div className={`text-sm ${textColor}`}>平均感情スコア</div>
          <div className={`text-2xl font-bold ${headingColor}`}>{data.overview.avgEmotion}</div>
        </div>
      </div>

      {/* 月別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <DynamicBarChart
          title="月別平均感情スコア"
          height={300}
          data={data.monthly}
          isDark={isDark}
        />
      </div>

      {/* 曜日別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <DynamicBarChart
          title="曜日別平均感情スコア"
          height={300}
          data={data.dayOfWeek}
          isDark={isDark}
        />
      </div>

      {/* 時間帯別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <DynamicBarChart
          title="時間帯別平均感情スコア"
          height={300}
          data={data.timeOfDay}
          isDark={isDark}
        />
      </div>
    </div>
  );
}