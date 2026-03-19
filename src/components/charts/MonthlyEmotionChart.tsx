import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";

export const MonthlyEmotionChart = memo<{
  data: Array<{ month: string; avgEmotion: number }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.month),
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
      title="月別感情スコア推移"
      type="line"
      height={350}
    />
  );
});

MonthlyEmotionChart.displayName = "MonthlyEmotionChart";
