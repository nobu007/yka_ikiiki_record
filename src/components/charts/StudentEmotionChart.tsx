import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { CHART_TITLES } from "@/lib/constants/messages";

export const StudentEmotionChart = memo<{
  data: Array<{ student: string; avgEmotion: number }>;
}>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.student),
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
      title={CHART_TITLES.STUDENT_EMOTION_SCORES}
      type="bar"
      height={UI_CONSTANTS.CHART.HEIGHT.XLARGE}
    />
  );
});

StudentEmotionChart.displayName = "StudentEmotionChart";
