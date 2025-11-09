"use client";

import DynamicBarChart from "@/components/charts/DynamicBarChart";
import ComponentCard from "@/components/common/ComponentCard";
import { useState, useCallback } from "react";

const demoData = [
  { name: "Jan", value: 168 },
  { name: "Feb", value: 385 },
  { name: "Mar", value: 201 },
  { name: "Apr", value: 298 },
  { name: "May", value: 187 },
  { name: "Jun", value: 195 },
  { name: "Jul", value: 291 },
  { name: "Aug", value: 110 },
  { name: "Sep", value: 215 },
  { name: "Oct", value: 390 },
  { name: "Nov", value: 280 },
  { name: "Dec", value: 112 }
];

export default function BarChartContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ここに実際のデータ更新ロジックを実装
      await new Promise(resolve => setTimeout(resolve, 1000)); // デモ用の遅延
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">月別データ</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "更新中..." : "データを更新"}
        </button>
      </div>

      <ComponentCard
        title="月別統計"
        desc="月別の統計データを表示します"
      >
        {error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
            <p className="font-semibold">エラーが発生しました</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : (
          <DynamicBarChart
            data={demoData}
            title="月別データ"
            height={300}
          />
        )}
      </ComponentCard>
    </div>
  );
}