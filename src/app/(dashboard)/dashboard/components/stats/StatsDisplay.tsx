"use client";

import { memo } from "react";
import DynamicBarChart, {
  ChartData,
} from "@/components/charts/DynamicBarChart";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { ERROR_MESSAGES, UI_TEXT, CHART_TITLES } from "@/lib/constants/messages";

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

const StatsDisplay = memo(function StatsDisplay({
  data,
  isLoading,
  error,
  onRetry,
  isDark,
}: StatsDisplayProps) {
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-gray-200" : "text-gray-500";
  const headingColor = isDark ? "text-white" : "text-gray-900";

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
        <p className="text-red-500 mb-4">
          {ERROR_MESSAGES.TITLE}: {error.message}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          {UI_TEXT.DASHBOARD.RETRY_BUTTON}
        </button>
      </div>
    );
  }

  if (!data) return <p className="text-center">{ERROR_MESSAGES.NOT_FOUND_SHORT}</p>;

  return (
    <div className="space-y-6">
      {/* 概要統計 */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 ${bgColor} rounded-lg shadow transition-colors`}>
          <div className={`text-sm ${textColor}`}>{CHART_TITLES.TOTAL_RECORDS}</div>
          <div className={`text-2xl font-bold ${headingColor}`}>
            {data.overview.count}
          </div>
        </div>
        <div className={`p-4 ${bgColor} rounded-lg shadow transition-colors`}>
          <div className={`text-sm ${textColor}`}>{CHART_TITLES.AVERAGE_EMOTION_SCORE}</div>
          <div className={`text-2xl font-bold ${headingColor}`}>
            {data.overview.avgEmotion}
          </div>
        </div>
      </div>

      {/* 月別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <DynamicBarChart
          title={CHART_TITLES.MONTHLY_AVERAGE_EMOTION}
          height={UI_CONSTANTS.CHART.HEIGHT.DEFAULT}
          data={data.monthly}
          isDark={isDark}
        />
      </div>

      {/* 曜日別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <DynamicBarChart
          title={CHART_TITLES.DAY_OF_WEEK_AVERAGE_EMOTION}
          height={UI_CONSTANTS.CHART.HEIGHT.DEFAULT}
          data={data.dayOfWeek}
          isDark={isDark}
        />
      </div>

      {/* 時間帯別グラフ */}
      <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
        <DynamicBarChart
          title={CHART_TITLES.TIME_OF_DAY_AVERAGE_EMOTION}
          height={UI_CONSTANTS.CHART.HEIGHT.DEFAULT}
          data={data.timeOfDay}
          isDark={isDark}
        />
      </div>
    </div>
  );
});

StatsDisplay.displayName = "StatsDisplay";

export default StatsDisplay;
