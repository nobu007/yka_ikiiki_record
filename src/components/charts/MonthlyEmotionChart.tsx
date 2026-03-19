import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { CHART_TITLES } from "@/lib/constants/messages";

export const MonthlyEmotionChart = memo<{
  data: Array<{ month: string; avgEmotion: number }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.month),
      series: [
        {
          name: CHART_TITLES.AVERAGE_EMOTION_SCORE,
          data: data.map((d) => d.avgEmotion),
        },
      ],
    }),
    [data],
  );

  return (
    <EmotionChart
      data={chartData}
      title={CHART_TITLES.MONTHLY_EMOTION_TREND}
      type="line"
      height={UI_CONSTANTS.CHART.HEIGHT.LARGE}
    />
  );
});

MonthlyEmotionChart.displayName = "MonthlyEmotionChart";
