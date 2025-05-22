"use client";
import dynamic from 'next/dynamic';
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChartData {
  name: string;
  value: number;
}

interface ChartProps {
  width?: number;
  height?: number;
  data?: ChartData[];
  title?: string;
}

const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = mod;
    return function Chart({ width, height, data, title }: ChartProps) {
      return (
        <div>
          {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
          <BarChart width={width} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" name="感情スコア" />
          </BarChart>
        </div>
      );
    };
  }),
  { ssr: false }
);

interface Stats {
  overview: {
    count: number;
    avgEmotion: string;
  };
  monthlyStats: Array<{
    month: string;
    count: number;
    avgEmotion: string;
  }>;
  dayOfWeekStats: Array<{
    day: string;
    count: number;
    avgEmotion: string;
  }>;
  timeOfDayStats: {
    morning: string;
    afternoon: string;
    evening: string;
  }
}

interface DashboardContentProps {
  initialStats: Stats;
}

export default function DashboardContent({ initialStats }: DashboardContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>(initialStats);

  const handleSeed = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students: 25, days: 365 })
      });

      if (res.ok) {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const newStats = await statsRes.json();
          setStats(newStats);
          // router.refresh();
        }
      }
    } catch (error) {
      console.error("Error generating data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 各種グラフ用のデータ変換
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
    <div className="p-4 space-y-6">
      <div>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⚡</span>
              生成中...
            </>
          ) : (
            "📊 Demo データ生成"
          )}
        </button>
      </div>

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
                width={600}
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
              width={600}
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
              width={600}
              height={300}
              data={timeOfDayChartData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}