"use client";
import dynamic from 'next/dynamic';
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChartProps {
  width?: number;
  height?: number;
  data?: Array<{
    month: string;
    value: number;
  }>;
}

const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = mod;
    return function Chart(props: ChartProps) {
      return (
        <BarChart {...props}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Bar dataKey="value" fill="#4F46E5" />
        </BarChart>
      );
    };
  }),
  { ssr: false }
);

interface Stats {
  count: number;
  avgEmotion: string;
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
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error generating data:", error);
    } finally {
      setLoading(false);
    }
  };

  const demoData = [
    { month: "1月", value: 3.8 },
    { month: "2月", value: 4.2 },
    { month: "3月", value: 3.9 },
    { month: "4月", value: 4.5 },
    { month: "5月", value: 4.1 },
    { month: "6月", value: 3.7 }
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

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">総記録数</div>
          <div className="text-2xl font-bold">{stats.count}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">平均感情スコア</div>
          <div className="text-2xl font-bold">{stats.avgEmotion}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">月別平均感情スコア</h3>
        <div className="overflow-x-auto">
          <DynamicBarChart width={600} height={300} data={demoData} />
        </div>
      </div>
    </div>
  );
}