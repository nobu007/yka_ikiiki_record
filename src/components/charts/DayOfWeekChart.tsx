import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";

const DAY_OF_WEEK_CHART_HEIGHT = 300;

export const DayOfWeekChart = memo<{
  data: Array<{ day: string; avgEmotion: number }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.day),
      series: [
        {
          name: "平均感情スコア",
          data: data.map((d) => d.avgEmotion),
        },
      ],
    }),
    [data],
  );

  return (
    <EmotionChart
      data={chartData}
      title="曜日別感情スコア"
      type="bar"
      height={DAY_OF_WEEK_CHART_HEIGHT}
    />
  );
});

DayOfWeekChart.displayName = "DayOfWeekChart";
