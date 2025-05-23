'use client';

import { useStatsFetch } from '@/hooks/useStatsFetch';
import StatsDisplay from '../components/stats/StatsDisplay';
import { ChartData } from '@/components/charts/DynamicBarChart';
import { useTheme } from 'next-themes';

export default function StatsContainer() {
  const { stats, error, isLoading, refetch } = useStatsFetch();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // データ加工ロジック
  const processChartData = () => {
    if (!stats) return null;

    const monthlyChartData: ChartData[] = stats.monthlyStats.map(stat => ({
      name: stat.month.split('-')[1] + '月',
      value: Number(stat.avgEmotion)
    }));

    const dayOfWeekChartData: ChartData[] = stats.dayOfWeekStats.map(stat => ({
      name: stat.day,
      value: Number(stat.avgEmotion)
    }));

    const timeOfDayChartData: ChartData[] = [
      { name: '朝（5-11時）', value: Number(stats.timeOfDayStats.morning) },
      { name: '昼（12-17時）', value: Number(stats.timeOfDayStats.afternoon) },
      { name: '夜（18-4時）', value: Number(stats.timeOfDayStats.evening) }
    ];

    return {
      monthly: monthlyChartData,
      dayOfWeek: dayOfWeekChartData,
      timeOfDay: timeOfDayChartData,
      overview: {
        count: stats.overview.count,
        avgEmotion: stats.overview.avgEmotion
      }
    };
  };

  const chartData = processChartData();

  return (
    <StatsDisplay
      data={chartData}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
      isDark={isDark}
    />
  );
}