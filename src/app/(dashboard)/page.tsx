"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Stats {
  count: number;
  avgEmotion: string;
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/seed", {
        method: "POST",
        body: JSON.stringify({ students: 25 })
      });
      await fetchStats();
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
      {/* データ生成ボタン */}
      <div>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "生成中..." : "📊 Demo データ生成"}
        </button>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">総記録数</div>
          <div className="text-2xl font-bold">{stats?.count || 0}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">平均感情スコア</div>
          <div className="text-2xl font-bold">{stats?.avgEmotion || "0"}</div>
        </div>
      </div>

      {/* 月別グラフ */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">月別平均感情スコア</h3>
        <div className="overflow-x-auto">
          <BarChart width={600} height={300} data={demoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}