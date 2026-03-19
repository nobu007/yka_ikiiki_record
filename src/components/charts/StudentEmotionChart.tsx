import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";

export const StudentEmotionChart = memo<{
  data: Array<{ student: string; avgEmotion: number }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.student),
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
      title="生徒別感情スコア"
      type="bar"
      height={400}
    />
  );
});

StudentEmotionChart.displayName = "StudentEmotionChart";
