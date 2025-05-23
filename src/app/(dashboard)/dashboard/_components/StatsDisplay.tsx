"use client";

import { Stats } from '@/types/stats';
import DynamicBarChart, { ChartData } from '@/components/charts/DynamicBarChart';

interface StatsDisplayProps {
  stats: Stats;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  // データ変換
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

  return (
    <div className="space-y-6">
      {/* 概要統計 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">総記録数</div>
          <div className="text-2xl font-bold">{stats.overview.count}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">平均感情スコア</div>
          <div className="text-2xl font-bold">{stats.overview.avgEmotion}</div>
        </div>
      </div>

      {/* 月別グラフ */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">月別平均感情スコア</h3>
        <div className="overflow-x-auto">
          {monthlyChartData.length > 0 ? (
            <DynamicBarChart
              height={300}
              data={monthlyChartData}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* 曜日別グラフ */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">曜日別平均感情スコア</h3>
        <div className="overflow-x-auto">
          <DynamicBarChart
            height={300}
            data={dayOfWeekChartData}
          />
        </div>
      </div>

      {/* 時間帯別グラフ */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">時間帯別平均感情スコア</h3>
        <div className="overflow-x-auto">
          <DynamicBarChart
            height={300}
            data={timeOfDayChartData}
          />
        </div>
      </div>
    </div>
  );
}