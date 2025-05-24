"use client";

import BarChartOne from "@/components/charts/bar/BarChartOne";
import DashboardTemplate from "../../../(dashboard)/dashboard/components/__templates__/DashboardTemplate";
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
    <DashboardTemplate
      buttonProps={{
        label: "データを更新",
        onClick: handleRefresh,
        loading: isLoading
      }}
      displayProps={{
        data: <BarChartOne data={demoData} />,
        loading: isLoading,
        error: error
      }}
      className="space-y-6"
    />
  );
}