'use client';

import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Stats } from '@/types/stats';
import DynamicBarChart, { ChartData } from '@/components/charts/DynamicBarChart';

const fetcher = (url: string) =>
  fetch(url).then(async res => {
    if (!res.ok) {
      const error = new Error(`Error ${res.status}: ${await res.text()}`);
      error.name = 'FetchError';
      throw error;
    }
    return res.json();
  });

const RETRY_COUNT = 3;
const RETRY_INTERVAL = 1000;

export default function StatsDisplay() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { data: stats, error, isLoading, mutate } = useSWR<Stats>(
    '/api/stats',
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとに自動更新
      onErrorRetry: (error, key, config, revalidate, { retryCount = 0 }) => {
        if (retryCount >= RETRY_COUNT) return;
        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), RETRY_INTERVAL);
      }
    }
  );

  const retryFetch = useCallback(() => {
    mutate();
  }, [mutate]);

  const monthlyChartData: ChartData[] = useMemo(() =>
    stats?.monthlyStats.map(stat => ({
      name: stat.month.split('-')[1] + '月',
      value: Number(stat.avgEmotion)
    })) ?? [], [stats?.monthlyStats]);

  const dayOfWeekChartData: ChartData[] = useMemo(() =>
    stats?.dayOfWeekStats.map(stat => ({
      name: stat.day,
      value: Number(stat.avgEmotion)
    })) ?? [], [stats?.dayOfWeekStats]);

  const timeOfDayChartData: ChartData[] = useMemo(() => [
    { name: '朝（5-11時）', value: Number(stats?.timeOfDayStats.morning ?? 0) },
    { name: '昼（12-17時）', value: Number(stats?.timeOfDayStats.afternoon ?? 0) },
    { name: '夜（18-4時）', value: Number(stats?.timeOfDayStats.evening ?? 0) }
  ], [stats?.timeOfDayStats]);

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
          onClick={retryFetch}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!stats) return <p className="text-center">データが見つかりません</p>;

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-500';
  const headingColor = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      {/* 概要統計 */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 ${bgColor} rounded-lg shadow transition-colors`}>
          <div className={`text-sm ${textColor}`}>総記録数</div>
          <div className={`text-2xl font-bold ${headingColor}`}>{stats.overview.count}</div>
        </div>
        <div className={`p-4 ${bgColor} rounded-lg shadow transition-colors`}>
          <div className={`text-sm ${textColor}`}>平均感情スコア</div>
          <div className={`text-2xl font-bold ${headingColor}`}>{stats.overview.avgEmotion}</div>
        </div>
      </div>

      {/* 月別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>月別平均感情スコア</h3>
        <div className="overflow-x-auto">
          {monthlyChartData.length > 0 ? (
            <DynamicBarChart
              height={300}
              data={monthlyChartData}
              isDark={isDark}
            />
          ) : (
            <div className={`text-center ${textColor} py-8`}>
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* 曜日別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>曜日別平均感情スコア</h3>
        <div className="overflow-x-auto">
          <DynamicBarChart
            height={300}
            data={dayOfWeekChartData}
            isDark={isDark}
          />
        </div>
      </div>

      {/* 時間帯別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>時間帯別平均感情スコア</h3>
        <div className="overflow-x-auto">
          <DynamicBarChart
            height={300}
            data={timeOfDayChartData}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}