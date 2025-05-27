'use client';

import { useStats } from '@/hooks';
import { useSeedGeneration } from '@/hooks/useSeedGeneration';
import StatsDisplay from '../components/stats/StatsDisplay';
import DataGenerationPanel from '../components/stats/DataGenerationPanel';
import { ChartData } from '@/components/charts/DynamicBarChart';
import { useTheme } from 'next-themes';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';

export default function StatsContainer() {
  const { stats, error, isLoading, refetch } = useStats();
  const { generateSeed, isGenerating } = useSeedGeneration();
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

  // データ生成ハンドラ
  const handleGenerate = async (config: DataGenerationConfig) => {
    try {
      await generateSeed(config);
      await refetch();
    } catch (e) {
      console.error('データ生成エラー:', e);
    }
  };

  const chartData = processChartData();

  return (
    <div className="space-y-6">
      <DataGenerationPanel
        onGenerate={handleGenerate}
        className="mb-6"
      />
      <StatsDisplay
        data={chartData}
        isLoading={isLoading || isGenerating}
        error={error as Error}
        onRetry={refetch}
        isDark={isDark}
      />
    </div>
  );
}