import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { CHART_TITLES } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";

export const DayOfWeekChart = memo<{
  data: Array<{ day: string; avgEmotion: number }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.day),
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
      title={CHART_TITLES.DAY_OF_WEEK_AVERAGE_EMOTION}
      type="bar"
      height={UI_CONSTANTS.CHART.HEIGHT.MEDIUM}
    />
  );
});

DayOfWeekChart.displayName = "DayOfWeekChart";
