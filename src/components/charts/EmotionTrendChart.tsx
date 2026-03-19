import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { CHART_TITLES, CHART_AXIS_LABELS } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";

export const EmotionTrendChart = memo<{
  data: Array<{ student: string; trendline: number[] }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: CHART_AXIS_LABELS.LAST_7_DAYS,
      series: data.slice(0, 5).map((student) => ({
        name: student.student,
        data: student.trendline,
      })),
    }),
    [data],
  );

  return (
    <EmotionChart
      data={chartData}
      title={CHART_TITLES.EMOTION_TREND_TOP_STUDENTS}
      type="line"
      height={UI_CONSTANTS.CHART.HEIGHT.LARGE}
    />
  );
});

EmotionTrendChart.displayName = "EmotionTrendChart";
